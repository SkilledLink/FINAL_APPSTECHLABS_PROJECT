from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.services.upload_service import save_job_image

router = APIRouter(prefix="/api/uploads", tags=["Uploads"])

@router.post("/job")
async def upload_job_image(file: UploadFile = File(...)):
    """Upload a job image"""
    try:
        filename = await save_job_image(file)
        return {
            "filename": filename,
            "url": f"/uploads/jobs/{filename}",
            "message": "Image uploaded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))