from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import UserRegister, UserLogin, UserOut, Token
from ..auth.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from ..auth.dependencies import require_admin


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED
)
def register(
    data: UserRegister,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role="user"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# =========================================================
# LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=Token
)
def login(
    data: UserLogin,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(
        data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


# =========================================================
# GET ALL USERS - ADMIN ONLY
# =========================================================

@router.get(
    "/users",
    response_model=list[UserOut]
)
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    users = (
        db.query(User)
        .order_by(User.id.desc())
        .all()
    )

    return users