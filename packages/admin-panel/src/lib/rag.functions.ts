import type { RagResult } from "./rag.server";

/** Client-side stub; replace with BACKEND_URL /v1/rag/query when available. */
export async function askMka(query: string): Promise<RagResult> {
  const q = query.trim();
  if (!q) {
    return { answer: "پرسش خالی است.", citations: [] };
  }
  return {
    answer:
      "پاسخ آزمایشی MKA: برای پاسخ مستند، اسناد را در Registry ایندکس کنید یا BACKEND_URL را در تنظیمات وصل کنید. این خروجی جایگزین مشاور رسمی نیست.",
    citations: [],
    model: "stub-local",
  };
}
