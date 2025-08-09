from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from .. import models, schemas

router = APIRouter(prefix="/api/dashboards", tags=["dashboards"])


@router.get("", response_model=list[schemas.DashboardOut])
def list_dashboards(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    items = (
        db.query(models.Dashboard)
        .filter(models.Dashboard.user_id == user.id)
        .order_by(models.Dashboard.created_at.desc())
        .all()
    )
    return items


@router.get("/{dashboard_id}", response_model=schemas.DashboardOut)
def get_dashboard(
    dashboard_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    item = (
        db.query(models.Dashboard)
        .filter(models.Dashboard.id == dashboard_id, models.Dashboard.user_id == user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Dashboard não encontrado")
    return item