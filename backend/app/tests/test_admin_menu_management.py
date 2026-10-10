import uuid

import pytest
from httpx import AsyncClient

from app.core.security import create_access_token
from app.models.user import User


async def create_test_category_and_item(client: AsyncClient, admin_token: str) -> tuple[str, str]:
    """Helper to create a real category and menu item via API with Admin token."""
    cat_name = f"Grill {uuid.uuid4().hex[:6]}"
    cat_res = await client.post(
        "/api/v1/menu/categories",
        json={
            "name": cat_name,
            "slug": f"grill-{uuid.uuid4().hex[:6]}",
            "display_order": 1,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert cat_res.status_code == 201, cat_res.text
    cat_id = cat_res.json()["id"]

    item_res = await client.post(
        "/api/v1/menu/items",
        json={
            "category_id": cat_id,
            "name": "Halal A5 Japanese Wagyu Ribeye",
            "slug": f"wagyu-ribeye-{uuid.uuid4().hex[:6]}",
            "description": "A5 Miyazaki Wagyu with bone marrow jus",
            "price": "95.00",
            "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
            "is_available": True,
            "is_vegetarian": False,
            "is_gluten_free": True,
            "preparation_time_mins": 25,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert item_res.status_code == 201, item_res.text
    item_id = item_res.json()["id"]
    return cat_id, item_id


@pytest.mark.asyncio
async def test_admin_can_update_product_name(client: AsyncClient, test_user_admin: User):
    """1. ADMIN can update product name."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    new_name = "Royal Saffron Dry-Aged Ribeye (Master Reserve)"
    response = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"name": new_name},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["name"] == new_name
    assert "royal-saffron-dry-aged-ribeye-master-reserve" in data["slug"]


@pytest.mark.asyncio
async def test_admin_can_update_description(client: AsyncClient, test_user_admin: User):
    """2. ADMIN can update description."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    new_desc = "Slow-braised with organic herbs and served with silk parsnip puree."
    response = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"description": new_desc},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert response.json()["description"] == new_desc


@pytest.mark.asyncio
async def test_admin_can_update_price(client: AsyncClient, test_user_admin: User):
    """3. ADMIN can update price."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    new_price = "105.50"
    response = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"price": new_price},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert response.json()["price"] == "105.50"


@pytest.mark.asyncio
async def test_admin_can_update_category(client: AsyncClient, test_user_admin: User):
    """4. ADMIN can update category."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    cat2_res = await client.post(
        "/api/v1/menu/categories",
        json={
            "name": f"Seafood {uuid.uuid4().hex[:6]}",
            "slug": f"seafood-{uuid.uuid4().hex[:6]}",
            "display_order": 2,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert cat2_res.status_code == 201
    cat2_id = cat2_res.json()["id"]

    response = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"category_id": cat2_id},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["category_id"] == cat2_id


@pytest.mark.asyncio
async def test_customer_receives_403_on_update(
    client: AsyncClient, test_user_admin: User, test_user_customer: User
):
    """5. CUSTOMER receives 403 Forbidden."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    cust_token = create_access_token(test_user_customer.id, test_user_customer.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    response = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"price": "1.00"},
        headers={"Authorization": f"Bearer {cust_token}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_staff_receives_403_on_update(
    client: AsyncClient, test_user_admin: User, test_user_staff: User
):
    """6. STAFF receives 403 Forbidden."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    staff_token = create_access_token(test_user_staff.id, test_user_staff.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    response = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"price": "1.00"},
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_unauthenticated_receives_401(client: AsyncClient, test_user_admin: User):
    """7. Unauthenticated request receives 401 Unauthorized."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    response = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"price": "1.00"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_invalid_price_zero_rejected(client: AsyncClient, test_user_admin: User):
    """8. Price of zero is rejected by validation."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    response = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"price": "0.00"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_negative_price_rejected(client: AsyncClient, test_user_admin: User):
    """9. Negative price is rejected."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    response = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"price": "-25.00"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_invalid_category_rejected(client: AsyncClient, test_user_admin: User):
    """10. Nonexistent category UUID is rejected with HTTP 400."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    fake_cat_id = str(uuid.uuid4())
    response = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"category_id": fake_cat_id},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 400
    assert "does not exist" in response.json()["detail"]


@pytest.mark.asyncio
async def test_empty_or_whitespace_name_rejected(client: AsyncClient, test_user_admin: User):
    """11. Empty or whitespace-only product name is rejected."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    response_empty = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"name": ""},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response_empty.status_code == 422

    response_space = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"name": "     "},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response_space.status_code == 422


@pytest.mark.asyncio
async def test_excessively_long_description_rejected(client: AsyncClient, test_user_admin: User):
    """12. Excessively long description (>2000 chars) is rejected."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    long_desc = "A" * 2001
    response = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"description": long_desc},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_xss_input_handled_as_safe_plain_text(client: AsyncClient, test_user_admin: User):
    """13. XSS-looking input remains safe text."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    xss_payload = '<script>alert("XSS")</script>'
    response = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"description": xss_payload},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert response.json()["description"] == xss_payload


@pytest.mark.asyncio
async def test_sqli_metacharacters_handled_safely(client: AsyncClient, test_user_admin: User):
    """14. SQL-injection payload cannot manipulate SQL query."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    sqli_payload = "Wagyu Steak'; DROP TABLE menu_items; --"
    response = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"name": sqli_payload},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == sqli_payload

    # Verify table integrity via API
    get_res = await client.get(f"/api/v1/menu/items/{item_id}")
    assert get_res.status_code == 200


