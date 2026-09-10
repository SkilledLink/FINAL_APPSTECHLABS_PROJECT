import logging
from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select, text

from app.models.knowledge_document import KnowledgeDocument

logger = logging.getLogger(__name__)


class KnowledgeRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, title: str, content: str, category: Optional[str], embedding: List[float]) -> KnowledgeDocument:
        doc = KnowledgeDocument(
            title=title,
            content=content,
            category=category,
            embedding=embedding
        )
        self.session.add(doc)
        self.session.flush()
        return doc

    def search_similar(self, query_vector: List[float], limit: int = 3) -> List[KnowledgeDocument]:
        """Search for documents similar to the query vector using cosine distance."""
        sql = text("""
            SELECT *
            FROM knowledge_documents
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> CAST(:query_vector AS vector)
            LIMIT :limit
        """)
        result = self.session.execute(sql, {"query_vector": query_vector, "limit": limit})
        rows = result.mappings().all()
        return [KnowledgeDocument(**dict(row)) for row in rows]

    def get_all(self) -> List[KnowledgeDocument]:
        stmt = select(KnowledgeDocument).order_by(KnowledgeDocument.title)
        return self.session.exec(stmt).all()

    def delete_all(self) -> None:
        """Clear all documents (useful for re-seeding)."""
        self.session.execute(text("DELETE FROM knowledge_documents"))
        self.session.flush()