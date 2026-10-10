import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


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


class MenuItemUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=150)
    description: str | None = Field(None, max_length=2000)
    price: Decimal | None = Field(None, ge=0.01, le=10000.00)
    category_id: uuid.UUID | None = None
    image_url: str | None = Field(None, max_length=500)
    is_available: bool | None = None
    is_vegetarian: bool | None = None
    is_gluten_free: bool | None = None
    preparation_time_mins: int | None = Field(None, ge=1, le=240)

    model_config = ConfigDict(extra="forbid")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is not None:
            v_stripped = v.strip()
            if not v_stripped:
                raise ValueError("Product name cannot be empty or whitespace-only.")
            return v_stripped
        return v

    @field_validator("price")
    @classmethod
    def validate_price(cls, v: Decimal | None) -> Decimal | None:
        if v is not None:
            if v <= Decimal("0.00"):
                raise ValueError("Price must be strictly positive (> 0.00 EUR).")
            return round(v, 2)
        return v


class MenuItemOut(MenuItemBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    category: CategoryOut | None = None

    model_config = ConfigDict(from_attributes=True)


class MenuItemChangeLog(BaseModel):
    id: uuid.UUID
    timestamp: datetime
    actor_email: str | None = None
    actor_name: str | None = None
    details: str
    request_id: str | None = None

    model_config = ConfigDict(from_attributes=True)
