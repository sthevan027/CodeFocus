from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # Configurações do Banco de Dados
    # Usar SQLite para desenvolvimento
    database_url: str = "sqlite:///./codefocus.db"
    
    # Configurações de Segurança
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Configurações da Aplicação
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"
    
    # Configurações de Email
    mail_username: str = "your-email@gmail.com"
    mail_password: str = "your-app-password"
    mail_from: str = "your-email@gmail.com"
    mail_port: int = 587
    mail_server: str = "smtp.gmail.com"
    mail_tls: bool = True
    mail_ssl: bool = False
    
    class Config:
        env_file = ".env"

settings = Settings()

# Detectar se estamos no Windows e usar SQLite
if os.name == 'nt':  # Windows
    settings.database_url = "sqlite:///./codefocus.db" 