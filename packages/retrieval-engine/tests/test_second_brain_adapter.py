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
    build_scope_filter_groups,
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


def test_case_scope_filter_groups_allow_only_global_domain_and_exact_case():
    groups = build_scope_filter_groups(case_id="CASE-A", domain="iran-tax")

    assert groups[0]["knowledge_scope"] == "GLOBAL"
    assert groups[1]["knowledge_scope"] == "DOMAIN"
    assert groups[1]["domain"] == "iran-tax"
    assert groups[2]["knowledge_scope"] == "CASE"
    assert groups[2]["case_id"] == "CASE-A"
    for group in groups:
        assert group["knowledge_status"] == "ACTIVE"
        assert group["validation_status"] == "VALIDATED"


def test_global_query_does_not_admit_case_documents():
    groups = build_scope_filter_groups(domain="iran-tax")

    assert groups == [
        {
            "knowledge_status": "ACTIVE",
            "validation_status": "VALIDATED",
            "knowledge_scope": "GLOBAL",
            "domain": "iran-tax",
        }
    ]


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


def test_pending_index_cannot_produce_citation():
    try:
        citation_from_retrieval_hit(
            {
                "source_id": "pending-index",
                "source_type": "manual",
                "title": "Pending",
                "chunk_id": "pending::c1",
                "score": 0.9,
            }
        )
    except ValueError as exc:
        assert "unresolved source" in str(exc)
    else:
        raise AssertionError("pending-index must fail closed")
