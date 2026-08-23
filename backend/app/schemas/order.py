import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus
from app.schemas.menu import MenuItemOut


class OrderItemCreate(BaseModel):
    menu_item_id: uuid.UUID
    quantity: int = Field(..., gt=0)
    item_notes: str | None = None


class OrderItemOut(BaseModel):
    id: uuid.UUID
    menu_item_id: uuid.UUID
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    item_notes: str | None = None
    menu_item: MenuItemOut | None = None

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    table_id: uuid.UUID | None = None
    reservation_id: uuid.UUID | None = None
    items: list[OrderItemCreate] = Field(..., min_length=1)
    notes: str | None = None


class OrderUpdate(BaseModel):
    status: OrderStatus | None = None
    notes: str | None = None


class OrderOut(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID | None = None
    table_id: uuid.UUID | None = None
    reservation_id: uuid.UUID | None = None
    order_number: str
    status: OrderStatus
    total_amount: Decimal
    notes: str | None = None
    created_at: datetime
    items: list[OrderItemOut] = []

    model_config = ConfigDict(from_attributes=True)
