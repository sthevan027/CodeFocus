from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Any, List


class PlanOut(BaseModel):
    id: int
    name: str
    active_dashboard_limit: int
    total_dashboard_limit: int

    class Config:
        from_attributes = True


class DashboardOut(BaseModel):
    id: int
    title: str
    charts_json: str
    is_active: bool

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    dashboard: DashboardOut


class ErrorResponse(BaseModel):
    detail: str = Field(...)