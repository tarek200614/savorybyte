import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    ForeignKey,
    Integer,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.reservation import Reservation
    from app.models.user import User


class Review(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_between_1_and_5"),
    )

    customer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reservation_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("reservations.id", ondelete="SET NULL"), nullable=True, index=True
    )

    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    customer: Mapped["User"] = relationship("User", back_populates="reviews")
    reservation: Mapped[Optional["Reservation"]] = relationship(
        "Reservation", back_populates="reviews"
    )

    def __repr__(self) -> str:
        return f"<Review rating={self.rating} customer_id={self.customer_id}>"
