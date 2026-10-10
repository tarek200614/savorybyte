"""
Sliding Window Rate Limiting Engine.
Protects sensitive authentication, mutation, and security test endpoints
against abuse while providing standard HTTP 429 Retry-After headers.
"""

import threading
from datetime import UTC, datetime, timedelta


class SlidingWindowRateLimiter:
    def __init__(self):
        self._lock = threading.Lock()
        # Key -> list of request timestamps
        self._hits: dict[str, list[datetime]] = {}

    def is_rate_limited(
        self,
        key: str,
        max_requests: int,
        window_seconds: int,
    ) -> tuple[bool, int]:
        """
        Check and record a hit for a key (e.g. "login:192.168.1.1").
        Returns (is_limited, retry_after_seconds).
        """
        now = datetime.now(UTC)
        cutoff = now - timedelta(seconds=window_seconds)

        with self._lock:
            timestamps = self._hits.get(key, [])
            recent = [t for t in timestamps if t > cutoff]

            if len(recent) >= max_requests:
                oldest = recent[0]
                retry_after = max(1, int((oldest + timedelta(seconds=window_seconds) - now).total_seconds()))
                self._hits[key] = recent
                return True, retry_after

            recent.append(now)
            self._hits[key] = recent
            return False, 0

    def reset(self, key: str | None = None) -> None:
        with self._lock:
            if key:
                self._hits.pop(key, None)
            else:
                self._hits.clear()


# Global Singleton Rate Limiter
rate_limiter = SlidingWindowRateLimiter()
