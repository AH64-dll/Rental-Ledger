from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://ledger:ledger@localhost:5432/ledger"
    jwt_secret: str = "change-me"
    jwt_algo: str = "HS256"
    jwt_exp_minutes: int = 60 * 24 * 7
    currency: str = "EGP"
    operator_username: str = "operator"
    operator_password_hash: str = ""  # bcrypt hash; seeded at startup if empty

    class Config:
        env_file = ".env"


settings = Settings()
