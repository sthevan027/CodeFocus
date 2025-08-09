from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from typing import Generator
import os

from .config import get_settings


class Base(DeclarativeBase):
    pass


def get_database_url() -> str:
    settings = get_settings()
    if settings.database_url:
        return settings.database_url
    # Fallback SQLite for local dev
    db_path = os.path.join(os.path.dirname(__file__), "..", "app.db")
    return f"sqlite:///{os.path.abspath(db_path)}"


engine = create_engine(get_database_url(), future=True, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    # Import models locally to ensure they are registered with Base
    from . import models

    Base.metadata.create_all(bind=engine)

    # Seed plans
    from sqlalchemy import select
    from sqlalchemy.orm import Session

    with Session(bind=engine, future=True) as session:
        existing = {p.name for p in session.execute(select(models.Plan)).scalars().all()}
        default_plans = [
            ("Free", 2, 3),
            ("Pro", 4, 8),
            ("Plus", 8, 12),
        ]
        for name, active_limit, total_limit in default_plans:
            if name not in existing:
                session.add(models.Plan(name=name, active_dashboard_limit=active_limit, total_dashboard_limit=total_limit))
        session.commit()