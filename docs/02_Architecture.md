# MKA Platform Architecture

**Document:** 02_Architecture.md  
**Version:** 1.0  
**Status:** Draft  
**Work Order:** WO-001  
**Last Updated:** 2026-08-04

---

## 1. Purpose

This document defines the complete software architecture of the **MKA – Modular Knowledge Assistant** platform.

It establishes:

- System boundaries and external interactions (C4 Context)
- Deployable containers and their responsibilities (C4 Container)
- Internal component structure and module boundaries (Component Diagram)
- Runtime behaviour for the primary RAG request flow (Sequence Diagram)
- Key architectural decisions (ADRs)

The architecture is derived strictly from the Project Vision, Mission, Core Principles, and Initial Modules. It is domain-agnostic at the core and supports future expansion beyond the initial Persian-language tax advisory assistant.

**Constraints observed:**

- No source code
- No technology selection beyond the approved module set
- No business logic
- Modular, extensible, citation-first, secure-by-design

---

## 2. Architectural Overview

MKA is a **modular knowledge platform** that ingests documents from heterogeneous sources, builds a semantic index, and serves accurate, cited answers through multiple channels (Telegram, Web, public API).

### 2.1 Core Principles Applied

| Principle              | Architectural Manifestation                                      |
|------------------------|------------------------------------------------------------------|
| Modular Architecture   | Clear module boundaries; monorepo with independent packages     |
| Knowledge First        | Knowledge Manager owns the lifecycle of all knowledge artefacts |
| Source Citation        | Every retrieved chunk carries provenance; responses always cite |
| Human-in-the-loop      | Admin Panel + review queues for knowledge curation              |
| Security by Design     | API Gateway as single entry point; least-privilege module access|
| Extensibility          | Domain-agnostic core + pluggable domain adapters (future)       |
| Maintainability        | Explicit contracts between modules; no circular dependencies    |
| Testability            | Each module has well-defined interfaces and can be tested in isolation |

### 2.2 High-Level Layering

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Channels                          │
│  Telegram Bot  │  Web Interface  │  Administration Panel    │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                 API Gateway / Backend API                   │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼──────┐   ┌─────────▼────────┐   ┌───────▼──────┐
│  Retrieval   │   │    Knowledge     │   │   Prompt     │
│   Engine     │   │    Manager       │   │   Engine     │
└───────┬──────┘   └─────────┬────────┘   └───────┬──────┘
        │                    │                    │
        │            ┌───────▼──────┐             │
        │            │  Embedding   │             │
        │            │   Service    │             │
        │            └───────┬──────┘             │
        │                    │                    │
┌───────▼────────────────────▼────────────────────▼──────┐
│              Vector Database  +  Metadata Store         │
└─────────────────────────────────────────────────────────┘

