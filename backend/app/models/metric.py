from pydantic import BaseModel

class metric_value(BaseModel):
    timestamp: float
    value: str

class metric(BaseModel):
    job: str
    instance: str
    values: list[metric_value]