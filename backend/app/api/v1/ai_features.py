# app/api/v1/ai_features.py

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status as http_status
from sqlmodel import select

from app.api.deps_payments import (
    AIUsageServiceDep,
    ActiveUser,
    CurrentProfessional,
    SessionDep,
)
from app.enums.ai_proposal import ProposalStatus
from app.models.professional_ai_proposal import ProfessionalAIProposal
from app.schemas.ai_features import (
    AIUsageItem,
    AIUsageResponse,
    AnalyzeImageRequest,
    DeepAnalysisResponse,
    ImageAnalysisResponse,
    PortfolioSuggestion,
    PortfolioSuggestionsResponse,
)
from app.schemas.ai_proposals import (
    AcceptAllRequest,
    AcceptProposalRequest,
    AcceptProposalResponse,
    AIProposalResponse,
    BatchAcceptRequest,
    BatchAcceptResponse,
    BatchItemResult,
    BatchRejectRequest,
    BatchRejectResponse,
    GenerateProposalsResponse,
    ListProposalsResponse,
    RejectAllRequest,
    RejectProposalRequest,
)
from app.services.ai.features.image_analysis import (
    analyze_portfolio_image,
)
from app.services.ai.features.portfolio_deep_analysis import (
    generate_deep_analysis,
)
from app.services.ai.features.portfolio_suggestions import (
    generate_portfolio_suggestions,
)
from app.services.ai.features.profile_optimization import (
    generate_profile_proposals,
)
from app.services.ai.proposal_applier import (
    accept_many,
    accept_proposal,
    reject_many,
    reject_proposal,
)
from app.services.ai.tier_provider import TierProviderResolver

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


# ─── HELPERS ─────────────────────────────────────────────────────

