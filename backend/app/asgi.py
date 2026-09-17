# app/asgi.py
"""
ASGI entrypoint: FastAPI REST + Socket.IO mounted at /socket.io.

Run the app with:
    uvicorn app.asgi:application --host 0.0.0.0 --port 8000
"""
import socketio

from app.core.config import settings
from app.main import app  # existing FastAPI app — untouched
from app.sockets import sio  # imports handlers as a side effect

application = socketio.ASGIApp(
    sio,
    other_asgi_app=app,
    socketio_path=settings.SOCKET_PATH,  # default "socket.io"
)