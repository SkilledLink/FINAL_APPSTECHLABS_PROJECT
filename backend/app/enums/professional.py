# app/enums/professional.py

from enum import Enum


# ── Pre-existing ────────────────────────────────────────────────
class DurationUnit(str, Enum):
    HOURS = "hours"
    DAYS = "days"
    WEEKS = "weeks"
    MONTHS = "months"


class ClientType(str, Enum):
    INDIVIDUAL = "individual"
    BUSINESS = "business"
    HOUSEHOLD = "household"
    GOVERNMENT = "government"
    NGO = "ngo"


class PricingType(str, Enum):
    FIXED = "fixed"
    HOURLY = "hourly"
    DAILY = "daily"
    MONTHLY = "monthly"
    STARTING_FROM = "starting_from"
    NEGOTIABLE = "negotiable"


class AvailabilityDay(str, Enum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"


# ── Professional v2 ─────────────────────────────────────────────
class ProfessionalAccountStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    UNDER_REVIEW = "under_review"
    DEACTIVATED = "deactivated"
    DELETED = "deleted"


class VerificationStatus(str, Enum):
    NOT_STARTED = "not_started"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    FAILED = "failed"
    MANUAL_REVIEW = "manual_review"
    MANUAL_APPROVED = "manual_approved"
    MANUAL_REJECTED = "manual_rejected"
    EXPIRED = "expired"


class ExperienceLevel(str, Enum):
    JUNIOR = "junior"
    INTERMEDIATE = "intermediate"
    SENIOR = "senior"
    EXPERT = "expert"


class DeletionType(str, Enum):
    SELF = "self"
    ADMIN = "admin"
    GDPR = "gdpr"
    BAN = "ban"


class AuditAction(str, Enum):
    # Profile
    PROFILE_CREATED = "profile.created"
    PROFILE_UPDATED = "profile.updated"
    PROFILE_SOFT_DELETED_SELF = "profile.soft_deleted.self"
    PROFILE_SOFT_DELETED_ADMIN = "profile.soft_deleted.admin"

    # Status
    STATUS_SUSPENDED = "status.suspended"
    STATUS_REACTIVATED = "status.reactivated"
    STATUS_UNDER_REVIEW = "status.under_review"
    STATUS_DEACTIVATED = "status.deactivated"

    # Verification
    VERIFICATION_SUBMITTED = "verification.submitted"
    VERIFICATION_APPROVED = "verification.approved"
    VERIFICATION_REJECTED = "verification.rejected"
    VERIFICATION_FAILED = "verification.failed"
    VERIFICATION_MANUAL_REVIEW = "verification.manual_review"
    VERIFICATION_MANUAL_APPROVED = "verification.manual_approved"
    VERIFICATION_MANUAL_REJECTED = "verification.manual_rejected"
    VERIFICATION_ATTEMPTS_EXHAUSTED = "verification.attempts_exhausted"

    # Fraud / trust
    FLAG_ADDED = "flag.added"
    FLAG_REMOVED = "flag.removed"
    TRUST_SCORE_CHANGED = "trust_score.changed"

    # Tier / subscription lifecycle
    TIER_PURCHASED = "tier.purchased"
    TIER_UPGRADED = "tier.upgraded"
    TIER_RENEWED = "tier.renewed"
    TIER_EXPIRED = "tier.expired"
    TIER_CANCELLED = "tier.cancelled"
    TIER_SUSPENDED = "tier.suspended"

    # Payment lifecycle
    PAYMENT_CREATED = "payment.created"
    PAYMENT_PROCESSING = "payment.processing"
    PAYMENT_SUCCESS = "payment.success"
    PAYMENT_FAILED = "payment.failed"
    PAYMENT_CANCELLED = "payment.cancelled"
    PAYMENT_REFUNDED = "payment.refunded"
    PAYMENT_EXPIRED = "payment.expired"

    # AI proposal lifecycle
    AI_PROPOSAL_CREATED = "ai.proposal.created"
    AI_PROPOSAL_ACCEPTED = "ai.proposal.accepted"
    AI_PROPOSAL_REJECTED = "ai.proposal.rejected"
    AI_PROPOSAL_SUPERSEDED = "ai.proposal.superseded"