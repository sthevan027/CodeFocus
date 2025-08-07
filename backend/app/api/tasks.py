from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.user import User
from ..models.task import Task
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse
from ..auth.dependencies import get_current_active_user

router = APIRouter(prefix="/tasks", tags=["tarefas"])


@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    completed: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lista todas as tarefas do usuário com filtros opcionais"""
    query = db.query(Task).filter(Task.user_id == current_user.id)
    
    # Aplicar filtros
    if search:
        query = query.filter(Task.title.contains(search) | Task.description.contains(search))
    
    if tags:
        # Filtrar por tags (assumindo que tags são armazenadas como JSON array)
        for tag in tags:
            query = query.filter(Task.tags.contains(tag))
    
    if completed is not None:
        query = query.filter(Task.completed == completed)
    
    # Ordenar por data de criação (mais recentes primeiro)
    query = query.order_by(Task.created_at.desc())
    
    # Aplicar paginação
    tasks = query.offset(skip).limit(limit).all()
    
    return [TaskResponse.from_orm(task) for task in tasks]


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtém uma tarefa específica"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada"
        )
    
    return TaskResponse.from_orm(task)


@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Cria uma nova tarefa"""
    task = Task(
        **task_data.dict(),
        user_id=current_user.id
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return TaskResponse.from_orm(task)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Atualiza uma tarefa existente"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada"
        )
    
    # Atualizar apenas os campos fornecidos
    update_data = task_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    task.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(task)
    
    return TaskResponse.from_orm(task)


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Deleta uma tarefa"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada"
        )
    
    db.delete(task)
    db.commit()
    
    return {"message": "Tarefa deletada com sucesso"}


@router.post("/{task_id}/toggle")
async def toggle_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Alterna o status de conclusão de uma tarefa"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada"
        )
    
    task.completed = not task.completed
    task.completed_at = datetime.utcnow() if task.completed else None
    task.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(task)
    
    return TaskResponse.from_orm(task)


@router.get("/stats/summary")
async def get_task_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtém estatísticas das tarefas do usuário"""
    total_tasks = db.query(Task).filter(Task.user_id == current_user.id).count()
    completed_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.completed == True
    ).count()
    pending_tasks = total_tasks - completed_tasks
    
    # Tarefas criadas hoje
    today = datetime.utcnow().date()
    tasks_today = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.created_at >= today
    ).count()
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "tasks_created_today": tasks_today,
        "completion_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    }