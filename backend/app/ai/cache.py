# app/ai/cache.py
"""
Tiny in-process TTL + LRU cache.

Deliberately not thread-safe and not shared across workers.
For a multi-worker deployment, each worker gets its own cache —
that is fine for query-embedding caching because the hit rate
per worker is still high for FAQ-style traffic.

If you later need distributed caching, swap this class for a Redis
client with the same get/set interface. No caller changes required.
"""

import logging
import time
from typing import Any, Optional

logger = logging.getLogger(__name__)


class TTLCache:
    def __init__(self, ttl_seconds: int, max_size: int = 500):
        self._ttl = ttl_seconds
        self._max = max_size
        self._data: dict[str, tuple[float, Any]] = {}
        self.hits = 0
        self.misses = 0

    def get(self, key: str) -> Optional[Any]:
        entry = self._data.get(key)
        if entry is None:
            self.misses += 1
            return None
        ts, value = entry
        if time.time() - ts > self._ttl:
            self._data.pop(key, None)
            self.misses += 1
            return None
        self.hits += 1
        return value

    def set(self, key: str, value: Any) -> None:
        # Evict oldest entry when full (approximate LRU by timestamp).
        if len(self._data) >= self._max and key not in self._data:
            oldest_key = min(self._data.items(), key=lambda kv: kv[1][0])[0]
            self._data.pop(oldest_key, None)
        self._data[key] = (time.time(), value)

    def stats(self) -> dict[str, int]:
        return {
            "size": len(self._data),
            "hits": self.hits,
            "misses": self.misses,
        }