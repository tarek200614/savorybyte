import pytest

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.user import UserRole


def test_password_hashing_and_verification():
    """Verify that bcrypt password hashing and comparison work accurately."""
    raw_password = "SecretPassword123!"
    hashed = get_password_hash(raw_password)

    assert hashed != raw_password
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_access_token_creation_and_decoding():
    """Verify JWT access token generation and claims payload structure."""
    user_id = "123e4567-e89b-12d3-a456-426614174000"
    role = UserRole.ADMIN

    token = create_access_token(subject=user_id, role=role)
    payload = decode_token(token)

    assert payload.sub == user_id
    assert payload.role == role.value
    assert payload.type == "access"


def test_jwt_refresh_token_creation_and_decoding():
    """Verify JWT refresh token generation."""
    user_id = "123e4567-e89b-12d3-a456-426614174000"
    role = UserRole.CUSTOMER

    token = create_refresh_token(subject=user_id, role=role)
    payload = decode_token(token)

    assert payload.sub == user_id
    assert payload.role == role.value
    assert payload.type == "refresh"


def test_invalid_jwt_token_decoding():
    """Verify that decoding an invalid/tampered token raises ValueError."""
    invalid_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.payload"
    with pytest.raises(ValueError, match="Invalid token"):
        decode_token(invalid_token)
