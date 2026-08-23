import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.menu import Category, MenuItem
from app.schemas.menu import CategoryCreate, MenuItemCreate


class CRUDMenu:
    # --- Category CRUD ---
    async def get_category_by_id(self, db: AsyncSession, category_id: uuid.UUID) -> Category | None:
        stmt = select(Category).where(Category.id == category_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_categories(
        self, db: AsyncSession, is_active: bool | None = True
    ) -> list[Category]:
        stmt = select(Category)
        if is_active is not None:
            stmt = stmt.where(Category.is_active == is_active)
        stmt = stmt.order_by(Category.display_order.asc(), Category.name.asc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create_category(self, db: AsyncSession, obj_in: CategoryCreate) -> Category:
        db_obj = Category(
            name=obj_in.name,
            slug=obj_in.slug,
            description=obj_in.description,
            display_order=obj_in.display_order,
            is_active=True,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    # --- MenuItem CRUD ---
    async def get_item_by_id(self, db: AsyncSession, item_id: uuid.UUID) -> MenuItem | None:
        stmt = (
            select(MenuItem).options(selectinload(MenuItem.category)).where(MenuItem.id == item_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_menu_items(
        self,
        db: AsyncSession,
        category_id: uuid.UUID | None = None,
        is_available: bool | None = True,
        is_vegetarian: bool | None = None,
        is_gluten_free: bool | None = None,
        search: str | None = None,
    ) -> list[MenuItem]:
        stmt = select(MenuItem).options(selectinload(MenuItem.category))

        if is_available is not None:
            stmt = stmt.where(MenuItem.is_available == is_available)
        if category_id:
            stmt = stmt.where(MenuItem.category_id == category_id)
        if is_vegetarian:
            stmt = stmt.where(MenuItem.is_vegetarian)
        if is_gluten_free:
            stmt = stmt.where(MenuItem.is_gluten_free)
        if search:
            stmt = stmt.where(MenuItem.name.ilike(f"%{search}%"))

        stmt = stmt.order_by(MenuItem.name.asc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create_item(self, db: AsyncSession, obj_in: MenuItemCreate) -> MenuItem:
        db_obj = MenuItem(
            category_id=obj_in.category_id,
            name=obj_in.name,
            slug=obj_in.slug,
            description=obj_in.description,
            price=obj_in.price,
            image_url=obj_in.image_url,
            is_available=obj_in.is_available,
            is_vegetarian=obj_in.is_vegetarian,
            is_gluten_free=obj_in.is_gluten_free,
            preparation_time_mins=obj_in.preparation_time_mins,
        )
        db.add(db_obj)
        await db.commit()
        return await self.get_item_by_id(db, db_obj.id)  # type: ignore


menu_crud = CRUDMenu()
