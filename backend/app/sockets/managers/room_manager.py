# app/sockets/managers/room_manager.py
from uuid import UUID


def user_room(user_id: UUID | str) -> str:
    return f"user:{user_id}"


def conversation_room(conversation_id: UUID | str) -> str:
    return f"conversation:{conversation_id}"