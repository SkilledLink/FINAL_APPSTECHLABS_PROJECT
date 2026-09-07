from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, Relationship

from app.models.user import User


class UserFollow(SQLModel, table=True):
    __tablename__ = "user_follows"

    follower_id: UUID = Field(foreign_key="users.id", primary_key=True, nullable=False)
    followed_id: UUID = Field(foreign_key="users.id", primary_key=True, nullable=False)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships – not necessary but can help with querying
    # Follower: the user who follows
    follower: "User" = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": "[UserFollow.follower_id]",
            "lazy": "joined",
        }
    )
    # Followed: the user being followed
    followed: "User" = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": "[UserFollow.followed_id]",
            "lazy": "joined",
        }
    )