# app/repositories/knowledge_repository.py
import logging
from typing import List, Optional
from uuid import UUID

from sqlmodel import Session, select, text

from app.models.knowledge_document import KnowledgeDocument

logger = logging.getLogger(__name__)


class KnowledgeRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(
        self,
        title: str,
        content: str,
        category: Optional[str],
        embedding: List[float],
    ) -> KnowledgeDocument:
        doc = KnowledgeDocument(
            title=title,
            content=content,
            category=category,
            embedding=embedding,
        )
        self.session.add(doc)
        self.session.flush()
        return doc

    def search_similar(
        self,
        query_vector: List[float],
        limit: int = 3,
        min_similarity: Optional[float] = None,
    ) -> List[KnowledgeDocument]:
        """
        Cosine-similarity search over knowledge_documents.

        If `min_similarity` is set, documents scoring below it are
        filtered out **in the database** — they never reach the prompt.
        """
        if min_similarity is None:
            sql = text("""
                SELECT *
                FROM knowledge_documents
                WHERE embedding IS NOT NULL
                ORDER BY embedding <=> CAST(:query_vector AS vector)
                LIMIT :limit
            """)
            params = {"query_vector": query_vector, "limit": limit}
        else:
            sql = text("""
                SELECT *
                FROM knowledge_documents
                WHERE embedding IS NOT NULL
                  AND (1 - (embedding <=> CAST(:query_vector AS vector))) >= :min_sim
                ORDER BY embedding <=> CAST(:query_vector AS vector)
                LIMIT :limit
            """)
            params = {
                "query_vector": query_vector,
                "limit": limit,
                "min_sim": min_similarity,
            }

        result = self.session.execute(sql, params)
        rows = result.mappings().all()
        return [KnowledgeDocument(**dict(row)) for row in rows]

    def get_all(self) -> List[KnowledgeDocument]:
        stmt = select(KnowledgeDocument).order_by(KnowledgeDocument.title)
        return self.session.exec(stmt).all()

    def delete_all(self) -> None:
        """Clear all documents (useful for re-seeding)."""
        self.session.execute(text("DELETE FROM knowledge_documents"))
        self.session.flush()