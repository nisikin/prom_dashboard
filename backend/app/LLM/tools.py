import httpx
from core.config import settings


def get_all_metrics() -> dict:
    base_url = settings.PROMETHEUS_URL + "api/v1/query"
    query = 'count by (__name__)({__name__=~".+"})'
    params = {"query": query}
    r = httpx.get(base_url, params=params, timeout=None)
    if r.status_code == 200:
        try:
            data = r.json()["data"]["result"]
            metric_list = []
            for item in data:
                name = item["metric"]["__name__"]
                if name.startswith("node_"):
                    metric_list.append({"name": name})
            return {"metrics": metric_list}
        except KeyError:
            return {}
    return {}



tools = [
    {
        "type": "function",
        "function": {
            "name": "get_all_metrics",
            "description": "List all available Prometheus metrics exported by node_exporter in the current system, including their types and descriptions.",
            "parameters": {"type": "object", "properties": {}},
        },
    }
]
