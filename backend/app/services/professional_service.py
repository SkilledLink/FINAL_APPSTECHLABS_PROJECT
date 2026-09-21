# app/services/professional_service.py

import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status as http_status
from sqlmodel import Session

from app.enums.professional import (
    AuditAction,
    DeletionType,
    ProfessionalAccountStatus,
    VerificationStatus,
)
from app.enums.user import AccountType
from app.models.professional import Professional
from app.models.professional_audit_log import ProfessionalAuditLog
from app.models.user import User
from app.repositories.professional_audit_repository import (
    ProfessionalAuditRepository,
)
from app.repositories.professional_repository import ProfessionalRepository
from app.schemas.professional import (
    ProfessionalAdminResponse,
    ProfessionalPublicResponse,
    ProfessionalResponse,
)
from app.services.indexing_service import IndexingService
from app.services.professional_subscription_service import (
    ProfessionalSubscriptionService,
)

logger = logging.getLogger(__name__)

MAX_VERIFICATION_ATTEMPTS = 3

PROFILE_COMPLETENESS_FIELDS = {
    "profession": 10,
    "headline": 5,
    "bio": 10,
    "company_name": 5,
    "job_title": 5,
    "years_of_experience": 5,
    "skills": 10,
    "services": 10,
    "hourly_rate": 5,
    "city": 5,
    "region": 5,
    "country": 5,
    "certifications": 5,
    "education": 5,
    "website_url": 5,
    "linkedin_url": 5,
}


