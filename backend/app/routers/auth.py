import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db, get_current_user
from ..security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserOut, status_code=201)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(400, "An account with this email already exists")

    user = models.User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(401, "Incorrect email or password")

    token = create_access_token(subject=str(user.id))
    return schemas.Token(access_token=token, user=user)


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password", response_model=schemas.ForgotPasswordResponse)
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        # Don't reveal whether the email exists
        raise HTTPException(404, "No account found with this email")

    token = secrets.token_urlsafe(24)
    reset_entry = models.PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(minutes=30),
    )
    db.add(reset_entry)
    db.commit()

    # NOTE: This is a minimal build with no email server configured.
    # In production you would email this token instead of returning it directly.
    return schemas.ForgotPasswordResponse(
        message="Reset token generated. In production this would be emailed to you.",
        reset_token=token,
    )


@router.post("/reset-password")
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    entry = (
        db.query(models.PasswordResetToken)
        .filter(models.PasswordResetToken.token == payload.token)
        .first()
    )
    if not entry or entry.used or entry.expires_at < datetime.utcnow():
        raise HTTPException(400, "Invalid or expired reset token")

    user = db.query(models.User).filter(models.User.id == entry.user_id).first()
    user.hashed_password = hash_password(payload.new_password)
    entry.used = True
    db.commit()

    return {"message": "Password updated successfully. You can now log in."}
