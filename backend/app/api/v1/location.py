from fastapi import APIRouter, Depends, Query

from app.dependencies.current_user import get_current_user
from app.models.user import User
from app.schemas.location import (
    LocationSearchResponse,
    ReverseGeocodeResponse,
)
from app.services.location_service import LocationService

router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("/search", response_model=LocationSearchResponse)
async def search_locations(
    q: str = Query(..., min_length=2, max_length=200),
    limit: int = Query(8, ge=1, le=20),
    country: str | None = Query(None, min_length=2, max_length=2),
    current_user: User = Depends(get_current_user),
):
    service = LocationService()
    return await service.search(q, limit=limit, country=country)


@router.get("/reverse", response_model=ReverseGeocodeResponse)
async def reverse_geocode(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    current_user: User = Depends(get_current_user),
):
    service = LocationService()
    return await service.reverse(lat, lng)