Ingestion Path (async):
Google Drive Sync → Document Parser → Embedding Service → Knowledge Manager → Vector DB
```

---

## 3. C4 Context Diagram

See: [docs/diagrams/c4-context.md](diagrams/c4-context.md)

**Summary of external actors and systems:**

| Actor / System       | Interaction                                      |
|----------------------|--------------------------------------------------|
| End User             | Asks questions via Telegram or Web Interface     |
| Administrator        | Manages knowledge, users, configuration via Admin Panel |
| Integrator / Service | Consumes public API                              |
| Google Drive         | Source of documents (sync)                       |
| LLM Providers        | Generation of answers (via AI Gateway)           |
| Future Sources       | SharePoint, Notion, GitHub, etc. (pluggable)     |

The MKA Platform is the single system boundary. All knowledge processing, retrieval, and generation occur inside this boundary. External systems never receive raw internal state.

---

## 4. C4 Container Diagram

See: [docs/diagrams/c4-container.md](diagrams/c4-container.md)

### 4.1 Container Responsibilities

| Container              | Responsibility                                                                 | Communication Style      |
|------------------------|--------------------------------------------------------------------------------|--------------------------|
| **Telegram Bot**       | Receives user messages, forwards to Backend API, returns answers with citations | Sync HTTP / Webhook      |
| **Web Interface**      | Browser-based chat and knowledge exploration UI                                | Sync HTTP / WebSocket    |
| **Administration Panel** | Knowledge curation, sync status, user management, configuration              | Sync HTTP                |
| **Backend API**        | Single public entry point (API Gateway pattern). Authentication, routing, rate limiting, request orchestration | Sync HTTP                |
| **Knowledge Manager**  | Owns document lifecycle, metadata, chunk registry, citation provenance         | Sync + Async events      |
| **Google Drive Sync**  | Polls / receives change notifications, downloads new/updated files             | Async                    |
| **Document Parser**    | Extracts text, structure, and metadata from PDF, DOCX, XLSX, PPTX, MD, HTML, CSV, OCR | Async pipeline           |
| **Embedding Service**  | Produces vector embeddings for chunks                                          | Sync (internal) / Async  |
| **Vector Database**    | Stores and searches embeddings with associated metadata and citation keys      | Sync                     |
| **Retrieval Engine**   | Performs semantic search, ranking, and context assembly with citations         | Sync                     |
| **Prompt Engine**      | Constructs domain-aware prompts, injects retrieved context and citation instructions | Sync                     |
| **AI Gateway**         | Abstracts LLM providers; handles retries, token accounting, safety filters     | Sync                     |

### 4.2 Data Stores (logical)

- **Vector Database**: Primary semantic index
- **Metadata Store**: Document registry, chunk provenance, sync state, user/tenant configuration
- **Document Store**: Optional raw/parsed artefacts for re-processing and audit

All stores are accessed only through their owning modules. No direct cross-module database access.

---

## 5. Component Diagram (Module Boundaries)

See: [docs/diagrams/component.md](diagrams/component.md)

### 5.1 Module Catalogue & Ownership

| Module                 | Owns                                      | Does NOT own                          | Depends on                          |
|------------------------|-------------------------------------------|---------------------------------------|-------------------------------------|
| Backend API            | Public contracts, auth, routing, orchestration | Knowledge, embeddings, generation    | Knowledge Manager, Retrieval Engine, Prompt Engine, AI Gateway |
| Knowledge Manager      | Document & chunk lifecycle, provenance, citations | Parsing, embedding generation, search | Document Parser (events), Embedding Service, Vector DB, Metadata Store |
| Google Drive Sync      | Drive connection, change detection, file download | Parsing, indexing                    | Knowledge Manager (ingest API)     |
| Document Parser        | Text extraction, structure preservation, OCR hand-off | Embedding, storage                   | Knowledge Manager (result events)  |
| Embedding Service      | Vector production                         | Storage, search                       | — (pure function)                  |
| Vector Database        | Vector storage & similarity search        | Business logic                        | —                                  |
| Retrieval Engine       | Query embedding, search, ranking, context window assembly with citations | Prompt construction, generation     | Embedding Service, Vector Database, Knowledge Manager |
| Prompt Engine          | Prompt templates, context injection, citation instructions | LLM calls                            | —                                  |
| AI Gateway             | Provider abstraction, request/response normalisation | Prompt logic                         | External LLM providers             |
| Telegram Bot           | Telegram protocol adaptation              | Business logic                        | Backend API                        |
| Web Interface          | UI rendering and interaction              | Business logic                        | Backend API                        |
| Administration Panel   | Admin UX, curation workflows              | Core knowledge logic                  | Backend API                        |

### 5.2 Dependency Rules

- **No circular dependencies** are permitted.
- Client channels depend only on Backend API.
- Backend API depends on Core services (Retrieval, Knowledge Manager, Prompt, AI Gateway).
- Ingestion path is unidirectional: Sync → Parser → Embedding → Knowledge Manager → Vector DB.
- Retrieval path is unidirectional: Retrieval Engine → Embedding + Vector DB + Knowledge Manager → Prompt Engine → AI Gateway.
- Knowledge Manager is the single source of truth for provenance and citations.

### 5.3 Extension Points (Future Domains)

The core remains domain-agnostic. Domain-specific behaviour (tax rules, legal terminology, medical safety) will be introduced via:

- Domain-specific Prompt templates (Prompt Engine)
- Optional Domain Adapters that can post-process retrieval results or enforce domain constraints
- Separate knowledge collections / namespaces per domain or tenant

No domain logic is present in v1 architecture.

---

## 6. Sequence Diagram – RAG Request Flow

See: [docs/diagrams/sequence-rag.md](diagrams/sequence-rag.md)

**Happy-path steps (simplified):**

1. User sends question via Telegram Bot / Web Interface.
2. Client forwards request to Backend API (authenticated).
3. Backend API validates and routes to Retrieval Engine.
4. Retrieval Engine requests query embedding from Embedding Service.
5. Retrieval Engine performs similarity search against Vector Database (with optional filters from Knowledge Manager).
6. Retrieval Engine assembles ranked chunks + full citation metadata.
7. Backend API passes context + question to Prompt Engine.
8. Prompt Engine builds the final prompt (system + context + citation instructions + user question).
9. Prompt Engine / Backend API calls AI Gateway.
10. AI Gateway invokes the configured LLM provider and returns the generated answer.
11. Backend API packages answer + citation list and returns to client.
12. Client renders answer with clickable / expandable source references.

Error paths, timeouts, and human-in-the-loop review queues are defined at the interface level but left for detailed design.

---

## 7. Architectural Decision Records

| ADR          | Title                     | Status   |
|--------------|---------------------------|----------|
| ADR-001      | Domain-Agnostic Core      | Accepted |
| ADR-002      | Modular Monorepo          | Accepted |
| ADR-003      | API Gateway Pattern       | Accepted |

Full records: [docs/adr/](adr/)

---

## 8. Non-Functional Mapping

| NFR              | How addressed                                              |
|------------------|------------------------------------------------------------|
| Secure           | Single entry point (API Gateway), least-privilege modules, no direct store access |
| Observable       | Structured logging and metrics at every module boundary    |
| Configurable     | Configuration owned by Administration Panel + Backend API  |
| Portable         | Container-ready; no host-specific assumptions              |
| Cloud Ready      | Stateless services where possible; externalisable stores   |
| Docker Ready     | Explicit container boundaries defined                      |
| High Accuracy    | Citation-first retrieval + ranked context                  |
| Fast Retrieval   | Dedicated Vector Database + Embedding Service              |
| Reliable Citations | Knowledge Manager owns provenance; every chunk carries source ID |
| Scalable         | Independent scaling of ingestion vs query path             |
| Easy Maintenance | Clear module ownership, no cycles                          |
| Multi-Agent Collaboration | Future: multiple specialised agents behind the same API Gateway |

---

## 9. Consistency & Validation Checklist

- [x] All diagrams internally consistent with module list from Vision
- [x] Module boundaries clearly defined
- [x] Responsibilities of each module documented
- [x] Inter-module communication specified (sync vs async)
- [x] No circular dependencies
- [x] Architecture supports future domain expansion (domain-agnostic core + prompt/domain adapters)
- [x] Citation is a first-class concern owned by Knowledge Manager and enforced in Retrieval + Prompt
- [x] No technology choices beyond the approved module set
- [x] No business logic or domain rules present

---

## 10. Next Steps (Out of Scope of WO-001)

- Detailed interface contracts (OpenAPI / events)
- Data model for Metadata Store and Vector metadata
- Security model (authn/authz, tenancy)
- Observability specification
- Deployment topology

---

*End of Architecture Document*
