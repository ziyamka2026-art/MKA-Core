# ADR-002: Modular Monorepo

**Status:** Accepted  
**Date:** 2026-08-04  
**Work Order:** WO-001  
**Deciders:** Architecture Agent (on behalf of Project)

---

## Context

MKA consists of a well-defined set of modules (Backend API, Knowledge Manager, Google Drive Sync, Document Parser, Embedding Service, Vector Database interface, Retrieval Engine, Prompt Engine, AI Gateway, Telegram Bot, Web Interface, Administration Panel).

These modules must:

- Evolve independently where possible
- Share common contracts and utilities
- Be deployable as separate containers (Docker Ready, Cloud Ready)
- Remain easy to maintain and test
- Avoid the coordination overhead of many independent repositories in the early stages of the project

A pure multi-repo approach would slow down the initial delivery of the tightly coupled ingestion and retrieval paths. A classic monolith would violate the Modular Architecture principle and make independent scaling and replacement difficult.

## Decision

MKA shall be organised as a **Modular Monorepo**.

- All modules live in a single repository.
- Each module is a distinct package / project with its own boundary, public interface, and (where applicable) Dockerfile.
- Shared contracts (API schemas, event schemas, common types) live in a dedicated shared package that all modules may depend on.
- Build, test and release tooling is organised so that modules can be built, tested and versioned independently.
- Deployment artefacts remain separate containers; the monorepo is an organisational and versioning choice, not a runtime monolith.

The monorepo structure will reflect the module catalogue defined in the Architecture document and the dependency rules (no circular dependencies).

## Consequences

### Positive

- Atomic cross-module changes are possible when contracts evolve.
- Shared tooling, linting, CI and documentation stay consistent.
- Onboarding is simpler: one repository, one mental model.
- Independent deployability is preserved through per-module containers.
- Aligns with the Maintainability and Testability principles.

### Negative / Trade-offs

- Repository size and CI complexity will grow over time; tooling must be kept disciplined.
- Clear ownership and CODEOWNERS rules are required to prevent accidental coupling.
- Teams working on distant modules may still need coordination on shared contracts.

### Neutral

- The decision does not prescribe any particular language or build system (those remain out of scope for architecture).
- Future extraction of a mature module into its own repository remains possible if organisational needs change.

## Compliance

All new modules and shared libraries must be added inside the monorepo following the established package layout and dependency direction rules. Circular package dependencies are forbidden.
