# MKA Google Drive Sync & Circular Downloader

## الف) دانلود سیستمی از لیست URL

```bash
cd packages/google-drive-sync
cp config/urls.example.txt config/urls.txt
# لینک مستقیم PDFها را در urls.txt بگذارید

pip install -r requirements.txt
python -m app.download_circulars
```

فایل‌ها در `data/circulars_download/` ذخیره می‌شوند.  
سپس در Google Drive (پوشه بخشنامه‌ها/سال) آپلود کنید.

## ب) ایندکس خودکار پوشه محلی (Watch دستی)

هر بار که فایل جدید اضافه کردید:

```bash
# نیاز: ollama pull nomic-embed-text
python -m app.index_local --path data/circulars_download
python -m app.index_local --path path/to/قوانین
```

یا کل پوشه دانش:

```bash
python -m app.index_local --path D:\AI\GitHub\MKA\data
```

## ج) گردش پیشنهادی

1. لینک PDF را در `urls.txt` بگذارید → دانلود  
2. کپی به Google Drive (پشتیبان + منبع رسمی پروژه)  
3. `index_local` → ورود به پایگاه پرس‌وجو  
4. Backend RAG از همان Vector Store می‌خواند (مرحله بعد)

## پوشه‌های Drive فعلی

- قوانین: `1_QZ1av8XDBAz2VIpV0jj-FlCI1cp40qk`
- بخشنامه‌ها: `1FBESkAeVnuGZF3jHvYjr69mxzxcDjJtQ`
  - ۱۴۰۴ / ۱۴۰۵
