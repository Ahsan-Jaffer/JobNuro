from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "JobNuro AI Service"
    app_env: str = "development"
    max_file_size_mb: int = 5

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()