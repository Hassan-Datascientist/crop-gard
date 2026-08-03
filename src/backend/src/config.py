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
