from typing import Any
from pydantic import BaseModel, Field

class Entity(BaseModel):
    id: str = Field(min_length=1)
    type: str = Field(min_length=1)
    canonical_name: str = Field(min_length=1)
    display_name: str = Field(min_length=1)
    attributes: dict[str, Any] = Field(default_factory=dict)
    knowledge_item_ids: list[str] = Field(default_factory=list)
