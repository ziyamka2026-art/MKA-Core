# MKA Retrieval Engine (Query Database)

Local vector store for semantic search over tax knowledge.

## Stack

- **Embeddings**: Ollama `nomic-embed-text` (free & private)
- **Store**: In-memory + JSON persistence (swap to Qdrant later)
- **Similarity**: Cosine

## Setup

```bash
# Pull embedding model once
ollama pull nomic-embed-text

pip install -r packages/embedding-service/requirements.txt
pip install -r packages/retrieval-engine/requirements.txt
pip install -r packages/document-parser/requirements.txt
```

## Usage

```bash
# Index a law PDF
python -m packages.retrieval-engine.app.query_service index path/to/قانون.pdf

# Query
python -m packages.retrieval-engine.app.query_service query "نرخ مالیات بر ارزش افزوده"

# Status
python -m packages.retrieval-engine.app.query_service status
```

## API models

See `packages/shared/mka_shared/models.py`:
- `QueryRequest` / `QueryResponse`
- `DocumentChunk` / `IndexRequest`
