from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg2://dms_user:dms_password@localhost:5432/dms_db"
    jwt_secret_key: str = "change-me-in-local-env"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30
    ai_process_base_url: str = "http://localhost:8000"
    storage_dir: str = "./storage"
    master_kek: str = ""
    signing_private_key: str = ""


settings = Settings()
