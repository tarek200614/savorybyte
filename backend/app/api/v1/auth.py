from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.brute_force import brute_force_protector
from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.rate_limiter import rate_limiter
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.crud.crud_security import security_crud
from app.models.security import SecurityEventType, SecuritySeverity
from app.models.user import User, UserRole
from app.schemas.security import SecurityEventCreate
from app.schemas.user import Token, UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(
    request: Request,
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new customer account.
    Protected by rate limiting.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    request_id = getattr(request.state, "request_id", None)

    # 1. Rate Limiting check
    is_limited, retry_after = rate_limiter.is_rate_limited(
        f"register:{client_ip}", max_requests=10, window_seconds=60
    )
    if is_limited:
        await security_crud.log_event(
            db,
            SecurityEventCreate(
                event_type=SecurityEventType.RATE_LIMIT_TRIGGERED,
                severity=SecuritySeverity.WARNING,
                actor_email=user_in.email.lower(),
                actor_ip=client_ip,
                request_id=request_id,
                details=f"Rate limit exceeded on /auth/register from IP {client_ip}.",
            ),
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many registration requests. Please try again later.",
            headers={"Retry-After": str(retry_after)},
        )

    stmt = select(User).where(User.email == user_in.email.lower())
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    db_user = User(
        email=user_in.email.lower(),
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=UserRole.CUSTOMER,
        is_active=True,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    await security_crud.log_event(
        db,
        SecurityEventCreate(
            event_type=SecurityEventType.LOGIN_SUCCESS,
            severity=SecuritySeverity.INFO,
            actor_id=db_user.id,
            actor_email=db_user.email,
            actor_ip=client_ip,
            request_id=request_id,
            details=f"New customer account created: {db_user.email}",
        ),
    )

    return db_user


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """
    OAuth2 compatible token login. Accepts username (email) & password.
    Enforces server-side brute force detection, account lockout, and event logging.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    request_id = getattr(request.state, "request_id", None)
    username_clean = form_data.username.strip().lower()

    # 1. Check Server-Authoritative Brute Force Lockout
    lockout = brute_force_protector.check_lockout(username_clean, client_ip)
    if lockout.is_locked:
        await security_crud.log_event(
            db,
            SecurityEventCreate(
                event_type=SecurityEventType.ACCOUNT_LOCKED,
                severity=SecuritySeverity.HIGH,
                actor_email=username_clean,
                actor_ip=client_ip,
                request_id=request_id,
                details=f"Authentication blocked due to active lockout ({lockout.remaining_seconds}s remaining).",
            ),
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account temporarily locked due to repeated failed login attempts. Retry in {lockout.remaining_seconds} seconds.",
            headers={"Retry-After": str(lockout.remaining_seconds)},
        )

    stmt = select(User).where(User.email == username_clean)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.password_hash):
        # Record Failure in Brute Force Protector
        lockout_info = brute_force_protector.record_failure(username_clean, client_ip)

        event_type = (
            SecurityEventType.ACCOUNT_LOCKED
            if lockout_info.is_locked
            else SecurityEventType.LOGIN_FAILURE
        )
        severity = SecuritySeverity.HIGH if lockout_info.is_locked else SecuritySeverity.WARNING

        await security_crud.log_event(
            db,
            SecurityEventCreate(
                event_type=event_type,
                severity=severity,
                actor_id=user.id if user else None,
                actor_email=username_clean,
                actor_ip=client_ip,
                request_id=request_id,
                details=f"Failed login attempt ({lockout_info.attempts}/{lockout_info.max_attempts}). Lockout: {lockout_info.is_locked}.",
            ),
        )

        if lockout_info.is_locked:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many failed login attempts. Account temporarily locked for {lockout_info.remaining_seconds} seconds.",
                headers={"Retry-After": str(lockout_info.remaining_seconds)},
            )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account")

    # Clear brute-force failure tracking upon success
    brute_force_protector.record_success(username_clean, client_ip)

    # Log successful login event
    await security_crud.log_event(
        db,
        SecurityEventCreate(
            event_type=SecurityEventType.LOGIN_SUCCESS,
            severity=SecuritySeverity.INFO,
            actor_id=user.id,
            actor_email=user.email,
            actor_ip=client_ip,
            request_id=request_id,
            details=f"Successful authentication for {user.role.value} account: {user.email}",
        ),
    )

    access_token = create_access_token(subject=user.id, role=user.role)
    refresh_token = create_refresh_token(subject=user.id, role=user.role)

    # Set HttpOnly refresh token cookie for security
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        samesite="lax",
        secure=settings.ENVIRONMENT == "production",
    )

    return Token(access_token=access_token, token_type="bearer", user=user)


@router.post("/refresh", response_model=Token)
async def refresh_token(
    response: Response,
    refresh_token: str | None = Cookie(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Obtain a new access token using the HttpOnly refresh token cookie.
    """
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token cookie missing",
        )

    try:
        payload = decode_token(refresh_token)
        if payload.sub is None or payload.type != "refresh":
            raise ValueError()
        user_id = payload.sub
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        ) from err

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    new_access_token = create_access_token(subject=user.id, role=user.role)
    new_refresh_token = create_refresh_token(subject=user.id, role=user.role)

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        samesite="lax",
        secure=settings.ENVIRONMENT == "production",
    )

    return Token(access_token=new_access_token, token_type="bearer", user=user)


@router.get("/me", response_model=UserOut)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Fetch profile details of the currently authenticated user.
    """
    return current_user
