from __future__ import annotations

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from sqlalchemy import func
import uuid
from typing import Optional

from .database import Base


try:
    from sqlalchemy.dialects.sqlite import JSON as SQLITE_JSON
    JSONType = JSONB  # default
except Exception:
    JSONType = Text  # fallback


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    active_dashboard_limit: Mapped[int] = mapped_column(Integer, default=2)
    total_dashboard_limit: Mapped[int] = mapped_column(Integer, default=3)

    users: Mapped[list[User]] = relationship(back_populates="plan")  # type: ignore[name-defined]


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    supabase_user_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"))
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    plan: Mapped[Plan] = relationship(back_populates="users")
    uploads: Mapped[list[Upload]] = relationship(back_populates="user")  # type: ignore[name-defined]
    dashboards: Mapped[list[Dashboard]] = relationship(back_populates="user")  # type: ignore[name-defined]


class Upload(Base):
    __tablename__ = "uploads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    filename: Mapped[str] = mapped_column(String(255))
    file_size: Mapped[int] = mapped_column(Integer)
    content_type: Mapped[str] = mapped_column(String(100))
    num_rows: Mapped[int] = mapped_column(Integer)
    columns_json: Mapped[str] = mapped_column(Text)  # store columns schema summary as JSON string
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="uploads")
    dashboards: Mapped[list[Dashboard]] = relationship(back_populates="upload")  # type: ignore[name-defined]


class Dashboard(Base):
    __tablename__ = "dashboards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    upload_id: Mapped[int] = mapped_column(ForeignKey("uploads.id"))
    title: Mapped[str] = mapped_column(String(255))
    charts_json: Mapped[str] = mapped_column(Text)  # JSON string for Chart.js configs
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="dashboards")
    upload: Mapped[Upload] = relationship(back_populates="dashboards")