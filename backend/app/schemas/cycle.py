from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CycleBase(BaseModel):
    name: str
    duration: int
    phase: str  # focus, shortBreak, longBreak

class CycleCreate(CycleBase):
    git_commit: Optional[str] = None
    git_files: Optional[str] = None  # JSON string

class CycleUpdate(BaseModel):
    name: Optional[str] = None
    completed: Optional[bool] = None
    interrupted: Optional[bool] = None
    git_commit: Optional[str] = None
    git_files: Optional[str] = None
    end_time: Optional[datetime] = None

class CycleResponse(CycleBase):
    id: int
    user_id: int
    completed: bool
    interrupted: bool
    git_commit: Optional[str] = None
    git_files: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CycleStats(BaseModel):
    total_cycles: int
    completed_cycles: int
    interrupted_cycles: int
    total_focus_time: int  # em minutos
    total_break_time: int  # em minutos
    average_cycle_duration: float
    productivity_score: int  # 0-100 