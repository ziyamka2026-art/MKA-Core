"""CLI / helper: index parsed chunks and query the knowledge base."""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

# Path setup for monorepo
ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "packages" / "embedding-service" / "app"))
sys.path.insert(0, str(ROOT / "packages" / "retrieval-engine" / "app"))
sys.path.insert(0, str(ROOT / "packages" / "document-parser" / "app"))
sys.path.insert(0, str(ROOT / "packages" / "shared"))

from embedder import Embedder
from store import InMemoryVectorStore
from parser import DocumentParser


def index_file(store: InMemoryVectorStore, path: Path, source_id: str | None = None) -> int:
    parser = DocumentParser()
    doc = parser.parse_file(path, source_id=source_id)
    if not doc.success:
        print(f"Parse failed: {doc.error}", file=sys.stderr)
        return 0

    records = []
    for ch in doc.chunks:
        records.append({
            "chunk_id": f"{doc.source_id}::c{ch.chunk_index}",
            "source_id": doc.source_id,
            "source_type": doc.source_type,
            "title": doc.title,
            "text": ch.text,
            "page": ch.page,
            "section": ch.section,
            "url": None,
            "metadata": {"char_start": ch.char_start, "char_end": ch.char_end},
        })
    n = store.index(records)
    print(f"Indexed {n} chunks from {path.name} (store total={store.count()})")
    return n


def main() -> None:
    ap = argparse.ArgumentParser(description="MKA Knowledge Query DB")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p_idx = sub.add_parser("index", help="Parse and index a document")
    p_idx.add_argument("path", type=Path)
    p_idx.add_argument("--source-id", default=None)
    p_idx.add_argument("--db", default="data/mka_vectors.json")

    p_q = sub.add_parser("query", help="Semantic query")
    p_q.add_argument("query", type=str)
    p_q.add_argument("--top-k", type=int, default=5)
    p_q.add_argument("--db", default="data/mka_vectors.json")

    p_st = sub.add_parser("status", help="Store status")
    p_st.add_argument("--db", default="data/mka_vectors.json")

    args = ap.parse_args()
    embedder = Embedder()
    store = InMemoryVectorStore(persist_path=args.db, embedder=embedder)

    if args.cmd == "index":
        index_file(store, args.path, args.source_id)
    elif args.cmd == "status":
        print(json.dumps({"count": store.count(), "path": str(args.db)}, ensure_ascii=False))
    elif args.cmd == "query":
        t0 = time.time()
        hits = store.query(args.query, top_k=args.top_k)
        ms = int((time.time() - t0) * 1000)
        out = {
            "query": args.query,
            "latency_ms": ms,
            "hits": [
                {
                    "score": round(h["score"], 4),
                    "title": h["title"],
                    "page": h["page"],
                    "text": h["text"][:300],
                    "chunk_id": h["chunk_id"],
                }
                for h in hits
            ],
        }
        print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
