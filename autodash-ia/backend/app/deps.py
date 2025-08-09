from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import requests

from .database import get_db
from .config import get_settings
from . import models


security = HTTPBearer(auto_error=True)


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> models.User:
    token = creds.credentials
    settings = get_settings()

    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": settings.supabase_service_role_key,
    }
    # Validate token and get user from Supabase
    resp = requests.get(
        f"{settings.supabase_url}/auth/v1/user",
        headers=headers,
        timeout=10,
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth token")
    supa_user = resp.json()
    supabase_user_id: str = supa_user.get("id")
    if not supabase_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth user")

    # Ensure user exists in local DB
    user = db.query(models.User).filter(models.User.supabase_user_id == supabase_user_id).one_or_none()
    if not user:
        # Assign Free plan by default
        plan = db.query(models.Plan).filter(models.Plan.name == "Free").first()
        if not plan:
            raise HTTPException(status_code=500, detail="Plans not seeded")
        user = models.User(supabase_user_id=supabase_user_id, plan_id=plan.id)
        db.add(user)
        db.commit()
        db.refresh(user)

    return user