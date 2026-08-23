import pytest
from httpx import AsyncClient

from app.core.security import create_access_token
from app.models.user import User


@pytest.mark.asyncio
async def test_create_and_list_tables(client: AsyncClient, test_user_admin: User):
    """Test admin table creation and public table listing."""
    token = create_access_token(test_user_admin.id, test_user_admin.role)

    # 1. Create table as ADMIN
    res = await client.post(
        "/api/v1/tables",
        json={
            "table_number": "T-10",
            "capacity": 4,
            "location": "MAIN_HALL",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 201
    table_data = res.json()
    assert table_data["table_number"] == "T-10"
    assert table_data["capacity"] == 4

    # 2. Publicly list tables
    list_res = await client.get("/api/v1/tables")
    assert list_res.status_code == 200
    tables = list_res.json()
    assert len(tables) >= 1
    assert tables[0]["table_number"] == "T-10"
