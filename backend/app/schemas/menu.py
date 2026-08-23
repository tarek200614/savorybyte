import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    display_order: int = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MenuItemBase(BaseModel):
    category_id: uuid.UUID | None = None
    name: str = Field(..., min_length=1, max_length=150)
    slug: str = Field(..., min_length=1, max_length=150)
    description: str | None = None
    price: Decimal = Field(..., ge=0)
    image_url: str | None = None
    is_available: bool = True
    is_vegetarian: bool = False
    is_gluten_free: bool = False
    preparation_time_mins: int = Field(15, ge=1)


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemOut(MenuItemBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    category: CategoryOut | None = None

    model_config = ConfigDict(from_attributes=True)
