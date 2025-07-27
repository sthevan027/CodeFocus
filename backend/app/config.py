from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Configurações do Banco de Dados
    # Usar SQLite para desenvolvimento
    database_url: str = "sqlite:///./codefocus.db"
    
    # Configurações de Segurança
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Configurações OAuth - Google
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    google_redirect_uri: str = "http://localhost:3000/auth/google/callback"
    
    # Configurações OAuth - GitHub
    github_client_id: Optional[str] = None
    github_client_secret: Optional[str] = None
    github_redirect_uri: str = "http://localhost:3000/auth/github/callback"
    
    # Configurações da Aplicação
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"

settings = Settings()

# Detectar se estamos no Windows e usar SQLite
if os.name == 'nt':  # Windows
    settings.database_url = "sqlite:///./codefocus.db" 