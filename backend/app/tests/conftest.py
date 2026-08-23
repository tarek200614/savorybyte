import asyncio
from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base, get_db
from app.core.security import get_password_hash
from app.main import app
from app.models.user import User, UserRole

# Use SQLite in-memory database for fast, isolated unit tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine_test = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(
    bind=engine_test, class_=AsyncSession, expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
async def prepare_database():
    """Create fresh tables for every test module and drop them afterwards."""
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


@pytest.fixture
async def test_user_customer(prepare_database) -> User:
    async with TestingSessionLocal() as db:
        user = User(
            email="customer@example.com",
            password_hash=get_password_hash("password123"),
            full_name="Alice Customer",
            phone="+1234567890",
            role=UserRole.CUSTOMER,
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user


@pytest.fixture
async def test_user_admin(prepare_database) -> User:
    async with TestingSessionLocal() as db:
        user = User(
            email="admin@example.com",
            password_hash=get_password_hash("adminpassword123"),
            full_name="Bob Admin",
            phone="+1987654321",
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
