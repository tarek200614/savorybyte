import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.crud.crud_menu import menu_crud
from app.crud.crud_security import security_crud
from app.models.security import SecurityEventType, SecuritySeverity
from app.models.user import User, UserRole
from app.schemas.menu import (
    CategoryCreate,
    CategoryOut,
    MenuItemChangeLog,
    MenuItemCreate,
    MenuItemOut,
    MenuItemUpdate,
)
from app.schemas.security import SecurityEventCreate

router = APIRouter(prefix="/menu", tags=["Digital Food Menu"])


# --- Categories Endpoints ---
@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """List active menu categories."""
    return await menu_crud.get_categories(db)


@router.post(
    "/categories",
    response_model=CategoryOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role([UserRole.ADMIN]))],
)
async def create_category(category_in: CategoryCreate, db: AsyncSession = Depends(get_db)):
    """Create a menu category. Protected: ADMIN only."""
    return await menu_crud.create_category(db, category_in)


# --- Menu Items Endpoints ---
@router.get("/items", response_model=list[MenuItemOut])
async def list_menu_items(
    category_id: uuid.UUID | None = None,
    is_vegetarian: bool | None = None,
    is_gluten_free: bool | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Browse menu items with category filtering, dietary tags, and search query.
    """
    return await menu_crud.get_menu_items(
        db,
        category_id=category_id,
        is_vegetarian=is_vegetarian,
        is_gluten_free=is_gluten_free,
        search=search,
    )


@router.get("/items/{item_id}", response_model=MenuItemOut)
async def get_menu_item(item_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Retrieve a single menu item by ID."""
    item = await menu_crud.get_item_by_id(db, item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {item_id} not found.",
        )
    return item


@router.post(
    "/items",
    response_model=MenuItemOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role([UserRole.ADMIN]))],
)
async def create_menu_item(item_in: MenuItemCreate, db: AsyncSession = Depends(get_db)):
    """Create a new food/drink menu item. Protected: ADMIN only."""
    return await menu_crud.create_item(db, item_in)


@router.patch("/items/{item_id}", response_model=MenuItemOut)
@router.put("/items/{item_id}", response_model=MenuItemOut)
async def update_menu_item(
    item_id: uuid.UUID,
    item_in: MenuItemUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """
    Update an existing food/drink menu item. Protected: ADMIN only.
    Persists updates to PostgreSQL and records an audit trail event.
    """
    old_item = await menu_crud.get_item_by_id(db, item_id)
    if not old_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {item_id} not found.",
        )

    # Detect changed fields for audit trail
    changes: list[str] = []
    if item_in.name is not None and item_in.name != old_item.name:
        changes.append(f"name: '{old_item.name}' -> '{item_in.name}'")
    if item_in.price is not None and item_in.price != old_item.price:
        changes.append(f"price: €{old_item.price} -> €{item_in.price}")
    if item_in.category_id is not None and item_in.category_id != old_item.category_id:
        changes.append(f"category_id: {old_item.category_id} -> {item_in.category_id}")
    if item_in.description is not None and item_in.description != old_item.description:
        changes.append("description modified")
    if item_in.is_available is not None and item_in.is_available != old_item.is_available:
        changes.append(f"is_available: {old_item.is_available} -> {item_in.is_available}")
    if (
        item_in.preparation_time_mins is not None
        and item_in.preparation_time_mins != old_item.preparation_time_mins
    ):
        changes.append(
            f"prep_time: {old_item.preparation_time_mins}m -> {item_in.preparation_time_mins}m"
        )
    if item_in.is_vegetarian is not None and item_in.is_vegetarian != old_item.is_vegetarian:
        changes.append(f"is_vegetarian: {old_item.is_vegetarian} -> {item_in.is_vegetarian}")
    if item_in.is_gluten_free is not None and item_in.is_gluten_free != old_item.is_gluten_free:
        changes.append(f"is_gluten_free: {old_item.is_gluten_free} -> {item_in.is_gluten_free}")

    try:
        updated_item = await menu_crud.update_item(db, item_id, item_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {item_id} not found.",
        )

    # Record structured security audit event
    change_summary = ", ".join(changes) if changes else "No fields altered"
    await security_crud.log_event(
        db,
        SecurityEventCreate(
            event_type=SecurityEventType.ADMIN_ACTION,
            severity=SecuritySeverity.NOTICE,
            actor_id=current_user.id,
            actor_email=current_user.email,
            actor_ip=request.client.host if request.client else None,
            target_type="menu_item",
            target_id=str(item_id),
            request_id=request.headers.get("x-request-id"),
            details=f"Admin '{current_user.email}' updated menu product '{updated_item.name}'. [{change_summary}]",
        ),
    )

    return updated_item


@router.delete(
    "/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role([UserRole.ADMIN]))],
)
async def delete_menu_item(
    item_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a menu item. Protected: ADMIN only."""
    deleted = await menu_crud.delete_item(db, item_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {item_id} not found.",
        )

    await security_crud.log_event(
        db,
        SecurityEventCreate(
            event_type=SecurityEventType.ADMIN_ACTION,
            severity=SecuritySeverity.WARNING,
            actor_id=current_user.id,
            actor_email=current_user.email,
            actor_ip=request.client.host if request.client else None,
            target_type="menu_item",
            target_id=str(item_id),
            request_id=request.headers.get("x-request-id"),
            details=f"Admin '{current_user.email}' deleted menu item ID: {item_id}.",
        ),
    )


@router.get(
    "/items/{item_id}/history",
    response_model=list[MenuItemChangeLog],
    dependencies=[Depends(require_role([UserRole.ADMIN]))],
)
async def get_menu_item_history(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve modification history and audit trail for a specific menu item."""
    events, _ = await security_crud.get_multi(
        db,
        limit=20,
        search=str(item_id),
    )
    history: list[MenuItemChangeLog] = []
    for ev in events:
        if ev.target_type == "menu_item" and ev.target_id == str(item_id):
            history.append(
                MenuItemChangeLog(
                    id=ev.id,
                    timestamp=ev.created_at,
                    actor_email=ev.actor_email,
                    actor_name=ev.actor.full_name if ev.actor else None,
                    details=ev.details or "",
                    request_id=ev.request_id,
                )
            )
    return history
