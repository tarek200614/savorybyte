import enum
import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    Enum,
    ForeignKey,
    Index,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User


class SecurityEventType(enum.StrEnum):
    LOGIN_SUCCESS = "LOGIN_SUCCESS"
    LOGIN_FAILURE = "LOGIN_FAILURE"
    ACCOUNT_LOCKED = "ACCOUNT_LOCKED"
    ACCOUNT_UNLOCKED = "ACCOUNT_UNLOCKED"
    UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS"
    FORBIDDEN_ACCESS = "FORBIDDEN_ACCESS"
    RATE_LIMIT_TRIGGERED = "RATE_LIMIT_TRIGGERED"
    VALIDATION_FAILURE = "VALIDATION_FAILURE"
    SUSPICIOUS_REQUEST = "SUSPICIOUS_REQUEST"
    CSRF_REJECTED = "CSRF_REJECTED"
    ADMIN_ACTION = "ADMIN_ACTION"
    SECURITY_TEST_RUN = "SECURITY_TEST_RUN"


class SecuritySeverity(enum.StrEnum):
    INFO = "INFO"
    NOTICE = "NOTICE"
    WARNING = "WARNING"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SecurityEvent(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "security_events"

    event_type: Mapped[SecurityEventType] = mapped_column(
        Enum(SecurityEventType), nullable=False, index=True
    )
    severity: Mapped[SecuritySeverity] = mapped_column(
        Enum(SecuritySeverity), nullable=False, index=True, default=SecuritySeverity.INFO
    )
    actor_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    actor_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    actor_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)
    target_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    target_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    request_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    actor: Mapped[Optional["User"]] = relationship("User")

    __table_args__ = (
        Index("ix_security_events_type_created", "event_type", "created_at"),
        Index("ix_security_events_severity_created", "severity", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<SecurityEvent type={self.event_type} severity={self.severity} ip={self.actor_ip}>"
