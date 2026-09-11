import logging

from fastapi import HTTPException, status

from app.schemas.location import (
    LocationSearchResponse,
    ReverseGeocodeResponse,
)
from app.services.geocoding_service import GeocodingService

logger = logging.getLogger(__name__)


class LocationService:
    def __init__(self):
        self.geocoder = GeocodingService()

    async def search(
        self,
        query: str,
        limit: int = 8,
        country: str | None = None,
    ) -> LocationSearchResponse:
        if len(query.strip()) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Search query must be at least 2 characters",
            )
        results = await self.geocoder.search(query, limit=limit, country=country)
        return LocationSearchResponse(results=results)

    async def reverse(
        self, latitude: float, longitude: float
    ) -> ReverseGeocodeResponse:
        if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid coordinates",
            )
        result = await self.geocoder.reverse(latitude, longitude)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No location found for those coordinates",
            )
        return result