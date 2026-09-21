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

    def search_professionals(
        self,
        query: str,
        city: Optional[str] = None,
        region: Optional[str] = None,
        limit: int = 20,
        verified: Optional[bool] = None,
        min_tier_level: Optional[int] = None,
    ) -> List[SearchResultResponse]:

        query = query.strip()
        if not query:
            return []

        # Embedding is the only thing protected here. If it fails, keyword-only.
        try:
            query_vector = self.embedding_service.generate_embedding(query)
        except Exception as e:
            logger.warning(
                "Embedding failed for %r, falling back to keyword-only: %s",
                query,
                e,
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
        )

        self._attach_tier_badges(results)

        logger.info("Search for %r returned %d results", query, len(results))

        return [SearchResultResponse.model_validate(r) for r in results]

    # ─── batched tier badge attachment ──────────────────────
    def _attach_tier_badges(self, rows: List[dict]) -> None:
        """
        Mutates each row dict in place, adding a `tier_badge` key when the
        professional has an active subscription.

        Two DB queries total, regardless of result count — replaces the
        per-professional N+1 pattern used elsewhere.
        """
        if not rows:
            return

        professional_ids: List[UUID] = [row["id"] for row in rows]

        # {professional_id: tier_id}
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