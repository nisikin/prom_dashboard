from fastapi import APIRouter
from tool.time import to_utc_str
from core.config import settings
from models.metric import metric
import httpx

router = APIRouter(prefix="/metric", tags=["metric"])


@router.get("/average_cpu_usage")
def average_cpu_useage() -> list[metric]:
    from query.cpu import average_cpu_useage as a_c_u

    return a_c_u()


@router.get("/average_cpu_usage_range")
def average_cpu_usage_range(start: str, end: str, step: str) -> list[metric]:
    from query.cpu import average_cpu_usage_range as a_c_u_r

    print(start, end, step)
    start = to_utc_str(start, settings.LOCATION)
    end = to_utc_str(end, settings.LOCATION)
    return a_c_u_r(start, end, step)
