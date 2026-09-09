import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from dotenv import load_dotenv

load_dotenv()

# ============================================================
# CLOUDINARY CONFIGURATION
# ============================================================

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

# ============================================================
# JOB IMAGE FUNCTIONS
# ============================================================

async def save_job_image(file: UploadFile) -> str:
    """Upload job image to Cloudinary and return URL"""
    result = cloudinary.uploader.upload(
        file.file,
        folder="jobs",
        resource_type="image"
    )
    return result["secure_url"]  # Returns the Cloudinary URL

def delete_job_image(public_id: str):
    """Delete job image from Cloudinary"""
    cloudinary.uploader.destroy(public_id)

# ============================================================
# PROJECT IMAGE FUNCTIONS
# ============================================================

async def save_project_image(file: UploadFile) -> str:
    """Upload project image to Cloudinary and return URL"""
    result = cloudinary.uploader.upload(
        file.file,
        folder="projects",
        resource_type="image"
    )
    return result["secure_url"]  # Returns the Cloudinary URL

def delete_project_image(public_id: str):
    """Delete project image from Cloudinary"""
    cloudinary.uploader.destroy(public_id)