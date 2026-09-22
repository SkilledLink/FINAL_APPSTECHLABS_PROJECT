# app/enums/professional_tier.py

from enum import Enum


class ProfessionalSubscriptionStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    SUSPENDED = "suspended"


class TierFeatureType(str, Enum):
    BOOLEAN = "boolean"
    LIMIT = "limit"
    QUOTA = "quota"
    TEXT = "text"
    JSON = "json"


class TierFeatureKey(str, Enum):
    """Code-side canonical keys. DB stores feature_key as plain VARCHAR."""

    AI_PORTFOLIO_SUGGESTIONS = "ai_portfolio_suggestions"
    AI_PROFILE_OPTIMIZATION = "ai_profile_optimization"
    AI_SERVICE_DESCRIPTION = "ai_service_description"
    AI_IMAGE_ANALYSIS = "ai_image_analysis"
    AI_POST_SUGGESTIONS = "ai_post_suggestions"
    AI_REPLY_SUGGESTIONS = "ai_reply_suggestions"
    AI_CUSTOMER_REPLY_ASSISTANT = "ai_customer_reply_assistant"
    AI_SERVICE_INQUIRY_ASSISTANT = "ai_service_inquiry_assistant"
    AI_QUOTE_ASSISTANT = "ai_quote_assistant"
    AI_BRANDING_ASSISTANT = "ai_branding_assistant"
    AI_AUTO_REPLY = "ai_auto_reply"
    AI_SEARCH_PRIORITY = "ai_search_priority"
    PROFILE_VISIBILITY = "profile_visibility"
    FEATURED_PLACEMENT = "featured_placement"
    ANALYTICS = "analytics"
    AI_PORTFOLIO_DEEP_ANALYSIS = "ai_portfolio_deep_analysis"