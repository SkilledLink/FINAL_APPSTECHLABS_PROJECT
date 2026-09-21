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

        # Only the embedding call is protected here. If it fails, we pass
        # query_vector=None and the repo runs keyword-only. All DB-level
        # failures are handled by the repo, so we don't duplicate that here.
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
        )

        logger.info("Search for %r returned %d results", query, len(results))

        return [SearchResultResponse.model_validate(r) for r in results]