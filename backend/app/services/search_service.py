# app/services/search_service.py
import logging
from typing import List, Optional
from uuid import UUID

from sqlmodel import Session

from app.repositories.search_repository import SearchRepository
from app.repositories.professional_tier_repository import (
    ProfessionalTierRepository,
)
from app.repositories.professional_tier_subscription_repository import (
    ProfessionalTierSubscriptionRepository,
)
from app.services.embedding_service import EmbeddingService
from app.schemas.search import SearchResultResponse

logger = logging.getLogger(__name__)


class SearchService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = SearchRepository(session)
        self.subscription_repo = ProfessionalTierSubscriptionRepository(session)
        self.tier_repo = ProfessionalTierRepository(session)
        self.embedding_service = EmbeddingService()

    # ─── profession resolution (public passthrough) ─────────
    def resolve_profession(self, query: str) -> Optional[str]:
        """
        Public passthrough to the repository's profession resolver.
        Used by the HTTP endpoint to set the X-Resolved-Profession
        header so the frontend can show "Showing only Electrician".
        """
        if not query:
            return None
        try:
            return self.repo.resolve_profession(query)
        except Exception as e:
            logger.warning("resolve_profession failed for %r: %s", query, e)
            return None

    # ─── main search ────────────────────────────────────────
    def search_professionals(
        self,
        query: str,
        city: Optional[str] = None,
        region: Optional[str] = None,
        limit: int = 20,
        verified: Optional[bool] = None,
        min_tier_level: Optional[int] = None,
        profession: Optional[str] = None,
    ) -> List[SearchResultResponse]:
        """
        Run the hybrid search.

        `profession` — optional canonical profession to force strict
        filtering. When provided, takes precedence over internal
        resolution. Used by the AI / chat layer when the intent
        classifier already knows what the user asked for.
        """
        query = (query or "").strip()

        # Nothing to search by — return empty rather than the whole table.
        if not query and not profession:
            return []

        # Embedding is protected — if it fails, keyword-only path runs.
        # In strict mode (profession is set), embeddings only contribute
        # to ranking inside the strict set; they never widen it.
        query_vector: Optional[List[float]] = None
        if query:
            try:
                query_vector = self.embedding_service.generate_embedding(query)
            except Exception as e:
                logger.warning(
                    "Embedding failed for %r, falling back to keyword-only: %s",
                    query, e,
                )
                query_vector = None

        results = self.repo.hybrid_search(
            query=query,
            query_vector=query_vector,
            city=city,
            region=region,
            limit=limit,
            min_relevance=0.45,
            verified=verified,
            min_tier_level=min_tier_level,
            profession=profession,
        )

        self._attach_tier_badges(results)

        logger.info(
            "Search q=%r profession=%r city=%r returned %d results",
            query, profession, city, len(results),
        )

        return [SearchResultResponse.model_validate(r) for r in results]

    # ─── batched tier badge attachment ──────────────────────
    def _attach_tier_badges(self, rows: List[dict]) -> None:
        """
        Mutates each row dict in place, adding a `tier_badge` key when
        the professional has an active subscription.

        Two DB queries total, regardless of result count.
        """
        if not rows:
            return

        professional_ids: List[UUID] = [row["id"] for row in rows]

        sub_map = self.subscription_repo.list_active_for_professionals(
            professional_ids
        )
        if not sub_map:
            return

        tier_ids = list({tier_id for tier_id in sub_map.values()})
        tiers = self.tier_repo.list_by_ids(tier_ids)
        tier_by_id = {t.id: t for t in tiers}

        for row in rows:
            tier_id = sub_map.get(row["id"])
            if not tier_id:
                continue
            tier = tier_by_id.get(tier_id)
            if not tier:
                continue
            row["tier_badge"] = {
                "tier_id": tier.id,
                "level": tier.level,
                "name": tier.name,
                "badge_name": tier.badge_name,
                "badge_code": tier.badge_code,
                "badge_icon": tier.badge_icon,
                "badge_color": tier.badge_color,
                "badge_secondary_color": tier.badge_secondary_color,
                "badge_shape": tier.badge_shape,
            }