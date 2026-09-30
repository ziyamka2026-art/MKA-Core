"""Second Brain integration boundary for the Retrieval Engine.

This module contains policy/adapter logic only. It does not create a second
RAG stack and does not own persistence.
"""

from __future__ import annotations

from typing import Any

from mka_shared.models import Citation, SourceType
from mka_shared.second_brain.enums import (
    KnowledgeScope,
    KnowledgeStatus,
    ValidationStatus,
)
from mka_shared.second_brain.evidence import Evidence
from mka_shared.second_brain.knowledge import KnowledgeItem
from mka_shared.second_brain.provenance import Provenance
from mka_shared.second_brain.validation import Validation


def knowledge_to_retrieval_metadata(
    knowledge: KnowledgeItem,
    validation: Validation,
    provenance: Provenance,
    evidence: Evidence | None = None,
) -> dict[str, Any]:
    """Flatten SB metadata into the existing Retrieval Engine record contract."""

    if validation.status != ValidationStatus.VALIDATED:
        raise ValueError(
            f"Knowledge item {knowledge.id} is not validated: {validation.status}"
        )
    if knowledge.status != KnowledgeStatus.ACTIVE:
        raise ValueError(
            f"Knowledge item {knowledge.id} is not retrieval-eligible: {knowledge.status}"
        )

    metadata: dict[str, Any] = {
        "knowledge_id": knowledge.id,
        "knowledge_type": knowledge.type,
        "knowledge_scope": knowledge.scope.value,
        "knowledge_status": knowledge.status.value,
        "knowledge_level": knowledge.level.value,
        "validation_status": validation.status.value,
        "domain": knowledge.domain,
        "source_version": knowledge.source_version,
        "provenance_source_type": provenance.source_type,
        "provenance_source_id": provenance.source_id,
        "provenance_origin_uri": (
            str(provenance.origin_uri) if provenance.origin_uri else None
        ),
    }
    if knowledge.scope == KnowledgeScope.CASE:
        metadata["case_id"] = knowledge.case_id
    if evidence:
        metadata.update(
            {
                "evidence_id": evidence.id,
                "evidence_document_id": evidence.document_id,
                "evidence_chunk_id": evidence.chunk_id,
                "evidence_content_hash": evidence.content_hash,
            }
        )
    return metadata


def build_scope_filter_groups(
    *,
    case_id: str | None = None,
    domain: str | None = None,
) -> list[dict[str, Any]]:
    """Build equality-filter groups for the current VectorStore.

    For a case request, three permitted retrieval scopes are represented as
    separate queries because the current store has no OR operator:
    GLOBAL, DOMAIN, and the exact CASE. Callers must merge/rerank the results.
    """

    trusted = {
        "knowledge_status": KnowledgeStatus.ACTIVE.value,
        "validation_status": ValidationStatus.VALIDATED.value,
    }

    if not case_id:
        result = [{**trusted, "knowledge_scope": KnowledgeScope.GLOBAL.value}]
        if domain:
            result[0]["domain"] = domain
        return result

    groups = [{**trusted, "knowledge_scope": KnowledgeScope.GLOBAL.value}]
    if domain:
        groups.append(
            {
                **trusted,
                "knowledge_scope": KnowledgeScope.DOMAIN.value,
                "domain": domain,
            }
        )
    groups.append(
        {
            **trusted,
            "knowledge_scope": KnowledgeScope.CASE.value,
            "case_id": case_id,
        }
    )
    return groups


def is_retrieval_eligible(
    record: dict[str, Any],
    *,
    requested_case_id: str | None = None,
) -> bool:
    """Fail closed when Second Brain metadata is absent or untrusted."""

    if record.get("validation_status") != ValidationStatus.VALIDATED.value:
        return False
    if record.get("knowledge_status") != KnowledgeStatus.ACTIVE.value:
        return False

    scope = record.get("knowledge_scope")
    allowed_scopes = {member.value for member in KnowledgeScope}
    if scope not in allowed_scopes:
        return False

    if scope == KnowledgeScope.CASE:
        record_case_id = record.get("case_id")
        if not record_case_id or (
            requested_case_id is not None and record_case_id != requested_case_id
        ):
            return False

    return True


def citation_from_retrieval_hit(hit: dict[str, Any]) -> Citation:
    """Convert an existing retrieval hit to the project's existing Citation."""

    source_type_raw = hit.get("source_type", SourceType.MANUAL.value)
    try:
        source_type = SourceType(source_type_raw)
    except ValueError:
        source_type = SourceType.MANUAL

    source_id = hit.get("source_id")
    chunk_id = hit.get("chunk_id")
    if not source_id or not chunk_id or source_id == "pending-index":
        raise ValueError("unresolved source cannot produce a citation")

    return Citation(
        source_id=str(source_id),
        source_type=source_type,
        title=str(hit.get("title") or "Untitled source"),
        page=hit.get("page"),
        section=hit.get("section"),
        url=hit.get("url"),
        chunk_id=str(chunk_id),
        score=max(0.0, min(1.0, float(hit.get("score", 0.0)))),
    )
