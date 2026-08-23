from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_role
from app.crud.crud_analytics import analytics_crud
from app.models.user import UserRole

router = APIRouter(prefix="/admin", tags=["Executive Admin"])


@router.get(
    "/analytics/dashboard",
    response_model=dict[str, Any],
    dependencies=[Depends(require_role([UserRole.ADMIN]))],
)
async def get_admin_dashboard_metrics(db: AsyncSession = Depends(get_db)):
    """
    Fetch executive SaaS dashboard overview (Revenue, Occupancy, User metrics).
    Protected: ADMIN only.
    """
    return await analytics_crud.get_dashboard_summary(db)
