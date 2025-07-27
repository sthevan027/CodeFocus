from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ReportBase(BaseModel):
    report_type: str  # daily, weekly, monthly, custom
    report_date: datetime
    include_git_data: bool = True
    include_statistics: bool = True
    include_charts: bool = True

class ReportCreate(ReportBase):
    user_id: int

class ReportResponse(ReportBase):
    id: int
    user_id: int
    
    # Estatísticas
    total_cycles: int
    completed_cycles: int
    interrupted_cycles: int
    total_focus_time: int  # em minutos
    total_break_time: int  # em minutos
    productivity_score: int  # Score de 0-100
    
    # Dados detalhados
    cycles_data: List[Dict[str, Any]] = []
    
    # Arquivo gerado
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    
    created_at: datetime

    class Config:
        from_attributes = True

class ReportGenerate(BaseModel):
    report_type: str
    start_date: datetime
    end_date: datetime
    include_git_data: bool = True
    include_statistics: bool = True
    include_charts: bool = True
    format: str = "txt"  # txt, pdf, json 