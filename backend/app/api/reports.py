from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import json
import os
from ..database import get_db
from ..models.user import User
from ..models.cycle import Cycle
from ..models.report import Report
from ..schemas.report import ReportCreate, ReportResponse, ReportGenerate
from ..auth.dependencies import get_current_active_user

router = APIRouter(prefix="/reports", tags=["relatórios"])

@router.post("/generate", response_model=ReportResponse)
async def generate_report(
    report_data: ReportGenerate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Gera um novo relatório"""
    # Buscar ciclos no período
    cycles = db.query(Cycle).filter(
        Cycle.user_id == current_user.id,
        Cycle.start_time >= report_data.start_date,
        Cycle.start_time <= report_data.end_date
    ).all()
    
    # Calcular estatísticas
    total_cycles = len(cycles)
    completed_cycles = len([c for c in cycles if c.completed])
    interrupted_cycles = len([c for c in cycles if c.interrupted])
    total_focus_time = sum([c.duration for c in cycles if c.phase == "focus" and c.completed])
    total_break_time = sum([c.duration for c in cycles if c.phase in ["shortBreak", "longBreak"] and c.completed])
    
    # Calcular score de produtividade
    productivity_score = 0
    if total_cycles > 0:
        completion_rate = completed_cycles / total_cycles
        focus_efficiency = total_focus_time / (total_focus_time + total_break_time) if (total_focus_time + total_break_time) > 0 else 0
        productivity_score = int((completion_rate * 0.6 + focus_efficiency * 0.4) * 100)
    
    # Criar relatório
    report = Report(
        user_id=current_user.id,
        report_type=report_data.report_type,
        report_date=report_data.start_date,
        total_cycles=total_cycles,
        completed_cycles=completed_cycles,
        interrupted_cycles=interrupted_cycles,
        total_focus_time=total_focus_time,
        total_break_time=total_break_time,
        productivity_score=productivity_score,
        include_git_data=report_data.include_git_data,
        include_statistics=report_data.include_statistics,
        include_charts=report_data.include_charts,
        cycles_data=[{
            "id": c.id,
            "name": c.name,
            "duration": c.duration,
            "phase": c.phase,
            "completed": c.completed,
            "interrupted": c.interrupted,
            "git_commit": c.git_commit,
            "start_time": c.start_time.isoformat(),
            "end_time": c.end_time.isoformat() if c.end_time else None
        } for c in cycles]
    )
    
    db.add(report)
    db.commit()
    db.refresh(report)
    
    # Gerar arquivo do relatório
    file_path = await generate_report_file(report, report_data.format)
    report.file_path = file_path
    report.file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
    
    db.commit()
    db.refresh(report)
    
    return ReportResponse.from_orm(report)

@router.get("/", response_model=List[ReportResponse])
async def get_reports(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista todos os relatórios do usuário"""
    reports = db.query(Report).filter(
        Report.user_id == current_user.id
    ).order_by(Report.created_at.desc()).offset(skip).limit(limit).all()
    
    return [ReportResponse.from_orm(report) for report in reports]

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém um relatório específico"""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relatório não encontrado"
        )
    
    return ReportResponse.from_orm(report)

@router.delete("/{report_id}")
async def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deleta um relatório"""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relatório não encontrado"
        )
    
    # Deletar arquivo se existir
    if report.file_path and os.path.exists(report.file_path):
        os.remove(report.file_path)
    
    db.delete(report)
    db.commit()
    
    return {"message": "Relatório deletado com sucesso"}

async def generate_report_file(report: Report, format: str) -> str:
    """Gera o arquivo do relatório"""
    # Criar diretório de relatórios se não existir
    reports_dir = "reports"
    os.makedirs(reports_dir, exist_ok=True)
    
    filename = f"report_{report.id}_{report.report_date.strftime('%Y%m%d')}.{format}"
    file_path = os.path.join(reports_dir, filename)
    
    if format == "txt":
        await generate_txt_report(report, file_path)
    elif format == "json":
        await generate_json_report(report, file_path)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de relatório não suportado"
        )
    
    return file_path

async def generate_txt_report(report: Report, file_path: str):
    """Gera relatório em formato TXT"""
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(f"📅 CodeFocus – Relatório {report.report_date.strftime('%d/%m/%Y')}\n")
        f.write("=" * 50 + "\n\n")
        
        f.write("📊 ESTATÍSTICAS GERAIS\n")
        f.write(f"Total de ciclos: {report.total_cycles}\n")
        f.write(f"Ciclos completados: {report.completed_cycles}\n")
        f.write(f"Ciclos interrompidos: {report.interrupted_cycles}\n")
        f.write(f"Tempo total de foco: {report.total_focus_time}min\n")
        f.write(f"Tempo total de pausa: {report.total_break_time}min\n")
        f.write(f"Score de produtividade: {report.productivity_score}%\n\n")
        
        f.write("📝 CICLOS DETALHADOS\n")
        for cycle_data in report.cycles_data:
            status = "✅" if cycle_data["completed"] else "🔁" if cycle_data["interrupted"] else "⏸️"
            f.write(f"{status} {cycle_data['name']} – {cycle_data['duration']}min\n")
            if cycle_data["git_commit"]:
                f.write(f"   Commit: {cycle_data['git_commit']}\n")
        
        f.write(f"\nGerado em: {datetime.utcnow().strftime('%d/%m/%Y %H:%M:%S')}\n")

async def generate_json_report(report: Report, file_path: str):
    """Gera relatório em formato JSON"""
    report_data = {
        "report_id": report.id,
        "report_type": report.report_type,
        "report_date": report.report_date.isoformat(),
        "statistics": {
            "total_cycles": report.total_cycles,
            "completed_cycles": report.completed_cycles,
            "interrupted_cycles": report.interrupted_cycles,
            "total_focus_time": report.total_focus_time,
            "total_break_time": report.total_break_time,
            "productivity_score": report.productivity_score
        },
        "cycles": report.cycles_data,
        "generated_at": datetime.utcnow().isoformat()
    }
    
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2, ensure_ascii=False) 