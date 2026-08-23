import pytest
from httpx import AsyncClient

from app.core.security import create_access_token
from app.models.user import User


@pytest.mark.asyncio
async def test_menu_and_order_flow(
    client: AsyncClient, test_user_customer: User, test_user_admin: User
):
    """Test full menu browsing, order placement, total calculation, and kitchen queue."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    customer_token = create_access_token(test_user_customer.id, test_user_customer.role)

    # 1. Create Category as ADMIN
    cat_res = await client.post(
        "/api/v1/menu/categories",
        json={"name": "Starters", "slug": "starters", "display_order": 1},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert cat_res.status_code == 201
    cat_id = cat_res.json()["id"]

    # 2. Create Menu Item as ADMIN (Truffle Pasta @ $25.50)
    item_res = await client.post(
        "/api/v1/menu/items",
        json={
            "category_id": cat_id,
            "name": "Truffle Pasta",
            "slug": "truffle-pasta",
            "price": "25.50",
            "is_vegetarian": True,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert item_res.status_code == 201
    item_id = item_res.json()["id"]

    # 3. Customer places an order (2x Truffle Pasta = $51.00)
    order_res = await client.post(
        "/api/v1/orders",
        json={
            "items": [{"menu_item_id": item_id, "quantity": 2}],
            "notes": "Extra parmesan please",
        },
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert order_res.status_code == 201
    order_data = order_res.json()
    assert order_data["total_amount"] == "51.00"
    assert order_data["status"] == "PENDING"
    assert len(order_data["items"]) == 1

    # 4. Admin/Staff views live kitchen order queue
    live_res = await client.get(
        "/api/v1/orders/live",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert live_res.status_code == 200
    live_orders = live_res.json()
    assert len(live_orders) >= 1
    assert live_orders[0]["order_number"] == order_data["order_number"]
