from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User


class Job(SQLModel, table=True):
    __tablename__ = "jobs"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)

    title: str = Field(max_length=200, nullable=False)
    description: str = Field(nullable=False)
    status: str = Field(default="published")  # draft, published, closed

    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deleted_at: Optional[datetime] = Field(default=None)

    # Relationships
    user: "User" = Relationship(back_populates="jobs")
    images: List["JobImage"] = Relationship(
        back_populates="job",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    likes: List["JobLike"] = Relationship(
        back_populates="job",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    comments: List["JobComment"] = Relationship(
        back_populates="job",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class JobImage(SQLModel, table=True):
    __tablename__ = "job_images"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    job_id: UUID = Field(foreign_key="jobs.id", nullable=False, index=True)
    image_url: str = Field(nullable=False)
    order: int = Field(default=0)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    job: "Job" = Relationship(back_populates="images")


class JobLike(SQLModel, table=True):
    __tablename__ = "job_likes"

    user_id: UUID = Field(foreign_key="users.id", primary_key=True)
    job_id: UUID = Field(foreign_key="jobs.id", primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: "User" = Relationship()
    job: "Job" = Relationship(back_populates="likes")


class JobComment(SQLModel, table=True):
    __tablename__ = "job_comments"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    job_id: UUID = Field(foreign_key="jobs.id", nullable=False, index=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    content: str = Field(nullable=False, max_length=1000)
    parent_id: Optional[UUID] = Field(
        default=None,
        foreign_key="job_comments.id",
        index=True
    )

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    job: "Job" = Relationship(back_populates="comments")
    user: "User" = Relationship()
    replies: List["JobComment"] = Relationship(
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "lazy": "selectin"
        }
    )