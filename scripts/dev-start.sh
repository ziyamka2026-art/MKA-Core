#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "فایل .env وجود ندارد. از .env.example کپی کنید و TELEGRAM_BOT_TOKEN را وارد کنید."
  exit 1
fi

echo "▶ Starting Backend API on :8000 ..."
cd packages/backend-api
export PYTHONPATH="$ROOT/packages/shared:$PYTHONPATH"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

sleep 2

echo "▶ Starting Telegram Bot ..."
cd "$ROOT/packages/telegram-bot"
export PYTHONPATH="$ROOT/packages/shared:$PYTHONPATH"
export BACKEND_URL=http://localhost:8000
python app/bot.py &
BOT_PID=$!

echo "Backend PID: $BACKEND_PID | Bot PID: $BOT_PID"
echo "برای توقف: kill $BACKEND_PID $BOT_PID"

wait
