from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.services.auth import auth_service
from app.services.data_processor import data_processor
from app.services.openai_service import openai_service
from app.models import Upload, User
from app.schemas.upload import UploadResponse, DataAnalysis
import os
import uuid
from typing import Optional

router = APIRouter()


async def get_current_user_from_header(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Extrai e valida o usuário do header de autorização"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token não fornecido"
        )
    
    token = authorization.replace("Bearer ", "")
    user = await auth_service.get_current_user(token, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    return user


@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_header)
):
    """Faz upload de arquivo CSV ou Excel"""
    
    # Valida tipo de arquivo
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ["csv", "xlsx", "xls"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de arquivo não suportado. Use CSV ou Excel."
        )
    
    # Valida tamanho do arquivo
    file_size_mb = len(await file.read()) / (1024 * 1024)
    await file.seek(0)  # Reset file pointer
    
    if file_size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Arquivo muito grande. Máximo permitido: {settings.MAX_UPLOAD_SIZE_MB}MB"
        )
    
    # Salva arquivo temporariamente
    file_id = str(uuid.uuid4())
    file_path = os.path.join("uploads", f"{file_id}.{file_extension}")
    
    try:
        # Salva arquivo
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Cria registro no banco
        db_upload = Upload(
            user_id=current_user.id,
            filename=f"{file_id}.{file_extension}",
            original_filename=file.filename,
            file_size=file_size_mb,
            file_type=file_extension,
            status="processing"
        )
        db.add(db_upload)
        db.commit()
        db.refresh(db_upload)
        
        # Processa arquivo
        df, metadata = await data_processor.process_file(file_path, file_extension)
        
        # Atualiza registro com metadados
        db_upload.columns_info = metadata["columns"]
        db_upload.row_count = metadata["row_count"]
        db_upload.status = "completed"
        db.commit()
        
        return UploadResponse.from_orm(db_upload)
        
    except Exception as e:
        # Em caso de erro, atualiza status
        if db_upload:
            db_upload.status = "failed"
            db_upload.error_message = str(e)
            db.commit()
        
        # Remove arquivo se existir
        if os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar arquivo: {str(e)}"
        )


@router.get("/upload/{upload_id}/analyze", response_model=DataAnalysis)
async def analyze_upload(
    upload_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_header)
):
    """Analisa os dados do upload e sugere visualizações"""
    
    # Busca upload
    upload = db.query(Upload).filter(
        Upload.id == upload_id,
        Upload.user_id == current_user.id
    ).first()
    
    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload não encontrado"
        )
    
    if upload.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Upload ainda está sendo processado"
        )
    
    try:
        # Carrega dados
        file_path = os.path.join("uploads", upload.filename)
        df, _ = await data_processor.process_file(file_path, upload.file_type)
        
        # Pega amostra dos dados
        sample_data = data_processor.get_sample_data(df)
        
        # Analisa com IA
        suggested_charts = await openai_service.analyze_data_and_suggest_charts(
            columns=upload.columns_info,
            sample_data=sample_data,
            row_count=upload.row_count
        )
        
        return DataAnalysis(
            columns=upload.columns_info,
            row_count=upload.row_count,
            sample_data=sample_data,
            suggested_charts=suggested_charts
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao analisar dados: {str(e)}"
        )