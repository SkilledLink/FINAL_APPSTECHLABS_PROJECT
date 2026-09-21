import logging
import re
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from uuid import UUID

from sqlmodel import Session, text

logger = logging.getLogger(__name__)

_LIKE_SPECIALS = re.compile(r"([\\%_])")

# Hard cap on the ranking bonus a paid tier can contribute.
# 0.05 is visible as a tiebreaker but never beats a strictly higher
# keyword tier. Raise with caution — see notes.
MAX_TIER_BOOST = 0.05

# The feature_key whose feature_value carries the boost weight,
# e.g. feature_value = {"weight": 0.03}. Read from
# app.enums.professional_tier.TierFeatureKey.AI_SEARCH_PRIORITY.
_SEARCH_PRIORITY_KEY = "ai_search_priority"


def _escape_like(value: str) -> str:
    """Escape LIKE metacharacters so user input is treated literally."""
    return _LIKE_SPECIALS.sub(r"\\\1", value)


def _tokenize(query: str) -> List[str]:
    return [t for t in query.split() if t]


def _bind_tokens(params: Dict[str, Any], tokens: List[str]) -> None:
    for i, tok in enumerate(tokens):
        params[f"tok{i}"] = f"%{_escape_like(tok)}%"
        params[f"exact_tok{i}"] = tok


def _token_match_clause(n_tokens: int) -> str:
    """
    Every token must match at least one searchable field (AND across tokens).
    Each token ORs across fields. Makes multi-word skills like
    'python django' work against an array-as-text column.
    """
    parts = []
    for i in range(n_tokens):
        parts.append(
            f"""(
                u.first_name ILIKE :tok{i}
                OR u.last_name ILIKE :tok{i}
                OR p.profession ILIKE :tok{i}
                OR p.bio ILIKE :tok{i}
                OR p.skills::text ILIKE :tok{i}
                OR p.services::text ILIKE :tok{i}
                OR p.city ILIKE :tok{i}
                OR p.region ILIKE :tok{i}
                OR p.country ILIKE :tok{i}
            )"""
        )
    return " AND ".join(parts)


def _any_ilike(columns: List[str], n_tokens: int) -> str:
    parts = []
    for col in columns:
        for i in range(n_tokens):
            parts.append(f"{col} ILIKE :tok{i}")
    return "(" + " OR ".join(parts) + ")"


def _any_eq(columns: List[str], n_tokens: int) -> str:
    parts = []
    for col in columns:
        for i in range(n_tokens):
            parts.append(f"LOWER({col}) = LOWER(:exact_tok{i})")
    return "(" + " OR ".join(parts) + ")"


def _keyword_case_clause(n_tokens: int) -> str:
    """Single source of truth for the keyword scoring CASE expression."""
    first_last = "LOWER(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')))"
    last_first = "LOWER(CONCAT(COALESCE(u.last_name, ''), ' ', COALESCE(u.first_name, '')))"

    return f"""
        CASE
            WHEN {first_last} = LOWER(:exact_query) THEN 1.00
            WHEN {last_first} = LOWER(:exact_query) THEN 1.00
            WHEN {_any_eq(["u.first_name", "u.last_name"], n_tokens)} THEN 0.95
            WHEN {_any_ilike(["u.first_name", "u.last_name"], n_tokens)} THEN 0.90
            WHEN {_any_ilike(["p.profession"], n_tokens)} THEN 0.85
            WHEN {_any_ilike(["p.skills::text"], n_tokens)} THEN 0.75
            WHEN {_any_ilike(["p.services::text"], n_tokens)} THEN 0.75
            WHEN {_any_ilike(["p.city", "p.region", "p.country"], n_tokens)} THEN 0.70
            WHEN {_any_ilike(["p.bio"], n_tokens)} THEN 0.65
            ELSE 0
        END
    """


