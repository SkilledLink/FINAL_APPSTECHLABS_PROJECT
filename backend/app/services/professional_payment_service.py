# app/services/professional_payment_service.py

import logging
import secrets
import string
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status as http_status
from sqlmodel import Session

from app.enums.payment import (
    PaymentMethod,
    PaymentProvider,
    PaymentStatus,
)
from app.enums.professional import AuditAction
from app.enums.professional_tier import ProfessionalSubscriptionStatus
from app.models.professional import Professional
from app.models.professional_audit_log import ProfessionalAuditLog
from app.models.professional_payment import ProfessionalPayment
from app.models.professional_tier import ProfessionalTier
from app.models.user import User
from app.repositories.professional_audit_repository import (
    ProfessionalAuditRepository,
)
from app.repositories.professional_payment_repository import (
    ProfessionalPaymentRepository,
)
from app.repositories.professional_tier_repository import (
    ProfessionalTierRepository,
)
from app.repositories.professional_tier_subscription_repository import (
    ProfessionalTierSubscriptionRepository,
)
from app.services.notification_service import NotificationService
from app.services.payments import get_payment_provider
from app.services.payments.base import PaymentProviderClient
from app.services.professional_subscription_service import (
    ProfessionalSubscriptionService,
)

logger = logging.getLogger(__name__)

_REF_ALPHABET = string.ascii_uppercase + string.digits
_REF_PREFIX = "SKL-"
_REF_LENGTH = 8
_REF_MAX_ATTEMPTS = 10

DEFAULT_STALE_PAYMENT_MINUTES = 30


