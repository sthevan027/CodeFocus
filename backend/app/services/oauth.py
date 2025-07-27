import httpx
from typing import Optional, Dict, Any
from ..config import settings

class OAuthService:
    def __init__(self):
        self.google_client_id = settings.google_client_id
        self.google_client_secret = settings.google_client_secret
        self.github_client_id = settings.github_client_id
        self.github_client_secret = settings.github_client_secret

    async def get_google_user_info(self, access_token: str) -> Optional[Dict[str, Any]]:
        """Obtém informações do usuário do Google"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            if response.status_code == 200:
                return response.json()
        return None

    async def get_github_user_info(self, access_token: str) -> Optional[Dict[str, Any]]:
        """Obtém informações do usuário do GitHub"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                }
            )
            if response.status_code == 200:
                return response.json()
        return None

    async def exchange_google_code(self, code: str) -> Optional[Dict[str, Any]]:
        """Troca código de autorização por token de acesso do Google"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": self.google_client_id,
                    "client_secret": self.google_client_secret,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": settings.google_redirect_uri
                }
            )
            if response.status_code == 200:
                return response.json()
        return None

    async def exchange_github_code(self, code: str) -> Optional[Dict[str, Any]]:
        """Troca código de autorização por token de acesso do GitHub"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": self.github_client_id,
                    "client_secret": self.github_client_secret,
                    "code": code
                },
                headers={"Accept": "application/json"}
            )
            if response.status_code == 200:
                return response.json()
        return None

oauth_service = OAuthService() 