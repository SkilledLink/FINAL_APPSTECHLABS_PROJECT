# app/api/v1/professional_payments.py

from uuid import UUID

from fastapi import APIRouter, HTTPException, status as http_status

from app.api.deps_payments import (
    ActiveUser,
    AdminUser,
    CurrentProfessional,
    PaymentServiceDep,
    TierServiceDep,
)
from app.schemas.professional_payment import (
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    PaymentRefundRequest,
    ProfessionalPaymentAdminListResponse,
    ProfessionalPaymentAdminResponse,
    ProfessionalPaymentListResponse,
    ProfessionalPaymentResponse,
)

router = APIRouter(
    prefix="/api/v1/professional-payments",
    tags=["professional-payments"],
)


# ─── INITIATE ───────────────────────────────────────────────────
@router.post(
    "/initiate",
    response_model=PaymentInitiateResponse,
    status_code=http_status.HTTP_201_CREATED,
)
def initiate_payment(
    payload: PaymentInitiateRequest,
    professional: CurrentProfessional,
    current_user: ActiveUser,
    payment_service: PaymentServiceDep,
    tier_service: TierServiceDep,
) -> PaymentInitiateResponse:
    tier = tier_service.get_tier(payload.tier_id)

    payment, provider_info = payment_service.initiate_payment(
        user=current_user,
        professional=professional,
        tier=tier,
        provider_name=payload.provider,
        payment_method=payload.payment_method,
        phone_number=payload.phone_number,
        description=payload.description,
    )

    return PaymentInitiateResponse(
        payment_id=payment.id,
        reference=payment.reference,
        amount=payment.amount,
        currency=payment.currency,
        provider=payment.provider,
        status=payment.status,
        instructions=provider_info.get("instructions"),
        message=provider_info.get("message"),
    )


# ─── MY PAYMENTS ────────────────────────────────────────────────
@router.get("/me", response_model=ProfessionalPaymentListResponse)
def list_my_payments(
    professional: CurrentProfessional,
    service: PaymentServiceDep,
    skip: int = 0,
    limit: int = 20,
) -> ProfessionalPaymentListResponse:
    items, total = service.repo.list_for_professional(
        professional.id, skip=skip, limit=limit
    )
    return ProfessionalPaymentListResponse(
        items=[ProfessionalPaymentResponse.model_validate(p) for p in items],
        total=total,
        page=skip // limit + 1 if limit else 1,
        size=limit,
    )


@router.get("/{payment_id}", response_model=ProfessionalPaymentResponse)
def get_my_payment(
    payment_id: UUID,
    current_user: ActiveUser,
    service: PaymentServiceDep,
) -> ProfessionalPaymentResponse:
    payment = service.get_payment(payment_id)
    if payment.user_id != current_user.id and not getattr(
        current_user, "is_admin", False
    ):
        raise HTTPException(http_status.HTTP_403_FORBIDDEN, "Not your payment")
    return ProfessionalPaymentResponse.model_validate(payment)


# ─── CANCEL ─────────────────────────────────────────────────────
@router.post(
    "/{payment_id}/cancel",
    response_model=ProfessionalPaymentResponse,
)
def cancel_my_payment(
    payment_id: UUID,
    current_user: ActiveUser,
    service: PaymentServiceDep,
) -> ProfessionalPaymentResponse:
    payment = service.get_payment(payment_id)
    if payment.user_id != current_user.id:
        raise HTTPException(http_status.HTTP_403_FORBIDDEN, "Not your payment")
    updated = service.cancel_payment(
        payment_id,
        reason="Cancelled by user",
        actor_user_id=current_user.id,
        actor_role="user",
    )
    return ProfessionalPaymentResponse.model_validate(updated)


# ─── ADMIN ──────────────────────────────────────────────────────
@router.get(
    "/admin/all",
    response_model=ProfessionalPaymentAdminListResponse,
)
def admin_list_payments(
    admin: AdminUser,
    service: PaymentServiceDep,
    professional_id: UUID | None = None,
    skip: int = 0,
    limit: int = 50,
) -> ProfessionalPaymentAdminListResponse:
    if professional_id:
        items, total = service.repo.list_for_professional(
            professional_id, skip=skip, limit=limit
        )
    else:
        items, total = service.repo.list_all(skip=skip, limit=limit)

    return ProfessionalPaymentAdminListResponse(
        items=[
            ProfessionalPaymentAdminResponse.model_validate(p) for p in items
        ],
        total=total,
        page=skip // limit + 1 if limit else 1,
        size=limit,
    )


@router.post(
    "/admin/{payment_id}/refund",
    response_model=ProfessionalPaymentResponse,
)
def admin_refund_payment(
    payment_id: UUID,
    payload: PaymentRefundRequest,
    admin: AdminUser,
    service: PaymentServiceDep,
) -> ProfessionalPaymentResponse:
    updated = service.mark_refunded(
        payment_id,
        reason=payload.reason,
        actor_user_id=admin.id,
    )
    return ProfessionalPaymentResponse.model_validate(updated)