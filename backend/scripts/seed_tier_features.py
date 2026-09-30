# backend/scripts/seed_tier_features.py
"""
Seed AI features into professional_tier_features.

Quota scales with tier level:
    Level 2 (Verified Professional):  base limits
    Level 3 (Pro):                    base × 4
    Level 4+ (future tiers):          base × 8, × 16, ...

Usage:
    cd backend
    python -m scripts.seed_tier_features
"""

import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlmodel import Session, select

from app.database.session import engine
from app.enums.professional_tier import TierFeatureType
from app.models.professional_tier import (
    ProfessionalTier,
    ProfessionalTierFeature,
)


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Base limits for level 2. Multiplied per tier level (see _scale()).
BASE_LIMITS = {
    "ai_portfolio_suggestions": 5,
    "ai_profile_optimization": 5,
}

# Vision features — level 3+ only. Base at L3, multiplied for higher tiers.
VISION_BASE_LIMITS = {
    "ai_image_analysis": 40,
    "ai_portfolio_deep_analysis": 20,
}

FEATURE_META = {
    "ai_portfolio_suggestions": {
        "name": "Portfolio Suggestions",
        "description": "AI suggestions to improve your portfolio",
    },
    "ai_profile_optimization": {
        "name": "Profile Optimization",
        "description": "AI-generated profile improvements",
    },
    "ai_image_analysis": {
        "name": "Image Analysis",
        "description": "AI analysis of portfolio photos",
    },
    "ai_portfolio_deep_analysis": {
        "name": "Portfolio Deep Analysis",
        "description": "Full AI review of your portfolio with score, gaps, and recommendations",
    },
}


def _scale(base_limit: int, tier_level: int, base_level: int = 2) -> int:
    """
    Scale a base limit by tier level.

    Level 2 → base × 1
    Level 3 → base × 4
    Level 4 → base × 8
    Level 5 → base × 16
    ...
    """
    if tier_level < base_level:
        return base_limit
    # tier_level 2 -> 1, 3 -> 4, 4 -> 8, 5 -> 16 ...
    multiplier = 1 if tier_level == 2 else 4 ** (tier_level - 2)
    return base_limit * multiplier


def _features_for_tier(tier_level: int) -> dict[str, int]:
    """Return {feature_key: limit} for a given tier level."""
    if tier_level < 2:
        return {}

    features: dict[str, int] = {}

    # Text features (both L2 and L3+)
    for key, base in BASE_LIMITS.items():
        features[key] = _scale(base, tier_level, base_level=2)

    # Vision features (L3+ only)
    if tier_level >= 3:
        for key, base in VISION_BASE_LIMITS.items():
            features[key] = _scale(base, tier_level, base_level=3)

    return features


def seed():
    with Session(engine) as session:
        tiers = session.exec(
            select(ProfessionalTier).order_by(ProfessionalTier.level)
        ).all()

        if not tiers:
            logger.error("No tiers found. Aborting.")
            return

        logger.info("Found %d tier(s):", len(tiers))
        for t in tiers:
            logger.info("  - %s (level %d)", t.name, t.level)

        created = 0
        skipped = 0

        for tier in tiers:
            if tier.level < 2:
                logger.info(
                    "Skipping tier '%s' (level %d — no AI features)",
                    tier.name, tier.level,
                )
                continue

            for key, limit in _features_for_tier(tier.level).items():
                existing = session.exec(
                    select(ProfessionalTierFeature).where(
                        ProfessionalTierFeature.tier_id == tier.id,
                        ProfessionalTierFeature.feature_key == key,
                    )
                ).first()

                if existing:
                    logger.info(
                        "  [skip] %s → %s already exists (limit=%s)",
                        tier.name, key, existing.feature_value,
                    )
                    skipped += 1
                    continue

                meta = FEATURE_META[key]
                feature = ProfessionalTierFeature(
                    tier_id=tier.id,
                    feature_key=key,
                    feature_name=meta["name"],
                    feature_description=meta["description"],
                    feature_type=TierFeatureType.QUOTA,
                    feature_value={"limit": limit, "period": "monthly"},
                    is_enabled=True,
                )
                session.add(feature)
                created += 1
                logger.info(
                    "  [add ] %s → %s (limit=%d/month)",
                    tier.name, key, limit,
                )

        session.commit()

        logger.info(
            "✅ Done. Created %d feature row(s); skipped %d existing.",
            created, skipped,
        )


if __name__ == "__main__":
    seed()