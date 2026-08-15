# MKA – دسته دستورات مرحله‌ای #03
**مخاطب:** Lovable.dev  
**مبنا:** packages/admin-panel از mka-project-v2.zip  
**مرجع:** docs/MKA/01_DIRECTIVES.md  
**تاریخ:** 2026-08-15

## تأیید وضعیت v2
- AdvisorContact + شماره ۰۹۱۵۳۰۶۸۳۲۲ روی صفحه اول
- Registry / Circulars / Dashboard / Ask / Settings
- PRIMARY_KNOWLEDGE_DRIVE = 1Jx0cip...
- نام نمایشی: ضیاءالدین موسوی جراحی

## دستورات (۱۲ مورد)

| # | دستور |
|---|--------|
| 1 | در Settings و Dashboard لینک‌های PRIMARY و FALLBACK Drive + REGISTRY_SHEET قابل کلیک باشند. |
| 2 | دکمه/جریان «بازبینی مخزن دانش»: یادآوری یا چک‌لیست که کاربر فایل‌های جدید Drive را در Registry ثبت کند (چون API مستقیم Drive از Lovable محدود است). |
| 3 | برای هر ردیف Registry امکان الصاق `body_text` (متن استخراج‌شده) و نمایش در صفحه جزئیات. |
| 4 | صفحه Ask: Citation فقط از ردیف‌های Registry با status ایندکس‌شده یا دارای body_text؛ نمایش title + doc_number + source_url. |
| 5 | فیلد اختیاری BACKEND_URL در Settings؛ اگر پر بود Ask از API خارجی، وگرنه RAG ابری فعلی. |
| 6 | چک‌لیست ESSENTIAL_LAWS روی Dashboard با وضعیت از روی Registry (چند سند law_category متناظر). |
| 7 | نقش‌ها: viewer فقط خواندن؛ expert ایجاد/ویرایش پیش‌نویس؛ manager تغییر index_status؛ owner همه. |
| 8 | import دستی CSV/ردیف‌های نمونه برای ۴ قانون اصلی (حداقل عنوان + law_category + index_status=شناسایی‌شده). |
| 9 | جلوگیری از ذخیره ردیف بدون title و doc_type. |
| 10 | RTL و پیام‌های خطای فارسی یکدست. |
| 11 | هیچ secret در کد؛ فقط env. |
| 12 | پایان مرحله: ZIP کامل پروژه (mka-project-v3) برای به‌روزرسانی GitHub. |

## منبع دانش
تا رفع محدودیت سایت‌های رسمی:
https://drive.google.com/drive/folders/1Jx0cipUqQyGnJk4hFCURzWIg1Abo1Del

در هر اجرای کاری، مخزن بازبینی و Registry نسبت به اسناد جدید به‌روز شود.

## خارج از محدوده
Parser/Embedding/ربات تلگرام-بله → MKA-Core Python
