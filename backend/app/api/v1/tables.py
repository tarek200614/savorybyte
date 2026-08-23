import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_role
from app.crud.crud_table import table_crud
from app.models.table import TableLocation, TableStatus
from app.models.user import UserRole
from app.schemas.table import TableCreate, TableOut, TableUpdate

router = APIRouter(prefix="/tables", tags=["Restaurant Tables"])


@router.get("", response_model=list[TableOut])
async def list_tables(
    location: TableLocation | None = None,
    status: TableStatus | None = None,
    min_capacity: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    """
    List all active restaurant tables with optional location, status, and capacity filtering.
    Publicly accessible so customers can browse available table options.
    """
    return await table_crud.get_multi(
        db, location=location, status=status, min_capacity=min_capacity
    )


@router.get("/{table_id}", response_model=TableOut)
async def get_table(table_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Fetch details of a single table by ID."""
    table = await table_crud.get_by_id(db, table_id)
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    return table


@router.post(
    "",
    response_model=TableOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role([UserRole.ADMIN, UserRole.STAFF]))],
)
async def create_table(
    table_in: TableCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Add a new table to the restaurant layout.
    Protected: STAFF & ADMIN only.
    """
    existing = await table_crud.get_by_number(db, table_in.table_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Table number '{table_in.table_number}' already exists.",
        )
    return await table_crud.create(db, table_in)


@router.put(
    "/{table_id}",
    response_model=TableOut,
    dependencies=[Depends(require_role([UserRole.ADMIN, UserRole.STAFF]))],
)
async def update_table(
    table_id: uuid.UUID,
    table_in: TableUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Update table capacity, status, or location.
    Protected: STAFF & ADMIN only.
    """
    table = await table_crud.get_by_id(db, table_id)
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    return await table_crud.update(db, table, table_in)
