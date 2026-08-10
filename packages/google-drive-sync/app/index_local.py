"""
ایندکس خودکار فایل‌های محلی (قوانین / بخشنامه‌های دانلودشده) در پایگاه پرس‌وجو.

Usage:
  python -m app.index_local --path ../../data/circulars_download
  python -m app.index_local --path /path/to/pdf-or-folder
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "packages" / "document-parser" / "app"))
sys.path.insert(0, str(ROOT / "packages" / "embedding-service" / "app"))
sys.path.insert(0, str(ROOT / "packages" / "retrieval-engine" / "app"))

from parser import DocumentParser
from embedder import Embedder
from store import InMemoryVectorStore


def index_path(store: InMemoryVectorStore, path: Path) -> int:
    parser = DocumentParser()
    files: list[Path] = []
    if path.is_file():
        files = [path]
    else:
        for ext in ("*.pdf", "*.docx", "*.md", "*.txt"):
            files.extend(path.rglob(ext))

    total = 0
    for f in sorted(files):
        doc = parser.parse_file(f, source_id=f.stem)
        if not doc.success:
            print(f"  SKIP {f.name}: {doc.error}")
            continue
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
                "metadata": {"file": str(f)},
            })
        n = store.index(records)
        total += n
        print(f"  INDEXED {f.name}: {n} chunks (store={store.count()})")
    return total


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--path", type=Path, required=True, help="فایل یا پوشه")
    ap.add_argument("--db", default="data/mka_vectors.json")
    args = ap.parse_args()

    if not args.path.exists():
        print(f"مسیر وجود ندارد: {args.path}")
        sys.exit(1)

    embedder = Embedder()
    store = InMemoryVectorStore(persist_path=args.db, embedder=embedder)
    print(f"شروع ایندکس از {args.path} ...")
    print("(نیاز به ollama pull nomic-embed-text)")
    n = index_path(store, args.path)
    print(f"تمام. مجموع chunk ایندکس‌شده در این اجرا: {n} | کل store: {store.count()}")


if __name__ == "__main__":
    main()
