import uuid
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
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
    from app.models.order import OrderItem


class Category(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "categories"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    items: Mapped[list["MenuItem"]] = relationship("MenuItem", back_populates="category")

    def __repr__(self) -> str:
        return f"<Category name={self.name}>"


class MenuItem(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "menu_items"
    __table_args__ = (CheckConstraint("price >= 0", name="check_non_negative_price"),)

    category_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    slug: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    is_vegetarian: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_gluten_free: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    preparation_time_mins: Mapped[int] = mapped_column(Integer, default=15, nullable=False)

    # Relationships
    category: Mapped[Optional["Category"]] = relationship("Category", back_populates="items")
    order_items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="menu_item")

    def __repr__(self) -> str:
        return f"<MenuItem name={self.name} price={self.price}>"
