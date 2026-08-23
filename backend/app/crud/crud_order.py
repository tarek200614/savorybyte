import uuid
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.menu import MenuItem
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.order import OrderCreate, OrderUpdate


class CRUDOrder:
    async def generate_order_number(self, db: AsyncSession) -> str:
        """Generate a readable order number (e.g. ORD-YYYYMMDD-XXXX)."""
        now = datetime.now(UTC)
        date_str = now.strftime("%Y%m%d")
        stmt = select(Order).where(Order.order_number.like(f"ORD-{date_str}-%"))
        result = await db.execute(stmt)
        count = len(result.scalars().all()) + 1
        return f"ORD-{date_str}-{count:04d}"

    async def get_by_id(self, db: AsyncSession, order_id: uuid.UUID) -> Order | None:
        stmt = (
            select(Order)
            .options(
                selectinload(Order.items)
                .selectinload(OrderItem.menu_item)
                .selectinload(MenuItem.category),
                selectinload(Order.customer),
                selectinload(Order.table),
            )
            .where(Order.id == order_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_multi(
        self,
        db: AsyncSession,
        status: OrderStatus | None = None,
        customer_id: uuid.UUID | None = None,
        table_id: uuid.UUID | None = None,
    ) -> list[Order]:
        stmt = select(Order).options(
            selectinload(Order.items)
            .selectinload(OrderItem.menu_item)
            .selectinload(MenuItem.category),
            selectinload(Order.table),
        )
        if status:
            stmt = stmt.where(Order.status == status)
        if customer_id:
            stmt = stmt.where(Order.customer_id == customer_id)
        if table_id:
            stmt = stmt.where(Order.table_id == table_id)

        stmt = stmt.order_by(Order.created_at.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create(
        self,
        db: AsyncSession,
        customer_id: uuid.UUID | None,
        obj_in: OrderCreate,
    ) -> Order:
        order_number = await self.generate_order_number(db)
        total_amount = Decimal("0.00")
        order_items_to_add: list[OrderItem] = []

        # Process each item in order
        for item_in in obj_in.items:
            stmt = select(MenuItem).where(MenuItem.id == item_in.menu_item_id)
            res = await db.execute(stmt)
            menu_item = res.scalar_one_or_none()
            if not menu_item or not menu_item.is_available:
                raise ValueError(
                    f"Menu item {item_in.menu_item_id} is unavailable or does not exist."
                )

            subtotal = menu_item.price * item_in.quantity
            total_amount += subtotal

            order_items_to_add.append(
                OrderItem(
                    menu_item_id=menu_item.id,
                    quantity=item_in.quantity,
                    unit_price=menu_item.price,
                    subtotal=subtotal,
                    item_notes=item_in.item_notes,
                )
            )

        db_order = Order(
            customer_id=customer_id,
            table_id=obj_in.table_id,
            reservation_id=obj_in.reservation_id,
            order_number=order_number,
            status=OrderStatus.PENDING,
            total_amount=total_amount,
            notes=obj_in.notes,
            items=order_items_to_add,
        )
        db.add(db_order)
        await db.commit()

        # Re-query eagerly with relationships
        return await self.get_by_id(db, db_order.id)  # type: ignore

    async def update(self, db: AsyncSession, db_obj: Order, obj_in: OrderUpdate) -> Order:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        await db.commit()
        return await self.get_by_id(db, db_obj.id)  # type: ignore


order_crud = CRUDOrder()
