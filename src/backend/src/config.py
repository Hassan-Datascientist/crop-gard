from pydantic_settings import BaseSettings, SettingsConfigDict


class Setting(BaseSettings):
    groq_api_key: str
    plantnet_api_key: str
    plantnet_project: str = "all"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8-sig",  # handles PowerShell's BOM-prefixed writes
    )


settings = Setting()
