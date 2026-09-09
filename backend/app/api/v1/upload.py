from fastapi import APIRouter, UploadFile, File, HTTPException, status
from typing import List
from app.services.upload_service import save_job_image, save_project_image

router = APIRouter(prefix="/api/uploads", tags=["Uploads"])

# ============================================================
# JOB UPLOAD
# ============================================================

@router.post("/job")
async def upload_job_image(file: UploadFile = File(...)):
    """Upload a job image to Cloudinary"""
    try:
        url = await save_job_image(file)
        return {
            "url": url,
            "message": "Image uploaded successfully to Cloudinary"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# PROJECT UPLOADS
# ============================================================

@router.post("/project/single")
async def upload_project_single_image(file: UploadFile = File(...)):
    """Upload a single project image to Cloudinary"""
    try:
        url = await save_project_image(file)
        return {
            "url": url,
            "message": "Image uploaded successfully to Cloudinary"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/project/multiple")
async def upload_project_multiple_images(files: List[UploadFile] = File(...)):
    """Upload multiple project images to Cloudinary"""
    try:
        urls = []
        for file in files:
            url = await save_project_image(file)
            urls.append(url)
        
        return {
            "urls": urls,
            "message": "Images uploaded successfully to Cloudinary"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))