import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateWaiver,
  runWaiverSmokeTests,
  type PenaltyRow,
  type WaiverResult,
} from "@/lib/waiver-calculator";
import {
  CIRCULAR_CONFIG,
  DEFAULT_PENALTY_TYPES,
  DOC_CHECKLIST,
  WAIVER_VERSION,
} from "@/lib/waiver-config";
import { PRIMARY_KNOWLEDGE_DRIVE_URL } from "@/lib/mka-constants";

export const Route = createFileRoute("/_authenticated/waiver")({
  head: () => ({
    meta: [
      { title: "محاسبه‌گر بخشودگی جرائم — MousaviTax / MKA" },
      {
        name: "description",
        content:
          "پیشنهاد سیستمی بخشودگی جرائم قابل بخشش مطابق دستورالعمل ۲۰۰/۱۴۰۴/۵۰۴ — نیازمند تأیید انسان",
      },
    ],
  }),
  component: WaiverPage,
});

function fmtPct(n: number) {
  return (n * 100).toFixed(2) + "٪";
}
function fmtNum(n: number) {
  return Math.round(n).toLocaleString("fa-IR");
}

function WaiverPage() {
  const [taxpayer, setTaxpayer] = useState("");
  const [nid, setNid] = useState("");
  const [source, setSource] = useState("عملکرد");
  const [year, setYear] = useState(1403);
  const [diagDate, setDiagDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [payDate, setPayDate] = useState("");

  const [appealStages, setAppealStages] = useState(0);
  const [reduceDebt30, setReduceDebt30] = useState(false);
  const [afterExec, setAfterExec] = useState(false);
  const [payType, setPayType] = useState<"پرداخت نقدی" | "ترتیب پرداخت">("پرداخت نقدی");
  const [art80, setArt80] = useState(false);
  const [art40, setArt40] = useState(false);
  const [isProd, setIsProd] = useState(false);
  const [specialOk, setSpecialOk] = useState(true);

  const [penalties, setPenalties] = useState<PenaltyRow[]>(() =>
    DEFAULT_PENALTY_TYPES.map((t, i) => ({
      type: t,
      amount: 0,
      waivable: i !== 8,
    })),
  );

  const [docs, setDocs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(DOC_CHECKLIST.map((d) => [d, false])),
  );

  const [result, setResult] = useState<WaiverResult | null>(null);
  const [tests, setTests] = useState<ReturnType<typeof runWaiverSmokeTests> | null>(null);

  const missingDocs = useMemo(
    () => DOC_CHECKLIST.filter((d) => !docs[d]),
    [docs],
  );

  const onCalc = () => {
    const r = calculateWaiver({
      year,
      appealStages,
      reduceDebt30,
      afterExecutiveOneMonth: afterExec,
      payType,
      art190_80: art80,
      art190_40: art40,
      isProductionUnit: isProd,
      specialOk,
      payDate,
      penalties,
    });
    setResult(r);
  };

  const circ = CIRCULAR_CONFIG.circulars[CIRCULAR_CONFIG.activeCircularId];

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6 p-4" dir="rtl">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">محاسبه‌گر بخشودگی جرائم</h1>
          <p className="text-sm text-muted-foreground">
            نسخه قواعد {WAIVER_VERSION} — بخشنامه فعال: {circ.id} ({circ.title} — {circ.date})
          </p>
          <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm font-medium text-amber-900 dark:text-amber-100">
            خروجی سیستمی برای بررسی انسان است و جایگزین رأی سازمان امور مالیاتی یا مشاور رسمی
            نیست. وضعیت: HUMAN_REVIEW_REQUIRED
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">۱. مشخصات پرونده</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>نام مودی</Label>
              <Input value={taxpayer} onChange={(e) => setTaxpayer(e.target.value)} />
            </div>
            <div>
              <Label>شناسه / کد ملی</Label>
              <Input value={nid} onChange={(e) => setNid(e.target.value)} />
            </div>
            <div>
              <Label>منبع مالیاتی</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["عملکرد", "ارزش افزوده", "حقوق", "اجاره", "تکلیفی", "نقل و انتقال", "سایر"].map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>سال / دوره</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value) || 1403)}
              />
            </div>
            <div>
              <Label>تاریخ ابلاغ تشخیص</Label>
              <Input
                placeholder="1404/03/15"
                value={diagDate}
                onChange={(e) => setDiagDate(e.target.value)}
              />
            </div>
            <div>
              <Label>تاریخ قطعیت</Label>
              <Input value={finalDate} onChange={(e) => setFinalDate(e.target.value)} />
            </div>
            <div>
              <Label>تاریخ پرداخت / ترتیب پرداخت</Label>
              <Input
                placeholder="1405/05/28"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">۲. ثبت تفکیکی جرائم (ریال)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {penalties.map((p, i) => (
              <div key={i} className="grid grid-cols-12 items-center gap-2 text-sm">
                <span className="col-span-5 truncate">{p.type}</span>
                <Input
                  className="col-span-4"
                  type="number"
                  value={p.amount || ""}
                  onChange={(e) => {
                    const next = [...penalties];
                    next[i] = { ...p, amount: Number(e.target.value) || 0 };
                    setPenalties(next);
                  }}
                />
                <Select
                  value={p.waivable ? "بله" : "خیر"}
                  onValueChange={(v) => {
                    const next = [...penalties];
                    next[i] = { ...p, waivable: v === "بله" };
                    setPenalties(next);
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="بله">قابل بخشش</SelectItem>
                    <SelectItem value="خیر">غیرقابل بخشش</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">۳. شرایط</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>تعداد مراحل دادرسی</Label>
              <Input
                type="number"
                value={appealStages}
                onChange={(e) => setAppealStages(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>نوع پرداخت</Label>
              <Select
                value={payType}
                onValueChange={(v) => setPayType(v as "پرداخت نقدی" | "ترتیب پرداخت")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="پرداخت نقدی">پرداخت نقدی</SelectItem>
                  <SelectItem value="ترتیب پرداخت">ترتیب پرداخت</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(
              [
                ["کاهش بدهی ≥۳۰٪", reduceDebt30, setReduceDebt30],
                ["پرداخت پس از ۱ ماه اجرایی", afterExec, setAfterExec],
                ["معافیت ۸۰٪ ماده ۱۹۰", art80, setArt80],
                ["معافیت ۴۰٪ (۱ ماه از قطعی)", art40, setArt40],
                ["واحد تولیدی/آسیب‌دیده", isProd, setIsProd],
                ["شرط افزایش ویژه", specialOk, setSpecialOk],
              ] as const
            ).map(([label, val, set]) => (
              <div key={label} className="flex items-center justify-between gap-2 rounded border p-2">
                <span className="text-sm">{label}</span>
                <Select
                  value={val ? "بله" : "خیر"}
                  onValueChange={(v) => set(v === "بله")}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="خیر">خیر</SelectItem>
                    <SelectItem value="بله">بله</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button onClick={onCalc}>محاسبه بخشودگی</Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => setTests(runWaiverSmokeTests())}
          >
            آزمون داخلی فرمول
          </Button>
          <a
            className="inline-flex items-center text-sm text-primary underline"
            href={PRIMARY_KNOWLEDGE_DRIVE_URL}
            target="_blank"
            rel="noreferrer"
          >
            مخزن دانش Drive
          </a>
        </div>

        {tests && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">نتیجه آزمون فرمول</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {tests.map((t) => (
                <div key={t.name}>
                  <Badge variant={t.ok ? "default" : "destructive"}>{t.ok ? "OK" : "FAIL"}</Badge>{" "}
                  {t.name} → {t.detail}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="border-green-700/40">
            <CardHeader>
              <CardTitle className="text-base">۴. نتیجه (پیشنهاد سیستمی)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                مودی: <strong>{taxpayer || "—"}</strong> | منبع: {source} | سال: {year}
              </p>
              <p>درصد پایه پس از کسورات: {fmtPct(result.baseAfterDeductions)}</p>
              <p>معافیت ماده ۱۹۰: {fmtPct(result.art190Rate)}</p>
              <p>افزایش ویژه: {fmtPct(result.specialAdd)}</p>
              <p className="text-lg font-bold">
                درصد نهایی: {fmtPct(result.finalPct)}
              </p>
              <p>جمع قابل بخشش: {fmtNum(result.waivableSum)} ریال</p>
              <p className="text-destructive">
                غیرقابل بخشش: {fmtNum(result.nonWaivableSum)} ریال
              </p>
              <p className="text-lg font-bold text-green-800 dark:text-green-300">
                مبلغ بخشودگی پیشنهادی: {fmtNum(result.waivedAmount)} ریال
              </p>
              <p>مانده: {fmtNum(result.remaining)} ریال</p>
              <p className="text-xs text-muted-foreground">
                circular={result.circularId} | rule={result.ruleVersion}
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-200">{result.disclaimer}</p>
              {missingDocs.length > 0 && (
                <div className="mt-2 rounded border p-2">
                  <p className="font-medium">مدارک کسری ({missingDocs.length}):</p>
                  <ul className="list-disc pr-5">
                    {missingDocs.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">۵. چک‌لیست مدارک</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {DOC_CHECKLIST.map((d) => (
              <label key={d} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!docs[d]}
                  onChange={(e) => setDocs({ ...docs, [d]: e.target.checked })}
                />
                {d}
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