# Columns we actually need. Notably NOT p.embedding / p.embedding_stale.
_PROJECTION = """
    p.id,
    p.user_id,
    p.profession,
    p.bio,
    p.skills,
    p.years_of_experience,
    p.services,
    p.hourly_rate,
    p.country,
    p.region,
    p.city,
    p.available,
    p.is_verified,
    p.rating,
    p.total_reviews,
    p.completed_jobs,
    p.created_at,
    p.updated_at,
    u.first_name,
    u.last_name,
    u.profile_image_url
"""


# Lateral join that resolves the professional's single "current" active
# subscription. At most one row per professional — never multiplies results.
_ACTIVE_SUB_LATERAL = """
    LEFT JOIN LATERAL (
        SELECT s.tier_id
        FROM professional_tier_subscriptions s
        WHERE s.professional_id = p.id
          AND s.status = 'active'
          AND (s.expires_at IS NULL OR s.expires_at > :now)
        ORDER BY s.starts_at DESC NULLS LAST
        LIMIT 1
    ) sub ON true
"""


# Joins the resolved tier, then its search-priority feature row (at most
# one — enforced by unique constraint on (tier_id, feature_key)).
_TIER_JOINS = f"""
    {_ACTIVE_SUB_LATERAL}
    LEFT JOIN professional_tiers t ON t.id = sub.tier_id
    LEFT JOIN professional_tier_features f
        ON f.tier_id = t.id
       AND f.feature_key = :priority_key
       AND f.is_enabled = true
"""


def _tier_boost_expr() -> str:
    """The tier-contributed bonus, clamped to [0, MAX_TIER_BOOST]."""
    return f"""
        LEAST(
            :max_tier_boost,
            COALESCE((f.feature_value->>'weight')::float, 0)
        )
    """


