from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any, List


class UploadResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: float
    file_type: str
    columns_info: Optional[Dict[str, Any]] = None
    row_count: Optional[int] = None
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class DataAnalysis(BaseModel):
    columns: List[Dict[str, str]]  # {name, type}
    row_count: int
    sample_data: List[Dict[str, Any]]
    suggested_charts: List[Dict[str, Any]]