from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.dependencies.current_user import get_current_user
from app.services.storage_service import StorageService

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/file", response_model=dict)
async def upload_file(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
):
    """
    Upload any file (image, PDF, etc.) to Cloudinary.
    Returns the public URL and the path.
    """
    storage = StorageService()
    try:
        url = storage.upload_image(
            file,
            folder=f"users/{current_user.id}/files",
            public_id=file.filename,
            resource_type="auto",   # Cloudinary auto‑detects
            max_size_mb=20,
        )
        return {
            "url": url,
            "path": f"users/{current_user.id}/files/{file.filename}",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/voice", response_model=dict)
async def upload_voice(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
):
    """
    Upload a voice note (audio file) to Cloudinary.
    Returns the public URL and the path.
    """
    storage = StorageService()
    try:
        url = storage.upload_image(
            file,
            folder=f"users/{current_user.id}/voice",
            public_id=file.filename,
            resource_type="auto",   # handles audio as well
            max_size_mb=20,
        )
        return {
            "url": url,
            "path": f"users/{current_user.id}/voice/{file.filename}",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))