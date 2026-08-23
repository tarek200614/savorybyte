import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.table import RestaurantTable, TableLocation, TableStatus
from app.schemas.table import TableCreate, TableUpdate


class CRUDTable:
    async def get_by_id(self, db: AsyncSession, table_id: uuid.UUID) -> RestaurantTable | None:
        """Fetch table by ID."""
        stmt = select(RestaurantTable).where(RestaurantTable.id == table_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_number(self, db: AsyncSession, table_number: str) -> RestaurantTable | None:
        """Fetch table by table number."""
        stmt = select(RestaurantTable).where(RestaurantTable.table_number == table_number)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_multi(
        self,
        db: AsyncSession,
        location: TableLocation | None = None,
        status: TableStatus | None = None,
        min_capacity: int | None = None,
        is_active: bool | None = True,
    ) -> list[RestaurantTable]:
        """List tables with optional filtering."""
        stmt = select(RestaurantTable)
        if is_active is not None:
            stmt = stmt.where(RestaurantTable.is_active == is_active)
        if location:
            stmt = stmt.where(RestaurantTable.location == location)
        if status:
            stmt = stmt.where(RestaurantTable.status == status)
        if min_capacity:
            stmt = stmt.where(RestaurantTable.capacity >= min_capacity)

        stmt = stmt.order_by(RestaurantTable.table_number)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, obj_in: TableCreate) -> RestaurantTable:
        """Create a new restaurant table."""
        db_obj = RestaurantTable(
            table_number=obj_in.table_number,
            capacity=obj_in.capacity,
            location=obj_in.location,
            status=TableStatus.AVAILABLE,
            is_active=True,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self, db: AsyncSession, db_obj: RestaurantTable, obj_in: TableUpdate
    ) -> RestaurantTable:
        """Update an existing table."""
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


table_crud = CRUDTable()
