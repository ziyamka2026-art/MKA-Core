# Second Brain V1 — Governance and Contracts

Status: SB-01 Governance and Contracts
Branch: proposal/second-brain-v1

## Goal
Establish a governed, source-based Second Brain for MKA that supports legal, tax, case, research, evidence, relationship, and AI-provenance workflows.

## Scope
This version defines governance, lifecycle, provenance, evidence, validation, relationships, case isolation, AI-action provenance, and integration contracts.

## Non-goals
- No replacement of the existing Knowledge Manager.
- No independent RAG implementation.
- No independent graph database in V1.
- No business-logic rewrite.
- No private Google Drive mutation.
- No assumption that storage implies legal validity.

## Architecture
Sources -> Intake -> Document Parser -> Knowledge Manager -> Metadata/Provenance -> Embedding/Retrieval -> Second Brain -> Legal/Case/Brief Engines.

Existing MKA-Core components are reused wherever possible.

## Principles
1. Source-based and citation-first.
2. Auditable and versioned.
3. Fail-closed under uncertainty.
4. Explicit scope and strict case isolation.
5. Human-in-the-loop for consequential validation.
6. Reuse existing MKA-Core capabilities.
7. Domain-specific legal/tax concepts are adapters, not hard-coded core assumptions.

## Lifecycle
RAW -> ANALYZED -> LINKED -> VALIDATED -> ACTIVE -> SUPERSEDED -> ARCHIVED.

Unclear, conflicting, incomplete, unreadable, or untrusted material enters NEEDS_REVIEW and is not silently promoted to ACTIVE.

## Knowledge levels
OBSERVATION -> KNOWLEDGE -> VALIDATED_KNOWLEDGE -> CASE_LESSON.

## V1 acceptance criteria
- Contracts for all Second Brain entities are documented.
- Existing ingestion, parsing, knowledge and retrieval components are reused.
- Provenance is mandatory for registered knowledge.
- Scope is explicit for knowledge and evidence.
- AI actions are reconstructible and auditable.
- Case-private information cannot become GLOBAL through ambiguous classification.
- No production business logic is changed by SB-01.
