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
        limit: int = 20,
    ) -> List[SearchResultResponse]:

        query = query.strip()

        if not query:
            return []

        try:
            # Generate semantic embedding.
            query_vector = self.embedding_service.generate_embedding(query)

            # Hybrid search:
            # keyword relevance + semantic similarity.
            results = self.repo.hybrid_search(
                query=query,
                query_vector=query_vector,
                city=city,
                region=region,
                limit=limit,
                min_relevance=0.45,
            )

            logger.info(
                "Hybrid search for '%s' returned %d results",
                query,
                len(results),
            )

        except Exception as e:
            logger.error(
                "Hybrid/vector search failed for '%s': %s",
                query,
                e,
                exc_info=True,
            )

            # If embeddings fail, fall back to normal keyword search.
            results = self.repo.keyword_search(
                query=query,
                city=city,
                region=region,
                limit=limit,
            )

            logger.info(
                "Keyword fallback for '%s' returned %d results",
                query,
                len(results),
            )

        return [
            SearchResultResponse.model_validate(result)
            for result in results
        ]
