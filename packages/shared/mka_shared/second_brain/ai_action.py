from datetime import datetime, timezone
from typing import Any, Optional
from pydantic import BaseModel, Field

class AIAction(BaseModel):
    action_id: str = Field(min_length=1)
    agent_id: str = Field(min_length=1)
    task_type: str = Field(min_length=1)
    input_refs: list[str] = Field(default_factory=list)
    source_refs: list[str] = Field(default_factory=list)
    output_ref: Optional[str] = None
    model: str = Field(min_length=1)
    prompt_version: str = Field(min_length=1)
    decision: Optional[str] = None
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    human_approval: Optional[bool] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    correlation_id: str = Field(min_length=1)
    metadata: dict[str, Any] = Field(default_factory=dict)
