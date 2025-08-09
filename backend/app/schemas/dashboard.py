from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any


class ChartConfig(BaseModel):
    type: str  # bar, line, pie, doughnut, radar, etc
    title: str
    data_field: str
    label_field: Optional[str] = None
    options: Optional[Dict[str, Any]] = None


class DashboardBase(BaseModel):
    title: str
    description: Optional[str] = None


class DashboardCreate(DashboardBase):
    charts_config: List[ChartConfig]
    data_source: str


class DashboardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    charts_config: Optional[List[ChartConfig]] = None


class Dashboard(DashboardBase):
    id: int
    user_id: int
    is_active: bool
    charts_config: List[Dict[str, Any]]
    data_source: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class DashboardWithData(Dashboard):
    data: Optional[List[Dict[str, Any]]] = None