from __future__ import annotations

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
import pandas as pd
import io
import json

from ..deps import get_current_user
from ..database import get_db
from .. import models, schemas
from ..services import openai_service
from ..services.plan_limits import can_create_dashboard
from ..config import get_settings


router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@router.post("", response_model=schemas.UploadResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    settings = get_settings()
    # Size check (Streaming may be used in production; here we read in-memory for MVP)
    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.max_upload_mb:
        raise HTTPException(status_code=400, detail=f"Arquivo excede {settings.max_upload_mb} MB")

    if not can_create_dashboard(db, user):
        raise HTTPException(status_code=403, detail="Limites do plano atingidos")

    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Formato não suportado. Use .csv ou .xlsx")
    except Exception:
        raise HTTPException(status_code=400, detail="Falha ao ler o arquivo")

    # Build schema summary
    columns = []
    for col in df.columns.tolist():
        sample_values = df[col].dropna().astype(str).head(5).tolist()
        dtype = str(df[col].dtype)
        columns.append({"name": col, "dtype": dtype, "samples": sample_values})

    schema_summary = {
        "num_rows": int(len(df)),
        "columns": columns,
    }

    # Save upload metadata
    upload = models.Upload(
        user_id=user.id,
        filename=file.filename,
        file_size=len(contents),
        content_type=file.content_type or "application/octet-stream",
        num_rows=len(df),
        columns_json=json.dumps(columns, ensure_ascii=False),
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)

    # Generate charts via OpenAI
    chart_config = openai_service.generate_chart_config(schema_summary)
    title = chart_config.get("title", "Dashboard")

    dashboard = models.Dashboard(
        user_id=user.id,
        upload_id=upload.id,
        title=title,
        charts_json=json.dumps(chart_config.get("charts", []), ensure_ascii=False),
        is_active=True,
    )
    db.add(dashboard)
    db.commit()
    db.refresh(dashboard)

    return {"dashboard": dashboard}