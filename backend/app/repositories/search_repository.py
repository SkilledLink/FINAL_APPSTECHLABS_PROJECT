# app/repositories/search_repository.py
import logging
import re
import time
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from uuid import UUID

from sqlmodel import Session, text

from app.ai.profession_inference import infer_profession

logger = logging.getLogger(__name__)

_LIKE_SPECIALS = re.compile(r"([\\%_])")


# ─── Priority ranking configuration ─────────────────────────────
MAX_PRIORITY_BOOST = 0.50

W_TIER         = 0.20
W_VERIFIED     = 0.15
W_REVIEWS      = 0.08
W_COMPLETENESS = 0.05
W_JOBS         = 0.02

TIER_LEVEL_CEILING = 5.0
REVIEWS_CEILING    = 50.0
JOBS_CEILING       = 100.0
COMPLETENESS_FACTORS = 7


# ─── Profession detection cache ─────────────────────────────────
_PROFESSION_CACHE: Dict[str, Any] = {"at": 0.0, "values": []}
_PROFESSION_CACHE_TTL = 300.0


def _known_professions(session: Session) -> List[str]:
    now = time.time()
    if (
        now - _PROFESSION_CACHE["at"] < _PROFESSION_CACHE_TTL
        and _PROFESSION_CACHE["values"]
    ):
        return _PROFESSION_CACHE["values"]

    try:
        rows = session.execute(
            text(
                "SELECT DISTINCT profession FROM professionals "
                "WHERE profession IS NOT NULL AND profession <> ''"
            )
        ).all()
        values = [r[0] for r in rows]
    except Exception as e:
        logger.warning("Failed to load known professions: %s", e)
        values = []

    _PROFESSION_CACHE["at"] = now
    _PROFESSION_CACHE["values"] = values
    return values


def _match_profession(query: str, known: List[str]) -> Optional[str]:
    """
    Literal match — the query names a profession that exists in the DB.

    Returns the canonical profession string, or None.
    """
    if not known:
        return None

    tokens = _tokenize(query)
    if not tokens:
        return None

    candidates = list(tokens)
    candidates += [f"{a} {b}" for a, b in zip(tokens, tokens[1:])]

    lowered = [(orig, orig.lower()) for orig in known]

    # Pass 1 — exact match
    for cand in candidates:
        c = cand.lower()
        for orig, low in lowered:
            if c == low:
                return orig

    # Pass 2 — substring match (>= 4 chars to avoid noise)
    for cand in candidates:
        c = cand.lower()
        if len(c) < 4:
            continue
        for orig, low in lowered:
            if c in low or low in c:
                return orig

    return None


def _escape_like(value: str) -> str:
    return _LIKE_SPECIALS.sub(r"\\\1", value)


def _tokenize(query: str) -> List[str]:
    return [t for t in query.split() if t]


def _bind_tokens(params: Dict[str, Any], tokens: List[str]) -> None:
    for i, tok in enumerate(tokens):
        params[f"tok{i}"] = f"%{_escape_like(tok)}%"
        params[f"exact_tok{i}"] = tok


def _token_match_clause(n_tokens: int) -> str:
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


_TIER_JOINS = """
    LEFT JOIN LATERAL (
        SELECT s.tier_id
        FROM professional_tier_subscriptions s
        WHERE s.professional_id = p.id
          AND s.status = 'active'
          AND (s.expires_at IS NULL OR s.expires_at > :now)
        ORDER BY s.starts_at DESC NULLS LAST
        LIMIT 1
    ) sub ON true
    LEFT JOIN professional_tiers t ON t.id = sub.tier_id
"""


