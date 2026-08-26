from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg2://dms_user:dms_password@localhost:5432/dms_db"
    storage_dir: str = "./storage"
    master_kek: str = ""
    signing_private_key: str = ""


settings = Settings()