@pytest.mark.asyncio
async def test_immutable_product_id(client: AsyncClient, test_user_admin: User):
    """15. Product ID cannot be changed via update payload."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    fake_id = str(uuid.uuid4())
    response = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"id": fake_id, "name": "Valid Name"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_image_url_preserved_when_omitted(client: AsyncClient, test_user_admin: User):
    """16. Image URL is preserved when omitted from update payload."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    response = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"price": "77.00"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert (
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c" in response.json()["image_url"]
    )


@pytest.mark.asyncio
async def test_price_change_preserves_past_orders_and_updates_new_orders(
    client: AsyncClient,
    test_user_admin: User,
    test_user_customer: User,
):
    """17 & 18. Past order unit_price is locked; new orders use the updated price."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    cust_token = create_access_token(test_user_customer.id, test_user_customer.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    # 1. Customer orders the item at initial 95.00 EUR
    order_res = await client.post(
        "/api/v1/orders",
        json={
            "items": [{"menu_item_id": item_id, "quantity": 2}],
            "notes": "First order at initial price",
        },
        headers={"Authorization": f"Bearer {cust_token}"},
    )
    assert order_res.status_code == 201, order_res.text
    first_order_id = order_res.json()["id"]
    assert order_res.json()["total_amount"] == "190.00"

    # 2. Admin updates price to 110.00 EUR
    patch_res = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"price": "110.00"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["price"] == "110.00"

    # 3. Verify past order still locks 95.00 EUR
    past_order_res = await client.get(
        f"/api/v1/orders/{first_order_id}",
        headers={"Authorization": f"Bearer {cust_token}"},
    )
    assert past_order_res.status_code == 200
    assert past_order_res.json()["total_amount"] == "190.00"
    assert past_order_res.json()["items"][0]["unit_price"] == "95.00"

    # 4. Customer creates a NEW order -> must lock 110.00 EUR
    new_order_res = await client.post(
        "/api/v1/orders",
        json={
            "items": [{"menu_item_id": item_id, "quantity": 2}],
            "notes": "Second order at updated price",
        },
        headers={"Authorization": f"Bearer {cust_token}"},
    )
    assert new_order_res.status_code == 201
    assert new_order_res.json()["total_amount"] == "220.00"
    assert new_order_res.json()["items"][0]["unit_price"] == "110.00"


@pytest.mark.asyncio
async def test_audit_event_logged_on_menu_update(client: AsyncClient, test_user_admin: User):
    """19. Security audit event is created on product update."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    _, item_id = await create_test_category_and_item(client, admin_token)

    patch_res = await client.patch(
        f"/api/v1/menu/items/{item_id}",
        json={"price": "99.00"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert patch_res.status_code == 200

    # Retrieve history endpoint
    hist_res = await client.get(
        f"/api/v1/menu/items/{item_id}/history",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 1
    assert "99.00" in history[0]["details"] or "price" in history[0]["details"]
