# app/api/v1/ai_search.py
import logging
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlmodel import Session

from app.core.config import settings
from app.database.session import get_session
from app.dependencies.current_user import get_current_user
from app.models.user import User
from app.ai.intent import IntentType, classify
from app.ai.schemas import (
    ImageAnalysis,
    ProfessionalSearchParams,
    ProfessionalSearchResult,
    AISearchResponse,
)
from app.services.image_analysis_service import ImageAnalysisService
from app.services.professional_search_service import ProfessionalSearchService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Search"])

_ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

# Intents that warrant running a database search.
_SEARCH_INTENTS = {
    IntentType.PROFESSIONAL_SEARCH,
    IntentType.NEARBY_SEARCH,
    IntentType.SERVICE_SEARCH,
    IntentType.JOB_SEARCH,
    IntentType.POST_SEARCH,
    IntentType.USER_SEARCH,
    IntentType.IMAGE_ASSISTED_SEARCH,
    IntentType.MULTIMODAL_SEARCH,
    IntentType.IMAGE_ANALYSIS,
}

# Warmer, more specific explanations per non-search intent.
_NON_SEARCH_EXPLANATIONS = {
    IntentType.GENERAL_CONVERSATION: (
        "👋 Hi! This page helps you find professionals. "
        "Try 'electricians in Douala' or upload a photo of "
        "what you need help with."
    ),
    IntentType.GENERAL_GUIDANCE: (
        "Looking for a professional? Try 'electricians in Douala', "
        "'plumbers near me', or upload a photo of what you need "
        "help with."
    ),
    IntentType.STATIC_KNOWLEDGE: (
        "That's a platform question — try the AI assistant tab "
        "for an explanation. If you're looking for a professional, "
        "describe what you need: 'find electricians in Douala'."
    ),
}


def _clean(value):
    """Swagger UI fills optional text fields with the literal 'string'."""
    if value is None:
        return None
    if isinstance(value, str) and value.strip().lower() in ("", "string"):
        return None
    return value


def _clean_number(value, *, min_value: Optional[float] = None):
    """Swagger UI fills optional numeric fields with 0."""
    if value is None:
        return None
    try:
        f = float(value)
    except (TypeError, ValueError):
        return None
    if f == 0.0:
        return None
    if min_value is not None and f < min_value:
        return None
    return f


@router.post("/search", response_model=AISearchResponse)
async def ai_search(
    query: Optional[str] = Form(default=None, max_length=500),
    city: Optional[str] = Form(default=None, max_length=100),
    region: Optional[str] = Form(default=None, max_length=100),
    latitude: Optional[float] = Form(default=None),
    longitude: Optional[float] = Form(default=None),
    radius_km: Optional[float] = Form(default=None),
    verified_only: bool = Form(False),
    available_only: bool = Form(False),
    min_rating: Optional[float] = Form(default=None),
    limit: int = Form(default=10),
    image: Optional[UploadFile] = File(default=None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # ── Sanitize Swagger placeholders ───────────────────────
    query = _clean(query)
    city = _clean(city)
    region = _clean(region)
    latitude = _clean_number(latitude)
    longitude = _clean_number(longitude)
    radius_km = _clean_number(radius_km, min_value=0.5)
    min_rating = _clean_number(min_rating, min_value=0.0)
    if limit is None or limit <= 0:
        limit = 10
    limit = min(limit, 50)

    # ── Validate image if provided ──────────────────────────
    image_bytes: Optional[bytes] = None
    image_mime: Optional[str] = None
    if image is not None and image.filename:
        image_mime = (image.content_type or "").lower()
        if image_mime not in _ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported image type. Allowed: {sorted(_ALLOWED_IMAGE_TYPES)}",
            )
        image_bytes = await image.read()
        if len(image_bytes) == 0:
            image_bytes = None
        elif len(image_bytes) > settings.AI_IMAGE_MAX_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Image exceeds {settings.AI_IMAGE_MAX_SIZE_MB} MB",
            )

    if not query and not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide a query or an image",
        )

    # ── Classify ────────────────────────────────────────────
    intent = classify(query or "", has_image=bool(image_bytes))
    logger.info(
        "ai.search intent=%s has_image=%s q=%r city=%r region=%r "
        "lat=%r lng=%r radius=%r",
        intent.intent.value, bool(image_bytes),
        (query or "")[:80], city, region, latitude, longitude, radius_km,
    )

    # ── Guard — do not run search for non-search intents ────
    # `/ai/search` is a search endpoint. It must not fabricate
    # results for greetings, knowledge questions, or general
    # conversation. Return 0 results with an intent-appropriate
    # explanation.
    if intent.intent not in _SEARCH_INTENTS:
        logger.info(
            "ai.search skipped reason=intent_not_search intent=%s",
            intent.intent.value,
        )

        explanation = _NON_SEARCH_EXPLANATIONS.get(
            intent.intent,
            "Describe what you're looking for — for example: "
            "'find electricians in Douala' or upload a photo.",
        )

        return AISearchResponse(
            query=query,
            intent=intent.intent.value,
            total=0,
            results=[],
            explanation=explanation,
            image_analysis=None,
            search_metadata=None,
        )

    # ── Image analysis ──────────────────────────────────────
    analysis: Optional[ImageAnalysis] = None
    if image_bytes:
        analysis = ImageAnalysisService().analyze(
            image_bytes, image_mime or "image/jpeg", user_text=query,
        )

        # If image analysis produced nothing usable and there's no
        # text query to fall back on, return honestly.
        analysis_usable = (
            analysis.confidence > 0.0
            or bool(analysis.description.strip())
            or bool(analysis.possible_profession)
            or bool(analysis.search_terms)
        )
        if not analysis_usable and not query:
            return AISearchResponse(
                query=None,
                intent="image_analysis_failed",
                total=0,
                results=[],
                explanation=(
                    "I received the image but couldn't analyze it right "
                    "now. Please try again, or describe what you're "
                    "looking for in text."
                ),
                image_analysis=analysis,
                search_metadata=None,
            )

    # ── Build search params ─────────────────────────────────
    # Priority: explicit form > intent extraction > image hypotheses
    profession = (
        intent.profession
        or (analysis.possible_profession if analysis else None)
    )
    effective_query = (
        query
        or (analysis and " ".join(analysis.search_terms))
        or (analysis and analysis.description)
        or None
    )

    # Only treat coordinates as provided if BOTH are present
    use_location = latitude is not None and longitude is not None

    params = ProfessionalSearchParams(
        query=effective_query,
        profession=profession,
        city=city or intent.location,
        region=region,
        country=None,
        latitude=latitude if use_location else None,
        longitude=longitude if use_location else None,
        radius_km=radius_km if use_location else None,
        verified_only=verified_only or bool(intent.verified_only),
        available_only=available_only or bool(intent.available_only),
        min_rating=min_rating or intent.min_rating,
        limit=limit,
    )

    # ── Search ──────────────────────────────────────────────
    try:
        result: ProfessionalSearchResult = ProfessionalSearchService(
            session
        ).search(params)
    except Exception as e:
        logger.exception("ai.search failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search failed",
        )

    return AISearchResponse(
        query=query,
        intent=intent.intent.value,
        total=result.metadata.total,
        results=result.professionals,
        explanation=None,
        image_analysis=analysis,
        search_metadata=result.metadata,
    )