from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime
import random
import string
from ..database import get_db
from ..models.user import User
from ..models.settings import UserSettings
from ..schemas.user import UserCreate, UserLogin, UserResponse, Token
from ..auth.security import get_password_hash, verify_password, create_access_token
from ..services.email_service import email_service

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
        is_verified=False  # Sempre começa como não verificado
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Criar configurações padrão
    default_settings = UserSettings(user_id=db_user.id)
    db.add(default_settings)
    db.commit()
    
    # Gerar código de verificação e enviar email
    verification_code = ''.join(random.choices(string.digits, k=6))
    db_user.verification_code = verification_code
    db_user.verification_code_expires = datetime.utcnow()
    db.commit()
    
    # Enviar email de verificação
    await email_service.send_verification_email(
        email=user_data.email,
        code=verification_code,
        name=user_data.full_name or user_data.username
    )
    
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
    
    # Verificar se o email foi verificado
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email não verificado. Verifique seu email primeiro."
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



@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user: User = Depends(get_current_active_user)):
    """Obtém informações do usuário atual"""
    return UserResponse.from_orm(current_user)

@router.post("/send-verification")
async def send_verification_email(email: str, db: Session = Depends(get_db)):
    """Envia código de verificação por email"""
    # Verificar se o usuário existe
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Gerar código de verificação
    verification_code = ''.join(random.choices(string.digits, k=6))
    
    # Salvar código no banco (ou cache)
    user.verification_code = verification_code
    user.verification_code_expires = datetime.utcnow()
    db.commit()
    
    # Enviar email
    success = await email_service.send_verification_email(
        email=email,
        code=verification_code,
        name=user.full_name or user.username
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao enviar email de verificação"
        )
    
    return {"message": "Código de verificação enviado com sucesso"}

@router.post("/verify-email")
async def verify_email(email: str, code: str, db: Session = Depends(get_db)):
    """Verifica código de email"""
    # Buscar usuário
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Verificar código
    if not user.verification_code or user.verification_code != code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de verificação inválido"
        )
    
    # Verificar se expirou (5 minutos)
    if user.verification_code_expires:
        from datetime import timedelta
        if datetime.utcnow() - user.verification_code_expires > timedelta(minutes=5):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Código de verificação expirado"
            )
    
    # Marcar como verificado
    user.is_verified = True
    user.verification_code = None
    user.verification_code_expires = None
    user.verified_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Email verificado com sucesso"} 