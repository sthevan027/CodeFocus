from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class Cycle(Base):
    __tablename__ = "cycles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)  # Nome do ciclo (ex: "Refatorar API Login")
    duration = Column(Integer, nullable=False)  # Duração em minutos
    phase = Column(String, nullable=False)  # focus, shortBreak, longBreak
    completed = Column(Boolean, default=False)
    interrupted = Column(Boolean, default=False)
    git_commit = Column(String)  # Mensagem do commit se aplicável
    git_files = Column(Text)  # Lista de arquivos modificados (JSON)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos
    user = relationship("User", back_populates="cycles") 