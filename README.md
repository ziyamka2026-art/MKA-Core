# MKA – Modular Knowledge Assistant

**پلتفرم ماژولار برای ساخت دستیارهای هوشمند مبتنی بر دانش**

نسخه اول: دستیار مشاور مالیاتی فارسی‌زبان (Telegram Bot: [@taxiran1395_bot](https://t.me/taxiran1395_bot))

## مالکیت
- مالک پروژه و دارنده کامل حقوق کپی‌رایت: مالک حساب GitHub مرتبط با `mka-platform`
- ایمیل مدیر: ziya.mka2026@gmail.com

## معماری
مستندات کامل در [`docs/`](docs/):
- [Vision](AGENTS.md)
- [Architecture](docs/02_Architecture.md)
- ADRs و Diagrams

## ساختار Monorepo (بر اساس ADR-002)

```
mka/
├── packages/
│   ├── shared/                 # قراردادها، انواع مشترک، utilities
│   ├── backend-api/            # API Gateway + orchestration
│   ├── telegram-bot/           # ربات تلگرام
│   ├── knowledge-manager/      # مدیریت چرخه دانش و Citation
│   ├── google-drive-sync/      # همگام‌سازی Google Drive
│   ├── document-parser/        # استخراج متن از PDF/DOCX/...
│   ├── embedding-service/      # تولید embedding
│   ├── retrieval-engine/       # جستجوی معنایی + Citation
│   ├── prompt-engine/          # ساخت prompt با دستورات Citation
│   ├── ai-gateway/             # انتزاع LLM providers
│   ├── web-interface/          # رابط وب
│   └── admin-panel/            # پنل مدیریت
├── infra/                      # Docker, K8s, terraform
├── scripts/                    # ابزارهای توسعه و CI
└── docs/                       # مستندات
```

## وضعیت فعلی (شروع اجرا)
- [x] Vision و Architecture
- [x] اسکلت Monorepo
- [ ] Backend API (FastAPI skeleton)
- [ ] Telegram Bot skeleton
- [ ] Shared contracts
- [ ] Docker Compose اولیه
- [ ] اتصال واقعی به @taxiran1395_bot (نیاز به Bot Token)

## پیش‌نیازهای فوری از مالک پروژه
برای ادامه اجرا لطفاً موارد زیر را فراهم کنید:

1. **Telegram Bot Token** مربوط به `@taxiran1395_bot` (از @BotFather)
2. دسترسی به سازمان GitHub `mka-platform` (یا ایجاد repository جدید `mka-core` و دادن دسترسی)
3. کلیدهای LLM (OpenAI / Gemini / یا endpoint سازگار با OpenAI)
4. (اختیاری در فاز اول) Google Service Account برای Drive Sync

## راه‌اندازی سریع (پس از دریافت Tokenها)
```bash
# کپی .env.example به .env و پر کردن مقادیر
cp .env.example .env

# اجرای سرویس‌ها با Docker Compose
docker compose up --build
```

## مجوز
کلیه حقوق مادی و معنوی متعلق به مالک پروژه است.
