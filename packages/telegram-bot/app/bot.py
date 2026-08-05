"""MKA Telegram Bot – @taxiran1395_bot

Thin adapter: receives messages → calls Backend API → returns answer + citations.
"""

import asyncio
import logging
import os
from typing import Optional

import httpx
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters,
)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger("mka.telegram")

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    await update.message.reply_text(
        f"سلام {user.first_name or ''} 👋\n\n"
        "من دستیار مشاور مالیاتی MKA هستم.\n"
        "سوال مالیاتی‌تان را بپرسید تا با استناد به منابع پاسخ دهم.\n\n"
        "دستورات:\n"
        "/start – شروع\n"
        "/help – راهنما\n"
        "/status – وضعیت سرویس"
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "📖 راهنما\n\n"
        "هر سوالی در حوزه مالیات ایران بپرسید.\n"
        "پاسخ‌ها همراه با ارجاع به منبع (Citation) ارائه می‌شوند.\n\n"
        "مثال:\n"
        "• نرخ مالیات بر ارزش افزوده چقدر است؟\n"
        "• شرایط معافیت مالیاتی مشاغل خانگی چیست؟"
    )


async def status(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{BACKEND_URL}/health")
            data = r.json()
            await update.message.reply_text(
                f"✅ سرویس فعال\n"
                f"وضعیت: {data.get('status')}\n"
                f"نسخه: {data.get('version')}"
            )
    except Exception as e:
        logger.error("Health check failed: %s", e)
        await update.message.reply_text("❌ سرویس Backend در دسترس نیست.")


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.message or not update.message.text:
        return

    query = update.message.text.strip()
    if not query:
        return

    await update.message.chat.send_action(action="typing")

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            payload = {
                "query": query,
                "user_id": str(update.effective_user.id) if update.effective_user else None,
                "session_id": str(update.effective_chat.id) if update.effective_chat else None,
                "top_k": 5,
            }
            r = await client.post(f"{BACKEND_URL}/v1/rag/query", json=payload)
            r.raise_for_status()
            data = r.json()

        answer = data.get("answer", "پاسخی دریافت نشد.")
        citations = data.get("citations", [])

        text = answer
        if citations:
            text += "\n\n📚 منابع:\n"
            for i, c in enumerate(citations, 1):
                title = c.get("title", "بدون عنوان")
                section = c.get("section")
                score = c.get("score", 0)
                line = f"{i}. {title}"
                if section:
                    line += f" – {section}"
                line += f" (امتیاز: {score:.2f})"
                text += line + "\n"

        await update.message.reply_text(text)

    except httpx.HTTPError as e:
        logger.error("Backend error: %s", e)
        await update.message.reply_text(
            "⚠️ خطا در ارتباط با سرویس دانش. لطفاً کمی بعد دوباره تلاش کنید."
        )
    except Exception as e:
        logger.exception("Unexpected error")
        await update.message.reply_text("خطای داخلی رخ داد.")


def main() -> None:
    if not TELEGRAM_BOT_TOKEN:
        raise RuntimeError(
            "TELEGRAM_BOT_TOKEN تنظیم نشده است. "
            "لطفاً توکن @taxiran1395_bot را در متغیر محیطی قرار دهید."
        )

    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("status", status))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    logger.info("Starting MKA Telegram Bot (@taxiran1395_bot)...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
