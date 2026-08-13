import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/AppShell";
import { askMka } from "@/lib/rag.functions";
import type { Citation } from "@/lib/rag.server";

export const Route = createFileRoute("/_authenticated/ask")({
  head: () => ({
    meta: [
      { title: "پرس‌وجوی RAG — پاسخ مستند MKA" },
      {
        name: "description",
        content: "سؤال مالیاتی بپرسید؛ پاسخ با استناد (Citation) از اسناد ثبت‌شده Registry دریافت کنید.",
      },
      { property: "og:title", content: "پرس‌وجوی RAG — MKA" },
      { property: "og:description", content: "پاسخ‌های مستند مالیاتی با استناد در پلتفرم MKA." },
    ],
  }),
  component: AskPage,
});

function AskPage() {
  const ask = useServerFn(askMka);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (question.trim().length < 3) return;
    setLoading(true);
    setAnswer(null);
    setCitations([]);
    try {
      const res = await ask({ data: { question: question.trim() } });
      setAnswer(res.answer);
      setCitations(res.citations);
    } catch (e) {
      setAnswer(
        `خطا در دریافت پاسخ: ${e instanceof Error ? e.message : "خطای ناشناخته"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <h1 className="text-2xl font-bold">پرس‌وجوی RAG</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        پاسخ از اسناد ثبت‌شده در Registry (شبیه‌سازی فاز A) با استناد تولید می‌شود. اتصال به Backend
        پایتون MKA-Core از طریق <code>BACKEND_URL</code> در تنظیمات.
      </p>

      <Card className="mt-4">
        <CardContent className="space-y-3 p-4">
          <Textarea
            rows={3}
            placeholder="مثال: آیا پرداخت هزینه آموزش معاف از مالیات است؟"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button disabled={loading} onClick={submit}>
            {loading ? "در حال پردازش…" : "پرسش"}
          </Button>
        </CardContent>
      </Card>

      {answer && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">پاسخ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap leading-relaxed">{answer}</p>
          </CardContent>
        </Card>
      )}

      {citations.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">منابع استناد ({citations.length.toLocaleString("fa-IR")})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {citations.map((c, i) => (
              <div key={c.source_id} className="rounded-md border p-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{i + 1}</Badge>
                  <Badge>{c.doc_code}</Badge>
                  <span className="font-medium">{c.title}</span>
                  <Badge variant="outline">{c.doc_type}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.doc_number && `شماره: ${c.doc_number} · `}
                  {c.doc_date && `تاریخ: ${c.doc_date}`}
                </p>
                {c.source_url && (
                  <a className="text-xs text-primary underline" href={c.source_url} target="_blank" rel="noreferrer">
                    بازدید منبع
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
