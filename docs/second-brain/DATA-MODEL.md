# Second Brain V1 — Data Model

## KnowledgeItem
- id
- type
- title
- content
- summary
- domain
- scope
- source_id
- source_version
- status
- confidence
- created_at
- updated_at

## Entity
- id
- type
- canonical_name
- display_name
- attributes
- knowledge_item_ids[]

## Evidence
- id
- source_id
- document_id
- chunk_id
- page
- section
- text_span
- content_hash

## Relationship
- id
- from_entity_id
- relationship_type
- to_entity_id
- evidence_ids[]
- confidence
- status

## Provenance
- source_type
- source_id
- source_version
- origin_uri
- ingested_at
- processed_at
- processor_version
- parent_id

## Validation
- status
- method
- validator
- evidence_ids[]
- notes
- validated_at

## AIAction
- action_id
- agent_id
- task_type
- input_refs[]
- source_refs[]
- output_ref
- model
- prompt_version
- decision
- confidence
- human_approval
- timestamp
- correlation_id

## Integrity requirements
Every consequential knowledge item must be traceable to source/version and evidence. A relationship must be explainable by evidence or an explicit derivation record. AI output is not validated knowledge merely because it is stored.
