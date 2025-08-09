from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models.user import PlanType


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    supabase_id: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    plan: Optional[PlanType] = None


class User(UserBase):
    id: int
    supabase_id: str
    plan: PlanType
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserPlanLimits(BaseModel):
    plan: PlanType
    active_dashboards_limit: int
    total_dashboards_limit: int
    current_active_dashboards: int
    current_total_dashboards: int
    can_create_dashboard: bool 