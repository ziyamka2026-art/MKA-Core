"""MKA Backend API – API Gateway entry point."""

from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import sys
from pathlib import Path

# Load .env from project root
ROOT = Path(__file__).resolve().parents[3]
load_dotenv(ROOT / ".env")
load_dotenv()

# Make shared + ai-gateway importable (avoid name collision with local "app")
PACKAGES = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PACKAGES / "shared"))
sys.path.insert(0, str(PACKAGES / "ai-gateway" / "app"))  # so we can "import gateway"

from mka_shared.models import RAGRequest, RAGResponse, HealthResponse, Citation, SourceType
from gateway import AIGateway, AIGatewayError

app = FastAPI(
    title="MKA Backend API",
    description="Modular Knowledge Assistant – Public API Gateway",
    version="0.2.1",
    contact={"email": "ziya.mka2026@gmail.com"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gateway = AIGateway()


SYSTEM_PROMPT = """تو یک دستیار مشاور مالیاتی فارسی‌زبان متخصص در قوانین مالیاتی جمهوری اسلامی ایران هستی.
پاسخ‌ها را دقیق، شفاف و به زبان فارسی روان بنویس.
اگر اطلاعات کافی نداری، صادقانه بگو که نیاز به بررسی بیشتر دارد.
همیشه در پایان پاسخ، در صورت امکان به منبع یا ماده قانونی اشاره کن.
فعلاً پایگاه دانش اختصاصی هنوز ایندکس نشده؛ بنابراین از دانش عمومی مدل استفاده کن و این موضوع را شفاف بگو.
"""


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(version="0.2.1")


@app.post("/v1/rag/query", response_model=RAGResponse)
async def rag_query(request: RAGRequest):
    """
    Main RAG endpoint.
    Currently: Retrieval is still stub → AI Gateway generates answer from general knowledge.
    Citation remains placeholder until Knowledge Manager + Vector DB are connected.
    """
    try:
        user_prompt = f"پرسش کاربر:\n{request.query}"

        answer, model_name, latency_ms = await gateway.generate(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.3,
            max_tokens=1200,
        )

        citations = [
            Citation(
                source_id="general-knowledge",
                source_type=SourceType.MANUAL,
                title="دانش عمومی مدل (پایگاه دانش اختصاصی هنوز ایندکس نشده)",
                chunk_id="gen-001",
                score=0.0,
                section="پاسخ موقت",
            )
        ]

        return RAGResponse(
            answer=answer,
            citations=citations,
            model=model_name,
            latency_ms=latency_ms,
            request_id=f"req-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        )

    except AIGatewayError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")


@app.get("/")
async def root():
    return {
        "service": "MKA Backend API",
        "version": "0.2.1",
        "docs": "/docs",
        "health": "/health",
        "rag": "/v1/rag/query",
        "llm_provider": gateway.provider,
    }
