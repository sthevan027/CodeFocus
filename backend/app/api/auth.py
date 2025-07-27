from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models.user import User
from ..models.settings import UserSettings
from ..schemas.user import UserCreate, UserLogin, UserResponse, Token, OAuthCallback
from ..auth.security import get_password_hash, verify_password, create_access_token
from ..services.oauth import oauth_service
from ..auth.dependencies import get_current_active_user

router = APIRouter(prefix="/auth", tags=["autenticação"])

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Registra um novo usuário"""
    # Verificar se o email já existe
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já registrado"
        )
    
    # Criar usuário
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        avatar_url=user_data.avatar_url,
        provider=user_data.provider,
        provider_id=user_data.provider_id,
        is_verified=True if user_data.provider != "email" else False
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Criar configurações padrão
    default_settings = UserSettings(user_id=db_user.id)
    db.add(default_settings)
    db.commit()
    
    # Gerar token
    access_token = create_access_token(data={"sub": str(db_user.id)})
    
    return Token(
        access_token=access_token,
        expires_in=30 * 60,  # 30 minutos
        user=UserResponse.from_orm(db_user)
    )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Faz login com email e senha"""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo"
        )
    
    # Atualizar último login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Gerar token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return Token(
        access_token=access_token,
        expires_in=30 * 60,  # 30 minutos
        user=UserResponse.from_orm(user)
    )

@router.post("/google/callback", response_model=Token)
async def google_callback(callback_data: OAuthCallback, db: Session = Depends(get_db)):
    """Callback do Google OAuth"""
    # Trocar código por token
    token_data = await oauth_service.exchange_google_code(callback_data.code)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao trocar código por token"
        )
    
    # Obter informações do usuário
    user_info = await oauth_service.get_google_user_info(token_data["access_token"])
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao obter informações do usuário"
        )
    
    # Verificar se usuário já existe
    user = db.query(User).filter(User.provider_id == user_info["id"]).first()
    if not user:
        # Criar novo usuário
        user = User(
            email=user_info["email"],
            full_name=user_info["name"],
            avatar_url=user_info.get("picture"),
            provider="google",
            provider_id=user_info["id"],
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Criar configurações padrão
        default_settings = UserSettings(user_id=user.id)
        db.add(default_settings)
        db.commit()
    
    # Atualizar último login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Gerar token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return Token(
        access_token=access_token,
        expires_in=30 * 60,  # 30 minutos
        user=UserResponse.from_orm(user)
    )

@router.post("/github/callback", response_model=Token)
async def github_callback(callback_data: OAuthCallback, db: Session = Depends(get_db)):
    """Callback do GitHub OAuth"""
    # Trocar código por token
    token_data = await oauth_service.exchange_github_code(callback_data.code)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao trocar código por token"
        )
    
    # Obter informações do usuário
    user_info = await oauth_service.get_github_user_info(token_data["access_token"])
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao obter informações do usuário"
        )
    
    # Verificar se usuário já existe
    user = db.query(User).filter(User.provider_id == str(user_info["id"])).first()
    if not user:
        # Criar novo usuário
        user = User(
            email=user_info.get("email", f"{user_info['login']}@github.com"),
            username=user_info["login"],
            full_name=user_info.get("name", user_info["login"]),
            avatar_url=user_info.get("avatar_url"),
            provider="github",
            provider_id=str(user_info["id"]),
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Criar configurações padrão
        default_settings = UserSettings(user_id=user.id)
        db.add(default_settings)
        db.commit()
    
    # Atualizar último login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Gerar token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return Token(
        access_token=access_token,
        expires_in=30 * 60,  # 30 minutos
        user=UserResponse.from_orm(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user: User = Depends(get_current_active_user)):
    """Obtém informações do usuário atual"""
    return UserResponse.from_orm(current_user) 