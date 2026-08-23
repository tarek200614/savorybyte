import uuid
from datetime import date, time

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.reservation import Reservation, ReservationStatus
from app.schemas.reservation import ReservationCreate, ReservationUpdate


class CRUDReservation:
    async def check_overlap(
        self,
        db: AsyncSession,
        table_id: uuid.UUID,
        reservation_date: date,
        start_time: time,
        end_time: time,
        exclude_reservation_id: uuid.UUID | None = None,
    ) -> bool:
        """
        Overlap Prevention Algorithm:
        Returns True if an active reservation exists for target table on target date
        where interval (start_time, end_time) overlaps with existing reservation interval.
        Interval overlap condition: A_start < B_end AND A_end > B_start.
        """
        stmt = select(Reservation).where(
            and_(
                Reservation.table_id == table_id,
                Reservation.reservation_date == reservation_date,
                Reservation.status.notin_([ReservationStatus.CANCELLED, ReservationStatus.NO_SHOW]),
                Reservation.start_time < end_time,
                Reservation.end_time > start_time,
            )
        )

        if exclude_reservation_id:
            stmt = stmt.where(Reservation.id != exclude_reservation_id)

        result = await db.execute(stmt)
        existing = result.scalars().first()
        return existing is not None

    async def get_by_id(self, db: AsyncSession, reservation_id: uuid.UUID) -> Reservation | None:
        """Fetch reservation by ID with eagerly loaded relationships."""
        stmt = (
            select(Reservation)
            .options(selectinload(Reservation.customer), selectinload(Reservation.table))
            .where(Reservation.id == reservation_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_customer(self, db: AsyncSession, customer_id: uuid.UUID) -> list[Reservation]:
        """Fetch all reservations for a customer."""
        stmt = (
            select(Reservation)
            .options(selectinload(Reservation.table))
            .where(Reservation.customer_id == customer_id)
            .order_by(Reservation.reservation_date.desc(), Reservation.start_time.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_multi(
        self,
        db: AsyncSession,
        target_date: date | None = None,
        status: ReservationStatus | None = None,
        table_id: uuid.UUID | None = None,
    ) -> list[Reservation]:
        """List reservations for staff/admin with optional filters."""
        stmt = select(Reservation).options(
            selectinload(Reservation.customer), selectinload(Reservation.table)
        )

        if target_date:
            stmt = stmt.where(Reservation.reservation_date == target_date)
        if status:
            stmt = stmt.where(Reservation.status == status)
        if table_id:
            stmt = stmt.where(Reservation.table_id == table_id)

        stmt = stmt.order_by(Reservation.reservation_date.desc(), Reservation.start_time.asc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create(
        self, db: AsyncSession, customer_id: uuid.UUID, obj_in: ReservationCreate
    ) -> Reservation:
        """Create a new reservation."""
        db_obj = Reservation(
            customer_id=customer_id,
            table_id=obj_in.table_id,
            reservation_date=obj_in.reservation_date,
            start_time=obj_in.start_time,
            end_time=obj_in.end_time,
            party_size=obj_in.party_size,
            status=ReservationStatus.PENDING,
            special_requests=obj_in.special_requests,
        )
        db.add(db_obj)
        await db.commit()
        return await self.get_by_id(db, db_obj.id)  # type: ignore

    async def update(
        self, db: AsyncSession, db_obj: Reservation, obj_in: ReservationUpdate
    ) -> Reservation:
        """Update reservation details or status."""
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        await db.commit()
        return await self.get_by_id(db, db_obj.id)  # type: ignore


reservation_crud = CRUDReservation()
