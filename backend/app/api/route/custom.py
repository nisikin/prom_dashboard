from fastapi import APIRouter
from models.metric import metric
from query.custom import custom_query
from tool.time import to_utc_str
from core.config import settings


router = APIRouter(prefix="/custom", tags=["custom"])


@router.get("/custom_query")
def custom_query_endpoint(query: str) -> list[metric]:
    return custom_query(query)


@router.get("/custom_query_range")
def custom_query_range_endpoint(
    query: str, start: str, end: str, step: str
) -> list[metric]:
    start = to_utc_str(start, settings.LOCATION)
    end = to_utc_str(end, settings.LOCATION)
    return custom_query(query, start, end, step)
