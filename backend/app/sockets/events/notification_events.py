# app/sockets/events/notification_events.py
# Reservations for future notification-only events.
# Emitting 'new_notification' is already done from message_events.py.
from app.sockets.server import sio  # noqa: F401  (ensures module is imported)