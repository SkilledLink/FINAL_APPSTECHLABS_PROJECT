# app/api/v1/ai_features.py

from fastapi import APIRouter, status as http_status

from app.api.deps_payments import (
    AIUsageServiceDep,
    CurrentProfessional,
    SessionDep,
)
from app.schemas.ai_features import (
    PortfolioSuggestion,
    PortfolioSuggestionsResponse,
)
from app.services.ai.features.portfolio_suggestions import (
    generate_portfolio_suggestions,
)
from app.services.ai.tier_provider import TierProviderResolver

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


@router.post(
    "/portfolio-suggestions",
    response_model=PortfolioSuggestionsResponse,
    status_code=http_status.HTTP_200_OK,
)
def portfolio_suggestions(
    session: SessionDep,
    professional: CurrentProfessional,
    usage_service: AIUsageServiceDep,
) -> PortfolioSuggestionsResponse:
    """AI-generated portfolio improvement suggestions.

    Level 2 (Groq):   up to 3 suggestions, focused analysis.
    Level 3 (Gemini): up to 5 suggestions, deep analysis.
    """
    resolver = TierProviderResolver(session)
    config, adapter, tier_level = resolver.resolve_for_professional(
        professional.id, vision=False
    )

    result = generate_portfolio_suggestions(
        session=session,
        professional=professional,
        ai_client=adapter,
        tier_level=tier_level,
        usage_service=usage_service,
    )

    return PortfolioSuggestionsResponse(
        suggestions=[PortfolioSuggestion(**s) for s in result["suggestions"]],
        provider=result["provider"],
        model=result["model"],
        prompt_tokens=result.get("prompt_tokens"),
        completion_tokens=result.get("completion_tokens"),
    )