from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Text

# ============================================================
# PROJECT LIKE MODEL
# ============================================================

class ProjectLike(SQLModel, table=True):
    __tablename__ = "project_likes"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field()
    user_id: int = Field()
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================================
# PROJECT COMMENT MODEL
# ============================================================

class ProjectComment(SQLModel, table=True):
    __tablename__ = "project_comments"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field()
    user_id: int = Field()
    user_name: str = Field(max_length=255)
    content: str = Field(sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================================
# PROJECT SHARE MODEL
# ============================================================

class ProjectShare(SQLModel, table=True):
    __tablename__ = "project_shares"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field()
    user_id: int = Field()
    created_at: datetime = Field(default_factory=datetime.utcnow)