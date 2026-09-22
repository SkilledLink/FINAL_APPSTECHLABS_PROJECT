# app/sockets/__init__.py
from app.sockets.server import sio
from app.sockets import connection  # noqa: F401  registers connect/disconnect
from app.sockets import events  # noqa: F401  registers event handlers
from app.sockets.events import call_events  # noqa: F401

__all__ = ["sio"]