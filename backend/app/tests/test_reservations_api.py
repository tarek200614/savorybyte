from datetime import date

import pytest
from httpx import AsyncClient

from app.core.security import create_access_token
from app.models.user import User


@pytest.mark.asyncio
async def test_reservation_creation_and_overlap_prevention(
    client: AsyncClient, test_user_customer: User, test_user_admin: User
):
    """
    Test reservation booking flow and verify Overlap Prevention Algorithm (HTTP 409 Conflict).
    """
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    customer_token = create_access_token(test_user_customer.id, test_user_customer.role)

    # 1. Create a table (capacity 4)
    table_res = await client.post(
        "/api/v1/tables",
        json={"table_number": "T-VIP-1", "capacity": 4, "location": "PRIVATE_ROOM"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    table_id = table_res.json()["id"]

    booking_payload = {
        "table_id": table_id,
        "reservation_date": str(date.today()),
        "start_time": "19:00:00",
        "end_time": "20:30:00",
        "party_size": 2,
        "special_requests": "Window view please",
    }

    # 2. First booking should succeed (HTTP 201 Created)
    first_res = await client.post(
        "/api/v1/reservations",
        json=booking_payload,
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert first_res.status_code == 201
    assert first_res.json()["status"] == "PENDING"

    # 3. Second overlapping booking attempt for SAME table & time MUST fail with HTTP 409 Conflict!
    overlapping_payload = {
        "table_id": table_id,
        "reservation_date": str(date.today()),
        "start_time": "19:30:00",  # Overlaps 19:00 - 20:30 interval!
        "end_time": "21:00:00",
        "party_size": 4,
    }

    second_res = await client.post(
        "/api/v1/reservations",
        json=overlapping_payload,
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert second_res.status_code == 409
    assert "already reserved" in second_res.json()["detail"]
