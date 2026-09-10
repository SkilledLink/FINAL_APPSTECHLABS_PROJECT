from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel, Column
from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON


class KnowledgeDocument(SQLModel, table=True):
    __tablename__ = "knowledge_documents"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(nullable=False, max_length=200)
    content: str = Field(nullable=False)
    category: Optional[str] = Field(default=None, max_length=100)
    embedding: Optional[List[float]] = Field(
        default=None,
        sa_column=Column(Vector(768))   # ← changed to 768
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )

