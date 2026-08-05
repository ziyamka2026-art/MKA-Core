# C4 Context Diagram – MKA Platform

```mermaid
C4Context
    title System Context Diagram - MKA Platform

    Person(endUser, "End User", "Asks questions and receives cited answers via Telegram or Web")
    Person(admin, "Administrator", "Manages knowledge sources, curation, users and configuration")
    Person(integrator, "Integrator / External Service", "Consumes the public API")

    System(mka, "MKA Platform", "Modular Knowledge Assistant – ingests documents, builds semantic index, serves accurate cited answers")

    System_Ext(gdrive, "Google Drive", "Primary document source")
    System_Ext(llm, "LLM Providers", "Large language model services used for answer generation")
    System_Ext(futureSources, "Future Knowledge Sources", "SharePoint, Notion, GitHub, Confluence, SQL, REST APIs")

    Rel(endUser, mka, "Asks questions, receives answers with citations")
    Rel(admin, mka, "Configures sources, reviews knowledge, manages system")
    Rel(integrator, mka, "Calls public API")
    Rel(mka, gdrive, "Syncs documents (OAuth / service account)")
    Rel(mka, llm, "Sends prompts, receives generated text")
    Rel(mka, futureSources, "Will ingest via pluggable connectors (future)")
```

## Notes

- MKA is the sole system boundary for knowledge processing, retrieval and generation.
- External systems interact only through well-defined interfaces (Drive API, LLM APIs, future connectors).
- End users never interact directly with internal stores or services.
- The architecture is prepared for additional knowledge sources without changing the core context.
