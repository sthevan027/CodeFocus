from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class PlanType(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    PLUS = "plus"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    supabase_id = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    plan = Column(Enum(PlanType), default=PlanType.FREE, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 