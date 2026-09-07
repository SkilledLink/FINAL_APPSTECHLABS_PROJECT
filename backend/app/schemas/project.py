from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ProjectStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    COMPLETED = "completed"

class ProjectBase(BaseModel):
    title: str
    category: str
    trade: str
    location: str
    description: str
    before_image: Optional[str] = None
    after_image: Optional[str] = None
    images: Optional[List[str]] = []
    completion_date: Optional[datetime] = None
    duration: Optional[str] = None
    budget: Optional[str] = None
    client: Optional[str] = None
    skills: Optional[List[str]] = []
    challenges: Optional[List[str]] = []
    results: Optional[List[str]] = []

class ProjectCreate(ProjectBase):
    professional_id: int
    status: ProjectStatus = ProjectStatus.DRAFT

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    before_image: Optional[str] = None
    after_image: Optional[str] = None
    images: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    challenges: Optional[List[str]] = None
    results: Optional[List[str]] = None

class ProjectResponse(ProjectBase):
    id: int
    professional_id: int
    status: ProjectStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True