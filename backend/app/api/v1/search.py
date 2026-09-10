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
    session: Session = Depends(get_session),
):
    service = SearchService(session)
    try:
        return service.search_professionals(q, city, region, limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}"
        )