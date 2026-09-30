from mka_shared.second_brain.evidence import Evidence
from mka_shared.second_brain.knowledge import KnowledgeItem
from mka_shared.second_brain.provenance import Provenance
from mka_shared.second_brain.validation import Validation

from mka_shared.second_brain.enums import (
    KnowledgeLevel,
    KnowledgeScope,
    KnowledgeStatus,
    ValidationStatus,
)
from app.second_brain_adapter import (
    build_scope_filters,
    citation_from_retrieval_hit,
    is_retrieval_eligible,
    knowledge_to_retrieval_metadata,
)


def make_knowledge(**overrides):
    data = {
        "id": "k-1",
        "type": "law",
        "title": "Test law",
        "content": "content",
        "domain": "iran-tax",
        "scope": KnowledgeScope.GLOBAL,
        "source_id": "src-1",
        "status": KnowledgeStatus.ACTIVE,
        "level": KnowledgeLevel.KNOWLEDGE,
    }
    data.update(overrides)
    return KnowledgeItem(**data)


def test_validated_active_knowledge_maps_to_retrieval_metadata():
    knowledge = make_knowledge()
    validation = Validation(
        status=ValidationStatus.VALIDATED,
        method="human_review",
        validator="reviewer-1",
    )
    provenance = Provenance(source_type="manual", source_id="src-1")
    evidence = Evidence(
        id="ev-1",
        source_id="src-1",
        chunk_id="src-1::c1",
        content_hash="hash",
    )

    metadata = knowledge_to_retrieval_metadata(
        knowledge, validation, provenance, evidence
    )

    assert metadata["knowledge_id"] == "k-1"
    assert metadata["knowledge_scope"] == "GLOBAL"
    assert metadata["validation_status"] == "VALIDATED"
    assert metadata["evidence_id"] == "ev-1"


def test_unvalidated_knowledge_is_rejected():
    knowledge = make_knowledge()
    validation = Validation(
        status=ValidationStatus.PENDING,
        method="pipeline",
        validator="agent",
    )
    provenance = Provenance(source_type="manual", source_id="src-1")

    try:
        knowledge_to_retrieval_metadata(knowledge, validation, provenance)
    except ValueError as exc:
        assert "not validated" in str(exc)
    else:
        raise AssertionError("unvalidated knowledge must fail closed")


def test_case_scope_requires_exact_case_filter():
    filters = build_scope_filters(case_id="CASE-A", domain="iran-tax")

    assert filters["case_id"] == "CASE-A"
    assert filters["knowledge_status"] == "ACTIVE"
    assert filters["validation_status"] == "VALIDATED"


def test_global_query_does_not_admit_case_documents():
    filters = build_scope_filters(domain="iran-tax")

    assert filters["knowledge_scope"] == "GLOBAL"
    assert "case_id" not in filters


def test_case_b_is_not_eligible_for_case_a_by_policy():
    case_b = {
        "knowledge_scope": "CASE",
        "case_id": "CASE-B",
        "knowledge_status": "ACTIVE",
        "validation_status": "VALIDATED",
    }
    assert is_retrieval_eligible(case_b)
    assert case_b["case_id"] != "CASE-A"


def test_invalid_conflicting_and_superseded_are_not_eligible():
    for status in ("INVALID", "CONFLICTING", "SUPERSEDED", "NEEDS_REVIEW", "PENDING"):
        record = {
            "knowledge_scope": "GLOBAL",
            "knowledge_status": "ACTIVE",
            "validation_status": status,
        }
        assert not is_retrieval_eligible(record)


def test_unknown_scope_fails_closed():
    record = {
        "knowledge_scope": "UNKNOWN",
        "knowledge_status": "ACTIVE",
        "validation_status": "VALIDATED",
    }
    assert not is_retrieval_eligible(record)


def test_existing_citation_contract_is_preserved():
    citation = citation_from_retrieval_hit(
        {
            "source_id": "src-1",
            "source_type": "manual",
            "title": "Source",
            "chunk_id": "src-1::c1",
            "score": 0.82,
        }
    )

    assert citation.source_id == "src-1"
    assert citation.chunk_id == "src-1::c1"
    assert citation.score == 0.82
