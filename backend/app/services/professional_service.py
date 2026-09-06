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

    def create_professional(self, user: User, data: dict) -> Professional:
        # Check if user already has a professional profile
        existing = self.repo.get_by_user_id(user.id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already has a professional profile"
            )

        # Build professional object
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
            # System fields default
            is_verified=False,
            rating=0.0,
            total_reviews=0,
            completed_jobs=0,
        )

        # Update user account type
        user.account_type = AccountType.PROFESSIONAL
        self.session.add(user)

        # Save professional
        self.repo.create(professional)

        # Commit the transaction (both operations)
        self.session.commit()
        self.session.refresh(professional)  # to load any defaults from DB
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

        # Allowed fields for update (exclude system fields and user_id)
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

        # Apply updates
        for key, value in update_data.items():
            setattr(professional, key, value)
        professional.updated_at = datetime.now(timezone.utc)

        self.session.add(professional)
        self.session.commit()
        self.session.refresh(professional)
        return professional