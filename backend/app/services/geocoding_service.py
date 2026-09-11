import asyncio
import logging
import time
from typing import Any, Optional

import httpx

from app.core.config import settings
from app.schemas.location import (
    LocationSearchResult,
    ReverseGeocodeResponse,
)

logger = logging.getLogger(__name__)

# Nominatim sometimes returns administrative wrappers as `city`.
# We strip these so the UI shows "Yaoundé" instead of
# "Communauté urbaine de Yaoundé".
_ADMIN_WRAPPERS = (
    "communauté urbaine",
    "communaute urbaine",
    "urban community",
    "metropolitan area",
    "metropolitan borough",
    "district de",
    "department of",
)

# Separators used to find the real locality inside a wrapper string.
_WRAPPER_SEPARATORS = (
    " de la ",
    " de l'",
    " de l’",
    " de ",
    " of ",
    " d'",
    " d’",
)


def _strip_wrapper(candidate: str) -> Optional[str]:
    """'Communauté urbaine de Yaoundé' → 'Yaoundé'.

    Returns None if no separator match is found.
    """
    lower = candidate.lower()
    for wrapper in _ADMIN_WRAPPERS:
        if wrapper not in lower:
            continue
        for sep in _WRAPPER_SEPARATORS:
            idx = lower.find(sep)
            if idx != -1:
                tail = candidate[idx + len(sep):].strip()
                if tail:
                    return tail
    return None


def _pick_city(addr: dict) -> Optional[str]:
    """Pick the most human-meaningful city/town/village name from a
    Nominatim address dict, extracting the locality from administrative
    wrappers when necessary."""
    candidates = [
        addr.get("city"),
        addr.get("town"),
        addr.get("village"),
        addr.get("hamlet"),
        addr.get("municipality"),
    ]

    for candidate in candidates:
        if not candidate:
            continue

        lower = candidate.lower()
        if any(wrapper in lower for wrapper in _ADMIN_WRAPPERS):
            stripped = _strip_wrapper(candidate)
            if stripped:
                return stripped
            continue

        return candidate

    # Last-resort fallbacks
    return (
        addr.get("city_district")
        or addr.get("state_district")
        or addr.get("county")
        or None
    )


