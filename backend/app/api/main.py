from fastapi import APIRouter
from api.route import health
from api.route import metric



api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(metric.router)