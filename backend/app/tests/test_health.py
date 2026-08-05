import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_health_check_endpoint():
    """
    Verify that the /health endpoint returns 200 OK and expected status keys.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "project" in data
        assert "environment" in data


@pytest.mark.asyncio
async def test_root_api_v1_endpoint():
    """
    Verify that the /api/v1 root endpoint responds successfully.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1")
        assert response.status_code == 200
        data = response.json()
        assert "Welcome" in data["message"]
