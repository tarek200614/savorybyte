import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.table import TableLocation, TableStatus


class TableBase(BaseModel):
    table_number: str = Field(..., min_length=1, max_length=50)
    capacity: int = Field(..., gt=0)
    location: TableLocation = TableLocation.MAIN_HALL


class TableCreate(TableBase):
    pass


class TableUpdate(BaseModel):
    capacity: int | None = Field(None, gt=0)
    location: TableLocation | None = None
    status: TableStatus | None = None
    is_active: bool | None = None


class TableOut(TableBase):
    id: uuid.UUID
    status: TableStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
