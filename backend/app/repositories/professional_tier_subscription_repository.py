# app/repositories/professional_tier_subscription.py

from datetime import datetime, timezone
from typing import Optional, Tuple
from uuid import UUID

from sqlmodel import Session, func, select

from app.enums.professional_tier import ProfessionalSubscriptionStatus
from app.models.professional_tier_subscription import (
    ProfessionalTierSubscription,
)


class ProfessionalTierSubscriptionRepository:
    def __init__(self, session: Session):
        self.session = session

    # ─── CREATE ──────────────────────────────────────────────
    def create(
        self, subscription: ProfessionalTierSubscription
    ) -> ProfessionalTierSubscription:
        self.session.add(subscription)
        self.session.flush()
        return subscription

    # ─── READ (single) ───────────────────────────────────────
    def get_by_id(
        self, subscription_id: UUID
    ) -> Optional[ProfessionalTierSubscription]:
        return self.session.get(ProfessionalTierSubscription, subscription_id)

    def get_active_for_professional(
        self,
        professional_id: UUID,
        now: Optional[datetime] = None,
    ) -> Optional[ProfessionalTierSubscription]:
        """The single row that currently grants tier benefits.
        Enforces status=ACTIVE and (expires_at is NULL or in the future)."""
        now = now or datetime.now(timezone.utc)
        stmt = (
            select(ProfessionalTierSubscription)
            .where(
                ProfessionalTierSubscription.professional_id == professional_id,
                ProfessionalTierSubscription.status
                == ProfessionalSubscriptionStatus.ACTIVE.value,
            )
            .where(
                (ProfessionalTierSubscription.expires_at.is_(None))
                | (ProfessionalTierSubscription.expires_at > now)
            )
            .order_by(ProfessionalTierSubscription.starts_at.desc())
        )
        return self.session.exec(stmt).first()

    def get_latest_for_professional(
        self, professional_id: UUID
    ) -> Optional[ProfessionalTierSubscription]:
        """Most recent row regardless of status — useful for display of
        "your last tier was X" after expiry/cancellation."""
        stmt = (
            select(ProfessionalTierSubscription)
            .where(
                ProfessionalTierSubscription.professional_id == professional_id
            )
            .order_by(ProfessionalTierSubscription.created_at.desc())
        )
        return self.session.exec(stmt).first()

    def get_pending_for_professional(
        self, professional_id: UUID
    ) -> Optional[ProfessionalTierSubscription]:
        stmt = (
            select(ProfessionalTierSubscription)
            .where(
                ProfessionalTierSubscription.professional_id == professional_id,
                ProfessionalTierSubscription.status
                == ProfessionalSubscriptionStatus.PENDING.value,
            )
            .order_by(ProfessionalTierSubscription.created_at.desc())
        )
        return self.session.exec(stmt).first()

    def has_active(self, professional_id: UUID) -> bool:
        return self.get_active_for_professional(professional_id) is not None

    # ─── READ (batch) ────────────────────────────────────────
    def list_active_for_professionals(
        self,
        professional_ids: list[UUID],
        now: Optional[datetime] = None,
    ) -> dict[UUID, UUID]:
        """
        Batched version of `get_active_for_professional` — one query for
        many professionals. Returns {professional_id: tier_id}.

        Uses DISTINCT ON so a professional with more than one ACTIVE row
        (should not happen, but the model permits it) yields the most
        recently started subscription, matching the single-row lookup.
        """
        if not professional_ids:
            return {}

        now = now or datetime.now(timezone.utc)
        stmt = (
            select(
                ProfessionalTierSubscription.professional_id,
                ProfessionalTierSubscription.tier_id,
            )
            .where(
                ProfessionalTierSubscription.professional_id.in_(
                    professional_ids
                ),
                ProfessionalTierSubscription.status
                == ProfessionalSubscriptionStatus.ACTIVE.value,
            )
            .where(
                (ProfessionalTierSubscription.expires_at.is_(None))
                | (ProfessionalTierSubscription.expires_at > now)
            )
            .distinct(ProfessionalTierSubscription.professional_id)
            .order_by(
                ProfessionalTierSubscription.professional_id,
                ProfessionalTierSubscription.starts_at.desc(),
            )
        )
        rows = self.session.exec(stmt).all()
        return {prof_id: tier_id for prof_id, tier_id in rows}

    # ─── READ (list) ─────────────────────────────────────────
    def list_for_professional(
        self,
        professional_id: UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[list[ProfessionalTierSubscription], int]:
        conditions = [
            ProfessionalTierSubscription.professional_id == professional_id
        ]
        count_stmt = (
            select(func.count())
            .select_from(ProfessionalTierSubscription)
            .where(*conditions)
        )
        stmt = (
            select(ProfessionalTierSubscription)
            .where(*conditions)
            .order_by(ProfessionalTierSubscription.created_at.desc())
        )
        total = self.session.exec(count_stmt).first() or 0
        items = self.session.exec(stmt.offset(skip).limit(limit)).all()
        return items, total

    # ─── READ (sweep candidates) ─────────────────────────────
    def list_expired_active(
        self, now: Optional[datetime] = None
    ) -> list[ProfessionalTierSubscription]:
        """Active rows whose expiry has passed — used by the expiry sweep
        job to flip them to EXPIRED."""
        now = now or datetime.now(timezone.utc)
        stmt = (
            select(ProfessionalTierSubscription)
            .where(
                ProfessionalTierSubscription.status
                == ProfessionalSubscriptionStatus.ACTIVE.value,
                ProfessionalTierSubscription.expires_at.is_not(None),
                ProfessionalTierSubscription.expires_at <= now,
            )
        )
        return self.session.exec(stmt).all()

    def list_expiring_soon(
        self, within_days: int, now: Optional[datetime] = None
    ) -> list[ProfessionalTierSubscription]:
        """Active rows expiring within `within_days` — used for renewal
        reminder notifications."""
        from datetime import timedelta

        now = now or datetime.now(timezone.utc)
        horizon = now + timedelta(days=within_days)
        stmt = (
            select(ProfessionalTierSubscription)
            .where(
                ProfessionalTierSubscription.status
                == ProfessionalSubscriptionStatus.ACTIVE.value,
                ProfessionalTierSubscription.expires_at.is_not(None),
                ProfessionalTierSubscription.expires_at > now,
                ProfessionalTierSubscription.expires_at <= horizon,
            )
        )
        return self.session.exec(stmt).all()

    # ─── UPDATE ──────────────────────────────────────────────
    def update(
        self, subscription: ProfessionalTierSubscription, **kwargs
    ) -> ProfessionalTierSubscription:
        for key, value in kwargs.items():
            if hasattr(subscription, key):
                setattr(subscription, key, value)
        subscription.updated_at = datetime.now(timezone.utc)
        self.session.add(subscription)
        self.session.flush()
        return subscription

    # ─── STATE TRANSITIONS ───────────────────────────────────
    def activate(
        self,
        subscription: ProfessionalTierSubscription,
        starts_at: datetime,
        expires_at: datetime,
    ) -> ProfessionalTierSubscription:
        subscription.status = ProfessionalSubscriptionStatus.ACTIVE
        subscription.starts_at = starts_at
        subscription.expires_at = expires_at
        subscription.updated_at = datetime.now(timezone.utc)
        self.session.add(subscription)
        self.session.flush()
        return subscription

    def mark_expired(
        self, subscription: ProfessionalTierSubscription
    ) -> ProfessionalTierSubscription:
        subscription.status = ProfessionalSubscriptionStatus.EXPIRED
        subscription.updated_at = datetime.now(timezone.utc)
        self.session.add(subscription)
        self.session.flush()
        return subscription

    def mark_cancelled(
        self, subscription: ProfessionalTierSubscription
    ) -> ProfessionalTierSubscription:
        now = datetime.now(timezone.utc)
        subscription.status = ProfessionalSubscriptionStatus.CANCELLED
        subscription.cancelled_at = now
        subscription.updated_at = now
        self.session.add(subscription)
        self.session.flush()
        return subscription

    def mark_suspended(
        self, subscription: ProfessionalTierSubscription
    ) -> ProfessionalTierSubscription:
        subscription.status = ProfessionalSubscriptionStatus.SUSPENDED
        subscription.updated_at = datetime.now(timezone.utc)
        self.session.add(subscription)
        self.session.flush()
        return subscription