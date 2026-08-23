import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.crud.crud_reservation import reservation_crud
from app.crud.crud_table import table_crud
from app.models.reservation import ReservationStatus
from app.models.user import User, UserRole
from app.schemas.reservation import (
    ReservationCreate,
    ReservationOut,
    ReservationUpdate,
)

router = APIRouter(prefix="/reservations", tags=["Reservations Engine"])


@router.post("", response_model=ReservationOut, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    reservation_in: ReservationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new table reservation for the authenticated customer.
    Enforces Overlap Prevention Algorithm: Prevents double-booking target table.
    """
    # 1. Validate Table Existence & Capacity
    table = await table_crud.get_by_id(db, reservation_in.table_id)
    if not table or not table.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target table not found.")

    if reservation_in.party_size > table.capacity:
        msg = f"Party size ({reservation_in.party_size}) exceeds table capacity ({table.capacity})."
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    # 2. Check Overlap Conflict Algorithm
    has_overlap = await reservation_crud.check_overlap(
        db,
        table_id=reservation_in.table_id,
        reservation_date=reservation_in.reservation_date,
        start_time=reservation_in.start_time,
        end_time=reservation_in.end_time,
    )

    if has_overlap:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Table is already reserved for the selected date and time slot.",
        )

    # 3. Create Reservation
    return await reservation_crud.create(db, customer_id=current_user.id, obj_in=reservation_in)


@router.get("/my-reservations", response_model=list[ReservationOut])
async def get_my_reservations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch all reservations belonging to the authenticated customer."""
    return await reservation_crud.get_by_customer(db, current_user.id)


@router.get(
    "",
    response_model=list[ReservationOut],
    dependencies=[Depends(require_role([UserRole.STAFF, UserRole.ADMIN]))],
)
async def list_all_reservations(
    target_date: date | None = None,
    status: ReservationStatus | None = None,
    table_id: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    """
    List all reservations for staff/admin command center.
    Protected: STAFF & ADMIN only.
    """
    return await reservation_crud.get_multi(
        db, target_date=target_date, status=status, table_id=table_id
    )


@router.patch("/{reservation_id}", response_model=ReservationOut)
async def update_reservation(
    reservation_id: uuid.UUID,
    reservation_in: ReservationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Modify reservation details or status.
    Customers can cancel their own pending reservation; Staff/Admin can update any status.
    """
    reservation = await reservation_crud.get_by_id(db, reservation_id)
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found.")

    # Authorization Check
    if current_user.role == UserRole.CUSTOMER and reservation.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return await reservation_crud.update(db, reservation, reservation_in)
