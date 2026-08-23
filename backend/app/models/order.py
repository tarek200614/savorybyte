import enum
import uuid
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    CheckConstraint,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.menu import MenuItem
    from app.models.reservation import Reservation
    from app.models.table import RestaurantTable
    from app.models.user import User


class OrderStatus(enum.StrEnum):
    PENDING = "PENDING"
    PREPARING = "PREPARING"
    READY = "READY"
    SERVED = "SERVED"
    PAID = "PAID"
    CANCELLED = "CANCELLED"


class Order(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "orders"

    customer_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    table_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("restaurant_tables.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    reservation_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("reservations.id", ondelete="SET NULL"), nullable=True, index=True
    )

    order_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False, index=True
    )
    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), default=Decimal("0.00"), nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    customer: Mapped[Optional["User"]] = relationship("User", back_populates="orders")
    table: Mapped[Optional["RestaurantTable"]] = relationship(
        "RestaurantTable", back_populates="orders"
    )
    reservation: Mapped[Optional["Reservation"]] = relationship(
        "Reservation", back_populates="orders"
    )
    items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Order number={self.order_number} status={self.status} total={self.total_amount}>"


class OrderItem(Base, UUIDMixin):
    __tablename__ = "order_items"
    __table_args__ = (CheckConstraint("quantity > 0", name="check_positive_item_quantity"),)

    order_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    menu_item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("menu_items.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    item_notes: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    order: Mapped["Order"] = relationship("Order", back_populates="items")
    menu_item: Mapped["MenuItem"] = relationship("MenuItem", back_populates="order_items")

    def __repr__(self) -> str:
        return f"<OrderItem item={self.menu_item_id} qty={self.quantity}>"
