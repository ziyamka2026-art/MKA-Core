# Second Brain V1 — Case Isolation

## Scope values
- GLOBAL
- DOMAIN
- CASE
- USER
- ORGANIZATION

## Rules
1. General validated knowledge may be reusable only when its scope and provenance permit it.
2. Taxpayer, client, case and private document facts are CASE-scoped by default.
3. Retrieval must filter by authorized scope before semantic or relationship ranking.
4. Ambiguous scope is NEEDS_REVIEW, never an automatic GLOBAL classification.
5. Case-private facts must not leak into another case through embeddings, summaries, examples, prompts or generated answers.
6. Generalized lessons extracted from cases require an explicit derivation and privacy/scope decision.

## Brief Engine contract
Brief retrieval may use GLOBAL/DOMAIN knowledge plus authorized CASE knowledge. It must preserve source and scope provenance in the resulting evidence pack.
