from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Configurações do Timer
    focus_time = Column(Integer, default=25)  # minutos
    short_break_time = Column(Integer, default=5)  # minutos
    long_break_time = Column(Integer, default=15)  # minutos
    
    # Configurações de Comportamento
    auto_start_breaks = Column(Boolean, default=False)
    auto_start_pomodoros = Column(Boolean, default=False)
    sound_enabled = Column(Boolean, default=True)
    notifications_enabled = Column(Boolean, default=True)
    
    # Configurações de Git
    auto_commit = Column(Boolean, default=False)
    auto_push = Column(Boolean, default=False)
    git_commit_template = Column(String, default="feat: {cycle_name} ({duration}min)")
    
    # Configurações de Tema
    theme = Column(String, default="dark")  # dark, light, auto
    accent_color = Column(String, default="#3B82F6")
    
    # Configurações de Notificações
    notification_sound = Column(String, default="default")
    notification_volume = Column(Integer, default=50)
    
    # Configurações de Relatórios
    auto_generate_reports = Column(Boolean, default=True)
    report_format = Column(String, default="txt")  # txt, pdf, json
    
    # Configurações OAuth
    oauth_preferences = Column(JSON, default={})
    
    # Relacionamentos
    user = relationship("User", back_populates="settings") 