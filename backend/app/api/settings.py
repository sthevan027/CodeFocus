from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.settings import UserSettings
from ..schemas.settings import SettingsCreate, SettingsUpdate, SettingsResponse
from ..auth.dependencies import get_current_active_user

router = APIRouter(prefix="/settings", tags=["configurações"])

@router.get("/", response_model=SettingsResponse)
async def get_settings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém as configurações do usuário"""
    settings = db.query(UserSettings).filter(
        UserSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        # Criar configurações padrão se não existirem
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return SettingsResponse.from_orm(settings)

@router.put("/", response_model=SettingsResponse)
async def update_settings(
    settings_data: SettingsUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualiza as configurações do usuário"""
    settings = db.query(UserSettings).filter(
        UserSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        # Criar configurações se não existirem
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    # Atualizar campos
    for field, value in settings_data.dict(exclude_unset=True).items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    
    return SettingsResponse.from_orm(settings)

@router.post("/reset")
async def reset_settings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Reseta as configurações para os valores padrão"""
    settings = db.query(UserSettings).filter(
        UserSettings.user_id == current_user.id
    ).first()
    
    if settings:
        # Resetar para valores padrão
        settings.focus_time = 25
        settings.short_break_time = 5
        settings.long_break_time = 15
        settings.auto_start_breaks = False
        settings.auto_start_pomodoros = False
        settings.sound_enabled = True
        settings.notifications_enabled = True
        settings.auto_commit = False
        settings.auto_push = False
        settings.git_commit_template = "feat: {cycle_name} ({duration}min)"
        settings.theme = "dark"
        settings.accent_color = "#3B82F6"
        settings.notification_sound = "default"
        settings.notification_volume = 50
        settings.auto_generate_reports = True
        settings.report_format = "txt"
        settings.oauth_preferences = {}
        
        db.commit()
    
    return {"message": "Configurações resetadas para os valores padrão"} 