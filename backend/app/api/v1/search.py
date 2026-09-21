from typing import Optional, List

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlmodel import Session

from app.database.session import get_session
from app.services.search_service import SearchService
from app.schemas.search import SearchResultResponse

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/professionals", response_model=List[SearchResultResponse])
def search_professionals(
    q: str = Query(..., min_length=1, description="Search query"),
    city: Optional[str] = Query(None, description="Filter by city (case-insensitive)"),
    region: Optional[str] = Query(None, description="Filter by region (case-insensitive)"),
    limit: int = Query(20, ge=1, le=100, description="Max results"),
    verified: Optional[bool] = Query(
        None,
        description="If true, only KYC-verified professionals are returned.",
    ),
    min_tier_level: Optional[int] = Query(
        None,
        ge=1,
        le=100,
        description="If set, only professionals with an active tier at this level or above.",
    ),
    session: Session = Depends(get_session),
):
    service = SearchService(session)
    try:
        return service.search_professionals(
            query=q,
            city=city,
            region=region,
            limit=limit,
            verified=verified,
            min_tier_level=min_tier_level,
        )
    except Exception:
        import logging
        logging.getLogger(__name__).exception(
            "Search endpoint failed for q=%r city=%r region=%r "
            "verified=%r min_tier_level=%r",
            q, city, region, verified, min_tier_level,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search is temporarily unavailable.",
        )