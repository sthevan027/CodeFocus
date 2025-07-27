from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from ..database import get_db
from ..models.user import User
from ..models.cycle import Cycle
from ..schemas.cycle import CycleCreate, CycleUpdate, CycleResponse, CycleStats
from ..auth.dependencies import get_current_active_user

router = APIRouter(prefix="/cycles", tags=["ciclos"])

@router.post("/", response_model=CycleResponse)
async def create_cycle(
    cycle_data: CycleCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cria um novo ciclo"""
    db_cycle = Cycle(
        user_id=current_user.id,
        name=cycle_data.name,
        duration=cycle_data.duration,
        phase=cycle_data.phase,
        git_commit=cycle_data.git_commit,
        git_files=cycle_data.git_files
    )
    
    db.add(db_cycle)
    db.commit()
    db.refresh(db_cycle)
    
    return CycleResponse.from_orm(db_cycle)

@router.get("/", response_model=List[CycleResponse])
async def get_cycles(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista todos os ciclos do usuário"""
    cycles = db.query(Cycle).filter(
        Cycle.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return [CycleResponse.from_orm(cycle) for cycle in cycles]

@router.get("/{cycle_id}", response_model=CycleResponse)
async def get_cycle(
    cycle_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém um ciclo específico"""
    cycle = db.query(Cycle).filter(
        Cycle.id == cycle_id,
        Cycle.user_id == current_user.id
    ).first()
    
    if not cycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ciclo não encontrado"
        )
    
    return CycleResponse.from_orm(cycle)

@router.put("/{cycle_id}", response_model=CycleResponse)
async def update_cycle(
    cycle_id: int,
    cycle_data: CycleUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualiza um ciclo"""
    cycle = db.query(Cycle).filter(
        Cycle.id == cycle_id,
        Cycle.user_id == current_user.id
    ).first()
    
    if not cycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ciclo não encontrado"
        )
    
    # Atualizar campos
    for field, value in cycle_data.dict(exclude_unset=True).items():
        setattr(cycle, field, value)
    
    # Se marcando como completado, definir end_time
    if cycle_data.completed and not cycle.end_time:
        cycle.end_time = datetime.utcnow()
    
    db.commit()
    db.refresh(cycle)
    
    return CycleResponse.from_orm(cycle)

@router.delete("/{cycle_id}")
async def delete_cycle(
    cycle_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deleta um ciclo"""
    cycle = db.query(Cycle).filter(
        Cycle.id == cycle_id,
        Cycle.user_id == current_user.id
    ).first()
    
    if not cycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ciclo não encontrado"
        )
    
    db.delete(cycle)
    db.commit()
    
    return {"message": "Ciclo deletado com sucesso"}

@router.get("/stats/overview", response_model=CycleStats)
async def get_cycle_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém estatísticas gerais dos ciclos"""
    cycles = db.query(Cycle).filter(Cycle.user_id == current_user.id).all()
    
    total_cycles = len(cycles)
    completed_cycles = len([c for c in cycles if c.completed])
    interrupted_cycles = len([c for c in cycles if c.interrupted])
    
    total_focus_time = sum([c.duration for c in cycles if c.phase == "focus" and c.completed])
    total_break_time = sum([c.duration for c in cycles if c.phase in ["shortBreak", "longBreak"] and c.completed])
    
    average_duration = sum([c.duration for c in cycles if c.completed]) / completed_cycles if completed_cycles > 0 else 0
    
    # Calcular score de produtividade (0-100)
    productivity_score = 0
    if total_cycles > 0:
        completion_rate = completed_cycles / total_cycles
        focus_efficiency = total_focus_time / (total_focus_time + total_break_time) if (total_focus_time + total_break_time) > 0 else 0
        productivity_score = int((completion_rate * 0.6 + focus_efficiency * 0.4) * 100)
    
    return CycleStats(
        total_cycles=total_cycles,
        completed_cycles=completed_cycles,
        interrupted_cycles=interrupted_cycles,
        total_focus_time=total_focus_time,
        total_break_time=total_break_time,
        average_cycle_duration=average_duration,
        productivity_score=productivity_score
    )

@router.get("/stats/daily")
async def get_daily_stats(
    date: str,  # formato: YYYY-MM-DD
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém estatísticas de um dia específico"""
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de data inválido. Use YYYY-MM-DD"
        )
    
    start_date = datetime.combine(target_date, datetime.min.time())
    end_date = datetime.combine(target_date, datetime.max.time())
    
    cycles = db.query(Cycle).filter(
        Cycle.user_id == current_user.id,
        Cycle.start_time >= start_date,
        Cycle.start_time <= end_date
    ).all()
    
    return {
        "date": date,
        "total_cycles": len(cycles),
        "completed_cycles": len([c for c in cycles if c.completed]),
        "interrupted_cycles": len([c for c in cycles if c.interrupted]),
        "total_focus_time": sum([c.duration for c in cycles if c.phase == "focus" and c.completed]),
        "total_break_time": sum([c.duration for c in cycles if c.phase in ["shortBreak", "longBreak"] and c.completed]),
        "cycles": [CycleResponse.from_orm(c) for c in cycles]
    } 