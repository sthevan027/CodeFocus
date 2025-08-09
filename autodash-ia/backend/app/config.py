from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache
from typing import List
import os


class Settings(BaseSettings):
    database_url: str | None = Field(default=None, alias="DATABASE_URL")
    supabase_url: str = Field(alias="SUPABASE_URL")
    supabase_service_role_key: str = Field(alias="SUPABASE_SERVICE_ROLE_KEY")
    openai_api_key: str = Field(alias="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4o-mini", alias="OPENAI_MODEL")
    allowed_origins: str = Field(default="http://localhost:3000", alias="ALLOWED_ORIGINS")
    max_upload_mb: int = Field(default=10, alias="MAX_UPLOAD_MB")

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

    def get_allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[arg-type]