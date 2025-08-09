from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Upload(Base):
    __tablename__ = "uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    dashboard_id = Column(Integer, ForeignKey("dashboards.id"))
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_size = Column(Float)  # em MB
    file_type = Column(String)  # csv, xlsx
    columns_info = Column(JSON)  # Informações sobre as colunas
    row_count = Column(Integer)
    status = Column(String, default="processing")  # processing, completed, failed
    error_message = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos
    user = relationship("User", backref="uploads")
    dashboard = relationship("Dashboard", back_populates="uploads")