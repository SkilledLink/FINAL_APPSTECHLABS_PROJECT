# app/sockets/__init__.py
from app.sockets.server import sio
from app.sockets import connection  # noqa: F401  registers connect/disconnect
from app.sockets import events  # noqa: F401  registers event handlers

__all__ = ["sio"]