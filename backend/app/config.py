from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Server Configuration
    port: int = 8000
    environment: str = "development"
    
    # MongoDB Configuration
    mongo_uri: str
    database_name: str = "taskflow"
    
    # JWT Configuration
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15  # 15 minutes
    refresh_token_expire_days: int = 30  # 30 days
    
    # CORS Configuration
    cors_origins: str = "http://localhost:3000"
    
    # Upload Configuration
    upload_dir: str = "uploads"
    max_upload_size: int = 5242880  # 5MB
    allowed_extensions: str = "jpg,jpeg,png,gif,webp"
    
    # Email Configuration
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@taskflow.com"
    smtp_from_name: str = "TaskFlow"
    
    # Frontend Configuration
    frontend_url: str = "http://localhost:3000"
    
    # Security Configuration
    max_login_attempts: int = 5
    lockout_duration_minutes: int = 15
    max_devices_per_user: int = 5
    verification_token_expire_hours: int = 24
    reset_token_expire_hours: int = 1
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def allowed_extensions_list(self) -> List[str]:
        """Parse allowed extensions from comma-separated string."""
        return [ext.strip().lower() for ext in self.allowed_extensions.split(",")]


# Global settings instance
settings = Settings()
