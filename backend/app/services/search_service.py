import logging
from typing import List, Optional
from uuid import UUID

from sqlmodel import Session
from app.repositories.search_repository import SearchRepository
from app.services.embedding_service import EmbeddingService
from app.schemas.search import SearchResultResponse

logger = logging.getLogger(__name__)

class SearchService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = SearchRepository(session)
        self.embedding_service = EmbeddingService()

    def search_professionals(
        self,
        query: str,
        city: Optional[str] = None,
        region: Optional[str] = None,
        limit: int = 20
    ) -> List[SearchResultResponse]:
        """
        Perform AI-powered semantic search for professionals.
        Returns a list of SearchResultResponse, sorted by relevance.
        """
        if not query or not query.strip():
            return []

        # 1. Get embedding for the query
        try:
            query_vector = self.embedding_service.generate_embedding(query)
        except Exception as e:
            logger.error(f"Failed to generate embedding for query '{query}': {e}")
            # Fallback to basic keyword search (no vector)
            results = self.repo.keyword_search(query, city, region, limit)
        else:
            # 2. Perform vector search
            results = self.repo.vector_search(query_vector, city, region, limit)

        # 3. Map to response schema
        return [SearchResultResponse.model_validate(r) for r in results]