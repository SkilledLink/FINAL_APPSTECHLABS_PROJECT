import os
import shutil
from fastapi import UploadFile
from datetime import datetime
import uuid

UPLOAD_DIR = "uploads"
JOB_UPLOAD_DIR = "uploads/jobs"

def ensure_upload_dirs():
    """Create upload directories if they don't exist"""
    os.makedirs(JOB_UPLOAD_DIR, exist_ok=True)

async def save_job_image(file: UploadFile) -> str:
    """Save job image and return filename"""
    ensure_upload_dirs()
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}{file_extension}"
    file_path = os.path.join(JOB_UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return unique_filename

def delete_job_image(filename: str):
    """Delete job image"""
    file_path = os.path.join(JOB_UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return True
    return False

def get_job_image_url(filename: str):
    """Get URL to access the file"""
    return f"/uploads/jobs/{filename}"