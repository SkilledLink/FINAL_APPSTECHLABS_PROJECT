import logging
from typing import List, Optional, Dict, Any
from sqlmodel import Session, text

logger = logging.getLogger(__name__)


class SearchRepository:
    def __init__(self, session: Session):
        self.session = session

    def vector_search(
        self,
        query_vector: List[float],
        city: Optional[str] = None,
        region: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        conditions = ["p.embedding IS NOT NULL", "p.embedding_stale = false"]
        params: Dict[str, Any] = {
            "query_vector": query_vector,
            "limit": limit
        }

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
                1 - (p.embedding <=> CAST(:query_vector AS vector)) AS relevance_score
            FROM professionals p
            JOIN users u ON u.id = p.user_id
            WHERE {where_clause}
            ORDER BY relevance_score DESC
            LIMIT :limit
        """)

        result = self.session.execute(sql, params)
        return [dict(row) for row in result.mappings().all()]

    def keyword_search(
        self,
        query: str,
        city: Optional[str] = None,
        region: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        conditions = []
        params: Dict[str, Any] = {"query": f"%{query}%", "limit": limit}

        conditions.append(
            "(p.profession ILIKE :query OR p.bio ILIKE :query OR p.skills::text ILIKE :query)"
        )

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
                0.5 AS relevance_score
            FROM professionals p
            JOIN users u ON u.id = p.user_id
            WHERE {where_clause}
            ORDER BY p.rating DESC, p.completed_jobs DESC
            LIMIT :limit
        """)

        result = self.session.execute(sql, params)
        return [dict(row) for row in result.mappings().all()]