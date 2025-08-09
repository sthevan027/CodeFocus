from supabase import create_client, Client
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate
from sqlalchemy.orm import Session
from typing import Optional


class AuthService:
    def __init__(self):
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )
    
    async def get_current_user(self, token: str, db: Session) -> Optional[User]:
        """Valida o token JWT e retorna o usuário"""
        try:
            # Verifica o token com Supabase
            user_response = self.supabase.auth.get_user(token)
            if not user_response or not user_response.user:
                return None
            
            supabase_user = user_response.user
            
            # Busca ou cria o usuário no banco local
            user = db.query(User).filter(User.supabase_id == supabase_user.id).first()
            
            if not user:
                # Cria o usuário se não existir
                user_create = UserCreate(
                    email=supabase_user.email,
                    supabase_id=supabase_user.id,
                    full_name=supabase_user.user_metadata.get("full_name")
                )
                user = User(**user_create.dict())
                db.add(user)
                db.commit()
                db.refresh(user)
            
            return user
            
        except Exception as e:
            print(f"Erro ao validar token: {e}")
            return None
    
    async def sign_up(self, email: str, password: str) -> dict:
        """Registra um novo usuário no Supabase"""
        try:
            response = self.supabase.auth.sign_up({
                "email": email,
                "password": password
            })
            return {
                "success": True,
                "user": response.user,
                "session": response.session
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def sign_in(self, email: str, password: str) -> dict:
        """Faz login do usuário no Supabase"""
        try:
            response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            return {
                "success": True,
                "user": response.user,
                "session": response.session
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def sign_out(self, token: str) -> dict:
        """Faz logout do usuário"""
        try:
            self.supabase.auth.sign_out()
            return {"success": True}
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


auth_service = AuthService()