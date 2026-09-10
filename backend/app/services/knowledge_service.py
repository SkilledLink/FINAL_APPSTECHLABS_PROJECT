import logging
from typing import List, Dict
from sqlmodel import Session
from app.repositories.knowledge_repository import KnowledgeRepository
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class KnowledgeService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = KnowledgeRepository(session)
        self.embedding_service = EmbeddingService()

    def retrieve_context(self, query: str, limit: int = 3) -> List[Dict[str, str]]:
        """
        Retrieve the most relevant knowledge documents for a given query.
        Returns a list of {"title": "...", "content": "..."} dicts.
        """
        if not query or not query.strip():
            return []

        try:
            # Embed the query
            query_vector = self.embedding_service.generate_embedding(query)

            # Search for similar documents
            docs = self.repo.search_similar(query_vector, limit=limit)

            # Format the results
            context = [
                {"title": doc.title, "content": doc.content}
                for doc in docs
            ]

            logger.info(f"Retrieved {len(context)} context documents for query: '{query[:50]}...'")
            return context

        except Exception as e:
            logger.error(f"Failed to retrieve context: {e}")
            return []  # Fallback: no context