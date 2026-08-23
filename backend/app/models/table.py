import enum
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.order import Order
    from app.models.reservation import Reservation


class TableLocation(enum.StrEnum):
    MAIN_HALL = "MAIN_HALL"
    TERRACE = "TERRACE"
    PRIVATE_ROOM = "PRIVATE_ROOM"
    BAR = "BAR"


class TableStatus(enum.StrEnum):
    AVAILABLE = "AVAILABLE"
    RESERVED = "RESERVED"
    OCCUPIED = "OCCUPIED"
    OUT_OF_SERVICE = "OUT_OF_SERVICE"


class RestaurantTable(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "restaurant_tables"
    __table_args__ = (CheckConstraint("capacity > 0", name="check_positive_table_capacity"),)

    table_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    location: Mapped[TableLocation] = mapped_column(
        Enum(TableLocation), default=TableLocation.MAIN_HALL, nullable=False
    )
    status: Mapped[TableStatus] = mapped_column(
        Enum(TableStatus), default=TableStatus.AVAILABLE, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    reservations: Mapped[list["Reservation"]] = relationship(
        "Reservation", back_populates="table", cascade="all, delete-orphan"
    )
    orders: Mapped[list["Order"]] = relationship("Order", back_populates="table")

    def __repr__(self) -> str:
        return f"<RestaurantTable number={self.table_number} capacity={self.capacity}>"
