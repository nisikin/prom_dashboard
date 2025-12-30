from models.metric import metric, metric_value
from core.config import settings
from tool.time import *
import httpx

base_url = settings.PROMETHEUS_URL + "api/v1/query"
base_url_range = settings.PROMETHEUS_URL + "api/v1/query_range"

def custom_query(query: str)-> list[metric]:
    params = {"query": query}
    r = httpx.get(base_url, params=params, timeout=None)
    if r.status_code == 200:
        try:
            data = r.json()["data"]["result"]
            metric_list = []
            for item in data:
                metric_list.append(
                    metric(
                        instance=item["metric"]["instance"],
                        job="node",
                        values=[
                            metric_value(
                                timestamp=item["value"][0],
                                value=item["value"][1],
                            )
                        ],
                    )
                )
            return metric_list
        except KeyError:
            return []
    return []

def custom_query_range(query: str, start: str, end: str, step: str) -> list[metric]:
    start = format_time(start)
    end = format_time(end)
    params = {"query": query, "start": start, "end": end, "step": step}
    r = httpx.get(base_url_range, params=params, timeout=None)
    if r.status_code == 200:
        try:
            data = r.json()["data"]["result"]
            metric_list = []
            for item in data:
                values = []
                for value in item["values"]:
                    values.append(
                        metric_value(
                            timestamp=value[0],
                            value=value[1],
                        )
                    )
                metric_list.append(
                    metric(
                        instance=item["metric"]["instance"],
                        job="node",
                        values=values,
                    )
                )
            return metric_list
        except KeyError:
            return []
    return []
