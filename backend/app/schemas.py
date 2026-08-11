from datetime import datetime
from typing import List
from uuid import UUID
from pydantic import BaseModel, EmailStr


# ---- Auth ----
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str


class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: str  # returned directly since there's no email server in this minimal build


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ---- Analysis ----
class AnalysisOut(BaseModel):
    id: UUID
    ats_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    suggestions: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryItem(BaseModel):
    id: UUID
    resume_filename: str
    ats_score: float
    created_at: datetime

    class Config:
        from_attributes = True


class StatsOut(BaseModel):
    total_analyses: int
    average_score: float
