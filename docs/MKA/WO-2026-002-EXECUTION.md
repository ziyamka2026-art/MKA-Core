# WO-2026-002 Execution Order (Approved by MKA 2026-08-31)

## pending-index
Forbidden sentinel. Origin: temporary RAG when no chunks. Replace with INSUFFICIENT_DATA only.

## Start now
1. ADR-009 (this package)
2. Alembic + Postgres tables: users, cases, case_documents, audit_log, source_documents, document_chunks
3. Implement auth/security.py, deps.py, router.py
4. Mount auth router on API; protect /v1/admin/* and future case routes
5. Do not wire Admin UI to fake numbers
6. No new Telegram/Bale features until Auth+RBAC green
7. Item 11 Document AI blocked

## Commit style
feat(auth): ...
feat(security): ...
docs(adr): ADR-009 ...
