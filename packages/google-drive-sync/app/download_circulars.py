"""
دانلود سیستمی بخشنامه‌ها از لیست URL و ذخیره محلی.

Usage:
  1. کپی config/urls.example.txt → config/urls.txt
  2. لینک‌های مستقیم PDF را اضافه کنید
  3. python -m app.download_circulars

سپس فایل‌ها را در Google Drive (پوشه بخشنامه ها/سال) آپلود کنید
یا با index_local.py ایندکس کنید.
"""

from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

import httpx

ROOT = Path(__file__).resolve().parents[1]
URLS_FILE = ROOT / "config" / "urls.txt"
OUT_DIR = Path(__file__).resolve().parents[3] / "data" / "circulars_download"
# fallback for monorepo root
if not (Path(__file__).resolve().parents[3] / "packages").exists():
    OUT_DIR = Path.cwd() / "data" / "circulars_download"


def safe_filename(url: str, content_disposition: str | None = None) -> str:
    if content_disposition and "filename=" in content_disposition:
        m = re.search(r'filename\*?=(?:UTF-8\'\')?"?([^";]+)"?', content_disposition, re.I)
        if m:
            name = unquote(m.group(1).strip())
            if name.lower().endswith(".pdf") or "." in name:
                return re.sub(r'[<>:"/\\|?*]', "_", name)

    path = urlparse(url).path
    name = unquote(Path(path).name) or "download.pdf"
    if not name.lower().endswith(".pdf"):
        name += ".pdf"
    return re.sub(r'[<>:"/\\|?*]', "_", name)[:180]


def download_one(client: httpx.Client, url: str, out_dir: Path) -> Path | None:
    url = url.strip()
    if not url or url.startswith("#"):
        return None
    try:
        r = client.get(url, follow_redirects=True)
        r.raise_for_status()
        ctype = r.headers.get("content-type", "")
        if "pdf" not in ctype.lower() and not url.lower().endswith(".pdf"):
            # still save if body looks like pdf
            if not r.content[:4] == b"%PDF":
                print(f"  SKIP (not PDF): {url[:80]}")
                return None
        name = safe_filename(url, r.headers.get("content-disposition"))
        # avoid collision
        dest = out_dir / name
        if dest.exists():
            h = hashlib.md5(url.encode()).hexdigest()[:8]
            dest = out_dir / f"{dest.stem}_{h}{dest.suffix}"
        dest.write_bytes(r.content)
        print(f"  OK  {dest.name}  ({len(r.content)} bytes)")
        return dest
    except Exception as e:
        print(f"  FAIL {url[:60]}...  → {e}")
        return None


def main() -> None:
    if not URLS_FILE.exists():
        print(f"فایل {URLS_FILE} پیدا نشد.")
        print("از urls.example.txt کپی بگیرید و لینک‌ها را اضافه کنید.")
        sys.exit(1)

    lines = URLS_FILE.read_text(encoding="utf-8").splitlines()
    urls = [ln.strip() for ln in lines if ln.strip() and not ln.strip().startswith("#")]
    if not urls:
        print("هیچ URLای در urls.txt نیست.")
        sys.exit(1)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"دانلود {len(urls)} مورد → {OUT_DIR}")

    ok = 0
    with httpx.Client(timeout=90.0, headers={"User-Agent": "MKA-KnowledgeBot/0.1"}) as client:
        for url in urls:
            if download_one(client, url, OUT_DIR):
                ok += 1

    print(f"\nتمام: {ok}/{len(urls)} موفق")
    print("مرحله بعد: فایل‌ها را در Drive آپلود کنید یا index_local را اجرا کنید.")


if __name__ == "__main__":
    main()
