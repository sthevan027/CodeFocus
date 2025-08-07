"""
OAuth authentication module for Google and GitHub
"""
import os
import httpx
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from jose import jwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..config import settings
from ..models.user import User
from ..schemas.auth import UserCreate
from .security import create_access_token, get_password_hash

# OAuth URLs
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAIL_URL = "https://api.github.com/user/emails"


class OAuthProvider:
    """Base OAuth provider class"""
    
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
    
    async def get_access_token(self, code: str) -> str:
        """Exchange authorization code for access token"""
        raise NotImplementedError
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user information from OAuth provider"""
        raise NotImplementedError


class GoogleOAuth(OAuthProvider):
    """Google OAuth implementation"""
    
    async def get_access_token(self, code: str) -> str:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "redirect_uri": self.redirect_uri,
                    "grant_type": "authorization_code",
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get access token from Google"
                )
            
            data = response.json()
            return data["access_token"]
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get user info from Google"
                )
            
            return response.json()


class GitHubOAuth(OAuthProvider):
    """GitHub OAuth implementation"""
    
    async def get_access_token(self, code: str) -> str:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                GITHUB_TOKEN_URL,
                headers={"Accept": "application/json"},
                data={
                    "code": code,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "redirect_uri": self.redirect_uri,
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get access token from GitHub"
                )
            
            data = response.json()
            return data["access_token"]
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            # Get user info
            user_response = await client.get(
                GITHUB_USER_URL,
                headers={"Authorization": f"token {access_token}"}
            )
            
            if user_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get user info from GitHub"
                )
            
            user_data = user_response.json()
            
            # Get primary email if not public
            if not user_data.get("email"):
                email_response = await client.get(
                    GITHUB_EMAIL_URL,
                    headers={"Authorization": f"token {access_token}"}
                )
                
                if email_response.status_code == 200:
                    emails = email_response.json()
                    primary_email = next(
                        (email["email"] for email in emails if email["primary"]),
                        None
                    )
                    if primary_email:
                        user_data["email"] = primary_email
            
            return user_data


async def get_or_create_oauth_user(
    db: Session,
    provider: str,
    user_info: Dict[str, Any]
) -> User:
    """Get existing user or create new one from OAuth info"""
    
    email = user_info.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not provided by OAuth provider"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Create new user
        user_data = UserCreate(
            email=email,
            name=user_info.get("name") or user_info.get("login") or email.split("@")[0],
            password=get_password_hash(os.urandom(32).hex()),  # Random password for OAuth users
            oauth_provider=provider,
            oauth_provider_id=str(user_info.get("id", "")),
            picture=user_info.get("picture") or user_info.get("avatar_url")
        )
        
        user = User(**user_data.dict())
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update OAuth info if needed
        if not user.oauth_provider:
            user.oauth_provider = provider
            user.oauth_provider_id = str(user_info.get("id", ""))
        
        if not user.picture and (user_info.get("picture") or user_info.get("avatar_url")):
            user.picture = user_info.get("picture") or user_info.get("avatar_url")
        
        db.commit()
        db.refresh(user)
    
    return user


def get_oauth_provider(provider: str) -> OAuthProvider:
    """Get OAuth provider instance"""
    
    if provider == "google":
        return GoogleOAuth(
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            redirect_uri=settings.GOOGLE_REDIRECT_URI
        )
    elif provider == "github":
        return GitHubOAuth(
            client_id=settings.GITHUB_CLIENT_ID,
            client_secret=settings.GITHUB_CLIENT_SECRET,
            redirect_uri=settings.GITHUB_REDIRECT_URI
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported OAuth provider: {provider}"
        )