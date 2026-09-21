# app/api/v1/professional_ai_usage.py

from fastapi import APIRouter

from app.api.deps_payments import AIUsageServiceDep, CurrentProfessional
from app.schemas.professional_ai_usage import (
    AIUsageCheckRequest,
    AIUsageCheckResponse,
    AIUsageIncrementRequest,
    ProfessionalAIUsageListResponse,
    ProfessionalAIUsageResponse,
)

router = APIRouter(
    prefix="/api/v1/professional-ai-usage",
    tags=["professional-ai-usage"],
)


@router.post("/check", response_model=AIUsageCheckResponse)
def check_feature(
    payload: AIUsageCheckRequest,
    professional: CurrentProfessional,
    service: AIUsageServiceDep,
) -> AIUsageCheckResponse:
    """Called before invoking any AI provider. `allowed=False` means the
    caller must not make the AI call."""
    return service.check(professional.id, payload.feature_key)


@router.post("/increment", response_model=ProfessionalAIUsageResponse)
def increment_feature(
    payload: AIUsageIncrementRequest,
    professional: CurrentProfessional,
    service: AIUsageServiceDep,
) -> ProfessionalAIUsageResponse:
    usage = service.increment(
        professional.id, payload.feature_key, payload.amount
    )
    return ProfessionalAIUsageResponse.model_validate(usage)


@router.get("/me", response_model=ProfessionalAIUsageListResponse)
def list_my_usage(
    professional: CurrentProfessional,
    service: AIUsageServiceDep,
    skip: int = 0,
    limit: int = 50,
) -> ProfessionalAIUsageListResponse:
    items, total = service.list_for_professional(
        professional.id, skip=skip, limit=limit
    )
    return ProfessionalAIUsageListResponse(
        items=[ProfessionalAIUsageResponse.model_validate(u) for u in items],
        total=total,
    )