import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserOut


class ReviewCreate(BaseModel):
    reservation_id: uuid.UUID | None = None
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = None


class ReviewOut(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    reservation_id: uuid.UUID | None = None
    rating: int
    comment: str | None = None
    is_approved: bool
    created_at: datetime
    customer: UserOut | None = None

    model_config = ConfigDict(from_attributes=True)
