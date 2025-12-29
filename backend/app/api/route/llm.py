from fastapi import APIRouter
from core.config import settings
from LLM.service import generate_PromQL
import httpx

router = APIRouter(prefix="/llm", tags=["llm"])

@router.get("/get_promql")
def get_promql(prompt: str) -> str:
    try:
        promql = generate_PromQL(prompt)
        return promql
    except Exception as e:
        return "error, please try again"

