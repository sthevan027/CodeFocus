from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models


def get_user_limits(db: Session, user: models.User) -> tuple[int, int]:
    plan = db.query(models.Plan).filter(models.Plan.id == user.plan_id).first()
    if not plan:
        return (2, 3)
    return (plan.active_dashboard_limit, plan.total_dashboard_limit)


def get_user_counts(db: Session, user: models.User) -> tuple[int, int]:
    active_count = db.query(func.count(models.Dashboard.id)).filter(
        models.Dashboard.user_id == user.id,
        models.Dashboard.is_active == True,
    ).scalar() or 0

    total_count = db.query(func.count(models.Dashboard.id)).filter(
        models.Dashboard.user_id == user.id,
    ).scalar() or 0

    return (active_count, total_count)


def can_create_dashboard(db: Session, user: models.User) -> bool:
    (active_limit, total_limit) = get_user_limits(db, user)
    (active_count, total_count) = get_user_counts(db, user)
    return active_count < active_limit and total_count < total_limit