import pytest
from httpx import AsyncClient

from app.core.security import create_access_token
from app.models.user import User


@pytest.mark.asyncio
async def test_security_status_endpoint(client: AsyncClient):
    """Test public/authenticated security posture status retrieval."""
    res = await client.get("/api/v1/security/status")
    assert res.status_code == 200
    data = res.json()
    assert "controls" in data
    assert data["total_evaluated_controls"] >= 8
    assert data["active_defensive_controls"] >= 8
    assert any(c["control_id"] == "CTRL-AUTH-02" for c in data["controls"])


@pytest.mark.asyncio
async def test_security_threat_matrix_and_architecture(client: AsyncClient):
    """Test threat matrix and multi-tier defense architecture."""
    matrix_res = await client.get("/api/v1/security/threat-matrix")
    assert matrix_res.status_code == 200
    threats = matrix_res.json()
    assert len(threats) >= 10
    assert any(t["id"] == "TV-01" for t in threats)
    assert any(t["name"] == "SQL Injection (SQLi)" for t in threats)

    arch_res = await client.get("/api/v1/security/architecture")
    assert arch_res.status_code == 200
    arch = arch_res.json()
    assert len(arch["layers"]) >= 4


@pytest.mark.asyncio
async def test_security_test_suite_execution(
    client: AsyncClient, test_user_admin: User, test_user_customer: User
):
    """Test defensive security lab test execution under RBAC."""
    admin_token = create_access_token(test_user_admin.id, test_user_admin.role)
    cust_token = create_access_token(test_user_customer.id, test_user_customer.role)

    # 1. Customer cannot run security tests (403 Forbidden)
    cust_res = await client.post(
        "/api/v1/security/tests/run",
        headers={"Authorization": f"Bearer {cust_token}"},
    )
    assert cust_res.status_code == 403

    # 2. Admin executes test suite
    admin_res = await client.post(
        "/api/v1/security/tests/run",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_res.status_code == 200
    suite_data = admin_res.json()
    assert suite_data["total_tests"] >= 8
    assert suite_data["passed_tests"] == suite_data["total_tests"]
    assert suite_data["failed_tests"] == 0

    # 3. Verify security event was recorded in audit trail
    events_res = await client.get(
        "/api/v1/security/events",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert events_res.status_code == 200
    events_data = events_res.json()
    assert events_data["total"] >= 1
    assert any(e["event_type"] == "SECURITY_TEST_RUN" for e in events_data["items"])


@pytest.mark.asyncio
async def test_brute_force_lockout_direct_api(client: AsyncClient):
    """Test server-authoritative lockout on repeated failed login attempts."""
    test_email = "bruteforce_target@savorybyte.com"
    wrong_pwd = "WrongPassword123!"

    # Fire 5 failed attempts
    for _ in range(5):
        r = await client.post(
            "/api/v1/auth/login",
            data={"username": test_email, "password": wrong_pwd},
        )
        assert r.status_code in [401, 429]

    # 6th attempt MUST be blocked by lockout with 429 and Retry-After
    lockout_res = await client.post(
        "/api/v1/auth/login",
        data={"username": test_email, "password": wrong_pwd},
    )
    assert lockout_res.status_code == 429
    assert "Retry-After" in lockout_res.headers
    assert "temporarily locked" in lockout_res.json()["detail"]


@pytest.mark.asyncio
async def test_security_headers_middleware(client: AsyncClient):
    """Test standard AppSec security headers on API responses."""
    res = await client.get("/health")
    assert res.status_code == 200
    assert "X-Request-ID" in res.headers
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert "Content-Security-Policy" in res.headers
