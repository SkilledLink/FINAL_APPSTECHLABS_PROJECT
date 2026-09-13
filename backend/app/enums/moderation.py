from enum import Enum


class FeedStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    PENDING_MODERATION = "pending_moderation"
    PENDING_REVIEW = "pending_review"
    REJECTED = "rejected"


class ModerationDecision(str, Enum):
    SAFE = "safe"
    REVIEW = "review"
    UNSAFE = "unsafe"


class ModerationReviewAction(str, Enum):
    APPROVED = "approved"
    REJECTED = "rejected"


class ModerationCategory(str, Enum):
    # Allowed / normal
    CONSTRUCTION_TOOL = "construction_tool"
    ELECTRICAL_TOOL = "electrical_tool"
    PLUMBING_TOOL = "plumbing_tool"
    WELDING_EQUIPMENT = "welding_equipment"
    AUTOMOTIVE_TOOL = "automotive_tool"
    CARPENTRY_TOOL = "carpentry_tool"
    MACHINERY = "machinery"
    WORKPLACE_SCENE = "workplace_scene"
    PROFESSIONAL_WORK = "professional_work"
    EVERYDAY_OBJECT = "everyday_object"

    # Prohibited
    FIREARM = "firearm"
    WEAPON = "weapon"
    EXPLOSIVE = "explosive"
    SEXUAL_CONTENT = "sexual_content"
    NUDITY = "nudity"
    GRAPHIC_VIOLENCE = "graphic_violence"
    GORE = "gore"
    DRUG_CONTENT = "drug_content"
    EXTREMIST_CONTENT = "extremist_content"
    HATE_SYMBOL = "hate_symbol"
    SELF_HARM = "self_harm"

    # Ambiguous
    POSSIBLE_WEAPON = "possible_weapon"

    # Fallback
    OTHER = "other"


CANONICAL_CATEGORIES: frozenset[str] = frozenset(c.value for c in ModerationCategory)