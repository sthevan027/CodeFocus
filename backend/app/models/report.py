from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_type = Column(String, nullable=False)  # daily, weekly, monthly, custom
    report_date = Column(DateTime(timezone=True), nullable=False)
    
    # Estatísticas
    total_cycles = Column(Integer, default=0)
    completed_cycles = Column(Integer, default=0)
    interrupted_cycles = Column(Integer, default=0)
    total_focus_time = Column(Integer, default=0)  # em minutos
    total_break_time = Column(Integer, default=0)  # em minutos
    
    # Dados detalhados
    cycles_data = Column(JSON, default=[])  # Lista de ciclos do período
    productivity_score = Column(Integer, default=0)  # Score de 0-100
    
    # Configurações do relatório
    include_git_data = Column(Boolean, default=True)
    include_statistics = Column(Boolean, default=True)
    include_charts = Column(Boolean, default=True)
    
    # Arquivo gerado
    file_path = Column(String)  # Caminho do arquivo gerado
    file_size = Column(Integer)  # Tamanho em bytes
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos
    user = relationship("User", back_populates="reports") 