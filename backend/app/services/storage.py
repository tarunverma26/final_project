import os
import re
import uuid
import base64
import logging
from typing import Optional, Tuple
from pathlib import Path
from app.config import (
    S3_BUCKET, S3_REGION, S3_ENDPOINT_URL,
    AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
    S3_PUBLIC_BASE_URL, UPLOAD_DIR, BASE_URL
)

logger = logging.getLogger("roadwatch.storage")

# Optional Boto3 S3 Client initialization
_s3_client = None
if S3_BUCKET and AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
    try:
        import boto3
        _s3_client = boto3.client(
            "s3",
            region_name=S3_REGION,
            endpoint_url=S3_ENDPOINT_URL or None,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        )
        logger.info(f"[Storage] S3 object storage initialized for bucket: {S3_BUCKET}")
    except Exception as e:
        logger.warning(f"[Storage] Failed to initialize S3 client: {e}. Falling back to local storage.")


def is_base64_data_url(val: Optional[str]) -> bool:
    """Check if input string is a base64 data URL."""
    if not val or not isinstance(val, str):
        return False
    return bool(re.match(r"^data:image/[a-zA-Z0-9.+-]+;base64,", val.strip()))


def parse_base64_image(data_url: str) -> Tuple[bytes, str, str]:
    """
    Parse a base64 image data URL.
    Returns: (image_bytes, extension, mime_type)
    """
    match = re.match(r"^data:(image/([a-zA-Z0-9.+-]+));base64,(.+)$", data_url.strip(), re.DOTALL)
    if match:
        mime = match.group(1)
        ext = match.group(2).lower()
        if ext == "jpeg":
            ext = "jpg"
        raw_b64 = match.group(3)
        img_bytes = base64.b64decode(raw_b64)
        return img_bytes, ext, mime

    # Fallback if raw base64 string
    img_bytes = base64.b64decode(data_url)
    return img_bytes, "jpg", "image/jpeg"


def save_file(file_bytes: bytes, filename: str, content_type: str = "image/jpeg") -> str:
    """
    Save image bytes to S3 object storage if configured, or local static uploads directory.
    Returns clean accessible URL.
    """
    # 1. Upload to S3 if configured
    if _s3_client and S3_BUCKET:
        try:
            _s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=filename,
                Body=file_bytes,
                ContentType=content_type,
                CacheControl="public, max-age=31536000",
            )
            if S3_PUBLIC_BASE_URL:
                return f"{S3_PUBLIC_BASE_URL.rstrip('/')}/{filename}"
            if S3_ENDPOINT_URL:
                return f"{S3_ENDPOINT_URL.rstrip('/')}/{S3_BUCKET}/{filename}"
            return f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{filename}"
        except Exception as e:
            logger.error(f"[Storage] S3 upload error: {e}. Storing locally.")

    # 2. Local filesystem storage
    local_path = UPLOAD_DIR / filename
    local_path.write_bytes(file_bytes)

    # Return relative URL that FastAPI mounts at /uploads
    if BASE_URL:
        return f"{BASE_URL}/uploads/{filename}"
    return f"/uploads/{filename}"


def save_base64_image(data_url: str, prefix: str = "report") -> str:
    """
    Convert base64 data URL into an uploaded file, saving only clean URL in MongoDB.
    """
    file_bytes, ext, mime = parse_base64_image(data_url)
    filename = f"{prefix}_{uuid.uuid4().hex[:12]}.{ext}"
    return save_file(file_bytes, filename, content_type=mime)


def get_image_base64(photo_url: str) -> Optional[str]:
    """Retrieve raw base64 string of an image given its URL or local path for AI vision inspection."""
    if not photo_url:
        return None
    if is_base64_data_url(photo_url):
        # Extract base64 part
        m = re.match(r"^data:image/[a-zA-Z0-9.+-]+;base64,(.+)$", photo_url.strip(), re.DOTALL)
        return m.group(1) if m else photo_url

    # If it's a local upload
    if "/uploads/" in photo_url:
        filename = photo_url.split("/uploads/")[-1]
        local_file = UPLOAD_DIR / filename
        if local_file.exists():
            return base64.b64encode(local_file.read_bytes()).decode("utf-8")

    # If it's an external HTTP/S3 URL
    if photo_url.startswith("http://") or photo_url.startswith("https://"):
        try:
            import httpx
            with httpx.Client(timeout=8.0) as client_http:
                resp = client_http.get(photo_url)
                if resp.status_code == 200:
                    return base64.b64encode(resp.content).decode("utf-8")
        except Exception as e:
            logger.warning(f"[Storage] Could not fetch remote image for AI vision: {e}")

    return None
