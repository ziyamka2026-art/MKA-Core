# ADR-001: Domain-Agnostic Core

**Status:** Accepted  
**Date:** 2026-08-04  
**Work Order:** WO-001  
**Deciders:** Architecture Agent (on behalf of Project)

---

## Context

MKA’s first production target is a Persian-language tax advisory assistant. The long-term vision, however, requires the same platform to support additional specialised domains (legal, accounting, medical, education, and others) without rewriting the core.

The Core Principles explicitly demand:

- Modular Architecture
- Extensibility
- Independence from any single domain of expertise

If domain-specific rules, taxonomies or safety constraints were embedded in the core modules, every new domain would force changes to the shared code base, violating maintainability and testability.

## Decision

The MKA core shall be **domain-agnostic**.

All modules listed in the Vision (Backend API, Knowledge Manager, Retrieval Engine, Prompt Engine, AI Gateway, ingestion services, stores, and client channels) must contain **zero domain business logic**.

Domain-specific behaviour will be introduced exclusively through:

1. **Prompt templates and instructions** owned by the Prompt Engine (different system prompts per domain or tenant).
2. **Knowledge collections / namespaces** – separate vector and metadata partitions per domain or organisation.
3. **Future Domain Adapters** (optional post-retrieval or pre-generation hooks) that can enforce domain constraints without modifying core modules.
4. **Configuration** managed via the Administration Panel.

The initial tax domain will be realised solely by:

- Loading tax-related documents into a dedicated knowledge collection.
- Supplying tax-oriented prompt templates.
- Optional future thin adapter for tax-specific citation or disclaimer rules.

## Consequences

### Positive

- A single, stable core can serve many domains.
- New domains can be onboarded by configuration and content, not by code changes to core modules.
- Testability is improved: core modules can be tested with synthetic, domain-neutral data.
- Clear separation of concerns reduces the risk of accidental domain leakage.

### Negative / Trade-offs

- Some domain-specific optimisations (e.g. specialised ranking for tax codes) may require a Domain Adapter later.
- Prompt engineering becomes a critical skill for domain quality.
- Initial tax assistant will rely heavily on high-quality source documents and carefully crafted prompts.

### Neutral

- The architecture already contains the necessary extension points (Prompt Engine, Knowledge Manager collections, future adapters).
- No impact on the module dependency graph defined in the Architecture document.

## Compliance

This decision is mandatory for all subsequent design and implementation work. Any pull request or design that introduces domain rules into core modules must be rejected.
