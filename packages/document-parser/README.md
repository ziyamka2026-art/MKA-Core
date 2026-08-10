# MKA Document Parser

Extracts clean text from knowledge documents for the RAG pipeline.

## Supported formats

- PDF (text-based) – `pdfplumber` + `pypdf` fallback
- DOCX – `python-docx`
- Markdown / plain text

## Usage

```bash
cd packages/document-parser
pip install -r requirements.txt

# CLI test
python -m app.cli /path/to/قانون.pdf --json --chunks
```

```python
from app.parser import DocumentParser

parser = DocumentParser(chunk_size=1200, chunk_overlap=200)
doc = parser.parse_file("قانون مالیاتهای مستقیم.pdf")
assert doc.success
for chunk in doc.chunks:
    print(chunk.page, chunk.text[:80])
```

## Output

`ParsedDocument` with:
- `full_text`
- `chunks` (for embedding / retrieval)
- `page_count`, `metadata`, `error`

Next modules: Embedding Service → Vector DB → Retrieval Engine.
