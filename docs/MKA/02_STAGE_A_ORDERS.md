# MKA – دسته دستورات مرحله‌ای #02 (فاز A تکمیلی)
**مخاطب:** Lovable.dev  
**مرجع اصلی:** docs/MKA/01_DIRECTIVES.md در MKA-Core  
**پروژه UI اصلی:** packages/admin-panel (از mka-project.zip + ادغام circulars)  
**تاریخ:** 2026-08-13

---

## سیاست منبع (اجباری)

1. تا رفع محدودیت سایت‌های رسمی، **منبع اصلی دانش** این Drive است:  
   https://drive.google.com/drive/folders/1Jx0cipUqQyGnJk4hFCURzWIg1Abo1Del  
2. در زمان اجرای نرم‌افزار، مخزن بازبینی شود و در صورت فایل/داده جدید، UI/Registry به‌روز شود.  
3. منبع مکمل: `1NcBkZOTemmVfnNKY7FgxuqbIXj6f4Dtl`  
4. ثابت‌ها در `src/lib/mka-constants.ts` (`PRIMARY_KNOWLEDGE_DRIVE_*`) تغییر داده نشود مگر با تأیید مالک.

---

## دستورات اجرایی (۱۵ مورد)

| # | دستور |
|---|--------|
| 1 | پروژه **جدید** (ZIP آخر) مبنای کد است؛ circulars از نسخه قبل ادغام شده — حفظ شود. |
| 2 | نام نمایشی همه نقش‌های owner/manager/expert: **ضیاءالدین موسوی جراحی** |
| 3 | صفحه اول: بلوک ثابت «ارتباط با مشاور» با موبایل **09153068322** و `tel:+989153068322` |
| 4 | لینک از خانه به `/circulars` و به `/_authenticated/registry` |
| 5 | Registry: فیلدهای doc_type, number, date, title, source_url, drive_path, law_family, index_status |
| 6 | هر بخشنامه ذخیره‌شده از scraper → یک ردیف Registry با doc_type=بخشنامه |
| 7 | جلوگیری از null-overwrite در scraper (متن قبلی پاک نشود اگر fetch خالی بود) |
| 8 | داشبورد: شمارش اسناد بر اساس index_status و doc_type |
| 9 | صفحه Ask: پاسخ موقت با Citation از Registry؛ آماده برای BACKEND_URL |
| 10 | Settings: نمایش PRIMARY_KNOWLEDGE_DRIVE و REGISTRY_SHEET لینک‌ها |
| 11 | نقش viewer فقط خواندن؛ expert ثبت؛ manager تأیید؛ owner همه |
| 12 | قوانین ضروری در UI به‌صورت چک‌لیست وضعیت ایندکس (۴ قانون + بودجه) |
| 13 | RTL کامل فارسی در صفحات عمومی و authenticated |
| 14 | بدون commit کردن secret؛ فقط env مثال |
| 15 | در پایان هر اسپرینت: **ZIP کامل پروژه** برای به‌روزرسانی GitHub ارسال شود |

---

## خروجی مورد انتظار از همکار

- استقرار UI پایدار روی Lovable  
- ZIP جدید پروژه پس از اعمال دستورات ۱–۱۴  
- گزارش کوتاه: چه مواردی done / blocked  

## خارج از محدوده Lovable

Parser/Embedding/Vector DB/ربات تلگرام-بله → MKA-Core Python
