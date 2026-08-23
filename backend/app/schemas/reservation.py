import uuid
from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field

from app.models.reservation import ReservationStatus
from app.schemas.table import TableOut
from app.schemas.user import UserOut


class ReservationBase(BaseModel):
    table_id: uuid.UUID
    reservation_date: date
    start_time: time
    end_time: time
    party_size: int = Field(..., gt=0)
    special_requests: str | None = None


class ReservationCreate(ReservationBase):
    pass


class ReservationUpdate(BaseModel):
    reservation_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    party_size: int | None = Field(None, gt=0)
    status: ReservationStatus | None = None
    special_requests: str | None = None


class ReservationOut(ReservationBase):
    id: uuid.UUID
    customer_id: uuid.UUID
    status: ReservationStatus
    created_at: datetime
    updated_at: datetime

    customer: UserOut | None = None
    table: TableOut | None = None

    model_config = ConfigDict(from_attributes=True)
