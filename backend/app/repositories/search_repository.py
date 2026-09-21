import logging
import re
from typing import List, Optional, Dict, Any

from sqlmodel import Session, text

logger = logging.getLogger(__name__)

_LIKE_SPECIALS = re.compile(r"([\\%_])")


def _escape_like(value: str) -> str:
    """Escape LIKE metacharacters so user input is treated literally."""
    return _LIKE_SPECIALS.sub(r"\\\1", value)


def _tokenize(query: str) -> List[str]:
    return [t for t in query.split() if t]


def _bind_tokens(params: Dict[str, Any], tokens: List[str]) -> None:
    """Bind per-token ILIKE patterns and exact-match values."""
    for i, tok in enumerate(tokens):
        params[f"tok{i}"] = f"%{_escape_like(tok)}%"
        params[f"exact_tok{i}"] = tok


def _token_match_clause(n_tokens: int) -> str:
    """
    Every token must match at least one searchable field (AND across tokens).
    Each token ORs across fields. This is what makes multi-word skills
    like 'python django' work against an array-as-text column.
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


class SearchRepository:
    def __init__(self, session: Session):
        self.session = session

    def _build_location_filter(
        self, params: Dict[str, Any], city: Optional[str], region: Optional[str]
    ) -> str:
        parts = []
        if city:
            parts.append("p.city ILIKE :city")
            params["city"] = f"%{_escape_like(city)}%"
        if region:
            parts.append("p.region ILIKE :region")
            params["region"] = f"%{_escape_like(region)}%"
        return (" AND " + " AND ".join(parts)) if parts else ""

    def hybrid_search(
        self,
        query: str,
        query_vector: Optional[List[float]] = None,
        city: Optional[str] = None,
        region: Optional[str] = None,
        limit: int = 20,
        min_relevance: float = 0.45,
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

        location_filter = self._build_location_filter(params, city, region)
        keyword_match = _token_match_clause(n)

        if query_vector is not None:
            # Index-friendly: compare the distance operator directly.
            # max_distance = 1 - min_relevance
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

        sql = text(f"""
            WITH scored AS (
                SELECT
                    {_PROJECTION},
                    ({keyword_score_expr}) AS keyword_score,
                    ({vector_score_expr}) AS vector_score
                FROM professionals p
                JOIN users u ON u.id = p.user_id
                WHERE
                    {search_condition}
                    {location_filter}
            )
            SELECT
                *,
                LEAST(
                    1.0,
                    keyword_score * 0.70 + vector_score * 0.30
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
            return self.keyword_search(query, city, region, limit)

    def keyword_search(
        self,
        query: str,
        city: Optional[str] = None,
        region: Optional[str] = None,
        limit: int = 20,
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

        location_filter = self._build_location_filter(params, city, region)
        keyword_match = _token_match_clause(n)
        keyword_score_expr = _keyword_case_clause(n)

        sql = text(f"""
            WITH scored AS (
                SELECT
                    {_PROJECTION},
                    0 AS vector_score,
                    ({keyword_score_expr}) AS keyword_score
                FROM professionals p
                JOIN users u ON u.id = p.user_id
                WHERE {keyword_match} {location_filter}
            )
            SELECT
                *,
                LEAST(1.0, keyword_score * 0.70 + vector_score * 0.30) AS relevance_score
            FROM scored
            ORDER BY
                relevance_score DESC,
                rating DESC,
                completed_jobs DESC
            LIMIT :limit
        """)

        result = self.session.execute(sql, params)
        return [dict(row) for row in result.mappings().all()]