from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Prometheus Dashboard"
    SERVER_PORT: int = 8000
    PROMETHEUS_URL: str = "http://10005480di8ni.vicp.fun/"
    LOCATION: str = "Asia/Shanghai"
    DEV: bool = False

    ZAI_API_KEY: str = "your-api-key"


settings = Settings()
