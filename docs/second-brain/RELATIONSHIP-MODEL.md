# Second Brain V1 — Relationship Model

## Generic relationships
- DERIVED_FROM
- SUPPORTS
- CONTRADICTS
- REFERENCES
- AMENDS
- SUPERSEDES
- APPLIES_TO
- PART_OF
- RELATED_TO
- SIMILAR_TO

## Legal/tax examples
- LAW -> ARTICLE
- LAW -> CIRCULAR
- CIRCULAR -> ARTICLE
- CASE -> LAW
- CASE -> CIRCULAR
- CASE -> DOCUMENT
- CASE -> ISSUE
- ISSUE -> ARGUMENT
- ARGUMENT -> EVIDENCE
- CASE -> PRECEDENT

## V1 storage decision
Relationships are structured metadata records in the existing metadata/storage layer. A dedicated graph database is explicitly deferred until scale or query complexity demonstrates a need.

Every consequential relationship should carry evidence references, confidence and status where applicable.
