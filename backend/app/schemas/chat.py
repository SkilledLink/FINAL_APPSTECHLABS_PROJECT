from typing import Optional, List
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User's message to the chatbot")


class ChatResponse(BaseModel):
    response: str = Field(..., description="The chatbot's reply")
    sources: Optional[List[str]] = Field(default=None, description="Titles of knowledge documents used as context")