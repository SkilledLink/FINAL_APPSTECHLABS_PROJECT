# app/schemas/chat.py
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(
        ..., min_length=1, max_length=2000,
        description="User's message to the chatbot",
    )


class ChatResponse(BaseModel):
    response: str = Field(..., description="The chatbot's reply")
    sources: Optional[List[str]] = Field(
        default=None,
        description="Titles of knowledge documents used as context",
    )
    # ── Optional structured payloads ──────────────────────
    results: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Professional cards when a search was performed",
    )
    image_analysis: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Structured image analysis when an image was processed",
    )
    redirect_url: Optional[str] = Field(
        default=None,
        description=(
            "Deep link to /discovery with the same search parameters "
            "pre-filled. Present only on successful search responses."
        ),
    )