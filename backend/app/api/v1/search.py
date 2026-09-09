from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlmodel import Session

from app.database.session import get_session
from app.services.search_service import SearchService
from app.schemas.search import SearchResultResponse

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/professionals", response_model=List[SearchResultResponse])
def search_professionals(
    q: str = Query(..., min_length=1, description="Search query (e.g., 'plumber for leak')"),
    city: Optional[str] = Query(None, description="Filter by city (exact match)"),
    region: Optional[str] = Query(None, description="Filter by region (exact match)"),
    limit: int = Query(20, ge=1, le=100, description="Max number of results"),
    session: Session = Depends(get_session),
):
    """
    Semantic search for professionals using AI embeddings.
    Returns results sorted by relevance (cosine similarity).
    """
    service = SearchService(session)
    try:
        results = service.search_professionals(q, city, region, limit)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}"
        )