class _TTLCache:
    """Tiny in-memory TTL cache. Swap for Redis in production."""

    def __init__(self, ttl_seconds: int, max_size: int = 1000):
        self._ttl = ttl_seconds
        self._max = max_size
        self._data: dict[str, tuple[float, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        entry = self._data.get(key)
        if not entry:
            return None
        ts, value = entry
        if time.time() - ts > self._ttl:
            self._data.pop(key, None)
            return None
        return value

    def set(self, key: str, value: Any) -> None:
        if len(self._data) >= self._max:
            oldest = min(self._data.items(), key=lambda x: x[1][0])[0]
            self._data.pop(oldest, None)
        self._data[key] = (time.time(), value)


class GeocodingService:
    """
    Nominatim client with rate limiting and TTL caching.

    Enforces Nominatim's 1 req/sec policy with a global lock.
    """

    _rate_lock = asyncio.Lock()
    _last_request_at: float = 0.0

    def __init__(self):
        self.base_url = settings.NOMINATIM_BASE_URL.rstrip("/")
        self.headers = {
            "User-Agent": settings.NOMINATIM_USER_AGENT,
            "Accept": "application/json",
        }
        self.timeout = settings.NOMINATIM_TIMEOUT_SECONDS
        self._search_cache = _TTLCache(settings.NOMINATIM_CACHE_TTL_SECONDS)
        self._reverse_cache = _TTLCache(settings.NOMINATIM_CACHE_TTL_SECONDS)

    # ─── Rate limiter ───────────────────────────────────────
    async def _wait_for_slot(self) -> None:
        async with self._rate_lock:
            now = time.monotonic()
            elapsed = now - self._last_request_at
            gap = settings.NOMINATIM_MIN_INTERVAL_SECONDS - elapsed
            if gap > 0:
                await asyncio.sleep(gap)
            GeocodingService._last_request_at = time.monotonic()

    # ─── Search ─────────────────────────────────────────────
    async def search(
        self,
        query: str,
        limit: Optional[int] = None,
        country: Optional[str] = None,
    ) -> list[LocationSearchResult]:
        limit = limit or settings.LOCATION_SEARCH_MAX_RESULTS
        country = (country or settings.NOMINATIM_COUNTRY_BIAS or "").lower()

        cache_key = f"search:{query.lower()}:{limit}:{country}"
        cached = self._search_cache.get(cache_key)
        if cached is not None:
            return cached

        await self._wait_for_slot()

        params: dict[str, Any] = {
            "q": query,
            "format": "jsonv2",
            "addressdetails": 1,
            "limit": limit,
        }
        if country:
            params["countrycodes"] = country

        try:
            async with httpx.AsyncClient(
                timeout=self.timeout, headers=self.headers
            ) as client:
                response = await client.get(
                    f"{self.base_url}/search", params=params
                )
                response.raise_for_status()
                raw = response.json()
        except httpx.HTTPError as e:
            logger.warning(f"Nominatim search failed: {e}")
            return []

        results = [self._parse_search_item(item) for item in raw]
        self._search_cache.set(cache_key, results)
        return results

    # ─── Reverse ────────────────────────────────────────────
    async def reverse(
        self, latitude: float, longitude: float
    ) -> Optional[ReverseGeocodeResponse]:
        cache_key = f"reverse:{round(latitude, 5)}:{round(longitude, 5)}"
        cached = self._reverse_cache.get(cache_key)
        if cached is not None:
            return cached

        await self._wait_for_slot()

        params = {
            "lat": latitude,
            "lon": longitude,
            "format": "jsonv2",
            "addressdetails": 1,
        }
        try:
            async with httpx.AsyncClient(
                timeout=self.timeout, headers=self.headers
            ) as client:
                response = await client.get(
                    f"{self.base_url}/reverse", params=params
                )
                response.raise_for_status()
                raw = response.json()
        except httpx.HTTPError as e:
            logger.warning(f"Nominatim reverse failed: {e}")
            return None

        if not raw or "error" in raw:
            return None

        parsed = self._parse_reverse_item(raw)
        self._reverse_cache.set(cache_key, parsed)
        return parsed

    # ─── Parsing ────────────────────────────────────────────
    def _parse_search_item(self, item: dict) -> LocationSearchResult:
        addr = item.get("address", {}) or {}
        return LocationSearchResult(
            display_name=item.get("display_name", ""),
            latitude=float(item.get("lat", 0.0)),
            longitude=float(item.get("lon", 0.0)),
            country=addr.get("country"),
            country_code=(addr.get("country_code") or "").upper() or None,
            region=addr.get("state") or addr.get("region"),
            city=_pick_city(addr),
            area=(
                addr.get("suburb")
                or addr.get("neighbourhood")
                or addr.get("quarter")
            ),
            postcode=addr.get("postcode"),
            osm_type=item.get("osm_type"),
            osm_id=str(item.get("osm_id")) if item.get("osm_id") else None,
            place_type=item.get("type") or item.get("category"),
        )

    def _parse_reverse_item(self, item: dict) -> ReverseGeocodeResponse:
        addr = item.get("address", {}) or {}
        return ReverseGeocodeResponse(
            display_name=item.get("display_name", ""),
            latitude=float(item.get("lat", 0.0)),
            longitude=float(item.get("lon", 0.0)),
            country=addr.get("country"),
            country_code=(addr.get("country_code") or "").upper() or None,
            region=addr.get("state") or addr.get("region"),
            city=_pick_city(addr),
            area=(
                addr.get("suburb")
                or addr.get("neighbourhood")
                or addr.get("quarter")
            ),
            postcode=addr.get("postcode"),
        )