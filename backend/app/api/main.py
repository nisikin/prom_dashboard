from fastapi import APIRouter
from api.route import health
from api.route import metric
from api.route import llm
from api.route import custom



api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(metric.router)
api_router.include_router(llm.router)
api_router.include_router(custom.router)