def _priority_score_expr() -> str:
    return f"""
        (
            :w_tier * LEAST(
                1.0,
                COALESCE(t.level, 0)::float / :tier_ceiling
            )
            + :w_verified * CASE WHEN p.is_verified THEN 1.0 ELSE 0.0 END
            + :w_reviews * LEAST(
                1.0,
                LN(1 + COALESCE(p.total_reviews, 0))
                / LN(1 + :reviews_ceiling)
            )
            + :w_completeness * (
                (
                    (CASE WHEN p.bio IS NOT NULL AND LENGTH(p.bio) > 50 THEN 1 ELSE 0 END)
                    + (CASE WHEN p.skills IS NOT NULL AND LENGTH(p.skills::text) > 2 THEN 1 ELSE 0 END)
                    + (CASE WHEN p.services IS NOT NULL AND LENGTH(p.services::text) > 2 THEN 1 ELSE 0 END)
                    + (CASE WHEN p.years_of_experience IS NOT NULL THEN 1 ELSE 0 END)
                    + (CASE WHEN p.hourly_rate IS NOT NULL THEN 1 ELSE 0 END)
                    + (CASE WHEN u.profile_image_url IS NOT NULL THEN 1 ELSE 0 END)
                    + (CASE WHEN p.city IS NOT NULL THEN 1 ELSE 0 END)
                )::float / :completeness_factors
            )
            + :w_jobs * LEAST(
                1.0,
                LN(1 + COALESCE(p.completed_jobs, 0))
                / LN(1 + :jobs_ceiling)
            )
        )
    """


def _relevance_expr() -> str:
    return "(keyword_score * 0.70 + vector_score * 0.30)"


