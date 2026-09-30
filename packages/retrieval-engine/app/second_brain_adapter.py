"""Second Brain integration boundary for the Retrieval Engine.

This module deliberately contains policy/adapter logic only. It does not create
a second RAG stack and does not own persistence.
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


TRUSTED_KNOWLEDGE_STATUSES = frozenset(
    {KnowledgeStatus.VALIDATED, KnowledgeStatus.ACTIVE}
)
BLOCKED_VALIDATION_STATUSES = frozenset(
    {
        ValidationStatus.INVALID,
        ValidationStatus.CONFLICTING,
        ValidationStatus.SUPERSEDED,
        ValidationStatus.NEEDS_REVIEW,
        ValidationStatus.PENDING,
    }
)


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
    if knowledge.status not in TRUSTED_KNOWLEDGE_STATUSES:
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


def build_scope_filters(
    *,
    case_id: str | None = None,
    domain: str | None = None,
) -> dict[str, Any]:
    """Build conservative top-level filters for the existing VectorStore.

    The current VectorStore uses equality filters. Case-aware retrieval therefore
    indexes scope/case fields as top-level record fields.
    """

    filters: dict[str, Any] = {
        "knowledge_status": KnowledgeStatus.ACTIVE.value,
        "validation_status": ValidationStatus.VALIDATED.value,
    }

    if domain:
        filters["domain"] = domain

    if case_id:
        # The current store cannot express OR directly. The adapter returns the
        # exact CASE filter and callers should execute the permitted GLOBAL/DOMAIN
        # fallback queries separately, then merge/rerank them.
        filters["case_id"] = case_id
    else:
        filters["knowledge_scope"] = KnowledgeScope.GLOBAL.value

    return filters


def is_retrieval_eligible(record: dict[str, Any]) -> bool:
    """Fail closed when Second Brain metadata is absent or untrusted."""

    if record.get("validation_status") != ValidationStatus.VALIDATED.value:
        return False
    if record.get("knowledge_status") != KnowledgeStatus.ACTIVE.value:
        return False

    scope = record.get("knowledge_scope")
    if scope not in {scope.value for scope in KnowledgeScope}:
        return False

    if scope == KnowledgeScope.CASE and not record.get("case_id"):
        return False

    return True


def citation_from_retrieval_hit(hit: dict[str, Any]) -> Citation:
    """Convert an existing retrieval hit to the project's existing Citation."""

    source_type_raw = hit.get("source_type", SourceType.MANUAL.value)
    try:
        source_type = SourceType(source_type_raw)
    except ValueError:
        source_type = SourceType.MANUAL

    return Citation(
        source_id=str(hit.get("source_id") or "unresolved"),
        source_type=source_type,
        title=str(hit.get("title") or "Untitled source"),
        page=hit.get("page"),
        section=hit.get("section"),
        url=hit.get("url"),
        chunk_id=str(hit.get("chunk_id") or "unresolved"),
        score=max(0.0, min(1.0, float(hit.get("score", 0.0)))),
    )
