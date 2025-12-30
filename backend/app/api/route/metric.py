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

#memory metrics
@router.get("/average_memory_usage")
def average_memory_usage() -> list[metric]:
    from query.memory import average_memory_usage as a_m_u
    return a_m_u()

@router.get("/average_memory_usage_range")
def average_memory_usage_range(start: str, end: str, step: str) -> list[metric]:
    from query.memory import average_memory_usage_range as a_m_u_r
    start = to_utc_str(start, settings.LOCATION)
    end = to_utc_str(end, settings.LOCATION)
    return a_m_u_r(start, end, step)

#disk metrics
@router.get("/average_disk_usage")
def average_disk_usage() -> list[metric]:
    from query.disk import average_disk_usage as a_d_u
    return a_d_u()

@router.get("/average_disk_usage_range")
def average_disk_usage_range(start: str, end: str, step: str) -> list[metric]:
    from query.disk import average_disk_usage_range as a_d_u_r
    start = to_utc_str(start, settings.LOCATION)
    end = to_utc_str(end, settings.LOCATION)
    return a_d_u_r(start, end, step)

#network metrics
@router.get("/average_network_receive_speed")
def average_network_receive_speed() -> list[metric]:
    from query.network import average_network_receive_speed as a_n_r_s
    return a_n_r_s()

@router.get("/average_network_receive_speed_range")
def average_network_receive_speed_range(start: str, end: str, step: str) -> list[metric]:
    from query.network import average_network_receive_speed_range as a_n_r_s_r
    start = to_utc_str(start, settings.LOCATION)
    end = to_utc_str(end, settings.LOCATION)
    return a_n_r_s_r(start, end, step)

@router.get("/average_network_send_speed")
def average_network_send_speed() -> list[metric]:
    from query.network import average_network_send_speed as a_n_s_s
    return a_n_s_s()

@router.get("/average_network_send_speed_range")
def average_network_send_speed_range(start: str, end: str, step: str) -> list[metric]:
    from query.network import average_network_send_speed_range as a_n_s_s_r
    start = to_utc_str(start, settings.LOCATION)
    end = to_utc_str(end, settings.LOCATION)
    return a_n_s_s_r(start, end, step)

@router.get("/average_network_drop_speed")
def average_network_drop_speed() -> list[metric]:
    from query.network import average_network_drop_speed as a_n_d_r
    return a_n_d_r()

@router.get("/average_network_drop_speed_range")
def average_network_drop_speed_range(start: str, end: str, step: str) -> list[metric]:
    from query.network import average_network_drop_speed_range as a_n_d_r_r
    start = to_utc_str(start, settings.LOCATION)
    end = to_utc_str(end, settings.LOCATION)
    return a_n_d_r_r(start, end, step)