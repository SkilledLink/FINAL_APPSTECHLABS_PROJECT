import logging
from typing import List, Optional
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
        if not query or not query.strip():
            return []

        try:
            query_vector = self.embedding_service.generate_embedding(query)
            results = self.repo.vector_search(query_vector, city, region, limit)
            # If vector search returns nothing, fall back to keyword
            if not results:
                logger.info("Vector search empty, falling back to keyword search")
                results = self.repo.keyword_search(query, city, region, limit)
        except Exception as e:
            logger.error(f"Vector search failed for '{query}': {e}")
            results = self.repo.keyword_search(query, city, region, limit)

        return [SearchResultResponse.model_validate(r) for r in results]