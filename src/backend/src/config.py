from pydantic_settings import BaseSettings, SettingsConfigDict


class APIKEYS(BaseSettings):
    GEMINI_API_KEY: str
    # model_config = SettingsConfigDict(env_file="../.env")


api_keys = APIKEYS()
