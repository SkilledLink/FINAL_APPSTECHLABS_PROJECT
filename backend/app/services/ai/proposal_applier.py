# app/services/ai/proposal_applier.py
"""Apply or reject AI-generated proposals.

Single-item: accept_proposal(), reject_proposal()
Batch:       accept_many(), reject_many()

Batch is transactional per item — one failure doesn't roll back the
others. Each item reports success or failure independently.
"""

import logging
from datetime import datetime, timezone
from typing import Iterable, Optional
from uuid import UUID

from fastapi import HTTPException, status as http_status
from sqlmodel import Session

from app.enums.ai_proposal import ProposalStatus
from app.enums.professional import AuditAction
from app.models.professional import Professional
from app.models.professional_ai_proposal import ProfessionalAIProposal
from app.models.professional_audit_log import ProfessionalAuditLog
from app.repositories.professional_audit_repository import (
    ProfessionalAuditRepository,
)
from app.services.ai.proposal_targets import (
    SUB_ENTITY_TARGETS,
    STATIC_TARGETS,
    apply_value,
    get_current_value,
    list_allowed_paths,
    parse_field_path,
)

logger = logging.getLogger(__name__)


def _ensure_aware(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


# ─── SINGLE-ITEM ─────────────────────────────────────────────────

def accept_proposal(
    *,
    session: Session,
    proposal: ProfessionalAIProposal,
    professional: Professional,
    accepted_by_user_id: UUID,
    final_value: Optional[str] = None,
) -> ProfessionalAIProposal:
    _validate_pending(proposal)

    if proposal.field_path not in list_allowed_paths(session, professional):
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Field '{proposal.field_path}' is no longer editable.",
        )

    live_value = get_current_value(
        session, professional=professional, field_path=proposal.field_path
    )

    if (live_value or "") != (proposal.current_value or ""):
        proposal.status = ProposalStatus.SUPERSEDED
        proposal.updated_at = datetime.now(timezone.utc)
        session.add(proposal)
        _log(
            session,
            professional.id,
            AuditAction.AI_PROPOSAL_SUPERSEDED,
            actor_user_id=accepted_by_user_id,
            new_value={"proposal_id": str(proposal.id)},
            reason="Field changed since proposal was generated",
        )
        session.commit()
        raise HTTPException(
            status_code=http_status.HTTP_409_CONFLICT,
            detail=(
                "This field was edited after the proposal was generated. "
                "Regenerate proposals to get fresh suggestions."
            ),
        )

    value_to_apply = (final_value or proposal.proposed_value).strip()
    if not value_to_apply:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Cannot apply an empty value.",
        )

    try:
        applied = apply_value(
            session,
            professional=professional,
            field_path=proposal.field_path,
            new_value=value_to_apply,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST, detail=str(exc)
        )

    now = datetime.now(timezone.utc)
    proposal.status = ProposalStatus.ACCEPTED
    proposal.accepted_value = applied
    proposal.accepted_at = now
    proposal.accepted_by_user_id = accepted_by_user_id
    proposal.updated_at = now
    session.add(proposal)
    session.commit()
    session.refresh(proposal)

    _log(
        session,
        professional.id,
        AuditAction.AI_PROPOSAL_ACCEPTED,
        actor_user_id=accepted_by_user_id,
        old_value={"value": proposal.current_value},
        new_value={
            "proposal_id": str(proposal.id),
            "field_path": proposal.field_path,
            "value": applied,
        },
    )
    session.commit()

    if _invalidates_embedding(proposal.field_path):
        try:
            from app.services.indexing_service import IndexingService
            IndexingService(session).regenerate_vector(professional.user_id)
        except Exception as exc:
            logger.error(
                "Embedding regeneration failed after proposal %s: %s",
                proposal.id,
                exc,
            )

    return proposal


def reject_proposal(
    *,
    session: Session,
    proposal: ProfessionalAIProposal,
    professional: Professional,
    rejected_by_user_id: UUID,
    reason: Optional[str] = None,
) -> ProfessionalAIProposal:
    _validate_pending(proposal)

    now = datetime.now(timezone.utc)
    proposal.status = ProposalStatus.REJECTED
    proposal.rejected_at = now
    proposal.updated_at = now
    session.add(proposal)
    session.commit()
    session.refresh(proposal)

    _log(
        session,
        professional.id,
        AuditAction.AI_PROPOSAL_REJECTED,
        actor_user_id=rejected_by_user_id,
        new_value={"proposal_id": str(proposal.id)},
        reason=reason,
    )
    session.commit()
    return proposal


