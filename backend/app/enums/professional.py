# app/enums/professional.py

from enum import Enum


# ═══════════════════════════════════════════════════════════════
#  PRE-EXISTING — used by professional_portfolio.py
#  ⚠️ VERIFY these values against your original file & DB.
# ═══════════════════════════════════════════════════════════════

class DurationUnit(str, Enum):
    HOURS = "hours"
    DAYS = "days"
    WEEKS = "weeks"
    MONTHS = "months"


class ClientType(str, Enum):
    INDIVIDUAL = "individual"
    BUSINESS = "business"
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


# ═══════════════════════════════════════════════════════════════
#  NEW — professional v2 (Step 2)
# ═══════════════════════════════════════════════════════════════

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
    PROFILE_CREATED = "profile.created"
    PROFILE_UPDATED = "profile.updated"
    PROFILE_SOFT_DELETED_SELF = "profile.soft_deleted.self"
    PROFILE_SOFT_DELETED_ADMIN = "profile.soft_deleted.admin"
    STATUS_SUSPENDED = "status.suspended"
    STATUS_REACTIVATED = "status.reactivated"
    STATUS_UNDER_REVIEW = "status.under_review"
    STATUS_DEACTIVATED = "status.deactivated"
    VERIFICATION_SUBMITTED = "verification.submitted"
    VERIFICATION_APPROVED = "verification.approved"
    VERIFICATION_REJECTED = "verification.rejected"
    VERIFICATION_FAILED = "verification.failed"
    VERIFICATION_MANUAL_REVIEW = "verification.manual_review"
    VERIFICATION_MANUAL_APPROVED = "verification.manual_approved"
    VERIFICATION_MANUAL_REJECTED = "verification.manual_rejected"
    VERIFICATION_ATTEMPTS_EXHAUSTED = "verification.attempts_exhausted"
    FLAG_ADDED = "flag.added"
    FLAG_REMOVED = "flag.removed"
    TRUST_SCORE_CHANGED = "trust_score.changed"