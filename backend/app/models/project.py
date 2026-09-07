from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, ARRAY, Text

class ProjectStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    COMPLETED = "completed"

class Project(SQLModel, table=True):
    __tablename__ = "projects"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=255)
    category: str = Field(max_length=100)
    trade: str = Field(max_length=100)
    location: str = Field(max_length=255)
    description: str = Field(sa_column=Column(Text))
    before_image: Optional[str] = Field(default=None, max_length=500)
    after_image: Optional[str] = Field(default=None, max_length=500)
    images: List[str] = Field(default=[], sa_column=Column(ARRAY(String(500))))
    completion_date: Optional[datetime] = Field(default=None)
    duration: Optional[str] = Field(default=None, max_length=50)
    budget: Optional[str] = Field(default=None, max_length=100)
    client: Optional[str] = Field(default=None, max_length=255)
    skills: List[str] = Field(default=[], sa_column=Column(ARRAY(String(100))))
    challenges: List[str] = Field(default=[], sa_column=Column(ARRAY(String(500))))
    results: List[str] = Field(default=[], sa_column=Column(ARRAY(String(500))))
    professional_id: int = Field()
    status: ProjectStatus = Field(default=ProjectStatus.DRAFT)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)