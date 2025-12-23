import arrow

def to_utc_str(dt: str, location: str) -> str:
    return arrow.get(dt, tzinfo=location).to("utc").format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"

def format_time(dt: str) -> str:
    return arrow.get(dt).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
