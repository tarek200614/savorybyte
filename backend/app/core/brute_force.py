"""
Server-Authoritative Brute-Force Protection and Account Lockout Engine.
Tracks failed authentication attempts per IP and identifier with exponential backoff.
Enforces strict server-side lockout that cannot be bypassed by client refreshing,
localStorage tampering, or direct API manipulation.
"""

import threading
from datetime import UTC, datetime, timedelta
from typing import NamedTuple


class LockoutInfo(NamedTuple):
    is_locked: bool
    remaining_seconds: int
    lockout_until: datetime | None
    attempts: int
    max_attempts: int


class BruteForceProtector:
    def __init__(
        self,
        max_attempts: int = 5,
        base_lockout_seconds: int = 60,
        attempt_window_seconds: int = 300,
    ):
        self.max_attempts = max_attempts
        self.base_lockout_seconds = base_lockout_seconds
        self.attempt_window_seconds = attempt_window_seconds
        self._lock = threading.Lock()
        # Key -> list of failed attempt timestamps
        self._failures: dict[str, list[datetime]] = {}
        # Key -> (lockout_until_datetime, consecutive_lockouts_count)
        self._lockouts: dict[str, tuple[datetime, int]] = {}

    def _normalize_key(self, identifier: str, ip: str | None = None) -> str:
        ident_clean = identifier.strip().lower()
        ip_clean = (ip or "").strip()
        return f"{ident_clean}|{ip_clean}" if ip_clean else ident_clean

    def check_lockout(self, identifier: str, ip: str | None = None) -> LockoutInfo:
        """
        Check if the identifier/IP is currently locked out on the server.
        """
        key = self._normalize_key(identifier, ip)
        now = datetime.now(UTC)

        with self._lock:
            if key in self._lockouts:
                lockout_until, _ = self._lockouts[key]
                if now < lockout_until:
                    remaining = int((lockout_until - now).total_seconds())
                    return LockoutInfo(
                        is_locked=True,
                        remaining_seconds=max(1, remaining),
                        lockout_until=lockout_until,
                        attempts=self.max_attempts,
                        max_attempts=self.max_attempts,
                    )
                else:
                    # Lockout expired naturally
                    del self._lockouts[key]

            # Count recent failures within window
            failures = self._failures.get(key, [])
            cutoff = now - timedelta(seconds=self.attempt_window_seconds)
            recent_failures = [t for t in failures if t > cutoff]
            self._failures[key] = recent_failures

            return LockoutInfo(
                is_locked=False,
                remaining_seconds=0,
                lockout_until=None,
                attempts=len(recent_failures),
                max_attempts=self.max_attempts,
            )

    def record_failure(self, identifier: str, ip: str | None = None) -> LockoutInfo:
        """
        Record a failed authentication attempt.
        Triggers exponential lockout if max_attempts is reached.
        """
        key = self._normalize_key(identifier, ip)
        now = datetime.now(UTC)

        with self._lock:
            # Check existing lockout
            consecutive_lockouts = 0
            if key in self._lockouts:
                lockout_until, consecutive_lockouts = self._lockouts[key]
                if now < lockout_until:
                    remaining = int((lockout_until - now).total_seconds())
                    return LockoutInfo(
                        is_locked=True,
                        remaining_seconds=max(1, remaining),
                        lockout_until=lockout_until,
                        attempts=self.max_attempts,
                        max_attempts=self.max_attempts,
                    )

            # Append new failure
            failures = self._failures.get(key, [])
            cutoff = now - timedelta(seconds=self.attempt_window_seconds)
            recent_failures = [t for t in failures if t > cutoff]
            recent_failures.append(now)
            self._failures[key] = recent_failures

            if len(recent_failures) >= self.max_attempts:
                consecutive_lockouts += 1
                # Exponential backoff multiplier: 1x, 2x, 4x... capped at 900s (15 min)
                multiplier = min(2 ** (consecutive_lockouts - 1), 15)
                lockout_duration = self.base_lockout_seconds * multiplier
                lockout_until = now + timedelta(seconds=lockout_duration)
                self._lockouts[key] = (lockout_until, consecutive_lockouts)

                return LockoutInfo(
                    is_locked=True,
                    remaining_seconds=lockout_duration,
                    lockout_until=lockout_until,
                    attempts=len(recent_failures),
                    max_attempts=self.max_attempts,
                )

            return LockoutInfo(
                is_locked=False,
                remaining_seconds=0,
                lockout_until=None,
                attempts=len(recent_failures),
                max_attempts=self.max_attempts,
            )

    def record_success(self, identifier: str, ip: str | None = None) -> None:
        """
        Clear failure counter and lockout history upon successful login.
        """
        key = self._normalize_key(identifier, ip)
        with self._lock:
            self._failures.pop(key, None)
            self._lockouts.pop(key, None)

    def reset_all(self) -> None:
        """
        Administrative test utility to reset all in-memory brute force records.
        """
        with self._lock:
            self._failures.clear()
            self._lockouts.clear()


# Global Singleton Instance for SavoryByte Authentication
brute_force_protector = BruteForceProtector(
    max_attempts=5,
    base_lockout_seconds=60,
    attempt_window_seconds=300,
)