def _final_score_expr() -> str:
    return f"LEAST(1.0, {_relevance_expr()} * (1.0 + priority_score))"


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
        parts: List[str] = []

        if verified:
            parts.append("p.is_verified = true")

        if min_tier_level is not None:
            parts.append("t.level IS NOT NULL AND t.level >= :min_tier_level")
            params["min_tier_level"] = min_tier_level

        return (" AND " + " AND ".join(parts)) if parts else ""

    def _bind_ranking_params(self, params: Dict[str, Any]) -> None:
        params["now"] = datetime.now(timezone.utc)
        params["w_tier"] = W_TIER
        params["w_verified"] = W_VERIFIED
        params["w_reviews"] = W_REVIEWS
        params["w_completeness"] = W_COMPLETENESS
        params["w_jobs"] = W_JOBS
        params["tier_ceiling"] = TIER_LEVEL_CEILING
        params["reviews_ceiling"] = REVIEWS_CEILING
        params["jobs_ceiling"] = JOBS_CEILING
        params["completeness_factors"] = COMPLETENESS_FACTORS

    # ─── profession detection ───────────────────────────────
    def resolve_profession(self, query: str) -> Optional[str]:
        """
        Detect the canonical profession this query is asking about.

        Two-stage:
          1. Literal match — the query names a profession that exists
             in the DB ("electrician", "plumber", "hairdresser", …).
          2. Service inference — the query describes a service
             ("wire my house", "fix my sink", "braid my hair"). This
             returns a canonical profession name even if the exact
             word isn't present in the query.

        Whatever is returned here is used as a STRICT filter — the
        query is narrowed to professionals whose profession / skills /
        services match that name, and nothing else. If no rows match,
        the caller gets an empty list. Never widens back to flexible
        mode when this returns a value.
        """
        if not query:
            return None

        known = _known_professions(self.session)

        # 1. Literal match against real DB professions
        matched = _match_profession(query, known)
        if matched:
            return matched

        # 2. Service-language inference
        inferred = infer_profession(query)
        if inferred:
            return inferred

        return None

    # ─── query helpers ─────────────────────────────────────
    def _prepare_query_parts(
        self,
        query: str,
        params: Dict[str, Any],
    ) -> tuple[str, str, int]:
        """
        Returns (keyword_match_sql, keyword_score_sql, n_tokens).

        Binds token params into `params` as a side effect.

        When the query has no tokens (profession-only search),
        returns a never-matching clause and a literal `0` score so
        the SQL is still valid — no unbound `:tok0` references.
        """
        tokens = _tokenize(query)

        if tokens:
            _bind_tokens(params, tokens)
            n = len(tokens)
            return (
                _token_match_clause(n),
                _keyword_case_clause(n),
                n,
            )

        # No tokens. Bind a never-matching exact_query so the
        # `WHEN first_last = LOWER(:exact_query)` clause has a value.
        params["exact_query"] = "__no_query_tokens__"
        return ("false", "0", 0)

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
        profession: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        If `profession` is provided by the caller, it takes precedence
        over internal resolution and forces strict mode. Use this from
        the chat / AI layer when the intent classifier has already
        determined the canonical profession.
        """
        query = (query or "").strip()
        if not query and not profession:
            return []

        params: Dict[str, Any] = {"limit": limit}
        self._bind_ranking_params(params)

        keyword_match, keyword_score_expr, _n = self._prepare_query_parts(
            query, params
        )
        # Only override exact_query if tokens weren't bound above.
        params.setdefault("exact_query", query or "__empty__")

        location_filter = self._build_location_filter(params, city, region)
        extra_filter = self._build_extra_filters(
            params, verified, min_tier_level
        )

        # ── Decide strict vs flexible ────────────────────────
        resolved_profession = profession or self.resolve_profession(query)

        if resolved_profession:
            # STRICT — restrict to the profession. Bio is excluded
            # (bios name-drop other professions and would leak in).
            # Vector does NOT widen the result set here; it only
            # contributes to ranking inside the strict set.
            logger.info(
                "search.strict query=%r resolved_profession=%r source=%s",
                query, resolved_profession,
                "explicit" if profession else "inferred",
            )
            params["resolved_prof"] = f"%{_escape_like(resolved_profession)}%"
            search_condition = """
                (
                    p.profession ILIKE :resolved_prof
                    OR p.skills::text ILIKE :resolved_prof
                    OR p.services::text ILIKE :resolved_prof
                )
            """
            if query_vector is not None:
                params["query_vector"] = query_vector
                vector_score_expr = """
                    CASE
                        WHEN p.embedding IS NOT NULL
                             AND COALESCE(p.embedding_stale, false) = false
                        THEN 1 - (p.embedding <=> CAST(:query_vector AS vector))
                        ELSE 0
                    END
                """
            else:
                vector_score_expr = "0"
        else:
            # FLEXIBLE — natural language, no profession signal.
            if query_vector is not None:
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

        priority_expr = _priority_score_expr()
        relevance_expr = _relevance_expr()
        final_expr = _final_score_expr()

        sql = text(f"""
            WITH scored AS (
                SELECT
                    {_PROJECTION},
                    ({keyword_score_expr}) AS keyword_score,
                    ({vector_score_expr}) AS vector_score,
                    {priority_expr} AS priority_score
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
                {relevance_expr} AS relevance_score,
                {final_expr} AS final_score
            FROM scored
            ORDER BY
                final_score DESC,
                relevance_score DESC,
                rating DESC,
                total_reviews DESC,
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
                profession=profession,
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
        profession: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        query = (query or "").strip()
        if not query and not profession:
            return []

        params: Dict[str, Any] = {"limit": limit}
        self._bind_ranking_params(params)

        keyword_match, keyword_score_expr, _n = self._prepare_query_parts(
            query, params
        )
        params.setdefault("exact_query", query or "__empty__")

        location_filter = self._build_location_filter(params, city, region)
        extra_filter = self._build_extra_filters(
            params, verified, min_tier_level
        )

        resolved_profession = profession or self.resolve_profession(query)
        if resolved_profession:
            params["resolved_prof"] = f"%{_escape_like(resolved_profession)}%"
            search_condition = """
                (
                    p.profession ILIKE :resolved_prof
                    OR p.skills::text ILIKE :resolved_prof
                    OR p.services::text ILIKE :resolved_prof
                )
            """
        else:
            search_condition = keyword_match

        priority_expr = _priority_score_expr()
        relevance_expr = _relevance_expr()
        final_expr = _final_score_expr()

        sql = text(f"""
            WITH scored AS (
                SELECT
                    {_PROJECTION},
                    0 AS vector_score,
                    ({keyword_score_expr}) AS keyword_score,
                    {priority_expr} AS priority_score
                FROM professionals p
                JOIN users u ON u.id = p.user_id
                {_TIER_JOINS}
                WHERE {search_condition} {location_filter} {extra_filter}
            )
            SELECT
                *,
                {relevance_expr} AS relevance_score,
                {final_expr} AS final_score
            FROM scored
            ORDER BY
                final_score DESC,
                relevance_score DESC,
                rating DESC,
                total_reviews DESC,
                completed_jobs DESC
            LIMIT :limit
        """)

        result = self.session.execute(sql, params)
        return [dict(row) for row in result.mappings().all()]