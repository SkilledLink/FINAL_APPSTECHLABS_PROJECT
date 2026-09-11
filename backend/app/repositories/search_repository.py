import logging
from typing import List, Optional, Dict, Any

from sqlmodel import Session, text

logger = logging.getLogger(__name__)


class SearchRepository:
    def __init__(self, session: Session):
        self.session = session

    def hybrid_search(
        self,
        query: str,
        query_vector: Optional[List[float]] = None,
        city: Optional[str] = None,
        region: Optional[str] = None,
        limit: int = 20,
        min_relevance: float = 0.30,
    ) -> List[Dict[str, Any]]:
        """
        Hybrid professional search.

        Priority:
        1. Exact/partial name matches
        2. Profession matches
        3. Skills/services matches
        4. Location matches
        5. Bio matches
        6. Semantic/vector similarity

        Keyword matches are boosted above vector-only matches.
        """

        query = query.strip()

        if not query:
            return []

        # ── Base params ────────────────────────────────────────────
        params: Dict[str, Any] = {
            "query": f"%{query}%",
            "exact_query": query,          # ← set BEFORE building SQL
            "limit": limit,
        }

        # ── Optional location filters ──────────────────────────────
        conditions = []

        if city:
            conditions.append("p.city ILIKE :city")
            params["city"] = f"%{city}%"

        if region:
            conditions.append("p.region ILIKE :region")
            params["region"] = f"%{region}%"

        location_filter = ""
        if conditions:
            location_filter = " AND " + " AND ".join(conditions)

        # ── Keyword match clause ───────────────────────────────────
        keyword_match = """
            (
                u.first_name ILIKE :query
                OR u.last_name ILIKE :query
                OR p.profession ILIKE :query
                OR p.bio ILIKE :query
                OR p.skills::text ILIKE :query
                OR p.services::text ILIKE :query
                OR p.city ILIKE :query
                OR p.region ILIKE :query
                OR p.country ILIKE :query
            )
        """

        # ── Vector score + filter (only if we have a query vector) ─
        if query_vector is not None:
            # Null-safe staleness check + cosine similarity
            vector_score = """
                CASE
                    WHEN p.embedding IS NOT NULL
                         AND COALESCE(p.embedding_stale, false) = false
                    THEN
                        1 - (
                            p.embedding <=> CAST(:query_vector AS vector)
                        )
                    ELSE 0
                END
            """

            vector_filter = """
                (
                    p.embedding IS NOT NULL
                    AND COALESCE(p.embedding_stale, false) = false
                    AND (
                        1 - (
                            p.embedding <=> CAST(:query_vector AS vector)
                        )
                    ) >= :min_relevance
                )
            """

            params["query_vector"] = query_vector
            params["min_relevance"] = min_relevance

            search_condition = f"""
                (
                    {keyword_match}
                    OR {vector_filter}
                )
            """
        else:
            vector_score = "0"
            search_condition = keyword_match

        # ── Keyword score CASE expression (reused in two places) ──
        keyword_score_case = """
            CASE
                WHEN LOWER(
                    CONCAT(
                        COALESCE(u.first_name, ''),
                        ' ',
                        COALESCE(u.last_name, '')
                    )
                ) = LOWER(:exact_query)
                THEN 1.00

                WHEN LOWER(u.first_name) = LOWER(:exact_query)
                THEN 0.95

                WHEN LOWER(u.last_name) = LOWER(:exact_query)
                THEN 0.95

                WHEN u.first_name ILIKE :query
                  OR u.last_name ILIKE :query
                THEN 0.90

                WHEN p.profession ILIKE :query
                THEN 0.85

                WHEN p.skills::text ILIKE :query
                THEN 0.75

                WHEN p.services::text ILIKE :query
                THEN 0.75

                WHEN p.city ILIKE :query
                  OR p.region ILIKE :query
                  OR p.country ILIKE :query
                THEN 0.70

                WHEN p.bio ILIKE :query
                THEN 0.65

                ELSE 0
            END
        """

        sql = text(f"""
            SELECT
                p.*,
                u.first_name,
                u.last_name,
                u.profile_image_url,

                ({vector_score}) AS vector_score,

                ({keyword_score_case}) AS keyword_score,

                (
                    ({keyword_score_case}) * 0.70
                    +
                    ({vector_score}) * 0.30
                ) AS relevance_score

            FROM professionals p
            JOIN users u ON u.id = p.user_id

            WHERE
                {search_condition}
                {location_filter}

            ORDER BY
                relevance_score DESC,
                p.rating DESC,
                p.completed_jobs DESC

            LIMIT :limit
        """)

        try:
            result = self.session.execute(sql, params)
            return [dict(row) for row in result.mappings().all()]
        except Exception as e:
            logger.error(f"hybrid_search SQL failed: {e}")
            # Fallback to keyword-only, which has no vector dependency
            return self.keyword_search(query, city, region, limit)

    def keyword_search(
        self,
        query: str,
        city: Optional[str] = None,
        region: Optional[str] = None,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        """
        Keyword-only fallback.

        Used when vector search is unavailable or fails.
        """

        query = query.strip()

        if not query:
            return []

        params: Dict[str, Any] = {
            "query": f"%{query}%",
            "exact_query": query,
            "limit": limit,
        }

        conditions = [
            """
            (
                u.first_name ILIKE :query
                OR u.last_name ILIKE :query
                OR p.profession ILIKE :query
                OR p.bio ILIKE :query
                OR p.skills::text ILIKE :query
                OR p.services::text ILIKE :query
                OR p.city ILIKE :query
                OR p.region ILIKE :query
                OR p.country ILIKE :query
            )
            """
        ]

        if city:
            conditions.append("p.city ILIKE :city")
            params["city"] = f"%{city}%"

        if region:
            conditions.append("p.region ILIKE :region")
            params["region"] = f"%{region}%"

        where_clause = " AND ".join(conditions)

        sql = text(f"""
            SELECT
                p.*,
                u.first_name,
                u.last_name,
                u.profile_image_url,

                0 AS vector_score,

                CASE
                    WHEN LOWER(
                        CONCAT(
                            COALESCE(u.first_name, ''),
                            ' ',
                            COALESCE(u.last_name, '')
                        )
                    ) = LOWER(:exact_query)
                    THEN 1.00

                    WHEN LOWER(u.first_name) = LOWER(:exact_query)
                    THEN 0.95

                    WHEN LOWER(u.last_name) = LOWER(:exact_query)
                    THEN 0.95

                    WHEN u.first_name ILIKE :query
                      OR u.last_name ILIKE :query
                    THEN 0.90

                    WHEN p.profession ILIKE :query
                    THEN 0.85

                    WHEN p.skills::text ILIKE :query
                    THEN 0.75

                    WHEN p.services::text ILIKE :query
                    THEN 0.75

                    WHEN p.city ILIKE :query
                      OR p.region ILIKE :query
                      OR p.country ILIKE :query
                    THEN 0.70

                    WHEN p.bio ILIKE :query
                    THEN 0.65

                    ELSE 0.50
                END AS keyword_score,

                CASE
                    WHEN LOWER(
                        CONCAT(
                            COALESCE(u.first_name, ''),
                            ' ',
                            COALESCE(u.last_name, '')
                        )
                    ) = LOWER(:exact_query)
                    THEN 1.00

                    WHEN LOWER(u.first_name) = LOWER(:exact_query)
                    THEN 0.95

                    WHEN LOWER(u.last_name) = LOWER(:exact_query)
                    THEN 0.95

                    WHEN u.first_name ILIKE :query
                      OR u.last_name ILIKE :query
                    THEN 0.90

                    WHEN p.profession ILIKE :query
                    THEN 0.85

                    WHEN p.skills::text ILIKE :query
                    THEN 0.75

                    WHEN p.services::text ILIKE :query
                    THEN 0.75

                    WHEN p.city ILIKE :query
                      OR p.region ILIKE :query
                      OR p.country ILIKE :query
                    THEN 0.70

                    WHEN p.bio ILIKE :query
                    THEN 0.65

                    ELSE 0.50
                END AS relevance_score

            FROM professionals p
            JOIN users u ON u.id = p.user_id

            WHERE {where_clause}

            ORDER BY
                relevance_score DESC,
                p.rating DESC,
                p.completed_jobs DESC

            LIMIT :limit
        """)

        result = self.session.execute(sql, params)
        return [dict(row) for row in result.mappings().all()]