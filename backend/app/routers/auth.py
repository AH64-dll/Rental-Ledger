from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import issue_token, verify_password, current_user
from app.db import get_db
from app.models import User
from app.schemas.auth import LoginRequest, LoginResponse, ProfileUpdate

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    user = db.execute(
        select(User).where(User.username == body.username)
    ).scalar_one_or_none()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    token = issue_token(user.username)
    return LoginResponse(access_token=token)


@router.put("/profile", response_model=LoginResponse)
def update_profile(
    body: ProfileUpdate,
    db: Session = Depends(get_db),
    username: str = Depends(current_user),
) -> LoginResponse:
    user = db.execute(
        select(User).where(User.username == username)
    ).scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if not verify_password(body.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password",
        )

    if body.new_username:
        existing = db.execute(
            select(User).where(User.username == body.new_username)
        ).scalar_one_or_none()
        if existing and existing.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )
        user.username = body.new_username

    if body.new_password:
        from app.auth import hash_password
        user.password_hash = hash_password(body.new_password)

    db.commit()
    db.refresh(user)

    token = issue_token(user.username)
    return LoginResponse(access_token=token)
