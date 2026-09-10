import logging
from typing import Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from collections import defaultdict
from datetime import datetime, timedelta

from app.dependencies.current_user import get_current_active_user
from app.database.session import get_session
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat"])

# Simple in-memory rate limiter: user_id -> list of timestamps
_rate_limit_store: Dict[str, list] = defaultdict(list)
RATE_LIMIT = 10  # requests per minute


def check_rate_limit(user_id: str) -> bool:
    """Return True if rate limit is exceeded."""
    now = datetime.utcnow()
    cutoff = now - timedelta(minutes=1)

    # Clean old entries
    _rate_limit_store[user_id] = [ts for ts in _rate_limit_store[user_id] if ts > cutoff]

    if len(_rate_limit_store[user_id]) >= RATE_LIMIT:
        return False

    _rate_limit_store[user_id].append(now)
    return True


@router.post("/", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """
    Send a message to the AI chatbot.
    The bot will answer questions about the platform using a knowledge base.
    """
    # Rate limiting
    if not check_rate_limit(str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please wait a moment before sending another message."
        )

    try:
        service = ChatService(session)
        result = service.process_message(current_user.id, request.message)

        return ChatResponse(
            response=result["response"],
            sources=result["sources"]
        )

    except Exception as e:
        logger.error(f"Chat error for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process your message. Please try again later."
        )