class ProfessionalService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = ProfessionalRepository(session)
        self.audit_repo = ProfessionalAuditRepository(session)
        self.subscription_service = ProfessionalSubscriptionService(session)

    # ────────────────────────────────────────────────────────
    #  Response builders (attach active tier badge)
    # ────────────────────────────────────────────────────────

    def to_response(self, professional: Professional) -> ProfessionalResponse:
        """ORM Professional → ProfessionalResponse with the professional's
        active tier badge (if any) populated."""
        response = ProfessionalResponse.model_validate(professional)
        response.tier_badge = self.subscription_service.build_badge(
            professional.id
        )
        return response

    def to_public_response(
        self, professional: Professional
    ) -> ProfessionalPublicResponse:
        response = ProfessionalPublicResponse.model_validate(professional)
        response.tier_badge = self.subscription_service.build_badge(
            professional.id
        )
        return response

    def to_admin_response(
        self, professional: Professional
    ) -> ProfessionalAdminResponse:
        response = ProfessionalAdminResponse.model_validate(professional)
        response.tier_badge = self.subscription_service.build_badge(
            professional.id
        )
        return response

    def list_to_public_responses(
        self, professionals: list[Professional]
    ) -> list[ProfessionalPublicResponse]:
        """Batch conversion for discovery lists. One badge lookup per
        professional — swap for a batched query if list size grows."""
        return [self.to_public_response(p) for p in professionals]

    # ────────────────────────────────────────────────────────
    #  Create / read / update
    # ────────────────────────────────────────────────────────

    def create_professional(self, user: User, data: dict) -> Professional:
        existing = self.repo.get_by_user_id(user.id)
        if existing:
            raise HTTPException(
                status_code=http_status.HTTP_409_CONFLICT,
                detail="User already has a professional profile",
            )

        professional = Professional(
            user_id=user.id,
            profession=data["profession"],
            headline=data.get("headline"),
            bio=data.get("bio"),
            experience_level=data.get("experience_level") or "intermediate",
            years_of_experience=data.get("years_of_experience"),
            company_name=data.get("company_name"),
            job_title=data.get("job_title"),
            employment_type=data.get("employment_type"),
            website_url=data.get("website_url"),
            linkedin_url=data.get("linkedin_url"),
            portfolio_url=data.get("portfolio_url"),
            facebook_url=data.get("facebook_url"),
            instagram_url=data.get("instagram_url"),
            twitter_url=data.get("twitter_url"),
            skills=data.get("skills"),
            services=data.get("services"),
            certifications=data.get("certifications"),
            education=data.get("education"),
            languages=data.get("languages"),
            hourly_rate=data.get("hourly_rate"),
            currency=data.get("currency", "XAF"),
            country=data.get("country"),
            region=data.get("region"),
            city=data.get("city"),
            available=data.get("available", True),
            availability_notes=data.get("availability_notes"),
            response_time_hours=data.get("response_time_hours"),
            status=ProfessionalAccountStatus.PENDING,
            is_verified=False,
            verification_status=VerificationStatus.NOT_STARTED,
            rating=0.0,
            total_reviews=0,
            completed_jobs=0,
            profile_completeness=0,
            trust_score=50,
            is_flagged=False,
        )
        professional.profile_completeness = self._compute_completeness(professional)

        user.account_type = AccountType.PROFESSIONAL
        self.session.add(user)
        self.repo.create(professional)
        self.session.commit()
        self.session.refresh(professional)

        self._log_audit(
            professional.id,
            AuditAction.PROFILE_CREATED,
            actor_user_id=user.id,
            actor_role="user",
            new_value={"profession": professional.profession},
        )
        self.session.commit()

        try:
            IndexingService(self.session).regenerate_vector(user.id)
        except Exception as e:
            logger.error(
                f"Indexing failed after professional creation for {user.id}: {e}"
            )

        return professional

    def get_by_user(self, user: User) -> Optional[Professional]:
        return self.repo.get_by_user_id(user.id)

    def get_by_id(
        self, professional_id: UUID, include_deleted: bool = False
    ) -> Optional[Professional]:
        return self.repo.get_by_id(professional_id, include_deleted=include_deleted)

    def get_by_user_id(self, user_id: str | UUID) -> Optional[Professional]:
        if isinstance(user_id, str):
            try:
                user_id = UUID(user_id)
            except ValueError:
                return None
        return self.repo.get_by_user_id(user_id)

    def update_professional(self, user: User, data: dict) -> Professional:
        professional = self.repo.get_by_user_id(user.id)
        if not professional:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Professional profile not found",
            )

        allowed = {
            "profession", "headline", "bio", "experience_level",
            "years_of_experience", "company_name", "job_title", "employment_type",
            "website_url", "linkedin_url", "portfolio_url",
            "facebook_url", "instagram_url", "twitter_url",
            "skills", "services", "certifications", "education", "languages",
            "hourly_rate", "currency",
            "country", "region", "city",
            "available", "availability_notes", "response_time_hours",
        }
        update_data = {
            k: v for k, v in data.items() if k in allowed and v is not None
        }
        if not update_data:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update",
            )

        old_values = {k: getattr(professional, k, None) for k in update_data}
        for key, value in update_data.items():
            setattr(professional, key, value)
        professional.updated_at = datetime.now(timezone.utc)
        professional.profile_completeness = self._compute_completeness(professional)

        self.session.add(professional)
        self.session.commit()
        self.session.refresh(professional)

        self._log_audit(
            professional.id,
            AuditAction.PROFILE_UPDATED,
            actor_user_id=user.id,
            actor_role="user",
            old_value={k: str(v) for k, v in old_values.items()},
            new_value={k: str(v) for k, v in update_data.items()},
        )
        self.session.commit()

        if any(
            f in update_data
            for f in {"profession", "bio", "skills", "services", "headline"}
        ):
            try:
                IndexingService(self.session).regenerate_vector(user.id)
            except Exception as e:
                logger.error(
                    f"Indexing failed after professional update for {user.id}: {e}"
                )

        return professional

    # ────────────────────────────────────────────────────────
    #  Soft delete + snapshot
    # ────────────────────────────────────────────────────────

    def soft_delete(
        self,
        professional: Professional,
        deletion_type: DeletionType,
        reason: Optional[str],
        actor_user_id: Optional[UUID],
        actor_role: str,
        snapshot: Optional[dict] = None,
    ) -> Professional:
        self.repo.soft_delete(
            professional,
            deletion_type=deletion_type,
            reason=reason,
            deleted_by_user_id=actor_user_id,
        )

        if snapshot:
            self.repo.attach_snapshot(
                professional,
                email=snapshot.get("email"),
                username=snapshot.get("username"),
                ip=snapshot.get("ip"),
                user_agent=snapshot.get("user_agent"),
            )

        self.session.commit()
        self.session.refresh(professional)

        action = (
            AuditAction.PROFILE_SOFT_DELETED_SELF
            if deletion_type == DeletionType.SELF
            else AuditAction.PROFILE_SOFT_DELETED_ADMIN
        )
        self._log_audit(
            professional.id,
            action,
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            new_value={
                "deletion_type": deletion_type.value,
                "retention_until": str(professional.retention_until),
            },
            reason=reason,
        )
        self.session.commit()
        return professional

    # ────────────────────────────────────────────────────────
    #  Verification state machine
    # ────────────────────────────────────────────────────────

    def record_verification_result(
        self,
        professional: Professional,
        didit_status: VerificationStatus,
        raw_data: Optional[dict] = None,
    ) -> Professional:
        """Called by the Didit webhook handler.

        - APPROVED → is_verified=True, status=ACTIVE
        - REJECTED / FAILED → verification_status=MANUAL_REVIEW (per policy)
        - attempts capped at MAX_VERIFICATION_ATTEMPTS
        """
        if didit_status == VerificationStatus.APPROVED:
            professional.verification_status = VerificationStatus.APPROVED
            professional.is_verified = True
            professional.verified_at = datetime.now(timezone.utc)
            if professional.status == ProfessionalAccountStatus.PENDING:
                professional.status = ProfessionalAccountStatus.ACTIVE
            audit_action = AuditAction.VERIFICATION_APPROVED
        else:
            professional.verification_status = VerificationStatus.MANUAL_REVIEW
            audit_action = (
                AuditAction.VERIFICATION_REJECTED
                if didit_status == VerificationStatus.REJECTED
                else AuditAction.VERIFICATION_FAILED
            )

        professional.verification_attempts = (
            professional.verification_attempts or 0
        ) + 1
        professional.verification_last_attempt_at = datetime.now(timezone.utc)
        if raw_data is not None:
            professional.verification_data = raw_data

        professional.updated_at = datetime.now(timezone.utc)
        self.session.add(professional)
        self.session.commit()
        self.session.refresh(professional)

        self._log_audit(
            professional.id,
            audit_action,
            actor_role="system",
            new_value={
                "didit_status": didit_status.value,
                "attempts": professional.verification_attempts,
            },
        )

        if (
            didit_status != VerificationStatus.APPROVED
            and professional.verification_attempts >= MAX_VERIFICATION_ATTEMPTS
        ):
            self._log_audit(
                professional.id,
                AuditAction.VERIFICATION_ATTEMPTS_EXHAUSTED,
                actor_role="system",
                new_value={"attempts": professional.verification_attempts},
            )

        self.session.commit()
        return professional

    def can_retry_verification(self, professional: Professional) -> bool:
        return (
            professional.verification_attempts or 0
        ) < MAX_VERIFICATION_ATTEMPTS

    # ────────────────────────────────────────────────────────
    #  Admin actions
    # ────────────────────────────────────────────────────────

    def admin_override_verification(
        self,
        professional: Professional,
        new_status: VerificationStatus,
        admin_user_id: UUID,
        reason: str,
    ) -> Professional:
        old = professional.verification_status
        self.repo.admin_override_verification(
            professional,
            new_status=new_status,
            admin_user_id=admin_user_id,
            reason=reason,
        )
        self.session.commit()
        self.session.refresh(professional)

        action = (
            AuditAction.VERIFICATION_MANUAL_APPROVED
            if new_status == VerificationStatus.MANUAL_APPROVED
            else AuditAction.VERIFICATION_MANUAL_REJECTED
        )
        self._log_audit(
            professional.id,
            action,
            actor_user_id=admin_user_id,
            actor_role="admin",
            old_value={"verification_status": old.value},
            new_value={"verification_status": new_status.value},
            reason=reason,
        )
        self.session.commit()
        return professional

    def admin_suspend(
        self,
        professional: Professional,
        admin_user_id: UUID,
        reason: str,
    ) -> Professional:
        old = professional.status
        professional.status = ProfessionalAccountStatus.SUSPENDED
        professional.updated_at = datetime.now(timezone.utc)
        self.session.add(professional)
        self.session.commit()
        self.session.refresh(professional)

        self._log_audit(
            professional.id,
            AuditAction.STATUS_SUSPENDED,
            actor_user_id=admin_user_id,
            actor_role="admin",
            old_value={"status": old.value},
            new_value={"status": professional.status.value},
            reason=reason,
        )
        self.session.commit()
        return professional

    def admin_reactivate(
        self,
        professional: Professional,
        admin_user_id: UUID,
        reason: str,
    ) -> Professional:
        old = professional.status
        professional.status = ProfessionalAccountStatus.ACTIVE
        professional.updated_at = datetime.now(timezone.utc)
        self.session.add(professional)
        self.session.commit()
        self.session.refresh(professional)

        self._log_audit(
            professional.id,
            AuditAction.STATUS_REACTIVATED,
            actor_user_id=admin_user_id,
            actor_role="admin",
            old_value={"status": old.value},
            new_value={"status": professional.status.value},
            reason=reason,
        )
        self.session.commit()
        return professional

    def admin_flag(
        self,
        professional: Professional,
        admin_user_id: UUID,
        reason: str,
        notes: Optional[str],
    ) -> Professional:
        professional.is_flagged = True
        if notes:
            professional.fraud_notes = (
                (professional.fraud_notes or "") + "\n" + notes
            ).strip()
        professional.updated_at = datetime.now(timezone.utc)
        self.session.add(professional)
        self.session.commit()
        self.session.refresh(professional)

        self._log_audit(
            professional.id,
            AuditAction.FLAG_ADDED,
            actor_user_id=admin_user_id,
            actor_role="admin",
            new_value={"is_flagged": True, "notes": notes},
            reason=reason,
        )
        self.session.commit()
        return professional

    def admin_unflag(
        self,
        professional: Professional,
        admin_user_id: UUID,
        reason: str,
    ) -> Professional:
        professional.is_flagged = False
        professional.updated_at = datetime.now(timezone.utc)
        self.session.add(professional)
        self.session.commit()
        self.session.refresh(professional)

        self._log_audit(
            professional.id,
            AuditAction.FLAG_REMOVED,
            actor_user_id=admin_user_id,
            actor_role="admin",
            new_value={"is_flagged": False},
            reason=reason,
        )
        self.session.commit()
        return professional

    def admin_update_trust_score(
        self,
        professional: Professional,
        admin_user_id: UUID,
        new_score: int,
        reason: str,
    ) -> Professional:
        old = professional.trust_score
        professional.trust_score = new_score
        professional.updated_at = datetime.now(timezone.utc)
        self.session.add(professional)
        self.session.commit()
        self.session.refresh(professional)

        self._log_audit(
            professional.id,
            AuditAction.TRUST_SCORE_CHANGED,
            actor_user_id=admin_user_id,
            actor_role="admin",
            old_value={"trust_score": old},
            new_value={"trust_score": new_score},
            reason=reason,
        )
        self.session.commit()
        return professional

    # ────────────────────────────────────────────────────────
    #  Internals
    # ────────────────────────────────────────────────────────

    def _compute_completeness(self, p: Professional) -> int:
        score = 0
        for field, weight in PROFILE_COMPLETENESS_FIELDS.items():
            value = getattr(p, field, None)
            if value not in (None, "", [], {}):
                score += weight
        return min(100, score)

    def _log_audit(
        self,
        professional_id: UUID,
        action: AuditAction,
        actor_user_id: Optional[UUID] = None,
        actor_role: Optional[str] = None,
        old_value: Optional[dict] = None,
        new_value: Optional[dict] = None,
        reason: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> ProfessionalAuditLog:
        log = ProfessionalAuditLog(
            professional_id=professional_id,
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            action=action,
            old_value=old_value,
            new_value=new_value,
            reason=reason,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        return self.audit_repo.create(log)