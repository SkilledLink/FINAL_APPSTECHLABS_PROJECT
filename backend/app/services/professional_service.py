from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.professional import Professional
from app.models.user import User
from app.repositories.professional_repository import ProfessionalRepository
from app.enums.user import AccountType


class ProfessionalService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = ProfessionalRepository(session)

    # ─── Existing methods ──────────────────────────────

    def create_professional(self, user: User, data: dict) -> Professional:
        existing = self.repo.get_by_user_id(user.id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already has a professional profile"
            )

        professional = Professional(
            user_id=user.id,
            profession=data["profession"],
            bio=data.get("bio"),
            skills=data.get("skills"),
            years_of_experience=data.get("years_of_experience"),
            services=data.get("services"),
            hourly_rate=data.get("hourly_rate"),
            country=data.get("country"),
            region=data.get("region"),
            city=data.get("city"),
            available=data.get("available", True),
            is_verified=False,
            rating=0.0,
            total_reviews=0,
            completed_jobs=0,
        )

        user.account_type = AccountType.PROFESSIONAL
        self.session.add(user)
        self.repo.create(professional)
        self.session.commit()
        self.session.refresh(professional)
        return professional

    def get_by_user(self, user: User) -> Optional[Professional]:
        return self.repo.get_by_user_id(user.id)

    def get_by_id(self, professional_id: UUID) -> Optional[Professional]:
        return self.repo.get_by_id(professional_id)

    def update_professional(self, user: User, data: dict) -> Professional:
        professional = self.repo.get_by_user_id(user.id)
        if not professional:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Professional profile not found"
            )

        allowed_fields = {
            "profession", "bio", "skills", "years_of_experience",
            "services", "hourly_rate", "country", "region", "city", "available"
        }
        update_data = {k: v for k, v in data.items() if k in allowed_fields and v is not None}
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )

        for key, value in update_data.items():
            setattr(professional, key, value)
        professional.updated_at = datetime.now(timezone.utc)

        self.session.add(professional)
        self.session.commit()
        self.session.refresh(professional)
        return professional

    # ─── NEW methods for KYC ──────────────────────────

    def get_by_user_id(self, user_id: str | UUID) -> Optional[Professional]:
        """Fetch a professional profile by the user's UUID (string or UUID)."""
        if isinstance(user_id, str):
            try:
                user_id = UUID(user_id)
            except ValueError:
                return None
        return self.repo.get_by_user_id(user_id)

    def update_verification_status(
        self,
        user_id: str | UUID,
        status: str,          # "approved", "declined", "review", ...
        decision: dict,
        verified_at: Optional[datetime] = None,
    ) -> Optional[Professional]:
        """Update KYC status after receiving a webhook from Didit."""
        professional = self.get_by_user_id(user_id)
        if not professional:
            # Log this – unknown user received a webhook
            return None

        professional.verification_status = status
        professional.verification_data = decision
        professional.is_verified = (status == "approved")
        if verified_at:
            professional.verified_at = verified_at
        professional.updated_at = datetime.now(timezone.utc)

        self.session.add(professional)
        self.session.commit()
        self.session.refresh(professional)
        return professional