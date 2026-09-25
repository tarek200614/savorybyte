import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.crud.crud_order import order_crud
from app.models.order import OrderStatus
from app.models.user import User, UserRole
from app.schemas.order import OrderCreate, OrderOut, OrderUpdate

router = APIRouter(prefix="/orders", tags=["Food Ordering System"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def place_order(
    order_in: OrderCreate,
    current_user: User | None = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Place a food & drink order for a table or customer session.
    Calculates exact total amount and locks item unit prices.
    """
    customer_id = current_user.id if current_user else None
    try:
        return await order_crud.create(db, customer_id=customer_id, obj_in=order_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@router.get("/my-orders", response_model=list[OrderOut])
async def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch order history for authenticated customer."""
    return await order_crud.get_multi(db, customer_id=current_user.id)


@router.get(
    "",
    response_model=list[OrderOut],
    dependencies=[Depends(require_role([UserRole.STAFF, UserRole.ADMIN]))],
)
@router.get(
    "/live",
    response_model=list[OrderOut],
    dependencies=[Depends(require_role([UserRole.STAFF, UserRole.ADMIN]))],
)
async def get_live_kitchen_orders(
    status: OrderStatus | None = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Fetch active order queue for Staff Kitchen Display System (KDS) & Admin.
    Protected: STAFF & ADMIN only.
    """
    return await order_crud.get_multi(db, status=status)


@router.patch(
    "/{order_id}",
    response_model=OrderOut,
    dependencies=[Depends(require_role([UserRole.STAFF, UserRole.ADMIN]))],
)
@router.patch(
    "/{order_id}/status",
    response_model=OrderOut,
    dependencies=[Depends(require_role([UserRole.STAFF, UserRole.ADMIN]))],
)
async def update_order_status(
    order_id: uuid.UUID,
    order_in: OrderUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Update order lifecycle status (PENDING -> PREPARING -> READY -> SERVED -> PAID).
    Protected: STAFF & ADMIN only.
    """
    order = await order_crud.get_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    return await order_crud.update(db, order, order_in)
