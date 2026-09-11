from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from uuid import UUID

from sqlmodel import Session, func, or_, select

from app.enums.professional import (
    DeletionType,
    ProfessionalAccountStatus,
    VerificationStatus,
)
from app.models.professional import Professional


DEFAULT_RETENTION_DAYS = 365 * 5  # 5 years — fraud investigation window


class ProfessionalRepository:
    def __init__(self, session: Session):
        self.session = session

    # ─── CREATE ──────────────────────────────────────────────
    def create(self, professional: Professional) -> Professional:
        self.session.add(professional)
        self.session.flush()
        return professional

    # ─── READ (single) ───────────────────────────────────────
    def get_by_id(
        self,
        professional_id: UUID,
        include_deleted: bool = False,
    ) -> Optional[Professional]:
        stmt = select(Professional).where(Professional.id == professional_id)
        if not include_deleted:
            stmt = stmt.where(Professional.deleted_at.is_(None))
        return self.session.exec(stmt).first()

    def get_by_user_id(
        self,
        user_id: UUID,
        include_deleted: bool = False,
    ) -> Optional[Professional]:
        stmt = select(Professional).where(Professional.user_id == user_id)
        if not include_deleted:
            stmt = stmt.where(Professional.deleted_at.is_(None))
        return self.session.exec(stmt).first()

    # ─── READ (public discovery) ─────────────────────────────
    def list_active(
        self,
        skip: int = 0,
        limit: int = 20,
        profession: Optional[str] = None,
        city: Optional[str] = None,
        country: Optional[str] = None,
        verified_only: bool = False,
        available_only: bool = True,
        search: Optional[str] = None,
        sort: str = "rating_desc",
    ) -> Tuple[list[Professional], int]:
        conditions = [
            Professional.deleted_at.is_(None),
            Professional.status == ProfessionalAccountStatus.ACTIVE,
        ]
        if available_only:
            conditions.append(Professional.available.is_(True))
        if verified_only:
            conditions.append(Professional.is_verified.is_(True))
        if profession:
            conditions.append(Professional.profession.ilike(f"%{profession}%"))
        if city:
            conditions.append(Professional.city.ilike(f"%{city}%"))
        if country:
            conditions.append(Professional.country.ilike(f"%{country}%"))
        if search:
            term = f"%{search}%"
            conditions.append(
                or_(
                    Professional.profession.ilike(term),
                    Professional.headline.ilike(term),
                    Professional.bio.ilike(term),
                    Professional.company_name.ilike(term),
                )
            )

        total = (
            self.session.exec(
                select(func.count()).select_from(Professional).where(*conditions)
            ).first()
            or 0
        )

        stmt = select(Professional).where(*conditions)
        if sort == "rating_desc":
            stmt = stmt.order_by(
                Professional.rating.desc(), Professional.total_reviews.desc()
            )
        elif sort == "newest":
            stmt = stmt.order_by(Professional.created_at.desc())
        elif sort == "completed_desc":
            stmt = stmt.order_by(Professional.completed_jobs.desc())
        else:
            stmt = stmt.order_by(Professional.rating.desc())

        items = self.session.exec(stmt.offset(skip).limit(limit)).all()
        return items, total

    # ─── READ (admin — includes deleted) ─────────────────────
    def list_all_admin(
        self,
        skip: int = 0,
        limit: int = 20,
        include_deleted: bool = True,
        status: Optional[ProfessionalAccountStatus] = None,
        verification_status: Optional[VerificationStatus] = None,
        flagged_only: bool = False,
    ) -> Tuple[list[Professional], int]:
        conditions = []
        if not include_deleted:
            conditions.append(Professional.deleted_at.is_(None))
        if status:
            conditions.append(Professional.status == status)
        if verification_status:
            conditions.append(Professional.verification_status == verification_status)
        if flagged_only:
            conditions.append(Professional.is_flagged.is_(True))

        count_stmt = select(func.count()).select_from(Professional)
        stmt = select(Professional)
        if conditions:
            count_stmt = count_stmt.where(*conditions)
            stmt = stmt.where(*conditions)

        total = self.session.exec(count_stmt).first() or 0
        items = self.session.exec(
            stmt.order_by(Professional.created_at.desc()).offset(skip).limit(limit)
        ).all()
        return items, total

    # ─── UPDATE ──────────────────────────────────────────────
    def update(self, professional: Professional, **kwargs) -> Professional:
        for key, value in kwargs.items():
            if hasattr(professional, key):
                setattr(professional, key, value)
        professional.updated_at = datetime.now(timezone.utc)
        self.session.add(professional)
        self.session.flush()
        return professional

    # ─── SOFT DELETE + RETENTION ─────────────────────────────
    def soft_delete(
        self,
        professional: Professional,
        deletion_type: DeletionType,
        reason: Optional[str] = None,
        deleted_by_user_id: Optional[UUID] = None,
        retention_days: int = DEFAULT_RETENTION_DAYS,
    ) -> Professional:
        now = datetime.now(timezone.utc)
        professional.deleted_at = now
        professional.deletion_type = deletion_type
        professional.deletion_reason = reason
        professional.deleted_by_user_id = deleted_by_user_id
        professional.status = ProfessionalAccountStatus.DELETED
        professional.available = False
        professional.retention_until = now + timedelta(days=retention_days)
        professional.updated_at = now
        self.session.add(professional)
        self.session.flush()
        return professional

    # ─── ATTACH SNAPSHOT (before user record is removed) ─────
    def attach_snapshot(
        self,
        professional: Professional,
        email: Optional[str] = None,
        username: Optional[str] = None,
        ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Professional:
        professional.snapshot_email = email
        professional.snapshot_username = username
        professional.snapshot_ip = ip
        professional.snapshot_user_agent = user_agent
        self.session.add(professional)
        self.session.flush()
        return professional

    # ─── HARD DELETE (admin, after retention window) ─────────
    def hard_delete(self, professional: Professional) -> None:
        self.session.delete(professional)
        self.session.flush()

    # ─── VERIFICATION ────────────────────────────────────────
    def record_verification_attempt(
        self,
        professional: Professional,
        status: VerificationStatus,
        raw_data: Optional[dict] = None,
    ) -> Professional:
        professional.verification_status = status
        professional.verification_attempts = (
            professional.verification_attempts or 0
        ) + 1
        professional.verification_last_attempt_at = datetime.now(timezone.utc)
        if raw_data is not None:
            professional.verification_data = raw_data
        if status == VerificationStatus.APPROVED:
            professional.is_verified = True
            professional.verified_at = datetime.now(timezone.utc)
            if professional.status == ProfessionalAccountStatus.PENDING:
                professional.status = ProfessionalAccountStatus.ACTIVE
        self.session.add(professional)
        self.session.flush()
        return professional

    def admin_override_verification(
        self,
        professional: Professional,
        new_status: VerificationStatus,
        admin_user_id: UUID,
        reason: str,
    ) -> Professional:
        now = datetime.now(timezone.utc)
        professional.admin_override_status = new_status
        professional.admin_override_by = admin_user_id
        professional.admin_override_at = now
        professional.admin_override_reason = reason
        professional.is_verified = new_status in (
            VerificationStatus.APPROVED,
            VerificationStatus.MANUAL_APPROVED,
        )
        if professional.is_verified and professional.status == ProfessionalAccountStatus.PENDING:
            professional.status = ProfessionalAccountStatus.ACTIVE
        professional.updated_at = now
        self.session.add(professional)
        self.session.flush()
        return professional