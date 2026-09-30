import pytest
from pydantic import ValidationError
from mka_shared.second_brain import KnowledgeItem, KnowledgeScope, KnowledgeStatus, KnowledgeLevel
from mka_shared.second_brain.relationship import Relationship, RelationshipType


def test_case_scope_requires_case_id():
    with pytest.raises(ValidationError):
        KnowledgeItem(id="k1", type="case_fact", title="x", content="x", domain="tax", scope=KnowledgeScope.CASE, source_id="s1")


def test_global_scope_rejects_case_id():
    with pytest.raises(ValidationError):
        KnowledgeItem(id="k1", type="law", title="x", content="x", domain="tax", scope=KnowledgeScope.GLOBAL, case_id="c1", source_id="s1")


def test_active_observation_is_fail_closed():
    with pytest.raises(ValidationError):
        KnowledgeItem(id="k1", type="law", title="x", content="x", domain="tax", scope=KnowledgeScope.GLOBAL, source_id="s1", status=KnowledgeStatus.ACTIVE, level=KnowledgeLevel.OBSERVATION)


def test_relationship_contract():
    r = Relationship(id="r1", from_entity_id="e1", relationship_type=RelationshipType.SUPPORTS, to_entity_id="e2", confidence=0.9)
    assert r.relationship_type == RelationshipType.SUPPORTS
