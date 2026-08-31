from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = ["*"]
    DISCONNECT_TIMEOUT_SECONDS: int = 30
    DEFAULT_CODE_LENGTH: int = 6


settings = Settings()
