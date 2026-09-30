from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, HttpUrl

class Provenance(BaseModel):
    source_type: str = Field(min_length=1)
    source_id: str = Field(min_length=1)
    source_version: Optional[str] = None
    origin_uri: Optional[HttpUrl] = None
    ingested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    processed_at: Optional[datetime] = None
    processor_version: Optional[str] = None
    parent_id: Optional[str] = None