class SearchRepository:
    def __init__(self, session: Session):
        self.session = session

    # ─── shared filter builders ─────────────────────────────
    def _build_location_filter(
        self,
        params: Dict[str, Any],
        city: Optional[str],
        region: Optional[str],
    ) -> str:
        parts = []
        if city:
            parts.append("p.city ILIKE :city")
            params["city"] = f"%{_escape_like(city)}%"
        if region:
            parts.append("p.region ILIKE :region")
            params["region"] = f"%{_escape_like(region)}%"
        return (" AND " + " AND ".join(parts)) if parts else ""

    def _build_extra_filters(
        self,
        params: Dict[str, Any],
        verified: Optional[bool],
        min_tier_level: Optional[int],
    ) -> str:
        """
        Additional AND'd predicates:
          - verified=True → only KYC-verified professionals
          - min_tier_level → only professionals whose *current* active
            subscription's tier level meets or exceeds the threshold.
            Uses the lateral join (t.level) rather than a separate EXISTS
            so the filter and the boost agree on which tier is "current".
        """
        parts: List[str] = []

        if verified:
            parts.append("p.is_verified = true")

        if min_tier_level is not None:
            parts.append("t.level IS NOT NULL AND t.level >= :min_tier_level")
            params["min_tier_level"] = min_tier_level

        return (" AND " + " AND ".join(parts)) if parts else ""

    def _bind_boost_params(self, params: Dict[str, Any]) -> None:
        params["now"] = datetime.now(timezone.utc)
        params["max_tier_boost"] = MAX_TIER_BOOST
        params["priority_key"] = _SEARCH_PRIORITY_KEY

    # ─── hybrid search ──────────────────────────────────────
    def hybrid_search(
        self,
        query: str,
        query_vector: Optional[List[float]] = None,
        city: Optional[str] = None,
        region: Optional[str] = None,
        limit: int = 20,
        min_relevance: float = 0.45,
        verified: Optional[bool] = None,
        min_tier_level: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        query = query.strip()
        if not query:
            return []

        tokens = _tokenize(query)
        if not tokens:
            return []

        n = len(tokens)
        params: Dict[str, Any] = {"exact_query": query, "limit": limit}
        _bind_tokens(params, tokens)
        self._bind_boost_params(params)

        location_filter = self._build_location_filter(params, city, region)
        extra_filter = self._build_extra_filters(
            params, verified, min_tier_level
        )
        keyword_match = _token_match_clause(n)

        if query_vector is not None:
            # Index-friendly: distance operator compared directly against value.
            params["query_vector"] = query_vector
            params["max_distance"] = 1.0 - min_relevance

            vector_filter = """
                (
                    p.embedding IS NOT NULL
                    AND COALESCE(p.embedding_stale, false) = false
                    AND p.embedding <=> CAST(:query_vector AS vector) <= :max_distance
                )
            """
            vector_score_expr = """
                CASE
                    WHEN p.embedding IS NOT NULL
                         AND COALESCE(p.embedding_stale, false) = false
                    THEN 1 - (p.embedding <=> CAST(:query_vector AS vector))
                    ELSE 0
                END
            """
            search_condition = f"({keyword_match} OR {vector_filter})"
        else:
            vector_score_expr = "0"
            search_condition = keyword_match

        keyword_score_expr = _keyword_case_clause(n)
        tier_boost_expr = _tier_boost_expr()

        sql = text(f"""
            WITH scored AS (
                SELECT
                    {_PROJECTION},
                    ({keyword_score_expr}) AS keyword_score,
                    ({vector_score_expr}) AS vector_score,
                    ({tier_boost_expr}) AS tier_boost
                FROM professionals p
                JOIN users u ON u.id = p.user_id
                {_TIER_JOINS}
                WHERE
                    {search_condition}
                    {location_filter}
                    {extra_filter}
            )
            SELECT
                *,
                LEAST(
                    1.0,
                    keyword_score * 0.70
                    + vector_score * 0.30
                    + tier_boost
                ) AS relevance_score
            FROM scored
            ORDER BY
                relevance_score DESC,
                rating DESC,
                completed_jobs DESC
            LIMIT :limit
        """)

        try:
            result = self.session.execute(sql, params)
            return [dict(row) for row in result.mappings().all()]
        except Exception as e:
            logger.error("hybrid_search SQL failed: %s", e, exc_info=True)
            return self.keyword_search(
                query, city, region, limit,
                verified=verified, min_tier_level=min_tier_level,
            )

    # ─── keyword-only fallback ──────────────────────────────
    def keyword_search(
        self,
        query: str,
        city: Optional[str] = None,
        region: Optional[str] = None,
        limit: int = 20,
        verified: Optional[bool] = None,
        min_tier_level: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        query = query.strip()
        if not query:
            return []

        tokens = _tokenize(query)
        if not tokens:
            return []

        n = len(tokens)
        params: Dict[str, Any] = {"exact_query": query, "limit": limit}
        _bind_tokens(params, tokens)
        self._bind_boost_params(params)

        location_filter = self._build_location_filter(params, city, region)
        extra_filter = self._build_extra_filters(
            params, verified, min_tier_level
        )
        keyword_match = _token_match_clause(n)
        keyword_score_expr = _keyword_case_clause(n)
        tier_boost_expr = _tier_boost_expr()

        sql = text(f"""
            WITH scored AS (
                SELECT
                    {_PROJECTION},
                    0 AS vector_score,
                    ({keyword_score_expr}) AS keyword_score,
                    ({tier_boost_expr}) AS tier_boost
                FROM professionals p
                JOIN users u ON u.id = p.user_id
                {_TIER_JOINS}
                WHERE {keyword_match} {location_filter} {extra_filter}
            )
            SELECT
                *,
                LEAST(
                    1.0,
                    keyword_score * 0.70
                    + vector_score * 0.30
                    + tier_boost
                ) AS relevance_score
            FROM scored
            ORDER BY
                relevance_score DESC,
                rating DESC,
                completed_jobs DESC
            LIMIT :limit
        """)

        result = self.session.execute(sql, params)
        return [dict(row) for row in result.mappings().all()]