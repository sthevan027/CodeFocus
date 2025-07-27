from pydantic import BaseModel
from typing import Optional, Dict, Any

class SettingsBase(BaseModel):
    # Configurações do Timer
    focus_time: int = 25
    short_break_time: int = 5
    long_break_time: int = 15
    
    # Configurações de Comportamento
    auto_start_breaks: bool = False
    auto_start_pomodoros: bool = False
    sound_enabled: bool = True
    notifications_enabled: bool = True
    
    # Configurações de Git
    auto_commit: bool = False
    auto_push: bool = False
    git_commit_template: str = "feat: {cycle_name} ({duration}min)"
    
    # Configurações de Tema
    theme: str = "dark"  # dark, light, auto
    accent_color: str = "#3B82F6"
    
    # Configurações de Notificações
    notification_sound: str = "default"
    notification_volume: int = 50
    
    # Configurações de Relatórios
    auto_generate_reports: bool = True
    report_format: str = "txt"  # txt, pdf, json
    
    # Configurações OAuth
    oauth_preferences: Dict[str, Any] = {}

class SettingsCreate(SettingsBase):
    user_id: int

class SettingsUpdate(BaseModel):
    # Configurações do Timer
    focus_time: Optional[int] = None
    short_break_time: Optional[int] = None
    long_break_time: Optional[int] = None
    
    # Configurações de Comportamento
    auto_start_breaks: Optional[bool] = None
    auto_start_pomodoros: Optional[bool] = None
    sound_enabled: Optional[bool] = None
    notifications_enabled: Optional[bool] = None
    
    # Configurações de Git
    auto_commit: Optional[bool] = None
    auto_push: Optional[bool] = None
    git_commit_template: Optional[str] = None
    
    # Configurações de Tema
    theme: Optional[str] = None
    accent_color: Optional[str] = None
    
    # Configurações de Notificações
    notification_sound: Optional[str] = None
    notification_volume: Optional[int] = None
    
    # Configurações de Relatórios
    auto_generate_reports: Optional[bool] = None
    report_format: Optional[str] = None
    
    # Configurações OAuth
    oauth_preferences: Optional[Dict[str, Any]] = None

class SettingsResponse(SettingsBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True 