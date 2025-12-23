from fastapi import APIRouter
import httpx
from core.config import settings

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/")
def health():
    return {"status": "ok"}

@router.get("/prometheus")
def prometheus():
    r = httpx.get(f"{settings.PROMETHEUS_URL}api/v1/query?query=up", timeout=None)
    return r.json()