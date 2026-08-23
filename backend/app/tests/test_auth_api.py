import pytest
from httpx import AsyncClient

from app.models.user import User


@pytest.mark.asyncio
async def test_register_user_success(client: AsyncClient):
    """Test user registration endpoint with valid parameters."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "Password123!",
            "full_name": "John Doe",
            "phone": "+19998887777",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["role"] == "CUSTOMER"
    assert "id" in data
    assert "password_hash" not in data


@pytest.mark.asyncio
async def test_register_user_duplicate_email(client: AsyncClient, test_user_customer: User):
    """Test that registering with an existing email returns 400 Bad Request."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": test_user_customer.email,
            "password": "NewPassword123!",
            "full_name": "Duplicate User",
        },
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_user_customer: User):
    """Test user login returning JWT bearer token."""
    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user_customer.email,
            "password": "password123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == test_user_customer.email


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient, test_user_customer: User):
    """Test login with incorrect password returns 401 Unauthorized."""
    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user_customer.email,
            "password": "WrongPassword123!",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_authenticated(client: AsyncClient, test_user_customer: User):
    """Test fetching /me profile with valid JWT Bearer header."""
    login_res = await client.post(
        "/api/v1/auth/login",
        data={"username": test_user_customer.email, "password": "password123"},
    )
    token = login_res.json()["access_token"]

    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user_customer.email
    assert data["full_name"] == test_user_customer.full_name


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client: AsyncClient):
    """Test fetching /me without Authorization header returns 401 Unauthorized."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401
