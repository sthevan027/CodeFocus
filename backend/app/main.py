from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .models import user, cycle, settings, report
from .api import auth, cycles, settings as settings_api, reports

# Criar tabelas
user.Base.metadata.create_all(bind=engine)
cycle.Base.metadata.create_all(bind=engine)
settings.Base.metadata.create_all(bind=engine)
report.Base.metadata.create_all(bind=engine)

# Criar aplicação FastAPI
app = FastAPI(
    title="CodeFocus API",
    description="API para o aplicativo CodeFocus - Produtividade Dev no Ritmo do Código",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas
app.include_router(auth.router, prefix="/api")
app.include_router(cycles.router, prefix="/api")
app.include_router(settings_api.router, prefix="/api")
app.include_router(reports.router, prefix="/api")

@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "message": "CodeFocus API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Verificação de saúde da API"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 