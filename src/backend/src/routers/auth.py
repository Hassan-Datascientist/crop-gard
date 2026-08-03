import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..deps import get_current_user
from ..models import User
from ..schemas import (
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UpdateProfileRequest,
    UserOut,
)
from ..security import (
    create_access_token,
    generate_salt,
    hash_password,
    verify_password,
)
from ..storage import public_url, store_image

router = APIRouter(prefix="/api/auth", tags=["auth"])

_UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_CREDENTIALS"
)


def _user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        uuid=user.uuid,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        language_pref=user.language_pref,
        avatar_key=user.avatar_key,
        avatar_url=public_url(user.avatar_key) if user.avatar_key else None,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


def _token_for(user: User) -> TokenResponse:
    return TokenResponse(token=create_access_token(user.id), user=_user_out(user))


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    email = payload.email.lower().strip()

    existing = await db.scalar(select(User).where(User.email == email))
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="EMAIL_IN_USE")

    salt = generate_salt()
    user = User(
        uuid=str(uuid.uuid4()),
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        email=email,
        password_hash=hash_password(payload.password, salt),
        salt=salt,
        language_pref=payload.language_pref,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return _token_for(user)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    email = payload.email.lower().strip()
    user = await db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(payload.password, user.salt, user.password_hash):
        raise _UNAUTHORIZED
    return _token_for(user)


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return _user_out(user)


@router.patch("/me", response_model=UserOut)
async def update_me(
    payload: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump(exclude_unset=True)
    if "email" in data and data["email"] is not None:
        email = data["email"].lower().strip()
        clash = await db.scalar(select(User).where(User.email == email, User.id != user.id))
        if clash is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="EMAIL_IN_USE")
        user.email = email

    for field in ("first_name", "last_name", "language_pref"):
        value = data.get(field)
        if value is not None:
            setattr(user, field, value)

    user.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)
    return _user_out(user)


@router.post("/avatar", response_model=UserOut)
async def upload_avatar(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file")

    avatar_key, _ = await store_image(content)
    user.avatar_key = avatar_key
    user.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)
    return _user_out(user)


@router.delete("/avatar", response_model=UserOut)
async def remove_avatar(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user.avatar_key = None
    user.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)
    return _user_out(user)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    payload: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(payload.current_password, user.salt, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="WRONG_PASSWORD")

    user.salt = generate_salt()
    user.password_hash = hash_password(payload.new_password, user.salt)
    user.updated_at = datetime.now(timezone.utc)
    await db.commit()
