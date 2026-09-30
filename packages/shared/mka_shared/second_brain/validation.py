from datetime import datetime, timezone
from pydantic import BaseModel, Field
from .enums import ValidationStatus

class Validation(BaseModel):
    status: ValidationStatus = ValidationStatus.PENDING
    method: str = Field(min_length=1)
    validator: str = Field(min_length=1)
    evidence_ids: list[str] = Field(default_factory=list)
    notes: str | None = None
    validated_at: datetime | None = None

    def mark_validated(self) -> "Validation":
        self.status = ValidationStatus.VALIDATED
        self.validated_at = datetime.now(timezone.utc)
        return self
