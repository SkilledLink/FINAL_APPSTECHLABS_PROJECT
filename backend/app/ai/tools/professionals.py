# app/ai/tools/professionals.py
import logging
from typing import Optional

from sqlmodel import Session

from app.core.config import settings
from app.ai.intent import extract_city, extract_profession
from app.ai.tools.base import ToolResult
from app.repositories.professional_repository import ProfessionalRepository

logger = logging.getLogger(__name__)


def search_professionals(
    session: Session,
    message: str,
    limit: Optional[int] = None,
) -> ToolResult:
    """
    Search professionals using the existing ProfessionalRepository.

    Never invents results. Never touches the DB directly — the repo
    is the only layer that does. All filters go through the repo's
    public method.

    NOTE (Stage 4.1): this tool is not yet wired into ChatService.
    It stays here ready for Stage 4.2 when PROFESSIONAL_SEARCH is
    enabled.
    """
    limit = limit or settings.AI_TOOL_PROFESSIONAL_LIMIT

    profession = extract_profession(message)
    city = extract_city(message)

    search_term = profession or message.strip()

    try:
        repo = ProfessionalRepository(session)
        rows, _total = repo.list_active(
            skip=0,
            limit=limit,
            profession=profession,
            city=city,
            verified_only=False,
            available_only=True,
            search=search_term,
            sort="rating_desc",
        )
    except Exception as e:
        logger.error("search_professionals failed: %s", e)
        return ToolResult.failure("professional search failed")

    if not rows:
        filters = []
        if profession:
            filters.append(f"profession={profession}")
        if city:
            filters.append(f"city={city}")
        note = "no professionals matched"
        if filters:
            note += " (" + ", ".join(filters) + ")"
        return ToolResult.empty(note)

    items = []
    for p in rows:
        items.append({
            "id": str(p.id),
            "name": p.headline or p.profession,
            "profession": p.profession,
            "city": p.city,
            "country": p.country,
            "years_of_experience": p.years_of_experience,
            "rating": float(p.rating) if p.rating is not None else None,
            "total_reviews": p.total_reviews,
            "is_verified": p.is_verified,
            "available": p.available,
        })

    logger.info(
        "ai.tool professionals profession=%s city=%s hits=%d",
        profession, city, len(items),
    )

    return ToolResult(success=True, count=len(items), items=items)