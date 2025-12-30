from models.metric import metric,metric_value
from core.config import settings
from tool.time import *
import httpx

base_url = settings.PROMETHEUS_URL + "api/v1/query"
base_url_range = settings.PROMETHEUS_URL + "api/v1/query_range"

def average_network_receive_speed() -> list[metric]:
    query = 'rate(node_network_receive_bytes_total[1m])'
    params = {"query": query}

    r = httpx.get(base_url, params=params, timeout=None)
    if r.status_code == 200:
        try:
            data = r.json()["data"]["result"]
            metric_list = []

            for item in data:
                metric_list.append(
                    metric(
                        instance=item["metric"].get("instance", ""),
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

def average_network_receive_speed_range(start: str, end: str, step: str) -> list[metric]:
    start = format_time(start)
    end = format_time(end)
    query = 'rate(node_network_receive_bytes_total[1m])'
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
                        instance=item["metric"].get("instance", ""),
                        job="node",
                        values=values,
                    )
                )

            return metric_list
        except KeyError:
            return []

    return []

def average_network_send_speed() -> list[metric]:
    query = 'rate(node_network_transmit_bytes_total[1m])'
    params = {"query": query}

    r = httpx.get(base_url, params=params, timeout=None)
    if r.status_code == 200:
        try:
            data = r.json()["data"]["result"]
            metric_list = []

            for item in data:
                metric_list.append(
                    metric(
                        instance=item["metric"].get("instance", ""),
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

def average_network_send_speed_range(start: str, end: str, step: str) -> list[metric]:
    start = format_time(start)
    end = format_time(end)
    query = 'rate(node_network_transmit_bytes_total[1m])'
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
                        instance=item["metric"].get("instance", ""),
                        job="node",
                        values=values,
                    )
                )

            return metric_list
        except KeyError:
            return []

    return []

def average_network_drop_speed() -> list[metric]:
    query = (
        'rate(node_network_receive_drop_total[1m]) + '
        'rate(node_network_transmit_drop_total[1m])'
    )
    params = {"query": query}

    r = httpx.get(base_url, params=params, timeout=None)
    if r.status_code != 200:
        return []

    try:
        results = r.json().get("data", {}).get("result", [])
        metric_list = []

        for item in results:
            value_data = item.get("value", [0, "0"])
            timestamp = value_data[0]
            value = max(0, float(value_data[1]))
            metric_list.append(
                metric(
                    instance=item.get("metric", {}).get("instance", ""),
                    job=item.get("metric", {}).get("job", "node"),
                    values=[metric_value(timestamp=timestamp, value=value)]
                )
            )
        return metric_list
    except (KeyError, IndexError, TypeError, ValueError):
        return []


def average_network_drop_speed_range(start: str, end: str, step: str) -> list[metric]:
    start = format_time(start)
    end = format_time(end)
    query = (
        'rate(node_network_receive_drop_total[1m]) + '
        'rate(node_network_transmit_drop_total[1m])'
    )
    params = {"query": query, "start": start, "end": end, "step": step}

    r = httpx.get(base_url_range, params=params, timeout=None)
    if r.status_code != 200:
        return []

    try:
        results = r.json().get("data", {}).get("result", [])
        metric_list = []

        for item in results:
            values = []
            for v in item.get("values", []):
                timestamp = v[0]
                value = max(0, float(v[1]))
                values.append(metric_value(timestamp=timestamp, value=value))

            metric_list.append(
                metric(
                    instance=item.get("metric", {}).get("instance", ""),
                    job=item.get("metric", {}).get("job", "node"),
                    values=values
                )
            )
        return metric_list
    except (KeyError, IndexError, TypeError, ValueError):
        return []
