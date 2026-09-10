from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Text

# ============================================================
# LIKE MODEL
# ============================================================

class JobLike(SQLModel, table=True):
    __tablename__ = "job_likes"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: int = Field()
    user_id: int = Field()
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================================
# COMMENT MODEL
# ============================================================

class JobComment(SQLModel, table=True):
    __tablename__ = "job_comments"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: int = Field()
    user_id: int = Field()
    user_name: str = Field(max_length=255)
    content: str = Field(sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================================
# SHARE MODEL
# ============================================================

class JobShare(SQLModel, table=True):
    __tablename__ = "job_shares"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: int = Field()
    user_id: int = Field()
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================================
# APPLICATION MODEL
# ============================================================

class JobApplication(SQLModel, table=True):
    __tablename__ = "job_applications"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: int = Field()
    professional_id: int = Field()
    professional_name: str = Field(max_length=255)
    message: Optional[str] = Field(default=None, sa_column=Column(Text))
    status: str = Field(default="pending")
    created_at: datetime = Field(default_factory=datetime.utcnow)