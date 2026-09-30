from typing import Optional
from pydantic import BaseModel, Field

class Evidence(BaseModel):
    id: str = Field(min_length=1)
    source_id: str = Field(min_length=1)
    document_id: Optional[str] = None
    chunk_id: Optional[str] = None
    page: Optional[int] = Field(default=None, ge=1)
    section: Optional[str] = None
    text_span: Optional[str] = None
    content_hash: str = Field(min_length=1)
