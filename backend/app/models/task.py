from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Informações da tarefa
    title = Column(String(255), nullable=False)
    description = Column(Text)
    tags = Column(JSON, default=list)  # Lista de tags
    
    # Status
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True))
    
    # Relacionamento com ciclo (opcional)
    cycle_id = Column(Integer, ForeignKey("cycles.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    user = relationship("User", back_populates="tasks")
    cycle = relationship("Cycle", back_populates="tasks")