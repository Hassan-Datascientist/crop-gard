from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..database import get_db
from ..deps import get_current_user
from ..models import Scan, User
from ..schemas import (
    ImageOut,
    ScanOut,
    SyncRequest,
    SyncResponse,
    ensure_utc,
)
from ..storage import local_path, public_url, store_image

router = APIRouter(prefix="/api", tags=["sync"])

ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def _scan_out(scan: Scan) -> ScanOut:
    return ScanOut(
        uuid=scan.uuid,
        disease=scan.disease,
        confidence=scan.confidence,
        unsupported=scan.unsupported,
        image_key=scan.image_key,
        image_uri=scan.image_uri,
        image_url=public_url(scan.image_key) if scan.image_key else None,
        created_at=scan.created_at,
        updated_at=scan.updated_at,
        deleted=scan.deleted_at is not None,
    )


@router.post("/sync", response_model=SyncResponse)
async def sync(
    payload: SyncRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Bidirectional, last-write-wins sync of a user's scan history.

    The client pushes its local scans (upserted by ``uuid``). The server then
    returns every scan it has that was updated after ``since`` (including
    tombstones) so the client can pull remote changes. ``conflicts`` lists
    scans where the server already held a newer version than the push.
    """
    conflicts: list[Scan] = []

    for inc in payload.scans:
        existing = await db.scalar(
            select(Scan).where(Scan.user_id == user.id, Scan.uuid == inc.uuid)
        )
        incoming_updated = ensure_utc(inc.updated_at)

        if existing is None:
            db.add(
                Scan(
                    uuid=inc.uuid,
                    user_id=user.id,
                    image_key=inc.image_key,
                    image_uri=inc.image_uri,
                    disease=inc.disease,
                    confidence=inc.confidence,
                    unsupported=inc.unsupported,
                    created_at=ensure_utc(inc.created_at),
                    updated_at=incoming_updated,
                    deleted_at=incoming_updated if inc.deleted else None,
                )
            )
        elif incoming_updated >= ensure_utc(existing.updated_at):
            existing.image_key = inc.image_key
            existing.image_uri = inc.image_uri
            existing.disease = inc.disease
            existing.confidence = inc.confidence
            existing.unsupported = inc.unsupported
            existing.updated_at = incoming_updated
            existing.deleted_at = incoming_updated if inc.deleted else None
        else:
            # Server holds a newer revision; surface it so the client can reconcile.
            conflicts.append(existing)

    # Pull: everything changed on the server since the client's last sync.
    query = select(Scan).where(Scan.user_id == user.id)
    if payload.since is not None:
        query = query.where(Scan.updated_at > ensure_utc(payload.since))
    query = query.order_by(Scan.updated_at.desc())
    pulled = (await db.scalars(query)).all()

    await db.commit()

    return SyncResponse(
        server_time=datetime.now(timezone.utc),
        scans=[_scan_out(s) for s in pulled],
        conflicts=[_scan_out(c) for c in conflicts],
    )


@router.post("/images", response_model=ImageOut, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    ext = (Path(file.filename or "").suffix or ".jpg").lower()
    if ext not in ALLOWED_IMAGE_EXTS:
        ext = ".jpg"

    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file")

    image_id, url = await store_image(content)
    return ImageOut(image_id=image_id, url=url)


@router.get("/images/{image_id:path}")
async def get_image(
    image_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    owned = await db.scalar(
        select(Scan.id).where(Scan.user_id == user.id, Scan.image_key == image_id)
    )
    if owned is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    if settings.cloudinary_enabled:
        return RedirectResponse(public_url(image_id))

    path = local_path(image_id)
    if not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    return FileResponse(path)
