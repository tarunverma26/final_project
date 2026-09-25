import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from app.services.storage import save_file
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/upload", tags=["Media Upload"])

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/jpg"
}


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """
    Upload an image file to object storage (or local disk).
    Returns permanent URL to save in reports or profile.
    """
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{content_type}'. Please upload a valid image (JPEG, PNG, WEBP)."
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum permitted limit of 10 MB."
        )

    # Determine safe extension
    original_ext = file.filename.split(".")[-1].lower() if file.filename and "." in file.filename else "jpg"
    safe_ext = original_ext if original_ext in ("jpg", "jpeg", "png", "webp", "gif") else "jpg"
    unique_filename = f"report_{uuid.uuid4().hex[:12]}.{safe_ext}"

    url = save_file(content, unique_filename, content_type=content_type)
    return {
        "url": url,
        "filename": unique_filename,
        "content_type": content_type,
        "size": len(content),
    }
