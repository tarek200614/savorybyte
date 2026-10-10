import pytest
from httpx import AsyncClient

from app.core.security import create_access_token
from app.models.user import User


@pytest.mark.asyncio
async def test_all_menu_items_have_unique_valid_images(client: AsyncClient, test_user_admin: User):
    """
    Regression Test: Ensures that every menu item in the database
    has a non-null, valid, unique food/drink photograph.
    """
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)

    # 1. Create a category
    cat_res = await client.post(
        "/api/v1/menu/categories",
        json={"name": "Artisanal Mezze", "slug": "starters", "display_order": 1},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert cat_res.status_code == 201
    cat_id = cat_res.json()["id"]

    # 2. Create dishes with distinct image URLs
    dish1_res = await client.post(
        "/api/v1/menu/items",
        json={
            "category_id": cat_id,
            "name": "Truffle Burrata Pugliese",
            "slug": "truffle-burrata",
            "price": "24.00",
            "image_url": "https://images.unsplash.com/photo-1592417817098-8f3d691068a8?auto=format&fit=crop&w=800&q=80",
            "is_vegetarian": True,
            "is_gluten_free": False,
            "preparation_time_mins": 10,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert dish1_res.status_code == 201

    dish2_res = await client.post(
        "/api/v1/menu/items",
        json={
            "category_id": cat_id,
            "name": "Halal Yellowtail Hamachi Crudo",
            "slug": "hamachi-crudo",
            "price": "28.00",
            "image_url": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
            "is_vegetarian": False,
            "is_gluten_free": True,
            "preparation_time_mins": 12,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert dish2_res.status_code == 201

    # 3. Fetch public menu items
    response = await client.get("/api/v1/menu/items")
    assert response.status_code == 200
    items = response.json()

    assert len(items) >= 2

    image_urls = []
    for item in items:
        name = item["name"]
        image_url = item.get("image_url")

        assert image_url is not None, f"Dish '{name}' has a NULL image_url"
        assert len(image_url.strip()) > 0, f"Dish '{name}' has an empty image_url string"
        assert image_url.startswith(
            "https://images.unsplash.com/"
        ), f"Dish '{name}' has invalid image URL: {image_url}"
        assert item.get("category") is not None, f"Dish '{name}' has no category assigned"

        image_urls.append(image_url)

    # 4. Verify uniqueness
    unique_urls = set(image_urls)
    assert len(unique_urls) == len(
        items
    ), f"Found duplicate images across menu items! {len(unique_urls)} unique images for {len(items)} items."
