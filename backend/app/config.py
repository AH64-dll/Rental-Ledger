from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./dev.db"
    jwt_secret: str = ""
    jwt_algo: str = "HS256"
    jwt_exp_minutes: int = 60 * 24
    currency: str = "EGP"
    operator_username: str = "operator"
    operator_password_hash: str = ""

    class Config:
        env_file = ".env"


settings = Settings()


def validate_config() -> None:
    if not settings.database_url:
        raise ValueError("DATABASE_URL is required. Set it in .env or environment.")
    if not settings.jwt_secret or settings.jwt_secret == "change-me":
        raise ValueError("JWT_SECRET is required and must not be the default. Set it in .env or environment.")

    class Config:
        env_file = ".env"


settings = Settings()
