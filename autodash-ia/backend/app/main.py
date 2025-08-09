from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import orjson

from .config import get_settings
from .database import init_db
from .routers import uploads, dashboards, plans


def orjson_dumps(v, *, default):
    return orjson.dumps(v, default=default).decode()


app = FastAPI(title="AutoDash.ia API")

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(uploads.router)
app.include_router(dashboards.router)
app.include_router(plans.router)


@app.on_event("startup")
def startup_event():
    init_db()


@app.get("/healthz")
def healthz():
    return {"ok": True}