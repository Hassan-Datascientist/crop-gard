"""Image storage backend: Cloudinary when configured, local disk otherwise.

Render's filesystem is ephemeral, so the deployed service uses Cloudinary for
persistent image storage. Local disk keeps `uv run` development dependency-free.
"""
import asyncio
import uuid
from io import BytesIO
from pathlib import Path

import cloudinary
import cloudinary.uploader
import cloudinary.utils

from .config import settings

if settings.cloudinary_enabled:
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_secret,
        secure=True,
    )


async def store_image(content: bytes) -> tuple[str, str]:
    """Persist image bytes and return ``(image_key, public_url)``."""
    if settings.cloudinary_enabled:
        result = await asyncio.to_thread(
            cloudinary.uploader.upload,
            BytesIO(content),
            folder=settings.cloudinary_folder,
            resource_type="image",
            overwrite=True,
        )
        return result["public_id"], result["secure_url"]

    image_key = f"{uuid.uuid4()}.jpg"
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    (upload_dir / image_key).write_bytes(content)
    return image_key, f"/api/images/{image_key}"


def public_url(image_key: str) -> str:
    """Map a stored image key back to a publicly viewable URL."""
    if settings.cloudinary_enabled:
        return cloudinary.utils.cloudinary_url(image_key)[0]
    return f"/api/images/{image_key}"


def local_path(image_key: str) -> Path:
    return Path(settings.upload_dir) / image_key
