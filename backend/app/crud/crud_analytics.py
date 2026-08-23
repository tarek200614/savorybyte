from datetime import date
from decimal import Decimal
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, OrderStatus
from app.models.reservation import Reservation, ReservationStatus
from app.models.table import RestaurantTable
from app.models.user import User


class CRUDAnalytics:
    async def get_dashboard_summary(self, db: AsyncSession) -> dict[str, Any]:
        """Aggregate total revenue, active reservations, total tables, and user counts."""
        # 1. Total Paid Revenue
        rev_stmt = select(func.coalesce(func.sum(Order.total_amount), 0)).where(
            Order.status == OrderStatus.PAID
        )
        rev_res = await db.execute(rev_stmt)
        total_revenue = Decimal(str(rev_res.scalar_one()))

        # 2. Total Reservations Today
        today = date.today()
        res_stmt = select(func.count(Reservation.id)).where(
            Reservation.reservation_date == today,
            Reservation.status.notin_([ReservationStatus.CANCELLED, ReservationStatus.NO_SHOW]),
        )
        res_count = (await db.execute(res_stmt)).scalar_one()

        # 3. Total Active Tables
        table_stmt = select(func.count(RestaurantTable.id)).where(RestaurantTable.is_active)
        table_count = (await db.execute(table_stmt)).scalar_one()

        # 4. Total Registered Customers
        user_stmt = select(func.count(User.id))
        user_count = (await db.execute(user_stmt)).scalar_one()

        return {
            "total_revenue": total_revenue,
            "reservations_today": res_count,
            "total_tables": table_count,
            "total_users": user_count,
        }


analytics_crud = CRUDAnalytics()
