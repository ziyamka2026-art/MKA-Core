# MKA – دسته دستورات مرحله‌ای #04
**مخاطب:** Lovable.dev  
**مبنا:** mka-project-v3 (packages/admin-panel)  
**تاریخ:** 2026-08-16

## تأیید v3 در برابر STAGE-03
Settings (Drive + BACKEND_URL)، Dashboard (ESSENTIAL_LAWS + بازبینی مخزن)،
body_text در Registry، Ask با Citation، registry-admin — پوشش خوب.

## دستورات (۱۲ مورد)

| # | دستور |
|---|--------|
| 1 | Seed اولیه: حداقل ۵ ردیف نمونه برای ESSENTIAL_LAWS (عنوان + law_category + doc_type=قانون + index_status=شناسایی‌شده). |
| 2 | صفحه جزئیات سند: نمایش کامل body_text + لینک source_url/drive_path. |
| 3 | Ask: اگر BACKEND_URL تنظیم شده، POST به `/v1/rag/query`؛ در خطا fallback به Registry محلی با پیام واضح. |
| 4 | محدودیت نقش در UI: viewer بدون دکمه ذخیره/حذف؛ manager فقط index_status؛ expert ایجاد پیش‌نویس. |
| 5 | فیلتر Registry بر اساس law_category و index_status و جستجوی عنوان/شماره. |
| 6 | نشان «نیاز به بازبینی مخزن» اگر بیش از N روز از آخرین ثبت گذشته (N قابل تنظیم، پیش‌فرض ۷). |
| 7 | import CSV ساده (doc_code,title,doc_type,law_category,source_url) با اعتبارسنجی title+doc_type. |
| 8 | جلوگیری از doc_code تکراری در insert. |
| 9 | لاگ ساده فعالیت (کیست / چه سندی / چه تغییری) برای owner/manager — جدول یا لیست محدود. |
| 10 | RTL و تاریخ شمسی نمایشی برای doc_date در صورت امکان. |
| 11 | بدون secret در کد. |
| 12 | پایان: ZIP کامل `mka-project-v4` برای GitHub. |

## منبع دانش (ثابت)
PRIMARY: https://drive.google.com/drive/folders/1Jx0cipUqQyGnJk4hFCURzWIg1Abo1Del  
در هر کار: بازبینی Drive → ثبت در Registry.

## خارج از محدوده Lovable
Parser/Embedding/ربات تلگرام و بله → MKA-Core Python
