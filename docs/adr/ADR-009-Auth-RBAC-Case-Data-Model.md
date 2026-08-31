# ADR-009 — Auth, RBAC, Generic Case & Data Model (WO-2026-002)

**Status:** Accepted  
**Date:** 2026-08-31  
**Related:** WO-2026-002, ADR-004, ADR-005, ADR-008  

## Decision

1. Authentication is JWT (access + refresh). Password hashing: argon2 or bcrypt.
2. Roles: `taxpayer` | `advisor` | `admin` | `owner` (owner ⊇ admin + ledger settlement).
3. **Case** is domain-agnostic (`domain` field e.g. `iran-tax`). Tax-specific data lives in `payload` / linked services — not in Case identity. MVP table may be named `cases`.
4. All protected routes use `get_current_user` / `require_role`. Missing token → 401; wrong role → 403.
5. Ownership: `get_case_or_403` — access only if `owner_id`, assigned `advisor_id`, or role in (`admin`,`owner`).
6. Forbidden citation sentinels: `pending-index` and any non-resolvable `source_id`. Empty retrieval → `INSUFFICIENT_DATA` only.
7. Persistence target: PostgreSQL (+ pgvector for chunks). JSON/JSONL is temporary behind Repository only.
8. Audit log is append-only at application and preferably DB privilege level.
9. CORS from `CORS_ALLOWED_ORIGINS` env (comma-separated). Never `*` with credentials in production.
10. Item 11 (Document AI advisor workflow) blocked until items 1–10 of WO-2026-002 are Done.

## Tables (initial)

- users (id uuid, email unique, password_hash, role, created_at)
- cases (id uuid, domain, owner_id, advisor_id null, status, channel, human_review_required, payload jsonb, created_at, updated_at)
- case_documents (id uuid, case_id, uploaded_by, storage_key, content_type, size_bytes, created_at)
- audit_log (id uuid, actor_id, action, resource_type, resource_id, ip, metadata jsonb, created_at)
- source_documents, document_chunks (vector)

## API (phase 1)

- POST /v1/auth/register, /login, /refresh, /logout
- GET /v1/auth/me
- Later: /v1/cases*, /v1/admin*, /v1/rag/query with evidence gate

## Consequences

Security is backend-only. Channels (web, telegram, bale) remain thin clients.
