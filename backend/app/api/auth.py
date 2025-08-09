from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.auth import auth_service
from pydantic import BaseModel, EmailStr

router = APIRouter()


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str = None


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup")
async def sign_up(request: SignUpRequest):
    """Registra um novo usuário"""
    result = await auth_service.sign_up(request.email, request.password)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Erro ao criar usuário")
        )
    
    return {
        "message": "Usuário criado com sucesso",
        "user": result["user"],
        "session": result["session"]
    }


@router.post("/signin")
async def sign_in(request: SignInRequest):
    """Faz login do usuário"""
    result = await auth_service.sign_in(request.email, request.password)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get("error", "Credenciais inválidas")
        )
    
    return {
        "message": "Login realizado com sucesso",
        "user": result["user"],
        "session": result["session"]
    }


@router.post("/signout")
async def sign_out(token: str):
    """Faz logout do usuário"""
    result = await auth_service.sign_out(token)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Erro ao fazer logout")
        )
    
    return {"message": "Logout realizado com sucesso"}


@router.get("/me")
async def get_current_user(
    authorization: str = Depends(lambda: None),
    db: Session = Depends(get_db)
):
    """Retorna informações do usuário atual"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token não fornecido"
        )
    
    token = authorization.replace("Bearer ", "")
    user = await auth_service.get_current_user(token, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "plan": user.plan,
        "created_at": user.created_at
    } 