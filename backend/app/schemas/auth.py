from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=1, max_length=256)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProfileUpdate(BaseModel):
    new_username: str | None = Field(default=None, min_length=1, max_length=64)
    new_password: str | None = Field(default=None, min_length=1, max_length=256)
    current_password: str = Field(..., min_length=1, max_length=256)
