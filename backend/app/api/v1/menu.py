import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_role
from app.crud.crud_menu import menu_crud
from app.models.user import UserRole
from app.schemas.menu import (
    CategoryCreate,
    CategoryOut,
    MenuItemCreate,
    MenuItemOut,
)

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


@router.post(
    "/items",
    response_model=MenuItemOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role([UserRole.ADMIN]))],
)
async def create_menu_item(item_in: MenuItemCreate, db: AsyncSession = Depends(get_db)):
    """Create a new food/drink menu item. Protected: ADMIN only."""
    return await menu_crud.create_item(db, item_in)
