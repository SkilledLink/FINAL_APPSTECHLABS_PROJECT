# app/services/professional_search_service.py
import logging
from typing import List, Optional

from sqlmodel import Session

from app.ai.schemas import (
    ProfessionalCard,
    ProfessionalSearchParams,
    ProfessionalSearchResult,
    SearchMetadata,
)
from app.repositories.professional_repository import ProfessionalRepository
from app.repositories.professional_location_repository import (
    ProfessionalLocationRepository,
)
from app.repositories.search_repository import SearchRepository
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class ProfessionalSearchService:
    """
    Single entry point for professional search.

    Strategies (in priority order):
      1. nearby   — lat/lng + radius given -> PostGIS
      2. hybrid   — free-text query with embedding -> keyword + vector
      3. filtered — profession/city/verified/rating only
      4. keyword  — free-text without embedding fallback

    The caller never sees ORM rows. Return type is a flat
    ProfessionalSearchResult.
    """

    def __init__(self, session: Session):
        self.session = session
        self.prof_repo = ProfessionalRepository(session)
        self.loc_repo = ProfessionalLocationRepository(session)
        self.search_repo = SearchRepository(session)
        self.embedding_service = EmbeddingService()

    # ────────────────────────────────────────────────────────
    #  PUBLIC
    # ────────────────────────────────────────────────────────

    def search(
        self, params: ProfessionalSearchParams
    ) -> ProfessionalSearchResult:
        filters_applied: List[str] = []

        try:
            # ── Strategy 1: nearby ─────────────────────────
            if params.latitude is not None and params.longitude is not None:
                filters_applied.append("nearby")
                if params.verified_only:
                    filters_applied.append("verified_only")
                if params.available_only:
                    filters_applied.append("available_only")
                if params.profession:
                    filters_applied.append(f"profession={params.profession}")

                return self._search_nearby(params, filters_applied)

            # ── Strategy 2: hybrid (semantic + keyword) ────
            if params.query and params.query.strip():
                filters_applied.append("hybrid")
                if params.city:
                    filters_applied.append(f"city={params.city}")
                if params.region:
                    filters_applied.append(f"region={params.region}")

                return self._search_hybrid(params, filters_applied)

            # ── Strategy 3: filtered only ──────────────────
            filters_applied.append("filtered")
            return self._search_filtered(params, filters_applied)

        except Exception as e:
            logger.exception("ProfessionalSearchService.search failed: %s", e)
            # Failure must never fabricate results.
            return ProfessionalSearchResult(
                professionals=[],
                metadata=SearchMetadata(
                    total=0,
                    returned=0,
                    strategy="failed",
                    filters_applied=filters_applied,
                ),
            )

    # ────────────────────────────────────────────────────────
    #  STRATEGIES
    # ────────────────────────────────────────────────────────

    def _search_nearby(
        self, params: ProfessionalSearchParams, filters: List[str]
    ) -> ProfessionalSearchResult:
        rows, total = self.loc_repo.find_nearby(
            latitude=params.latitude,
            longitude=params.longitude,
            radius_km=params.radius_km or 10.0,
            skip=0,
            limit=params.limit,
            profession=params.profession,
            available_only=params.available_only,
            verified_only=params.verified_only,
        )
        cards = self._cards_from_nearby(rows)
        return ProfessionalSearchResult(
            professionals=cards,
            metadata=SearchMetadata(
                total=total,
                returned=len(cards),
                strategy="nearby",
                had_location=True,
                filters_applied=filters,
            ),
        )

    def _search_hybrid(
        self, params: ProfessionalSearchParams, filters: List[str]
    ) -> ProfessionalSearchResult:
        query = (params.query or "").strip()
        try:
            vector = self.embedding_service.generate_embedding(query)
        except Exception as e:
            logger.warning("Query embedding failed, keyword-only: %s", e)
            return self._search_keyword(params, filters + ["embedding_failed"])

        rows = self.search_repo.hybrid_search(
            query=query,
            query_vector=vector,
            city=params.city,
            region=params.region,
            limit=params.limit,
            min_relevance=0.35,
        )
        cards = self._cards_from_hybrid(rows)

        # Post-filter: verified/rating/available are not applied by
        # hybrid_search (its SQL is scoring-focused). Apply them in
        # Python on the small result set.
        cards = self._apply_soft_filters(cards, params)

        return ProfessionalSearchResult(
            professionals=cards,
            metadata=SearchMetadata(
                total=len(cards),
                returned=len(cards),
                strategy="hybrid",
                had_location=False,
                filters_applied=filters,
            ),
        )

    def _search_keyword(
        self, params: ProfessionalSearchParams, filters: List[str]
    ) -> ProfessionalSearchResult:
        rows = self.search_repo.keyword_search(
            query=(params.query or "").strip(),
            city=params.city,
            region=params.region,
            limit=params.limit,
        )
        cards = self._cards_from_hybrid(rows)
        cards = self._apply_soft_filters(cards, params)
        return ProfessionalSearchResult(
            professionals=cards,
            metadata=SearchMetadata(
                total=len(cards),
                returned=len(cards),
                strategy="keyword",
                had_location=False,
                filters_applied=filters,
            ),
        )

    def _search_filtered(
        self, params: ProfessionalSearchParams, filters: List[str]
    ) -> ProfessionalSearchResult:
        rows, total = self.prof_repo.list_active(
            skip=0,
            limit=params.limit,
            profession=params.profession,
            city=params.city,
            country=params.country,
            verified_only=params.verified_only,
            available_only=params.available_only,
            search=params.service or params.profession,
            sort=params.sort,
        )
        cards = self._cards_from_orm(rows)
        return ProfessionalSearchResult(
            professionals=cards,
            metadata=SearchMetadata(
                total=total,
                returned=len(cards),
                strategy="filtered",
                had_location=False,
                filters_applied=filters,
            ),
        )

    # ────────────────────────────────────────────────────────
    #  MAPPERS — always to flat, JSON-safe dicts
    # ────────────────────────────────────────────────────────

    def _cards_from_nearby(self, rows: list) -> List[ProfessionalCard]:
        cards: List[ProfessionalCard] = []
        for r in rows:
            prof = r.get("professional")
            loc = r.get("location")
            dist = r.get("distance_km")
            if not prof:
                continue
            cards.append(self._card_from_orm(prof, distance_km=dist))
        return cards

    def _cards_from_hybrid(self, rows: list[dict]) -> List[ProfessionalCard]:
        """
        hybrid_search / keyword_search return raw dicts from the
        professionals + users join. We only trust fields we know
        are public and present.
        """
        cards: List[ProfessionalCard] = []
        for row in rows:
            try:
                cards.append(
                    ProfessionalCard(
                        id=row["id"],
                        user_id=row["user_id"],
                        name=(
                            row.get("headline")
                            or row.get("profession")
                            or "Professional"
                        ),
                        profession=row.get("profession") or "",
                        headline=row.get("headline"),
                        city=row.get("city"),
                        country=row.get("country"),
                        years_of_experience=row.get("years_of_experience"),
                        rating=(
                            float(row["rating"])
                            if row.get("rating") is not None
                            else None
                        ),
                        total_reviews=row.get("total_reviews") or 0,
                        is_verified=bool(row.get("is_verified", False)),
                        available=bool(row.get("available", True)),
                        profile_image_url=row.get("profile_image_url"),
                        profile_url=f"/professionals/{row['id']}",
                    )
                )
            except Exception as e:
                logger.warning("Skipping malformed hybrid row: %s", e)
                continue
        return cards

    def _cards_from_orm(self, rows: list) -> List[ProfessionalCard]:
        return [self._card_from_orm(p) for p in rows]

    def _card_from_orm(self, p, distance_km: Optional[float] = None) -> ProfessionalCard:
        return ProfessionalCard(
            id=p.id,
            user_id=p.user_id,
            name=p.headline or p.profession or "Professional",
            profession=p.profession or "",
            headline=p.headline,
            city=p.city,
            country=p.country,
            years_of_experience=p.years_of_experience,
            rating=float(p.rating) if p.rating is not None else None,
            total_reviews=p.total_reviews or 0,
            is_verified=bool(p.is_verified),
            available=bool(p.available),
            profile_image_url=None,   # enriched by caller if needed
            distance_km=distance_km,
            profile_url=f"/professionals/{p.id}",
        )

    def _apply_soft_filters(
        self,
        cards: List[ProfessionalCard],
        params: ProfessionalSearchParams,
    ) -> List[ProfessionalCard]:
        out = cards
        if params.verified_only:
            out = [c for c in out if c.is_verified]
        if params.available_only:
            out = [c for c in out if c.available]
        if params.min_rating is not None:
            out = [c for c in out if (c.rating or 0) >= params.min_rating]
        return out