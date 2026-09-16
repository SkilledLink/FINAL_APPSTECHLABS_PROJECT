# app/services/moderation/rate_limiter.py
"""
Process-local sliding-window rate limiter.

Keeps the app under the provider's RPM ceiling. On limit hit, callers
should return a REVIEW decision rather than fail — the user sees their
post go to review queue, not a 500.

Note: per-worker. With N uvicorn workers you get N× the limit. For the
current single-worker dev setup this is fine; for multi-worker, either
reduce the limit per worker or move to Redis later.
"""

import logging
import time
from collections import deque
from threading import Lock

logger = logging.getLogger(__name__)


class SlidingWindowLimiter:
    def __init__(self, max_per_minute: int):
        self.max = max(1, max_per_minute)
        self._events: deque[float] = deque()
        self._lock = Lock()

    def allow(self) -> bool:
        now = time.monotonic()
        cutoff = now - 60.0
        with self._lock:
            while self._events and self._events[0] < cutoff:
                self._events.popleft()
            if len(self._events) >= self.max:
                logger.warning(
                    "rate_limiter blocked (window has %d events, max=%d)",
                    len(self._events), self.max,
                )
                return False
            self._events.append(now)
            return True

    def remaining(self) -> int:
        now = time.monotonic()
        cutoff = now - 60.0
        with self._lock:
            while self._events and self._events[0] < cutoff:
                self._events.popleft()
            return max(0, self.max - len(self._events))