# app/services/professional_subscription_service.py

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlmodel import Session

from app.enums.professional import AuditAction
from app.enums.professional_tier import ProfessionalSubscriptionStatus
from app.models.professional_audit_log import ProfessionalAuditLog
from app.models.professional_tier_subscription import (
    ProfessionalTierSubscription,
)
from app.repositories.professional_audit_repository import (
    ProfessionalAuditRepository,
)
from app.repositories.professional_tier_repository import (
    ProfessionalTierRepository,
)
from app.repositories.professional_tier_subscription_repository import (
    ProfessionalTierSubscriptionRepository,
)
from app.schemas.professional_tier import ProfessionalTierBadge

logger = logging.getLogger(__name__)


class ProfessionalSubscriptionService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = ProfessionalTierSubscriptionRepository(session)
        self.tier_repo = ProfessionalTierRepository(session)
        self.audit_repo = ProfessionalAuditRepository(session)

    # ─── READS ───────────────────────────────────────────────
    def get_by_id(
        self, subscription_id: UUID
    ) -> Optional[ProfessionalTierSubscription]:
        return self.repo.get_by_id(subscription_id)

    def get_active(
        self, professional_id: UUID
    ) -> Optional[ProfessionalTierSubscription]:
        return self.repo.get_active_for_professional(professional_id)

    def get_entitlements(self, professional_id: UUID) -> dict[str, dict]:
        """Returns {feature_key: feature_value} for the active tier.
        Empty dict when there is no active subscription."""
        sub = self.get_active(professional_id)
        if not sub:
            return {}
        features = self.tier_repo.list_features(sub.tier_id, enabled_only=True)
        return {
            f.feature_key: (f.feature_value or {}) for f in features
        }

    def has_feature(self, professional_id: UUID, feature_key: str) -> bool:
        return feature_key in self.get_entitlements(professional_id)

    def get_feature_value(
        self, professional_id: UUID, feature_key: str
    ) -> Optional[dict]:
        return self.get_entitlements(professional_id).get(feature_key)

    def build_badge(
        self, professional_id: UUID
    ) -> Optional[ProfessionalTierBadge]:
        sub = self.get_active(professional_id)
        if not sub:
            return None
        tier = self.tier_repo.get_by_id(sub.tier_id)
        if not tier:
            return None
        return ProfessionalTierBadge(
            tier_id=tier.id,
            level=tier.level,
            name=tier.name,
            badge_name=tier.badge_name,
            badge_code=tier.badge_code,
            badge_icon=tier.badge_icon,
            badge_color=tier.badge_color,
            badge_secondary_color=tier.badge_secondary_color,
            badge_shape=tier.badge_shape,
        )

    # ─── LIFECYCLE ───────────────────────────────────────────
    def create_pending(
        self,
        professional_id: UUID,
        tier_id: UUID,
        previous_subscription_id: Optional[UUID] = None,
    ) -> ProfessionalTierSubscription:
        """Creates a PENDING subscription. It only becomes ACTIVE once a
        payment is confirmed by the provider."""
        sub = ProfessionalTierSubscription(
            professional_id=professional_id,
            tier_id=tier_id,
            status=ProfessionalSubscriptionStatus.PENDING,
            previous_subscription_id=previous_subscription_id,
        )
        self.repo.create(sub)
        self.session.commit()
        self.session.refresh(sub)
        return sub

    def activate(
        self,
        subscription: ProfessionalTierSubscription,
        starts_at: Optional[datetime] = None,
        expires_at: Optional[datetime] = None,
        actor_user_id: Optional[UUID] = None,
    ) -> ProfessionalTierSubscription:
        now = datetime.now(timezone.utc)
        starts_at = starts_at or now

        if expires_at is None:
            tier = self.tier_repo.get_by_id(subscription.tier_id)
            if not tier:
                raise HTTPException(404, "Tier not found")
            expires_at = starts_at + timedelta(days=tier.duration_days)

        # Supersede any other currently-active subscription for this pro.
        current = self.repo.get_active_for_professional(
            subscription.professional_id
        )
        if current and current.id != subscription.id:
            self.repo.update(current, expires_at=now)
            self.repo.mark_expired(current)

        self.repo.activate(
            subscription, starts_at=starts_at, expires_at=expires_at
        )
        self.session.commit()
        self.session.refresh(subscription)

        action = (
            AuditAction.TIER_PURCHASED
            if subscription.previous_subscription_id is None
            else AuditAction.TIER_UPGRADED
        )
        self._log_audit(
            subscription.professional_id,
            action,
            actor_user_id=actor_user_id,
            actor_role="system",
            new_value={
                "subscription_id": str(subscription.id),
                "tier_id": str(subscription.tier_id),
                "starts_at": str(starts_at),
                "expires_at": str(expires_at),
            },
        )
        self.session.commit()
        return subscription

    def cancel(
        self,
        subscription: ProfessionalTierSubscription,
        reason: Optional[str] = None,
        actor_user_id: Optional[UUID] = None,
        actor_role: str = "user",
    ) -> ProfessionalTierSubscription:
        if subscription.status not in (
            ProfessionalSubscriptionStatus.ACTIVE,
            ProfessionalSubscriptionStatus.PENDING,
        ):
            raise HTTPException(
                400,
                f"Cannot cancel a subscription in status {subscription.status}",
            )
        self.repo.mark_cancelled(subscription)
        self.session.commit()
        self.session.refresh(subscription)

        self._log_audit(
            subscription.professional_id,
            AuditAction.TIER_CANCELLED,
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            reason=reason,
        )
        self.session.commit()
        return subscription

    def suspend(
        self,
        subscription: ProfessionalTierSubscription,
        reason: str,
        actor_user_id: Optional[UUID] = None,
    ) -> ProfessionalTierSubscription:
        self.repo.mark_suspended(subscription)
        self.session.commit()
        self.session.refresh(subscription)
        self._log_audit(
            subscription.professional_id,
            AuditAction.TIER_SUSPENDED,
            actor_user_id=actor_user_id,
            actor_role="admin",
            reason=reason,
        )
        self.session.commit()
        return subscription

    def expire_sweep(self) -> int:
        """Cron entry point — flips ACTIVE rows whose expires_at has passed
        to EXPIRED. Returns the number of rows transitioned."""
        now = datetime.now(timezone.utc)
        expired = self.repo.list_expired_active(now)
        for sub in expired:
            self.repo.mark_expired(sub)
            self._log_audit(
                sub.professional_id,
                AuditAction.TIER_EXPIRED,
                actor_role="system",
                new_value={"subscription_id": str(sub.id)},
            )
        if expired:
            self.session.commit()
        return len(expired)

    # ─── INTERNALS ───────────────────────────────────────────
    def _log_audit(
        self,
        professional_id: UUID,
        action: AuditAction,
        actor_user_id: Optional[UUID] = None,
        actor_role: Optional[str] = None,
        old_value: Optional[dict] = None,
        new_value: Optional[dict] = None,
        reason: Optional[str] = None,
    ) -> ProfessionalAuditLog:
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