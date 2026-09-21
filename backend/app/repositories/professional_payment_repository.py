# app/repositories/professional_payment.py

from datetime import datetime, timezone
from typing import Optional, Tuple
from uuid import UUID

from sqlmodel import Session, func, select

from app.enums.payment import PaymentProvider, PaymentStatus
from app.models.professional_payment import ProfessionalPayment


class ProfessionalPaymentRepository:
    def __init__(self, session: Session):
        self.session = session

    # ─── CREATE ──────────────────────────────────────────────
    def create(self, payment: ProfessionalPayment) -> ProfessionalPayment:
        self.session.add(payment)
        self.session.flush()
        return payment

    # ─── READ (single) ───────────────────────────────────────
    def get_by_id(self, payment_id: UUID) -> Optional[ProfessionalPayment]:
        return self.session.get(ProfessionalPayment, payment_id)

    def get_by_reference(self, reference: str) -> Optional[ProfessionalPayment]:
        stmt = select(ProfessionalPayment).where(
            ProfessionalPayment.reference == reference
        )
        return self.session.exec(stmt).first()

    def get_by_provider_transaction(
        self, provider: PaymentProvider, provider_transaction_id: str
    ) -> Optional[ProfessionalPayment]:
        stmt = select(ProfessionalPayment).where(
            ProfessionalPayment.provider == provider,
            ProfessionalPayment.provider_transaction_id
            == provider_transaction_id,
        )
        return self.session.exec(stmt).first()

    def reference_exists(self, reference: str) -> bool:
        """Used by the service when generating a unique SKL-XXXXXXXX code."""
        stmt = select(func.count()).select_from(ProfessionalPayment).where(
            ProfessionalPayment.reference == reference
        )
        return (self.session.exec(stmt).first() or 0) > 0

    # ─── READ (list) ─────────────────────────────────────────
    def list_for_professional(
        self,
        professional_id: UUID,
        status: Optional[PaymentStatus] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[list[ProfessionalPayment], int]:
        conditions = [ProfessionalPayment.professional_id == professional_id]
        if status:
            conditions.append(ProfessionalPayment.status == status.value)

        count_stmt = (
            select(func.count())
            .select_from(ProfessionalPayment)
            .where(*conditions)
        )
        stmt = (
            select(ProfessionalPayment)
            .where(*conditions)
            .order_by(ProfessionalPayment.created_at.desc())
        )
        total = self.session.exec(count_stmt).first() or 0
        items = self.session.exec(stmt.offset(skip).limit(limit)).all()
        return items, total

    def list_for_user(
        self,
        user_id: UUID,
        status: Optional[PaymentStatus] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[list[ProfessionalPayment], int]:
        conditions = [ProfessionalPayment.user_id == user_id]
        if status:
            conditions.append(ProfessionalPayment.status == status.value)

        count_stmt = (
            select(func.count())
            .select_from(ProfessionalPayment)
            .where(*conditions)
        )
        stmt = (
            select(ProfessionalPayment)
            .where(*conditions)
            .order_by(ProfessionalPayment.created_at.desc())
        )
        total = self.session.exec(count_stmt).first() or 0
        items = self.session.exec(stmt.offset(skip).limit(limit)).all()
        return items, total

    def list_for_subscription(
        self, subscription_id: UUID
    ) -> list[ProfessionalPayment]:
        stmt = (
            select(ProfessionalPayment)
            .where(ProfessionalPayment.subscription_id == subscription_id)
            .order_by(ProfessionalPayment.created_at.desc())
        )
        return self.session.exec(stmt).all()

    # ─── SWEEP CANDIDATES ────────────────────────────────────
    def list_pending_older_than(
        self, older_than: datetime, statuses: Optional[list[PaymentStatus]] = None
    ) -> list[ProfessionalPayment]:
        """Pending/processing rows older than the given cutoff — used to
        expire abandoned payments (user closed the MoMo prompt)."""
        statuses = statuses or [
            PaymentStatus.PENDING,
            PaymentStatus.PROCESSING,
        ]
        status_values = [s.value for s in statuses]
        stmt = select(ProfessionalPayment).where(
            ProfessionalPayment.status.in_(status_values),
            ProfessionalPayment.created_at < older_than,
        )
        return self.session.exec(stmt).all()

    # ─── UPDATE ──────────────────────────────────────────────
    def update(
        self, payment: ProfessionalPayment, **kwargs
    ) -> ProfessionalPayment:
        for key, value in kwargs.items():
            if hasattr(payment, key):
                setattr(payment, key, value)
        payment.updated_at = datetime.now(timezone.utc)
        self.session.add(payment)
        self.session.flush()
        return payment

    # ─── STATE TRANSITIONS ───────────────────────────────────
    def mark_processing(
        self, payment: ProfessionalPayment
    ) -> ProfessionalPayment:
        payment.status = PaymentStatus.PROCESSING
        payment.updated_at = datetime.now(timezone.utc)
        self.session.add(payment)
        self.session.flush()
        return payment

    def mark_success(
        self,
        payment: ProfessionalPayment,
        provider_transaction_id: str,
        provider_response: Optional[dict] = None,
    ) -> ProfessionalPayment:
        now = datetime.now(timezone.utc)
        payment.status = PaymentStatus.SUCCESS
        payment.provider_transaction_id = provider_transaction_id
        if provider_response is not None:
            payment.provider_response = provider_response
        payment.paid_at = now
        payment.updated_at = now
        self.session.add(payment)
        self.session.flush()
        return payment

    def mark_failed(
        self,
        payment: ProfessionalPayment,
        provider_response: Optional[dict] = None,
        reason: Optional[str] = None,
    ) -> ProfessionalPayment:
        now = datetime.now(timezone.utc)
        payment.status = PaymentStatus.FAILED
        if provider_response is not None:
            payment.provider_response = provider_response
        if reason:
            payment.description = reason
        payment.failed_at = now
        payment.updated_at = now
        self.session.add(payment)
        self.session.flush()
        return payment

    def mark_cancelled(
        self,
        payment: ProfessionalPayment,
        reason: Optional[str] = None,
    ) -> ProfessionalPayment:
        payment.status = PaymentStatus.CANCELLED
        if reason:
            payment.description = reason
        payment.updated_at = datetime.now(timezone.utc)
        self.session.add(payment)
        self.session.flush()
        return payment

    def mark_expired(
        self, payment: ProfessionalPayment
    ) -> ProfessionalPayment:
        payment.status = PaymentStatus.EXPIRED
        payment.updated_at = datetime.now(timezone.utc)
        self.session.add(payment)
        self.session.flush()
        return payment

    def mark_refunded(
        self,
        payment: ProfessionalPayment,
        provider_response: Optional[dict] = None,
    ) -> ProfessionalPayment:
        payment.status = PaymentStatus.REFUNDED
        if provider_response is not None:
            payment.provider_response = provider_response
        payment.updated_at = datetime.now(timezone.utc)
        self.session.add(payment)
        self.session.flush()
        return payment