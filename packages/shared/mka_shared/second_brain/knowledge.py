from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, model_validator
from .enums import KnowledgeLevel, KnowledgeScope, KnowledgeStatus

class KnowledgeItem(BaseModel):
    id: str = Field(min_length=1)
    type: str = Field(min_length=1)
    title: str = Field(min_length=1)
    content: str = Field(min_length=1)
    summary: Optional[str] = None
    domain: str = Field(min_length=1)
    scope: KnowledgeScope
    case_id: Optional[str] = None
    source_id: str = Field(min_length=1)
    source_version: Optional[str] = None
    status: KnowledgeStatus = KnowledgeStatus.RAW
    level: KnowledgeLevel = KnowledgeLevel.OBSERVATION
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @model_validator(mode="after")
    def validate_scope(self):
        if self.scope == KnowledgeScope.CASE and not self.case_id:
            raise ValueError("case_id is required for CASE-scoped knowledge")
        if self.scope != KnowledgeScope.CASE and self.case_id:
            raise ValueError("case_id is only allowed for CASE-scoped knowledge")
        if self.status == KnowledgeStatus.ACTIVE and self.level == KnowledgeLevel.OBSERVATION:
            raise ValueError("ACTIVE knowledge cannot remain at OBSERVATION level")
        return self
