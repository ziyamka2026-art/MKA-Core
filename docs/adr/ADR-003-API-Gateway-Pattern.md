# ADR-003: API Gateway Pattern

**Status:** Accepted  
**Date:** 2026-08-04  
**Work Order:** WO-001  
**Deciders:** Architecture Agent (on behalf of Project)

---

## Context

MKA exposes multiple client channels (Telegram Bot, Web Interface, Administration Panel) and a public API for integrators. Internally it comprises many specialised services (Retrieval Engine, Knowledge Manager, Prompt Engine, AI Gateway, etc.).

Direct exposure of every internal service to clients would:

- Violate Security by Design (many attack surfaces)
- Force every client to understand internal topology
- Make cross-cutting concerns (authentication, rate limiting, logging, correlation IDs) duplicated
- Hinder future evolution of internal modules

The Vision also requires a “Backend API” and “API عمومی” (public API) as first-class deliverables of version 1.0.

## Decision

All external traffic shall enter the MKA Platform exclusively through a **Backend API that implements the API Gateway pattern**.

Responsibilities of the Backend API / API Gateway:

- Single public entry point for all client channels and external integrators
- Authentication and authorisation
- Rate limiting and basic abuse protection
- Request validation and routing
- Orchestration of the RAG request flow (and other high-level use cases)
- Response shaping and citation packaging
- Centralised observability (correlation, metrics, structured logs)

Internal services (Retrieval Engine, Knowledge Manager, Prompt Engine, AI Gateway, ingestion services) are **never** exposed directly to clients. They communicate only with the Backend API or with each other according to the approved dependency rules.

Client channels (Telegram Bot, Web Interface, Administration Panel) are thin adapters that translate their native protocols into calls against the Backend API.

## Consequences

### Positive

- Security surface is minimised and controlled in one place.
- Clients remain simple and interchangeable.
- Cross-cutting concerns are implemented once.
- Internal modules can be refactored, scaled or replaced without affecting external contracts.
- Supports the future multi-agent and multi-domain vision behind a stable public façade.

### Negative / Trade-offs

- The Backend API becomes a critical path; it must be designed for high availability and horizontal scaling.
- Some latency is added by the extra hop (acceptable for the expected interactive workloads).
- Care must be taken not to turn the Gateway into a “god” service that accumulates business logic; orchestration only, no domain rules.

### Neutral

- The decision is fully compatible with the Modular Monorepo (ADR-002) and the Domain-Agnostic Core (ADR-001).
- Future introduction of an external API Gateway product (or service mesh) remains possible; the logical pattern stays the same.

## Compliance

- No client or external system may call any internal module directly.
- All new public endpoints must be added to the Backend API.
- Internal service-to-service communication remains private and follows the dependency direction rules defined in the Architecture document.
