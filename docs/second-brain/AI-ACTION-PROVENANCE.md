# Second Brain V1 — AI Action Provenance

Every consequential AI action must be reconstructible.

## Required fields
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

## Purpose
The record must make it possible to reconstruct what the AI was asked to do, which sources it used, what it produced, what decision was recorded, and whether a human approved the consequential result.

## Governance
AI output is not automatically knowledge and is not automatically legally validated. Human approval and validation status must remain explicit.

## Audit
AI action records belong in the project audit trail and should be versioned with the associated prompt/model/source context where available.
