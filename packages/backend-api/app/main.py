"""MKA Backend API – API Gateway entry point."""

from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Temporary local imports until proper packaging
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "shared"))

from mka_shared.models import RAGRequest, RAGResponse, HealthResponse, Citation, SourceType

app = FastAPI(
    title="MKA Backend API",
    description="Modular Knowledge Assistant – Public API Gateway",
    version="0.1.0",
    contact={"email": "ziya.mka2026@gmail.com"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse()


@app.post("/v1/rag/query", response_model=RAGResponse)
async def rag_query(request: RAGRequest):
    """
    Main RAG endpoint.
    Currently returns a stub response until Retrieval Engine + AI Gateway are connected.
    """
    # TODO: call RetrievalEngine → PromptEngine → AIGateway
    stub_answer = (
        f"پاسخ آزمایشی برای پرسش: «{request.query}»\n\n"
        "این پاسخ موقتی است. پس از اتصال ماژول‌های Retrieval Engine، Prompt Engine و AI Gateway، "
        "پاسخ‌های واقعی با استناد به منابع دانش تولید خواهد شد."
    )

    stub_citations = [
        Citation(
            source_id="stub-001",
            source_type=SourceType.MANUAL,
            title="سند آزمایشی MKA",
            chunk_id="chunk-001",
            score=0.95,
            section="مقدمه",
        )
    ]

    return RAGResponse(
        answer=stub_answer,
        citations=stub_citations,
        model="stub-v0.1",
        latency_ms=12,
        request_id=f"req-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
    )


@app.get("/")
async def root():
    return {
        "service": "MKA Backend API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
        "rag": "/v1/rag/query",
    }
