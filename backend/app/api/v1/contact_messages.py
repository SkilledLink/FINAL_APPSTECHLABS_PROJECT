from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.database.session import get_session
from app.api.v1.professional_admin import require_admin
from app.schemas.contact_messages import (
    ContactMessageCreate,
    ContactMessageRead,
    ContactMessageReply,
)
from app.services.contact_messages_services import ContactMessageService


router = APIRouter(
    prefix="/contact-messages",
    tags=["Contact Messages"],
)


@router.post(
    "",
    response_model=ContactMessageRead,
    status_code=status.HTTP_201_CREATED,
)
def create_contact_message(
    data: ContactMessageCreate,
    session: Session = Depends(get_session),
):
    service = ContactMessageService(session)
    return service.create_message(data)


@router.get(
    "",
    response_model=list[ContactMessageRead],
)
def get_contact_messages(
    session: Session = Depends(get_session),
    _: object = Depends(require_admin),
):
    service = ContactMessageService(session)
    return service.repo.get_all()


@router.get(
    "/{message_id}",
    response_model=ContactMessageRead,
)
def get_contact_message(
    message_id: int,
    session: Session = Depends(get_session),
    _: object = Depends(require_admin),
):
    service = ContactMessageService(session)
    return service.get_message(message_id)


@router.patch(
    "/{message_id}/read",
    response_model=ContactMessageRead,
)
def mark_contact_message_as_read(
    message_id: int,
    session: Session = Depends(get_session),
    _: object = Depends(require_admin),
):
    service = ContactMessageService(session)
    return service.mark_as_read(message_id)


@router.post(
    "/{message_id}/reply",
    response_model=ContactMessageRead,
)
def reply_to_contact_message(
    message_id: int,
    data: ContactMessageReply,
    session: Session = Depends(get_session),
    _: object = Depends(require_admin),
):
    service = ContactMessageService(session)
    return service.reply_to_message(message_id, data.reply)
