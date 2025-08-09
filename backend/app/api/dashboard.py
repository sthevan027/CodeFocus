from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Dashboard, User, Upload
from app.schemas.dashboard import Dashboard as DashboardSchema, DashboardCreate, DashboardUpdate, DashboardWithData
from app.services.data_processor import data_processor
from app.api.upload import get_current_user_from_header
import os
import json

router = APIRouter()


def check_plan_limits(user: User, db: Session) -> dict:
    """Verifica limites do plano do usuário"""
    # Define limites por plano
    plan_limits = {
        "free": {"active": 2, "total": 3},
        "pro": {"active": 4, "total": 8},
        "plus": {"active": 8, "total": 12}
    }
    
    limits = plan_limits.get(user.plan.value, plan_limits["free"])
    
    # Conta dashboards do usuário
    total_dashboards = db.query(Dashboard).filter(Dashboard.user_id == user.id).count()
    active_dashboards = db.query(Dashboard).filter(
        Dashboard.user_id == user.id,
        Dashboard.is_active == True
    ).count()
    
    return {
        "plan": user.plan,
        "active_limit": limits["active"],
        "total_limit": limits["total"],
        "current_active": active_dashboards,
        "current_total": total_dashboards,
        "can_create": total_dashboards < limits["total"],
        "can_activate": active_dashboards < limits["active"]
    }


@router.post("/dashboards", response_model=DashboardSchema)
async def create_dashboard(
    dashboard_data: DashboardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_header)
):
    """Cria um novo dashboard"""
    
    # Verifica limites do plano
    limits = check_plan_limits(current_user, db)
    if not limits["can_create"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Limite de dashboards atingido. Plano {current_user.plan.value} permite até {limits['total_limit']} dashboards."
        )
    
    # Cria o dashboard
    db_dashboard = Dashboard(
        user_id=current_user.id,
        title=dashboard_data.title,
        description=dashboard_data.description,
        charts_config=[chart.dict() for chart in dashboard_data.charts_config],
        data_source=dashboard_data.data_source,
        is_active=limits["can_activate"]  # Ativa apenas se estiver dentro do limite
    )
    
    db.add(db_dashboard)
    db.commit()
    db.refresh(db_dashboard)
    
    return db_dashboard


@router.get("/dashboards", response_model=List[DashboardSchema])
async def list_dashboards(
    skip: int = 0,
    limit: int = 20,
    only_active: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_header)
):
    """Lista dashboards do usuário"""
    query = db.query(Dashboard).filter(Dashboard.user_id == current_user.id)
    
    if only_active:
        query = query.filter(Dashboard.is_active == True)
    
    dashboards = query.offset(skip).limit(limit).all()
    return dashboards


@router.get("/dashboards/{dashboard_id}", response_model=DashboardWithData)
async def get_dashboard(
    dashboard_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_header)
):
    """Obtém um dashboard específico com dados"""
    
    # Busca dashboard
    dashboard = db.query(Dashboard).filter(
        Dashboard.id == dashboard_id,
        Dashboard.user_id == current_user.id
    ).first()
    
    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard não encontrado"
        )
    
    # Busca o upload associado
    upload = db.query(Upload).filter(
        Upload.filename == dashboard.data_source,
        Upload.user_id == current_user.id
    ).first()
    
    if not upload:
        return DashboardWithData(**dashboard.__dict__, data=None)
    
    try:
        # Carrega os dados
        file_path = os.path.join("uploads", upload.filename)
        df, _ = await data_processor.process_file(file_path, upload.file_type)
        
        # Prepara dados para cada gráfico
        chart_data = []
        for chart_config in dashboard.charts_config:
            data = data_processor.prepare_chart_data(df, chart_config)
            chart_data.append({
                **chart_config,
                "data": data
            })
        
        return DashboardWithData(
            **dashboard.__dict__,
            data=chart_data
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao carregar dados do dashboard: {str(e)}"
        )


@router.put("/dashboards/{dashboard_id}", response_model=DashboardSchema)
async def update_dashboard(
    dashboard_id: int,
    update_data: DashboardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_header)
):
    """Atualiza um dashboard"""
    
    # Busca dashboard
    dashboard = db.query(Dashboard).filter(
        Dashboard.id == dashboard_id,
        Dashboard.user_id == current_user.id
    ).first()
    
    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard não encontrado"
        )
    
    # Se está tentando ativar, verifica limites
    if update_data.is_active and not dashboard.is_active:
        limits = check_plan_limits(current_user, db)
        if not limits["can_activate"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Limite de dashboards ativos atingido. Plano {current_user.plan.value} permite até {limits['active_limit']} dashboards ativos."
            )
    
    # Atualiza campos
    update_dict = update_data.dict(exclude_unset=True)
    if "charts_config" in update_dict:
        update_dict["charts_config"] = [chart.dict() for chart in update_data.charts_config]
    
    for field, value in update_dict.items():
        setattr(dashboard, field, value)
    
    db.commit()
    db.refresh(dashboard)
    
    return dashboard


@router.delete("/dashboards/{dashboard_id}")
async def delete_dashboard(
    dashboard_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_header)
):
    """Deleta um dashboard"""
    
    # Busca dashboard
    dashboard = db.query(Dashboard).filter(
        Dashboard.id == dashboard_id,
        Dashboard.user_id == current_user.id
    ).first()
    
    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard não encontrado"
        )
    
    db.delete(dashboard)
    db.commit()
    
    return {"message": "Dashboard deletado com sucesso"}


@router.get("/dashboards/limits/check")
async def check_user_limits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_header)
):
    """Verifica limites do plano do usuário"""
    return check_plan_limits(current_user, db)