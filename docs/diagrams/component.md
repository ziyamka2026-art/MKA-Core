# Component Diagram – Module Boundaries

```mermaid
flowchart TB
    subgraph Clients["Client Channels"]
        TB[Telegram Bot]
        WI[Web Interface]
        AP[Administration Panel]
    end

    subgraph Gateway["API Layer"]
        API[Backend API<br/>API Gateway Pattern]
    end

    subgraph Core["Core Services"]
        KM[Knowledge Manager]
        RE[Retrieval Engine]
        PE[Prompt Engine]
        AG[AI Gateway]
    end

    subgraph Ingestion["Ingestion Services"]
        GDS[Google Drive Sync]
        DP[Document Parser]
        ES[Embedding Service]
    end

    subgraph Stores["Data Stores"]
        VDB[(Vector Database)]
        MS[(Metadata Store)]
    end

    subgraph External["External Systems"]
        GD[Google Drive]
        LLM[LLM Providers]
    end

    %% Client → API
    TB --> API
    WI --> API
    AP --> API

    %% API → Core (query path)
    API --> RE
    API --> KM
    API --> PE
    API --> AG

    %% Retrieval path
    RE --> ES
    RE --> VDB
    RE --> KM

    %% Prompt → AI
    PE --> AG
    AG --> LLM

    %% Ingestion path (unidirectional)
    GDS --> GD
    GDS --> KM
    KM --> DP
    DP --> KM
    KM --> ES
    KM --> VDB
    KM --> MS

    %% Styling
    classDef client fill:#e1f5fe,stroke:#01579b
    classDef gateway fill:#fff3e0,stroke:#e65100
    classDef core fill:#e8f5e9,stroke:#2e7d32
    classDef ingest fill:#f3e5f5,stroke:#6a1b9a
    classDef store fill:#eceff1,stroke:#37474f
    classDef external fill:#fafafa,stroke:#616161

    class TB,WI,AP client
    class API gateway
    class KM,RE,PE,AG core
    class GDS,DP,ES ingest
    class VDB,MS store
    class GD,LLM external
```

## Module Responsibility Matrix

| Module                 | Primary Responsibility                                                                 | Key Interfaces (conceptual)                          | Allowed Dependencies                  |
|------------------------|----------------------------------------------------------------------------------------|------------------------------------------------------|---------------------------------------|
| **Backend API**        | Public entry point, authn/authz, rate limiting, request orchestration, response shaping | Public API, internal service contracts               | KM, RE, PE, AG                        |
| **Knowledge Manager**  | Document & chunk lifecycle, provenance, citation registry, sync state                  | Ingest API, Metadata API, Citation API               | DP (events), ES, VDB, MS              |
| **Google Drive Sync**  | Drive authentication, change detection, file acquisition                               | Drive connector, Ingest trigger                      | KM                                    |
| **Document Parser**    | Format-specific text & structure extraction (PDF, Office, MD, HTML, CSV, OCR)          | Parse request / result events                        | KM (result only)                      |
| **Embedding Service**  | Stateless vector production for text                                                   | Embed(text) → vector                                 | None (pure)                           |
| **Vector Database**    | Persistent vector storage and similarity search                                        | Upsert, Search, Delete by ID                         | None                                  |
| **Retrieval Engine**   | Query embedding, filtered semantic search, ranking, context window + citation assembly | Retrieve(query, filters) → ranked chunks + citations | ES, VDB, KM                           |
| **Prompt Engine**      | Template selection, context injection, citation instruction injection                  | BuildPrompt(question, context) → prompt              | None                                  |
| **AI Gateway**         | Provider abstraction, retries, timeouts, safety, token accounting                      | Generate(prompt) → text                              | External LLM providers                |
| **Telegram Bot**       | Protocol adaptation only                                                               | Telegram updates ↔ Backend API                       | Backend API only                      |
| **Web Interface**      | Presentation only                                                                      | HTTP/WS ↔ Backend API                                | Backend API only                      |
| **Administration Panel** | Admin presentation and workflow UI                                                   | HTTP ↔ Backend API                                   | Backend API only                      |

## Dependency Direction Rules (Enforced)

1. Clients → Backend API only.
2. Backend API → Core services only (no direct store access).
3. Ingestion is strictly forward: Sync → Parser → Embedding → Knowledge Manager → Stores.
4. Retrieval is strictly forward: Retrieval Engine → Embedding + Vector + Knowledge Manager.
5. Prompt Engine and AI Gateway have no knowledge of storage or ingestion.
6. No module may depend on a Client channel.
7. Circular dependencies are forbidden by construction.

These rules guarantee that the core remains domain-agnostic and that future domain adapters can be introduced without modifying the existing dependency graph.
