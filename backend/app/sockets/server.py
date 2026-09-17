# app/sockets/server.py
import socketio

from app.core.config import settings


def _parse_origins(raw: str) -> list[str]:
    return [o.strip() for o in raw.split(",") if o.strip()]


sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=_parse_origins(settings.SOCKET_CORS_ORIGINS),
    cors_credentials=True,
    logger=settings.environment.lower() == "development",
    engineio_logger=False,
    ping_interval=25,
    ping_timeout=20,
)