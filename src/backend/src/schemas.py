from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

# from pydantic.fields import File


def ensure_utc(dt: datetime) -> datetime:
    """Normalize naive datetimes (e.g. SQLite 'YYYY-MM-DD HH:MM:SS') to aware UTC."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def iso(dt: datetime) -> str:
    return ensure_utc(dt).isoformat().replace("+00:00", "Z")



class PredictRequest(BaseModel):
    leaf_image: str


class PlantMatch(BaseModel):
    scientific_name: str
    common_names: List[str]
    family: str
    genus: str
    score: float
    gbif_id: Optional[str] = None
    powo_id: Optional[str] = None


class IdentificationResult(BaseModel):
    best_match: str
    top_result: PlantMatch
    remaining_requests: int


class RegisterRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=120)
    last_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    language_pref: str = "en"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=128)


class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    last_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    email: Optional[EmailStr] = None
    language_pref: Optional[str] = Field(default=None, max_length=8)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uuid: str
    first_name: str
    last_name: str
    email: str
    language_pref: str
    created_at: datetime
    updated_at: datetime


class TokenResponse(BaseModel):
    token: str
    token_type: str = "Bearer"
    user: UserOut


class ScanPayload(BaseModel):
    uuid: str
    disease: str
    confidence: float
    unsupported: bool = False
    image_key: Optional[str] = None  # server image id from a prior upload
    image_uri: Optional[str] = None  # original device path (informational)
    created_at: datetime
    updated_at: datetime
    deleted: bool = False

    @field_validator("created_at", "updated_at")
    @classmethod
    def _utc(cls, v: datetime) -> datetime:
        return ensure_utc(v)


class ScanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uuid: str
    disease: str
    confidence: float
    unsupported: bool
    image_key: Optional[str] = None
    image_uri: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted: bool = False


class SyncRequest(BaseModel):
    since: Optional[datetime] = None
    scans: List[ScanPayload] = Field(default_factory=list)

    @field_validator("since")
    @classmethod
    def _since_utc(cls, v: Optional[datetime]) -> Optional[datetime]:
        return ensure_utc(v) if v is not None else None


class SyncResponse(BaseModel):
    server_time: datetime
    scans: List[ScanOut] = Field(default_factory=list)
    conflicts: List[ScanOut] = Field(default_factory=list)


class ImageOut(BaseModel):
    image_id: str
    url: str
