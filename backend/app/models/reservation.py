import enum
import uuid
from datetime import date, time
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    Date,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Text,
    Time,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.order import Order
    from app.models.review import Review
    from app.models.table import RestaurantTable
    from app.models.user import User


class ReservationStatus(enum.StrEnum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    SEATED = "SEATED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"


class Reservation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "reservations"
    __table_args__ = (
        CheckConstraint("party_size > 0", name="check_positive_party_size"),
        Index(
            "idx_reservations_date_table",
            "reservation_date",
            "table_id",
            "status",
        ),
    )

    customer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    table_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("restaurant_tables.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    reservation_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    party_size: Mapped[int] = mapped_column(Integer, nullable=False)

    status: Mapped[ReservationStatus] = mapped_column(
        Enum(ReservationStatus),
        default=ReservationStatus.PENDING,
        nullable=False,
        index=True,
    )
    special_requests: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    customer: Mapped["User"] = relationship("User", back_populates="reservations")
    table: Mapped["RestaurantTable"] = relationship(
        "RestaurantTable", back_populates="reservations"
    )
    orders: Mapped[list["Order"]] = relationship("Order", back_populates="reservation")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="reservation")

    def __repr__(self) -> str:
        return f"<Reservation date={self.reservation_date} party={self.party_size}>"
