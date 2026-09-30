from enum import Enum
from pydantic import BaseModel, Field

class RelationshipType(str, Enum):
    DERIVED_FROM = "DERIVED_FROM"
    SUPPORTS = "SUPPORTS"
    CONTRADICTS = "CONTRADICTS"
    REFERENCES = "REFERENCES"
    AMENDS = "AMENDS"
    SUPERSEDES = "SUPERSEDES"
    APPLIES_TO = "APPLIES_TO"
    PART_OF = "PART_OF"
    RELATED_TO = "RELATED_TO"
    SIMILAR_TO = "SIMILAR_TO"

class Relationship(BaseModel):
    id: str = Field(min_length=1)
    from_entity_id: str = Field(min_length=1)
    relationship_type: RelationshipType
    to_entity_id: str = Field(min_length=1)
    evidence_ids: list[str] = Field(default_factory=list)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    status: str = Field(default="ACTIVE", min_length=1)
