# Second Brain V1 — Ingestion Protocol

## Pipeline
1. Discover source.
2. Acquire an immutable source/version reference.
3. Parse and normalize.
4. Register metadata and provenance.
5. Classify type, domain, and scope.
6. Extract entities, legal references, dates, facts and evidence references.
7. Detect duplicates, relationships, and possible conflicts.
8. Run validation.
9. Publish ACTIVE only when required validation succeeds.
10. Otherwise retain the item as NEEDS_REVIEW or an appropriate non-active status.

## Reuse existing MKA-Core
The protocol is implemented conceptually around the existing Google Drive Sync, Document Parser, Knowledge Manager, Embedding Service, Vector DB and Retrieval Engine. SB-01 does not introduce a second ingestion stack.

## Fail-closed conditions
Unreadable or incomplete source, missing provenance, uncertain scope, unresolved contradiction, untrusted origin, or pending validation must not be silently promoted to active knowledge.

## Provenance
Each ingestion records source type, source identifier, source version, origin URI when available, processing timestamps, processor version, and parent/derivation references.

## Duplicate and conflict handling
Potential duplicates should be linked rather than silently duplicated. Conflicting sources remain visible and carry their respective versions and validation states.
