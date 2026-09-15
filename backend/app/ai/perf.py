# app/ai/perf.py
import logging
import time
from contextlib import contextmanager

logger = logging.getLogger("ai.perf")


@contextmanager
def timed(label: str):
    """Emit one structured perf log line per labelled block."""
    start = time.perf_counter()
    try:
        yield
    finally:
        logger.info("perf.%s ms=%d", label, int((time.perf_counter() - start) * 1000))