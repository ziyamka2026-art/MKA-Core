import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DOC_TYPES,
  INDEX_STATUSES,
  LAW_CATEGORIES,
  ESSENTIAL_LAWS,
  PRIMARY_KNOWLEDGE_DRIVE_URL,
} from "@/lib/mka-constants";

export const Route = createFileRoute("/_authenticated/registry-admin")({
  head: () => ({
    meta: [
      { title: "مدیریت Registry — ویرایش وضعیت و منابع اسناد" },
      {
        name: "description",
        content:
          "داشبورد مدیریت Registry مالیاتی MKA برای ویرایش سریع وضعیت ایندکس، خانواده حقوقی و لینک منبع اسناد.",
      },
      { property: "og:title", content: "مدیریت Registry اسناد MKA" },
      {
        property: "og:description",
        content: "ویرایش گروهی وضعیت ایندکس، دسته‌بندی حقوقی و لینک منبع اسناد Registry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegistryAdminPage,
});

type Row = {
  id: string;
  doc_code: string;
  doc_type: string;
  doc_number: string | null;
  title: string;
  source_url: string | null;
  drive_path: string | null;
  law_category: string | null;
  index_status: string;
  body_text: string | null;
};

const NONE = "none";

function RegistryAdminPage() {
  const { isStaff, canContribute } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [urlDrafts, setUrlDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [openText, setOpenText] = useState<string | null>(null);
  const [textDrafts, setTextDrafts] = useState<Record<string, string>>({});
  const [csv, setCsv] = useState("");
  const [importing, setImporting] = useState(false);

  const { data } = useQuery({
    queryKey: ["registry"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registry_documents")
        .select("*")
        .order("doc_code", { ascending: true });
      if (error) throw error;
      return data as Row[];
    },
  });

  const rows = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((r) => {
      if (typeFilter !== "all" && r.doc_type !== typeFilter) return false;
      if (statusFilter !== "all" && r.index_status !== statusFilter) return false;
      if (categoryFilter !== "all") {
        if (categoryFilter === NONE ? r.law_category : r.law_category !== categoryFilter) return false;
      }
      if (q) {
        const hay = `${r.doc_code} ${r.title} ${r.doc_number ?? ""} ${r.drive_path ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data, search, typeFilter, statusFilter, categoryFilter]);

  const counters = useMemo(() => {
    const list = data ?? [];
    return {
      total: list.length,
      noSource: list.filter((r) => !r.source_url).length,
      noCategory: list.filter((r) => !r.law_category).length,
      indexed: list.filter((r) => r.index_status === "ایندکس‌شده").length,
    };
  }, [data]);

  const patch = async (row: Row, payload: Record<string, unknown>, message: string) => {
    if (!canContribute) {
      toast.error("برای ویرایش، نقش کارشناس یا بالاتر لازم است.");
      return;
    }
    setSavingId(row.id);
    const { error } = await supabase
      .from("registry_documents")
      .update(payload as never)
      .eq("id", row.id);
    setSavingId(null);
    if (error) {
      toast.error(`ذخیره نشد: ${error.message}`);
      return;
    }
    toast.success(message);
    void qc.invalidateQueries({ queryKey: ["registry"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-docs"] });
  };

  const saveUrl = async (row: Row) => {
    const draft = (urlDrafts[row.id] ?? row.source_url ?? "").trim();
    if (draft && !/^https?:\/\//i.test(draft)) {
      toast.error("لینک منبع باید با http:// یا https:// آغاز شود.");
      return;
    }
    await patch(row, { source_url: draft || null }, "لینک منبع ذخیره شد.");
    setUrlDrafts((d) => {
      const next = { ...d };
      delete next[row.id];
      return next;
    });
  };

  const saveText = async (row: Row) => {
    const draft = textDrafts[row.id] ?? row.body_text ?? "";
    await patch(row, { body_text: draft.trim() || null }, "متن سند ذخیره شد.");
  };

  const nextCode = (offset: number) => {
    const list = data ?? [];
    const nums = list
      .map((r) => /^MKA-LAW-(\d+)$/.exec(r.doc_code)?.[1])
      .filter(Boolean)
      .map((n) => Number(n));
    const max = nums.length ? Math.max(...nums) : 0;
    return `MKA-LAW-${String(max + offset).padStart(3, "0")}`;
  };

  const insertRows = async (
    items: { title: string; law_category: string | null }[],
    message: string,
  ) => {
    if (!canContribute) {
      toast.error("برای درج ردیف، نقش کارشناس یا بالاتر لازم است.");
      return;
    }
    const invalid = items.find((i) => !i.title.trim());
    if (invalid || items.length === 0) {
      toast.error("هر ردیف باید حداقل عنوان داشته باشد.");
      return;
    }
    setImporting(true);
    const { data: session } = await supabase.auth.getUser();
    const uid = session.user?.id;
    const payload = items.map((i, idx) => ({
      doc_code: nextCode(idx + 1),
      doc_type: "قانون",
      title: i.title.trim(),
      law_category: i.law_category,
      index_status: "شناسایی‌شده",
      created_by: uid,
    }));
    const { error } = await supabase.from("registry_documents").insert(payload as never);
    setImporting(false);
    if (error) {
      toast.error(`درج انجام نشد: ${error.message}`);
      return;
    }
    toast.success(message);
    void qc.invalidateQueries({ queryKey: ["registry"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-docs"] });
  };

  const seedEssentialLaws = async () => {
    const existing = new Set((data ?? []).map((r) => r.law_category ?? ""));
    const missing = ESSENTIAL_LAWS.filter((l) => !existing.has(l.name)).slice(0, 4);
    if (missing.length === 0) {
      toast.info("برای همه قوانین اصلی حداقل یک ردیف Registry وجود دارد.");
      return;
    }
    await insertRows(
      missing.map((l) => ({ title: `قانون ${l.name}`, law_category: l.name })),
      `${missing.length.toLocaleString("fa-IR")} ردیف نمونه قانون اصلی ثبت شد.`,
    );
  };

  const importCsv = async () => {
    const lines = csv
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !/^عنوان\s*,/.test(l));
    if (lines.length === 0) {
      toast.error("متن CSV خالی است. هر خط: عنوان,خانواده حقوقی");
      return;
    }
    const items = lines.map((line) => {
      const [title, category] = line.split(",");
      const cat = (category ?? "").trim();
      const known = LAW_CATEGORIES.find((c) => c.name === cat);
      return { title: (title ?? "").trim(), law_category: known ? known.name : null };
    });
    await insertRows(items, `${items.length.toLocaleString("fa-IR")} ردیف از CSV ثبت شد.`);
    setCsv("");
  };

  return (
    <AppShell>
      <h1 className="text-2xl font-bold">داشبورد مدیریت Registry</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        ویرایش سریع وضعیت ایندکس، خانواده حقوقی و لینک منبع هر سند — بدون باز کردن فرم کامل.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <StatCard label="کل اسناد" value={counters.total} />
        <StatCard label="ایندکس‌شده" value={counters.indexed} />
        <StatCard label="بدون لینک منبع" value={counters.noSource} />
        <StatCard label="بدون دسته‌بندی" value={counters.noCategory} />
      </div>

      {canContribute && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">درج دستی ردیف‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" disabled={importing} onClick={() => void seedEssentialLaws()}>
                درج ردیف نمونه چهار قانون اصلی
              </Button>
              <Button asChild size="sm" variant="ghost">
                <a href={PRIMARY_KNOWLEDGE_DRIVE_URL} target="_blank" rel="noreferrer">
                  بازبینی مخزن دانش
                </a>
              </Button>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">
                import از CSV — هر خط: عنوان,خانواده حقوقی
              </label>
              <Textarea
                rows={3}
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
                placeholder={"قانون مالیات‌های مستقیم,مالیات‌های مستقیم"}
              />
              <Button size="sm" variant="outline" disabled={importing} onClick={() => void importCsv()}>
                {importing ? "در حال درج…" : "درج ردیف‌های CSV"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Input
          placeholder="جستجو در کد / عنوان / شماره / مسیر Drive"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="نوع سند" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه انواع</SelectItem>
            {DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="وضعیت ایندکس" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه وضعیت‌ها</SelectItem>
            {INDEX_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="خانواده حقوقی" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه دسته‌ها</SelectItem>
            <SelectItem value={NONE}>بدون دسته‌بندی</SelectItem>
            {LAW_CATEGORIES.map((c) => <SelectItem key={c.priority} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardContent className="space-y-3 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{r.doc_code}</Badge>
                <span className="font-medium">{r.title}</span>
                <Badge variant="outline">{r.doc_type}</Badge>
                {r.body_text ? <Badge>دارای متن</Badge> : null}
                {savingId === r.id ? (
                  <span className="text-xs text-muted-foreground">در حال ذخیره…</span>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">وضعیت ایندکس</label>
                  <Select
                    value={r.index_status}
                    disabled={!isStaff}
                    onValueChange={(v) => void patch(r, { index_status: v }, "وضعیت ایندکس به‌روزرسانی شد.")}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {INDEX_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {!isStaff && (
                    <p className="text-[11px] text-muted-foreground">
                      تغییر وضعیت ایندکس فقط برای مدیر و مالک فعال است.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">خانواده حقوقی</label>
                  <Select
                    value={r.law_category ?? NONE}
                    disabled={!canContribute}
                    onValueChange={(v) =>
                      void patch(r, { law_category: v === NONE ? null : v }, "دسته‌بندی ذخیره شد.")
                    }
                  >
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>بدون دسته‌بندی</SelectItem>
                      {LAW_CATEGORIES.map((c) => <SelectItem key={c.priority} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">لینک منبع (source_url)</label>
                <div className="flex flex-wrap gap-2">
                  <Input
                    dir="ltr"
                    className="min-w-[16rem] flex-1"
                    placeholder="https://..."
                    disabled={!canContribute}
                    value={urlDrafts[r.id] ?? r.source_url ?? ""}
                    onChange={(e) => setUrlDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                  />
                  {canContribute && (
                    <Button size="sm" onClick={() => void saveUrl(r)}>ذخیره لینک</Button>
                  )}
                  {r.source_url && (
                    <Button asChild size="sm" variant="ghost">
                      <a href={r.source_url} target="_blank" rel="noreferrer">بازکردن</a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpenText((v) => (v === r.id ? null : r.id))}
                >
                  {openText === r.id ? "بستن متن سند" : "متن سند (body_text)"}
                </Button>
                {openText === r.id && (
                  <div className="space-y-2">
                    <Textarea
                      rows={8}
                      disabled={!canContribute}
                      value={textDrafts[r.id] ?? r.body_text ?? ""}
                      onChange={(e) => setTextDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                      placeholder="متن استخراج‌شده سند را اینجا الصاق کنید."
                    />
                    {canContribute ? (
                      <Button size="sm" onClick={() => void saveText(r)}>ذخیره متن سند</Button>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        نقش بازدیدکننده فقط اجازه مشاهده دارد.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">سندی با این فیلترها یافت نشد.</p>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-2xl font-bold">{value.toLocaleString("fa-IR")}</CardContent>
    </Card>
  );
}