def _ensure_aware(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _load_owned_pending(session, professional, proposal_id: UUID):
    proposal = session.get(ProfessionalAIProposal, proposal_id)
    if not proposal or proposal.professional_id != professional.id:
        raise HTTPException(404, "Proposal not found")
    return proposal


def _load_many_pending(session, professional, ids: list[UUID]):
    if not ids:
        return []
    stmt = select(ProfessionalAIProposal).where(
        ProfessionalAIProposal.id.in_(ids),
        ProfessionalAIProposal.professional_id == professional.id,
    )
    return session.exec(stmt).all()


def _load_all_pending(session, professional, feature_key: Optional[str] = None):
    stmt = select(ProfessionalAIProposal).where(
        ProfessionalAIProposal.professional_id == professional.id,
        ProfessionalAIProposal.status == ProposalStatus.PENDING.value,
    )
    if feature_key:
        stmt = stmt.where(ProfessionalAIProposal.feature_key == feature_key)
    return session.exec(stmt).all()


# ─── TEXT FEATURES (both tiers, Groq) ────────────────────────────

@router.post(
    "/portfolio-suggestions",
    response_model=PortfolioSuggestionsResponse,
    status_code=http_status.HTTP_200_OK,
)
def portfolio_suggestions(
    session: SessionDep,
    professional: CurrentProfessional,
    usage_service: AIUsageServiceDep,
) -> PortfolioSuggestionsResponse:
    """Advisory suggestions — not persisted, no accept/reject."""
    resolver = TierProviderResolver(session)
    _, adapter, tier_level = resolver.resolve_text_provider(professional.id)

    result = generate_portfolio_suggestions(
        session=session,
        professional=professional,
        ai_client=adapter,
        tier_level=tier_level,
        usage_service=usage_service,
    )

    return PortfolioSuggestionsResponse(
        suggestions=[PortfolioSuggestion(**s) for s in result["suggestions"]],
        provider=result["provider"],
        model=result["model"],
        prompt_tokens=result.get("prompt_tokens"),
        completion_tokens=result.get("completion_tokens"),
    )


@router.post(
    "/profile-proposals/generate",
    response_model=GenerateProposalsResponse,
    status_code=http_status.HTTP_201_CREATED,
)
def generate_profile_proposals_endpoint(
    session: SessionDep,
    professional: CurrentProfessional,
    usage_service: AIUsageServiceDep,
) -> GenerateProposalsResponse:
    resolver = TierProviderResolver(session)
    _, adapter, tier_level = resolver.resolve_text_provider(professional.id)

    proposals, meta = generate_profile_proposals(
        session=session,
        professional=professional,
        ai_client=adapter,
        tier_level=tier_level,
        usage_service=usage_service,
    )

    return GenerateProposalsResponse(
        proposals=[AIProposalResponse.model_validate(p) for p in proposals],
        provider=meta["provider"],
        model=meta["model"],
        prompt_tokens=meta.get("prompt_tokens"),
        completion_tokens=meta.get("completion_tokens"),
    )


# ─── VISION FEATURES (Level 3 exclusive, Gemini) ─────────────────

@router.post(
    "/analyze-portfolio-image",
    response_model=ImageAnalysisResponse,
    status_code=http_status.HTTP_200_OK,
)
def analyze_portfolio_image_endpoint(
    payload: AnalyzeImageRequest,
    session: SessionDep,
    professional: CurrentProfessional,
    usage_service: AIUsageServiceDep,
) -> ImageAnalysisResponse:
    """Level 3 exclusive. Analyzes a portfolio photo with Gemini vision."""
    resolver = TierProviderResolver(session)
    _, adapter, _ = resolver.resolve_vision_provider(professional.id)

    source = {
        "base64": payload.image_base64,
        "mime_type": payload.image_mime_type,
        "url": payload.image_url,
        "work_id": payload.work_id,
    }

    result = analyze_portfolio_image(
        session=session,
        professional=professional,
        image_source=source,
        context=payload.context,
        ai_client=adapter,
        usage_service=usage_service,
    )

    return ImageAnalysisResponse(**result)


@router.post(
    "/portfolio-deep-analysis",
    response_model=DeepAnalysisResponse,
    status_code=http_status.HTTP_200_OK,
)
def portfolio_deep_analysis(
    session: SessionDep,
    professional: CurrentProfessional,
    usage_service: AIUsageServiceDep,
) -> DeepAnalysisResponse:
    """Level 3 exclusive. Full-portfolio analysis with score, gaps, and
    prioritized recommendations. Runs on Gemini."""
    resolver = TierProviderResolver(session)
    _, adapter, _ = resolver.resolve_vision_provider(professional.id)

    result = generate_deep_analysis(
        session=session,
        professional=professional,
        ai_client=adapter,
        usage_service=usage_service,
    )

    return DeepAnalysisResponse(**result)


# ─── AI USAGE ────────────────────────────────────────────────────

@router.get(
    "/usage",
    response_model=AIUsageResponse,
    status_code=http_status.HTTP_200_OK,
)
def my_ai_usage(
    professional: CurrentProfessional,
    usage_service: AIUsageServiceDep,
) -> AIUsageResponse:
    """Current-period usage for every AI feature on the pro's tier.

    Returns one row per ProfessionalAIUsage record. Empty list when
    the pro hasn't run any AI feature this period yet.
    """
    rows, total = usage_service.list_for_professional(
        professional.id,
        period_start=None,
        skip=0,
        limit=50,
    )

    items = [
        AIUsageItem(
            feature_key=row.feature_key,
            feature_name=row.feature_key,
            usage_count=row.usage_count,
            usage_limit=row.usage_limit,
            remaining=max(0, row.usage_limit - row.usage_count),
            period_start=row.period_start,
            period_end=row.period_end,
        )
        for row in rows
    ]
    return AIUsageResponse(items=items, total=total)


# ─── PROPOSAL LIFECYCLE ──────────────────────────────────────────

@router.get(
    "/profile-proposals",
    response_model=ListProposalsResponse,
)
def list_profile_proposals(
    session: SessionDep,
    professional: CurrentProfessional,
    status_filter: Optional[ProposalStatus] = Query(
        default=ProposalStatus.PENDING, alias="status"
    ),
) -> ListProposalsResponse:
    stmt = select(ProfessionalAIProposal).where(
        ProfessionalAIProposal.professional_id == professional.id
    )
    if status_filter:
        stmt = stmt.where(
            ProfessionalAIProposal.status == status_filter.value
        )
    stmt = stmt.order_by(ProfessionalAIProposal.created_at.desc())

    rows = session.exec(stmt).all()

    now = datetime.now(timezone.utc)
    changed = False
    for row in rows:
        if row.status != ProposalStatus.PENDING:
            continue
        expires_at = _ensure_aware(row.expires_at)
        if expires_at and expires_at < now:
            row.status = ProposalStatus.EXPIRED
            session.add(row)
            changed = True
    if changed:
        session.commit()

    items = [
        AIProposalResponse.model_validate(r)
        for r in rows
        if (status_filter is None or r.status == status_filter)
    ]
    return ListProposalsResponse(items=items, total=len(items))


@router.post(
    "/profile-proposals/{proposal_id}/accept",
    response_model=AcceptProposalResponse,
)
def accept_profile_proposal(
    proposal_id: UUID,
    payload: AcceptProposalRequest,
    session: SessionDep,
    professional: CurrentProfessional,
    current_user: ActiveUser,
) -> AcceptProposalResponse:
    proposal = _load_owned_pending(session, professional, proposal_id)
    updated = accept_proposal(
        session=session,
        proposal=proposal,
        professional=professional,
        accepted_by_user_id=current_user.id,
        final_value=payload.final_value,
    )
    return AcceptProposalResponse(
        proposal=AIProposalResponse.model_validate(updated),
        applied_to=updated.field_path,
        new_value=updated.accepted_value or updated.proposed_value,
    )


@router.post(
    "/profile-proposals/{proposal_id}/reject",
    response_model=AIProposalResponse,
)
def reject_profile_proposal(
    proposal_id: UUID,
    payload: RejectProposalRequest,
    session: SessionDep,
    professional: CurrentProfessional,
    current_user: ActiveUser,
) -> AIProposalResponse:
    proposal = _load_owned_pending(session, professional, proposal_id)
    updated = reject_proposal(
        session=session,
        proposal=proposal,
        professional=professional,
        rejected_by_user_id=current_user.id,
        reason=payload.reason,
    )
    return AIProposalResponse.model_validate(updated)


@router.post(
    "/profile-proposals/accept-batch",
    response_model=BatchAcceptResponse,
)
def accept_profile_proposals_batch(
    payload: BatchAcceptRequest,
    session: SessionDep,
    professional: CurrentProfessional,
    current_user: ActiveUser,
) -> BatchAcceptResponse:
    proposals = _load_many_pending(session, professional, payload.ids)
    if not proposals:
        raise HTTPException(404, "No matching pending proposals found.")

    accepted, failed = accept_many(
        session=session,
        proposals=proposals,
        professional=professional,
        accepted_by_user_id=current_user.id,
        final_values=payload.final_values,
    )
    return BatchAcceptResponse(
        accepted=[
            BatchItemResult(
                proposal_id=p.id,
                field_path=p.field_path,
                applied_to=p.field_path,
                new_value=p.accepted_value or p.proposed_value,
            )
            for p in accepted
        ],
        failed=[BatchItemResult(**f) for f in failed],
        total_accepted=len(accepted),
        total_failed=len(failed),
    )


@router.post(
    "/profile-proposals/reject-batch",
    response_model=BatchRejectResponse,
)
def reject_profile_proposals_batch(
    payload: BatchRejectRequest,
    session: SessionDep,
    professional: CurrentProfessional,
    current_user: ActiveUser,
) -> BatchRejectResponse:
    proposals = _load_many_pending(session, professional, payload.ids)
    if not proposals:
        raise HTTPException(404, "No matching pending proposals found.")

    rejected, failed = reject_many(
        session=session,
        proposals=proposals,
        professional=professional,
        rejected_by_user_id=current_user.id,
        reason=payload.reason,
    )
    return BatchRejectResponse(
        rejected=[
            BatchItemResult(proposal_id=p.id, field_path=p.field_path)
            for p in rejected
        ],
        failed=[BatchItemResult(**f) for f in failed],
        total_rejected=len(rejected),
        total_failed=len(failed),
    )


@router.post(
    "/profile-proposals/accept-all",
    response_model=BatchAcceptResponse,
)
def accept_all_profile_proposals(
    payload: AcceptAllRequest,
    session: SessionDep,
    professional: CurrentProfessional,
    current_user: ActiveUser,
) -> BatchAcceptResponse:
    proposals = _load_all_pending(session, professional, payload.feature_key)
    if not proposals:
        raise HTTPException(404, "No pending proposals found.")

    accepted, failed = accept_many(
        session=session,
        proposals=proposals,
        professional=professional,
        accepted_by_user_id=current_user.id,
        final_values=payload.final_values,
    )
    return BatchAcceptResponse(
        accepted=[
            BatchItemResult(
                proposal_id=p.id,
                field_path=p.field_path,
                applied_to=p.field_path,
                new_value=p.accepted_value or p.proposed_value,
            )
            for p in accepted
        ],
        failed=[BatchItemResult(**f) for f in failed],
        total_accepted=len(accepted),
        total_failed=len(failed),
    )


@router.post(
    "/profile-proposals/reject-all",
    response_model=BatchRejectResponse,
)
def reject_all_profile_proposals(
    payload: RejectAllRequest,
    session: SessionDep,
    professional: CurrentProfessional,
    current_user: ActiveUser,
) -> BatchRejectResponse:
    proposals = _load_all_pending(session, professional, payload.feature_key)
    if not proposals:
        raise HTTPException(404, "No pending proposals found.")

    rejected, failed = reject_many(
        session=session,
        proposals=proposals,
        professional=professional,
        rejected_by_user_id=current_user.id,
        reason=payload.reason,
    )
    return BatchRejectResponse(
        rejected=[
            BatchItemResult(proposal_id=p.id, field_path=p.field_path)
            for p in rejected
        ],
        failed=[BatchItemResult(**f) for f in failed],
        total_rejected=len(rejected),
        total_failed=len(failed),
    )