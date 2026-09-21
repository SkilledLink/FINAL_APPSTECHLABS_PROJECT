# app/schemas/__init__.py
"""
Central re-export for Pydantic schemas.

Add imports for a schema file only after inspecting its contents —
importing a name that does not exist will break the whole package at
startup.

Order: user → professional → professional_portfolio → tier →
subscription → payment → ai_usage → admin.
"""

# ── User ──────────────────────────────────────────────────
from app.schemas.user import (
    UserResponse,
    UserUpdate,
    UserListResponse,
    UserCreate,
    UserLogin,
    Token,
    RefreshTokenRequest,
    VerificationRequest,
    VerificationResponse,
    PasswordResetRequest,
    PasswordResetConfirm,
)

# ── Professional ──────────────────────────────────────────
from app.schemas.professional import (
    ProfessionalUserPublic,
    ProfessionalCreate,
    ProfessionalUpdate,
    ProfessionalResponse,
    ProfessionalPublicResponse,
    ProfessionalListResponse,
    ProfessionalAdminResponse,
    ProfessionalAdminListResponse,
    VerificationOverrideRequest,
    SuspendProfessionalRequest,
    FlagProfessionalRequest,
    TrustScoreUpdateRequest,
    ProfessionalAuditLogResponse,
    ProfessionalAuditLogListResponse,
)

# ── Professional portfolio ────────────────────────────────
from app.schemas.professional_portfolio import (
    SpecialtyResponse,
    CategoryResponse,
    AvailabilityCreate,
    AvailabilityUpdate,
    AvailabilityResponse,
    ServiceFAQ,
    ServiceCreate,
    ServiceUpdate,
    ServiceResponse,
    WorkCreate,
    WorkUpdate,
    WorkResponse,
    PortfolioCreate,
    PortfolioUpdate,
    PortfolioResponse,
    PublicPortfolioResponse,
)

# ── Professional tier ─────────────────────────────────────
from app.schemas.professional_tier import (
    TierFeatureResponse,
    TierFeatureCreate,
    TierFeatureUpdate,
    ProfessionalTierResponse,
    ProfessionalTierDetailResponse,
    ProfessionalTierCreate,
    ProfessionalTierUpdate,
    ProfessionalTierListResponse,
    ProfessionalTierBadge,
)

# ── Professional tier subscription ────────────────────────
from app.schemas.professional_tier_subscription import (
    ProfessionalTierSubscriptionResponse,
    ProfessionalTierSubscriptionWithTierResponse,
    ActiveSubscriptionResponse,
    ProfessionalTierSubscriptionListResponse,
    SubscriptionUpgradeRequest,
    SubscriptionCancelRequest,
)

# ── Professional payment ──────────────────────────────────
from app.schemas.professional_payment import (
    ProfessionalPaymentResponse,
    ProfessionalPaymentAdminResponse,
    ProfessionalPaymentListResponse,
    ProfessionalPaymentAdminListResponse,
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    PaymentRefundRequest,
)

# ── Professional AI usage ─────────────────────────────────
from app.schemas.professional_ai_usage import (
    ProfessionalAIUsageResponse,
    AIUsageCheckRequest,
    AIUsageCheckResponse,
    AIUsageIncrementRequest,
    ProfessionalAIUsageListResponse,
)

# ── Admin ─────────────────────────────────────────────────
from app.schemas.admin import (
    AdminActionRequest,
    RoleUpdateRequest,
    AdminDashboardResponse,
    AuditLogResponse,
    AuditLogListResponse,
)


__all__ = [
    # User
    "UserResponse",
    "UserUpdate",
    "UserListResponse",
    "UserCreate",
    "UserLogin",
    "Token",
    "RefreshTokenRequest",
    "VerificationRequest",
    "VerificationResponse",
    "PasswordResetRequest",
    "PasswordResetConfirm",
    # Professional
    "ProfessionalUserPublic",
    "ProfessionalCreate",
    "ProfessionalUpdate",
    "ProfessionalResponse",
    "ProfessionalPublicResponse",
    "ProfessionalListResponse",
    "ProfessionalAdminResponse",
    "ProfessionalAdminListResponse",
    "VerificationOverrideRequest",
    "SuspendProfessionalRequest",
    "FlagProfessionalRequest",
    "TrustScoreUpdateRequest",
    "ProfessionalAuditLogResponse",
    "ProfessionalAuditLogListResponse",
    # Portfolio
    "SpecialtyResponse",
    "CategoryResponse",
    "AvailabilityCreate",
    "AvailabilityUpdate",
    "AvailabilityResponse",
    "ServiceFAQ",
    "ServiceCreate",
    "ServiceUpdate",
    "ServiceResponse",
    "WorkCreate",
    "WorkUpdate",
    "WorkResponse",
    "PortfolioCreate",
    "PortfolioUpdate",
    "PortfolioResponse",
    "PublicPortfolioResponse",
    # Tier
    "TierFeatureResponse",
    "TierFeatureCreate",
    "TierFeatureUpdate",
    "ProfessionalTierResponse",
    "ProfessionalTierDetailResponse",
    "ProfessionalTierCreate",
    "ProfessionalTierUpdate",
    "ProfessionalTierListResponse",
    "ProfessionalTierBadge",
    # Subscription
    "ProfessionalTierSubscriptionResponse",
    "ProfessionalTierSubscriptionWithTierResponse",
    "ActiveSubscriptionResponse",
    "ProfessionalTierSubscriptionListResponse",
    "SubscriptionUpgradeRequest",
    "SubscriptionCancelRequest",
    # Payment
    "ProfessionalPaymentResponse",
    "ProfessionalPaymentAdminResponse",
    "ProfessionalPaymentListResponse",
    "ProfessionalPaymentAdminListResponse",
    "PaymentInitiateRequest",
    "PaymentInitiateResponse",
    "PaymentRefundRequest",
    # AI usage
    "ProfessionalAIUsageResponse",
    "AIUsageCheckRequest",
    "AIUsageCheckResponse",
    "AIUsageIncrementRequest",
    "ProfessionalAIUsageListResponse",
    # Admin
    "AdminActionRequest",
    "RoleUpdateRequest",
    "AdminDashboardResponse",
    "AuditLogResponse",
    "AuditLogListResponse",
]