# ─── BATCH ───────────────────────────────────────────────────────

def accept_many(
    *,
    session: Session,
    proposals: Iterable[ProfessionalAIProposal],
    professional: Professional,
    accepted_by_user_id: UUID,
    final_values: Optional[dict[str, str]] = None,
) -> tuple[list[ProfessionalAIProposal], list[dict]]:
    """Accept each proposal independently. Returns (accepted, failed).

    `failed` entries are dicts: {"proposal_id": UUID, "field_path": str,
    "error": str}
    """
    final_values = final_values or {}
    accepted: list[ProfessionalAIProposal] = []
    failed: list[dict] = []

    for proposal in proposals:
        try:
            override = final_values.get(str(proposal.id))
            updated = accept_proposal(
                session=session,
                proposal=proposal,
                professional=professional,
                accepted_by_user_id=accepted_by_user_id,
                final_value=override,
            )
            accepted.append(updated)
        except HTTPException as exc:
            failed.append({
                "proposal_id": proposal.id,
                "field_path": proposal.field_path,
                "error": exc.detail,
            })
            # Roll back just this item's uncommitted changes, if any.
            session.rollback()
        except Exception as exc:  # pragma: no cover — defensive
            logger.exception("Unexpected error accepting proposal %s", proposal.id)
            failed.append({
                "proposal_id": proposal.id,
                "field_path": proposal.field_path,
                "error": str(exc),
            })
            session.rollback()

    return accepted, failed


def reject_many(
    *,
    session: Session,
    proposals: Iterable[ProfessionalAIProposal],
    professional: Professional,
    rejected_by_user_id: UUID,
    reason: Optional[str] = None,
) -> tuple[list[ProfessionalAIProposal], list[dict]]:
    rejected: list[ProfessionalAIProposal] = []
    failed: list[dict] = []

    for proposal in proposals:
        try:
            updated = reject_proposal(
                session=session,
                proposal=proposal,
                professional=professional,
                rejected_by_user_id=rejected_by_user_id,
                reason=reason,
            )
            rejected.append(updated)
        except HTTPException as exc:
            failed.append({
                "proposal_id": proposal.id,
                "field_path": proposal.field_path,
                "error": exc.detail,
            })
            session.rollback()
        except Exception as exc:  # pragma: no cover
            logger.exception("Unexpected error rejecting proposal %s", proposal.id)
            failed.append({
                "proposal_id": proposal.id,
                "field_path": proposal.field_path,
                "error": str(exc),
            })
            session.rollback()

    return rejected, failed


# ─── helpers ─────────────────────────────────────────────────────

def _validate_pending(proposal: ProfessionalAIProposal) -> None:
    if proposal.status != ProposalStatus.PENDING:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Proposal is already {proposal.status.value}.",
        )
    expires_at = _ensure_aware(proposal.expires_at)
    if expires_at and expires_at < datetime.now(timezone.utc):
        proposal.status = ProposalStatus.EXPIRED
        raise HTTPException(
            status_code=http_status.HTTP_410_GONE,
            detail="Proposal has expired.",
        )


def _invalidates_embedding(field_path: str) -> bool:
    scope, target_id, field_name = parse_field_path(field_path)
    if target_id is None:
        t = STATIC_TARGETS.get(f"{scope}.{field_name}")
        return t.invalidates_embedding if t else False
    t = SUB_ENTITY_TARGETS.get(f"{scope}.{field_name}")
    return t.invalidates_embedding if t else False


def _log(
    session: Session,
    professional_id: UUID,
    action: AuditAction,
    *,
    actor_user_id: Optional[UUID] = None,
    old_value: Optional[dict] = None,
    new_value: Optional[dict] = None,
    reason: Optional[str] = None,
) -> None:
    log = ProfessionalAuditLog(
        professional_id=professional_id,
        actor_user_id=actor_user_id,
        actor_role="user",
        action=action,
        old_value=old_value,
        new_value=new_value,
        reason=reason,
    )
    ProfessionalAuditRepository(session).create(log)