class ProfessionalPaymentService:
    def __init__(
        self,
        session: Session,
        provider: Optional[PaymentProviderClient] = None,
    ):
        self.session = session
        self.repo = ProfessionalPaymentRepository(session)
        self.tier_repo = ProfessionalTierRepository(session)
        self.sub_repo = ProfessionalTierSubscriptionRepository(session)
        self.subscription_service = ProfessionalSubscriptionService(session)
        self.audit_repo = ProfessionalAuditRepository(session)
        self.provider = provider or get_payment_provider()

    # ─── INITIATE ────────────────────────────────────────────
    def initiate_payment(
        self,
        *,
        user: User,
        professional: Professional,
        tier: ProfessionalTier,
        provider_name: PaymentProvider,
        payment_method: PaymentMethod,
        phone_number: str,
        description: Optional[str] = None,
    ) -> tuple[ProfessionalPayment, dict]:
        if not tier.is_active:
            raise HTTPException(
                http_status.HTTP_400_BAD_REQUEST,
                "This tier is not currently available for purchase",
            )
        if tier.currency != "XAF":
            logger.warning(
                "Initiating payment in non-XAF currency: %s", tier.currency
            )

        current_active = self.sub_repo.get_active_for_professional(
            professional.id
        )
        previous_sub_id = current_active.id if current_active else None

        subscription = self.subscription_service.create_pending(
            professional_id=professional.id,
            tier_id=tier.id,
            previous_subscription_id=previous_sub_id,
        )

        reference = self._generate_reference()
        payment = ProfessionalPayment(
            user_id=user.id,
            professional_id=professional.id,
            tier_id=tier.id,
            subscription_id=subscription.id,
            reference=reference,
            provider=provider_name,
            amount=tier.price,
            currency=tier.currency,
            status=PaymentStatus.PENDING,
            payment_method=payment_method,
            description=description or f"Subscription to {tier.name}",
        )
        self.repo.create(payment)
        self.session.commit()
        self.session.refresh(payment)

        self._log_audit(
            professional.id,
            AuditAction.PAYMENT_CREATED,
            actor_user_id=user.id,
            actor_role="user",
            new_value={
                "payment_id": str(payment.id),
                "reference": reference,
                "amount": str(tier.price),
                "currency": tier.currency,
            },
        )
        self.session.commit()

        try:
            result = self.provider.initiate_charge(
                reference=reference,
                amount=tier.price,
                currency=tier.currency,
                customer={
                    "name": f"{user.first_name} {user.last_name}".strip(),
                    "email": user.email,
                },
                phone_number=phone_number,
                network=provider_name.value,
                description=payment.description,
            )
        except Exception as exc:
            logger.exception(
                "Provider initiation raised for reference %s", reference
            )
            self.repo.mark_failed(
                payment,
                provider_response={"error": str(exc)},
                reason="Provider initiation failed",
            )
            self.subscription_service.cancel(
                subscription,
                reason="Payment initiation failed",
                actor_role="system",
            )
            self.session.commit()
            raise HTTPException(
                http_status.HTTP_502_BAD_GATEWAY,
                "Payment provider unavailable",
            )

        if result.status == "failed":
            self.repo.mark_failed(
                payment,
                provider_response=result.raw,
                reason=result.message or "Provider rejected the charge",
            )
            self.subscription_service.cancel(
                subscription,
                reason="Provider rejected the charge",
                actor_role="system",
            )
            self.session.commit()
            raise HTTPException(
                http_status.HTTP_400_BAD_REQUEST,
                result.message or "Payment provider rejected the request",
            )

        extra = {
            "provider_init": result.raw,
            "checkout_url": result.checkout_url,
        }
        if result.provider_reference:
            extra["provider_reference"] = result.provider_reference

        self.repo.update(
            payment,
            status=PaymentStatus.PROCESSING.value,
            provider_transaction_id=result.provider_reference
            or payment.provider_transaction_id,
            extra_metadata=extra,
        )
        self.session.commit()
        self.session.refresh(payment)

        return payment, {
            "instructions": result.instructions,
            "checkout_url": result.checkout_url,
            "message": result.message,
        }

    # ─── READ ────────────────────────────────────────────────
    def get_payment(self, payment_id: UUID) -> ProfessionalPayment:
        payment = self.repo.get_by_id(payment_id)
        if not payment:
            raise HTTPException(404, "Payment not found")
        return payment

    def get_by_reference(self, reference: str) -> Optional[ProfessionalPayment]:
        return self.repo.get_by_reference(reference)

    # ─── LIVE STATUS POLLING ─────────────────────────────────
    def fetch_provider_status(self, reference: str) -> dict:
        payment = self.repo.get_by_reference(reference)
        if not payment:
            raise HTTPException(404, "Payment not found")

        if payment.status in (
            PaymentStatus.SUCCESS,
            PaymentStatus.FAILED,
            PaymentStatus.CANCELLED,
            PaymentStatus.REFUNDED,
            PaymentStatus.EXPIRED,
        ):
            return {
                "status": payment.status.value.upper()
                if hasattr(payment.status, "value")
                else str(payment.status).upper(),
                "reason": None,
                "financial_transaction_id": payment.provider_transaction_id,
                "amount": str(payment.amount),
                "currency": payment.currency,
            }

        provider_ref = payment.provider_transaction_id or reference

        get_status = getattr(self.provider, "get_status", None)
        if get_status is None:
            raise HTTPException(
                http_status.HTTP_400_BAD_REQUEST,
                "Active payment provider does not support status polling",
            )

        try:
            raw = get_status(provider_ref)
        except Exception as exc:
            logger.warning(
                "Status lookup failed for %s: %s", reference, exc
            )
            raise HTTPException(
                http_status.HTTP_502_BAD_GATEWAY,
                f"Could not fetch status: {exc}",
            )

        status_upper = (raw.get("status") or "PENDING").upper()

        if status_upper in ("SUCCESSFUL", "SUCCESS"):
            self.repo.mark_success(
                payment,
                provider_transaction_id=raw.get("financialTransactionId")
                or payment.provider_transaction_id
                or reference,
                provider_response=raw,
            )
            if payment.subscription_id:
                sub = self.sub_repo.get_by_id(payment.subscription_id)
                tier = self.tier_repo.get_by_id(payment.tier_id)
                if sub and tier:
                    self.subscription_service.activate(sub)
            self.session.commit()
            self.session.refresh(payment)
            self._log_audit(
                payment.professional_id,
                AuditAction.PAYMENT_SUCCESS,
                actor_role="system",
                new_value={
                    "payment_id": str(payment.id),
                    "provider_transaction_id": raw.get(
                        "financialTransactionId"
                    ),
                    "source": "poll",
                },
            )
            self.session.commit()

            try:
                NotificationService(self.session).notify_payment(
                    recipient_id=payment.user_id,
                    status="succeeded",
                    reference=payment.reference,
                    amount=(
                        float(payment.amount)
                        if payment.amount is not None
                        else None
                    ),
                    currency=payment.currency,
                )
            except Exception:
                logger.exception("Payment success notification failed")

        elif status_upper in ("FAILED", "CANCELLED", "EXPIRED"):
            self.repo.mark_failed(
                payment,
                provider_response=raw,
                reason=raw.get("reason") or "Payment failed",
            )
            if payment.subscription_id:
                sub = self.sub_repo.get_by_id(payment.subscription_id)
                if (
                    sub
                    and sub.status == ProfessionalSubscriptionStatus.PENDING
                ):
                    self.sub_repo.mark_cancelled(sub)
            self.session.commit()
            self.session.refresh(payment)

            try:
                NotificationService(self.session).notify_payment(
                    recipient_id=payment.user_id,
                    status="failed",
                    reference=payment.reference,
                    amount=(
                        float(payment.amount)
                        if payment.amount is not None
                        else None
                    ),
                    currency=payment.currency,
                )
            except Exception:
                logger.exception("Payment failure notification failed")

        return {
            "status": status_upper,
            "reason": raw.get("reason"),
            "financial_transaction_id": raw.get("financialTransactionId"),
            "amount": raw.get("amount"),
            "currency": raw.get("currency"),
        }

    # ─── CANCEL / REFUND ─────────────────────────────────────
    def cancel_payment(
        self,
        payment_id: UUID,
        reason: Optional[str] = None,
        actor_user_id: Optional[UUID] = None,
        actor_role: str = "user",
    ) -> ProfessionalPayment:
        payment = self.get_payment(payment_id)
        if payment.status not in (
            PaymentStatus.PENDING,
            PaymentStatus.PROCESSING,
        ):
            raise HTTPException(
                400,
                f"Cannot cancel a payment in status {payment.status}",
            )

        self.repo.mark_cancelled(payment, reason=reason)
        if payment.subscription_id:
            sub = self.sub_repo.get_by_id(payment.subscription_id)
            if sub and sub.status in (
                ProfessionalSubscriptionStatus.PENDING,
                ProfessionalSubscriptionStatus.ACTIVE,
            ):
                self.subscription_service.cancel(
                    sub,
                    reason=reason or "Payment cancelled",
                    actor_user_id=actor_user_id,
                    actor_role=actor_role,
                )
        self.session.commit()
        self.session.refresh(payment)

        self._log_audit(
            payment.professional_id,
            AuditAction.PAYMENT_CANCELLED,
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            new_value={"payment_id": str(payment.id)},
            reason=reason,
        )
        self.session.commit()
        return payment

    def mark_refunded(
        self,
        payment_id: UUID,
        reason: str,
        actor_user_id: UUID,
    ) -> ProfessionalPayment:
        payment = self.get_payment(payment_id)
        if payment.status != PaymentStatus.SUCCESS:
            raise HTTPException(400, "Only successful payments can be refunded")

        self.repo.mark_refunded(payment)
        if payment.subscription_id:
            sub = self.sub_repo.get_by_id(payment.subscription_id)
            if sub and sub.status == ProfessionalSubscriptionStatus.ACTIVE:
                self.subscription_service.cancel(
                    sub,
                    reason=f"Refund issued: {reason}",
                    actor_user_id=actor_user_id,
                    actor_role="admin",
                )
        self.session.commit()
        self.session.refresh(payment)

        self._log_audit(
            payment.professional_id,
            AuditAction.PAYMENT_REFUNDED,
            actor_user_id=actor_user_id,
            actor_role="admin",
            new_value={"payment_id": str(payment.id)},
            reason=reason,
        )
        self.session.commit()

        try:
            NotificationService(self.session).notify_payment(
                recipient_id=payment.user_id,
                status="refunded",
                reference=payment.reference,
                amount=(
                    float(payment.amount)
                    if payment.amount is not None
                    else None
                ),
                currency=payment.currency,
            )
        except Exception:
            logger.exception("Payment refund notification failed")

        return payment

    # ─── WEBHOOK / PROVIDER CALLBACK ─────────────────────────
    def handle_webhook(
        self, raw_body: bytes, body: dict, headers: dict
    ) -> ProfessionalPayment:
        if not self.provider.verify_webhook_signature(raw_body, headers):
            raise HTTPException(401, "Invalid webhook signature")

        event = self.provider.parse_webhook_event(body)
        if not event.reference:
            raise HTTPException(400, "Webhook missing payment reference")

        payment = self.repo.get_by_reference(event.reference)
        if not payment:
            logger.warning(
                "Webhook for unknown reference: %s", event.reference
            )
            raise HTTPException(404, "Payment not found")

        if event.status == "success":
            return self._finalize_success(payment, event)
        if event.status == "failed":
            return self._finalize_failure(payment, event)

        logger.info(
            "Webhook for %s reported non-terminal status; ignoring.",
            event.reference,
        )
        return payment

    # ─── SWEEP ───────────────────────────────────────────────
    def expire_stale_payments(
        self, age_minutes: int = DEFAULT_STALE_PAYMENT_MINUTES
    ) -> int:
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=age_minutes)
        stale = self.repo.list_pending_older_than(cutoff)
        for payment in stale:
            self.repo.mark_expired(payment)
            if payment.subscription_id:
                sub = self.sub_repo.get_by_id(payment.subscription_id)
                if (
                    sub
                    and sub.status == ProfessionalSubscriptionStatus.PENDING
                ):
                    self.sub_repo.mark_cancelled(sub)
            self._log_audit(
                payment.professional_id,
                AuditAction.PAYMENT_EXPIRED,
                actor_role="system",
                new_value={"payment_id": str(payment.id)},
            )
        if stale:
            self.session.commit()
        return len(stale)

    # ─── INTERNALS ───────────────────────────────────────────
    def _finalize_success(
        self, payment: ProfessionalPayment, event
    ) -> ProfessionalPayment:
        if payment.status == PaymentStatus.SUCCESS:
            return payment

        self.repo.mark_success(
            payment,
            provider_transaction_id=event.provider_transaction_id
            or payment.reference,
            provider_response=event.raw,
        )

        if payment.subscription_id:
            sub = self.sub_repo.get_by_id(payment.subscription_id)
            tier = self.tier_repo.get_by_id(payment.tier_id)
            if sub and tier:
                self.subscription_service.activate(sub)

        self.session.commit()
        self.session.refresh(payment)

        self._log_audit(
            payment.professional_id,
            AuditAction.PAYMENT_SUCCESS,
            actor_role="system",
            new_value={
                "payment_id": str(payment.id),
                "provider_transaction_id": event.provider_transaction_id,
            },
        )
        self.session.commit()

        try:
            NotificationService(self.session).notify_payment(
                recipient_id=payment.user_id,
                status="succeeded",
                reference=payment.reference,
                amount=(
                    float(payment.amount)
                    if payment.amount is not None
                    else None
                ),
                currency=payment.currency,
            )
        except Exception:
            logger.exception("Payment success notification failed")

        return payment

    def _finalize_failure(
        self, payment: ProfessionalPayment, event
    ) -> ProfessionalPayment:
        if payment.status in (PaymentStatus.SUCCESS, PaymentStatus.FAILED):
            return payment

        self.repo.mark_failed(
            payment,
            provider_response=event.raw,
            reason=event.reason or "Payment failed",
        )
        if payment.subscription_id:
            sub = self.sub_repo.get_by_id(payment.subscription_id)
            if sub and sub.status == ProfessionalSubscriptionStatus.PENDING:
                self.sub_repo.mark_cancelled(sub)

        self.session.commit()
        self.session.refresh(payment)

        self._log_audit(
            payment.professional_id,
            AuditAction.PAYMENT_FAILED,
            actor_role="system",
            new_value={"payment_id": str(payment.id)},
            reason=event.reason,
        )
        self.session.commit()

        try:
            NotificationService(self.session).notify_payment(
                recipient_id=payment.user_id,
                status="failed",
                reference=payment.reference,
                amount=(
                    float(payment.amount)
                    if payment.amount is not None
                    else None
                ),
                currency=payment.currency,
            )
        except Exception:
            logger.exception("Payment failure notification failed")

        return payment

    def _generate_reference(self) -> str:
        for _ in range(_REF_MAX_ATTEMPTS):
            code = _REF_PREFIX + "".join(
                secrets.choice(_REF_ALPHABET) for _ in range(_REF_LENGTH)
            )
            if not self.repo.reference_exists(code):
                return code
        raise HTTPException(
            500, "Could not generate a unique payment reference"
        )

    def _log_audit(
        self,
        professional_id: Optional[UUID],
        action: AuditAction,
        actor_user_id: Optional[UUID] = None,
        actor_role: Optional[str] = None,
        old_value: Optional[dict] = None,
        new_value: Optional[dict] = None,
        reason: Optional[str] = None,
    ) -> Optional[ProfessionalAuditLog]:
        if professional_id is None:
            return None
        log = ProfessionalAuditLog(
            professional_id=professional_id,
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            action=action,
            old_value=old_value,
            new_value=new_value,
            reason=reason,
        )
        return self.audit_repo.create(log)