"""Shared data models for MKA (Pydantic)."""

from datetime import datetime
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field, HttpUrl


class SourceType(str, Enum):
    GOOGLE_DRIVE = "google_drive"
    UPLOAD = "upload"
    MARKDOWN = "markdown"
    PDF = "pdf"
    DOCX = "docx"
    XLSX = "xlsx"
    PPTX = "pptx"
    HTML = "html"
    CSV = "csv"
    OCR = "ocr"
    MANUAL = "manual"


class Citation(BaseModel):
    """Provenance information for a retrieved chunk."""
    source_id: str
    source_type: SourceType
    title: str
    page: Optional[int] = None
    section: Optional[str] = None
    url: Optional[str] = None
    chunk_id: str
    score: float = Field(..., ge=0.0, le=1.0)


class RetrievedChunk(BaseModel):
    content: str
    citation: Citation
    metadata: dict[str, Any] = Field(default_factory=dict)


class RAGRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=4000)
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    top_k: int = Field(default=5, ge=1, le=20)
    filters: Optional[dict[str, Any]] = None


class RAGResponse(BaseModel):
    answer: str
    citations: list[Citation]
    model: str
    latency_ms: Optional[int] = None
    request_id: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "0.1.0"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
