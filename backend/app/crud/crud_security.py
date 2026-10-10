import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from sqlalchemy import desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.security import SecurityEvent, SecurityEventType, SecuritySeverity
from app.schemas.security import SecurityEventCreate


class CRUDSecurity:
    async def log_event(
        self,
        db: AsyncSession,
        event_in: SecurityEventCreate,
    ) -> SecurityEvent:
        """
        Record a security event into the audit trail.
        """
        db_obj = SecurityEvent(
            event_type=event_in.event_type,
            severity=event_in.severity,
            actor_id=event_in.actor_id,
            actor_email=event_in.actor_email,
            actor_ip=event_in.actor_ip,
            target_type=event_in.target_type,
            target_id=event_in.target_id,
            request_id=event_in.request_id,
            details=event_in.details,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_multi(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 50,
        severity: SecuritySeverity | None = None,
        event_type: SecurityEventType | None = None,
        search: str | None = None,
        actor_id: uuid.UUID | None = None,
        target_type: str | None = None,
        target_id: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> tuple[list[SecurityEvent], int]:
        """
        Query security events with filtering, search, and pagination.
        """
        stmt = select(SecurityEvent).options(selectinload(SecurityEvent.actor))
        count_stmt = select(func.count(SecurityEvent.id))

        if severity:
            stmt = stmt.where(SecurityEvent.severity == severity)
            count_stmt = count_stmt.where(SecurityEvent.severity == severity)

        if event_type:
            stmt = stmt.where(SecurityEvent.event_type == event_type)
            count_stmt = count_stmt.where(SecurityEvent.event_type == event_type)

        if actor_id:
            stmt = stmt.where(SecurityEvent.actor_id == actor_id)
            count_stmt = count_stmt.where(SecurityEvent.actor_id == actor_id)

        if target_type:
            stmt = stmt.where(SecurityEvent.target_type == target_type)
            count_stmt = count_stmt.where(SecurityEvent.target_type == target_type)

        if target_id:
            stmt = stmt.where(SecurityEvent.target_id == target_id)
            count_stmt = count_stmt.where(SecurityEvent.target_id == target_id)

        if start_date:
            stmt = stmt.where(SecurityEvent.created_at >= start_date)
            count_stmt = count_stmt.where(SecurityEvent.created_at >= start_date)

        if end_date:
            stmt = stmt.where(SecurityEvent.created_at <= end_date)
            count_stmt = count_stmt.where(SecurityEvent.created_at <= end_date)

        if search:
            search_pattern = f"%{search.strip().lower()}%"
            filter_expr = or_(
                func.lower(SecurityEvent.actor_email).like(search_pattern),
                func.lower(SecurityEvent.actor_ip).like(search_pattern),
                func.lower(SecurityEvent.details).like(search_pattern),
                func.lower(SecurityEvent.target_type).like(search_pattern),
                func.lower(SecurityEvent.target_id).like(search_pattern),
                func.lower(SecurityEvent.request_id).like(search_pattern),
            )
            stmt = stmt.where(filter_expr)
            count_stmt = count_stmt.where(filter_expr)

        total_res = await db.execute(count_stmt)
        total = total_res.scalar() or 0

        stmt = stmt.order_by(desc(SecurityEvent.created_at)).offset(skip).limit(limit)
        items_res = await db.execute(stmt)
        items = list(items_res.scalars().all())

        return items, total

    async def get_summary_stats(self, db: AsyncSession) -> dict[str, Any]:
        """
        Aggregate real security event statistics from PostgreSQL.
        """
        now = datetime.now(UTC)
        day_ago = now - timedelta(hours=24)

        # Total events
        total_res = await db.execute(select(func.count(SecurityEvent.id)))
        total_events = total_res.scalar() or 0

        # Last 24h events
        day_res = await db.execute(
            select(func.count(SecurityEvent.id)).where(SecurityEvent.created_at >= day_ago)
        )
        events_last_24h = day_res.scalar() or 0

        # High / Critical count
        high_crit_res = await db.execute(
            select(func.count(SecurityEvent.id)).where(
                SecurityEvent.severity.in_([SecuritySeverity.HIGH, SecuritySeverity.CRITICAL])
            )
        )
        high_critical_count = high_crit_res.scalar() or 0

        # Breakdown by severity
        sev_stmt = select(SecurityEvent.severity, func.count(SecurityEvent.id)).group_by(
            SecurityEvent.severity
        )
        sev_res = await db.execute(sev_stmt)
        by_severity = {str(row[0].value): int(row[1]) for row in sev_res.all()}

        # Breakdown by event type
        type_stmt = select(SecurityEvent.event_type, func.count(SecurityEvent.id)).group_by(
            SecurityEvent.event_type
        )
        type_res = await db.execute(type_stmt)
        by_type = {str(row[0].value): int(row[1]) for row in type_res.all()}

        return {
            "total_events": total_events,
            "events_last_24h": events_last_24h,
            "high_critical_count": high_critical_count,
            "active_lockouts_count": 0,  # supplemented by in-memory brute force engine
            "by_severity": by_severity,
            "by_type": by_type,
            "recent_activity_trend": [],
        }


security_crud = CRUDSecurity()
