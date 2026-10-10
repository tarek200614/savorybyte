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


@router.get("/{order_id}", response_model=OrderOut)
async def get_order_by_id(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve an order by ID. Scoped to order owner for customers, or staff/admin."""
    order = await order_crud.get_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found.",
        )
    if current_user.role == UserRole.CUSTOMER and order.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot view another patron's order.",
        )
    return order


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


VALID_ORDER_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.PENDING: {OrderStatus.PREPARING, OrderStatus.CANCELLED},
    OrderStatus.PREPARING: {OrderStatus.READY, OrderStatus.CANCELLED},
    OrderStatus.READY: {OrderStatus.SERVED, OrderStatus.CANCELLED},
    OrderStatus.SERVED: {OrderStatus.PAID},
    OrderStatus.PAID: set(),
    OrderStatus.CANCELLED: set(),
}


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
    Enforces strict state machine transition validation.
    """
    order = await order_crud.get_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    if order_in.status is not None and order_in.status != order.status:
        allowed_next = VALID_ORDER_TRANSITIONS.get(order.status, set())
        if order_in.status not in allowed_next:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid order status transition from {order.status} to {order_in.status}.",
            )

    return await order_crud.update(db, order, order_in)
