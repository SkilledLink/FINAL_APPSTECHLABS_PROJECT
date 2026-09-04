from fastapi import APIRouter, Depends
from app.dependencies.current_user import get_current_user
from app.services.storage_service import StorageService
from app.schemas.upload import UploadUrlRequest, UploadUrlResponse

router = APIRouter(prefix="/uploads", tags=["uploads"])

@router.post("/voice", response_model=UploadUrlResponse)
def get_voice_upload_url(
    data: UploadUrlRequest,
    current_user = Depends(get_current_user)
):
    storage = StorageService()
    upload_url, path = storage.generate_upload_url(
        str(current_user.id),   # <-- .id
        data.file_name,
        data.content_type,
        folder="voice"
    )
    public_url = storage.get_public_url(path)
    return UploadUrlResponse(upload_url=upload_url, path=path, public_url=public_url)

@router.post("/file", response_model=UploadUrlResponse)
def get_file_upload_url(
    data: UploadUrlRequest,
    current_user = Depends(get_current_user)
):
    storage = StorageService()
    upload_url, path = storage.generate_upload_url(
        str(current_user.id),   # <-- .id
        data.file_name,
        data.content_type,
        folder="files"
    )
    public_url = storage.get_public_url(path)
    return UploadUrlResponse(upload_url=upload_url, path=path, public_url=public_url)