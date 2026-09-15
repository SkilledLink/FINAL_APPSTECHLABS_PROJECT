from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class Contact2_Message(SQLModel, table=True):
    __tablename__ = "contact2_messages"

    id: int | None = Field(default=None, primary_key=True)

    name: str = Field(max_length=150)
    email: str = Field(max_length=255, index=True)
    message: str

    is_read: bool = Field(default=False)
    replied: bool = Field(default=False)

    admin_reply: str | None = None

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    replied_at: datetime | None = None