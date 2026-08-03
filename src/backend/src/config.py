from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Setting(BaseSettings):
    # Sync service
    database_url: str = "postgresql+asyncpg://abdo:abdo00@localhost:5433/crop-gard"
    jwt_secret_key: str = "cropguard-dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080  # 7 days
    upload_dir: str = "data/uploads"

    # Cloudinary image storage (used when deployed; falls back to local disk otherwise)
    cloudinary_cloud_name: str | None = None
    cloudinary_api_key: str | None = None
    cloudinary_secret: str | None = None
    cloudinary_folder: str = "cropgard"

    @field_validator("database_url")
    @classmethod
    def _ensure_async_driver(cls, v: str) -> str:
        """Render DATABASE_URL is `postgresql://` (psycopg2); force asyncpg."""
        if v.startswith("postgres://"):
            v = "postgresql://" + v[len("postgres://") :]
        if v.startswith("postgresql://"):
            v = "postgresql+asyncpg://" + v[len("postgresql://") :]
        for sslmode in ("verify-full", "verify-ca", "require", "prefer", "allow", "disable"):
            v = v.replace(f"?sslmode={sslmode}", f"?ssl={sslmode}")
            v = v.replace(f"&sslmode={sslmode}", f"&ssl={sslmode}")
        return v

    @property
    def cloudinary_enabled(self) -> bool:
        return bool(
            self.cloudinary_cloud_name
            and self.cloudinary_api_key
            and self.cloudinary_secret
        )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8-sig",  # handles PowerShell's BOM-prefixed writes
    )


settings = Setting()
