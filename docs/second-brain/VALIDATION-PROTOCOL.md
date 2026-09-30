# Second Brain V1 — Validation Protocol

Storage is not legal validation.

## Validation principles
- Claims must be supported by identifiable evidence.
- Source version and status must remain visible.
- Conflicting material must not be silently collapsed.
- Superseded material must not be presented as current without qualification.
- Consequential legal/tax conclusions require human review where configured by policy.

## Outcomes
- VALIDATED
- UNVALIDATED
- CONFLICTING
- SUPERSEDED
- NEEDS_REVIEW

## Minimum validation record
A validation record contains validator, method, evidence references, notes, timestamp and source/version context.

## Retrieval behavior
Answers and evidence packs must distinguish validated, unvalidated, conflicting and superseded sources. When required evidence is missing or contradictory, the system should fail closed and request review rather than invent certainty.
