import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DOC_TYPES, INDEX_STATUSES, LAW_CATEGORIES } from "@/lib/mka-constants";

export const Route = createFileRoute("/_authenticated/registry")({
  head: () => ({
    meta: [
      { title: "Registry اسناد MKA — مدیریت اسناد مالیاتی" },
      {
        name: "description",
        content: "ثبت، ویرایش و فیلتر اسناد Registry مالیاتی همراه با استنادهای نمونه (Citation).",
      },
      { property: "og:title", content: "Registry اسناد MKA" },
      { property: "og:description", content: "مدیریت اسناد مالیاتی و استنادها در پلتفرم MKA." },
    ],
  }),
  component: RegistryPage,
});

type RegistryRow = {
  id: string;
  doc_code: string;
  doc_type: string;
  doc_number: string | null;
  doc_date: string | null;
  title: string;
  source_url: string | null;
  drive_path: string | null;
  law_category: string | null;
  index_status: string;
  notes: string | null;
};

type CitationRow = {
  id: string;
  source_title: string;
  page: string | null;
  section: string | null;
  snippet: string;
  approved: boolean;
};

type FormState = {
  doc_code: string;
  doc_type: string;
  doc_number: string;
  doc_date: string;
  title: string;
  source_url: string;
  drive_path: string;
  law_category: string;
  index_status: string;
  notes: string;
};

function emptyForm(): FormState {
  return {
    doc_code: "",
    doc_type: "قانون",
    doc_number: "",
    doc_date: "",
    title: "",
    source_url: "",
    drive_path: "",
    law_category: "",
    index_status: "شناسایی‌شده",
    notes: "",
  };
}

function RegistryPage() {
  const { canContribute, isStaff } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<RegistryRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  // doc_type / index_status come from DB enums; cast to the union at save time.
  const [open, setOpen] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["registry"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registry_documents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RegistryRow[];
    },
  });

  const rows = useMemo(() => {
    const list = data ?? [];
    return list.filter((r) => {
      if (typeFilter !== "all" && r.doc_type !== typeFilter) return false;
      if (statusFilter !== "all" && r.index_status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${r.doc_code} ${r.title} ${r.doc_number ?? ""} ${r.notes ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data, search, typeFilter, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const openEdit = (r: RegistryRow) => {
    setEditing(r);
    setForm({
      ...r,
      doc_number: r.doc_number ?? "",
      doc_date: r.doc_date ?? "",
      source_url: r.source_url ?? "",
      drive_path: r.drive_path ?? "",
      law_category: r.law_category ?? "",
      notes: r.notes ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.doc_code.trim() || !form.title.trim()) {
      toast.error("کد سند و عنوان الزامی است.");
      return;
    }
    const payload = {
      doc_code: form.doc_code.trim(),
      doc_type: form.doc_type,
      doc_number: form.doc_number.trim() || null,
      doc_date: form.doc_date.trim() || null,
      title: form.title.trim(),
      source_url: form.source_url.trim() || null,
      drive_path: form.drive_path.trim() || null,
      law_category: form.law_category || null,
      index_status: form.index_status,
      notes: form.notes.trim() || null,
    } as Record<string, unknown>;
    if (editing) {
      const { error } = await supabase.from("registry_documents").update(payload as never).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("سند به‌روزرسانی شد.");
    } else {
      const { error } = await supabase.from("registry_documents").insert(payload as never);
      if (error) { toast.error(error.message); return; }
      toast.success("سند ثبت شد.");
    }
    setOpen(false);
    void refetch();
    void qc.invalidateQueries({ queryKey: ["dashboard-docs"] });
  };

  const remove = async (r: RegistryRow) => {
    if (!confirm(`حذف «${r.title}»؟`)) return;
    const { error } = await supabase.from("registry_documents").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    toast.success("سند حذف شد.");
    void refetch();
    void qc.invalidateQueries({ queryKey: ["dashboard-docs"] });
  };

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Registry اسناد</h1>
        {canContribute && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>ثبت سند جدید</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "ویرایش سند" : "ثبت سند جدید"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>کد سند (doc_code) *</Label>
                    <Input value={form.doc_code} onChange={(e) => setForm({ ...form, doc_code: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>نوع سند</Label>
                    <Select value={form.doc_type} onValueChange={(v) => setForm({ ...form, doc_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>شماره سند</Label>
                    <Input value={form.doc_number} onChange={(e) => setForm({ ...form, doc_number: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>تاریخ سند</Label>
                    <Input value={form.doc_date} onChange={(e) => setForm({ ...form, doc_date: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>عنوان *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>خانواده حقوقی</Label>
                  <Select value={form.law_category || "none"} onValueChange={(v) => setForm({ ...form, law_category: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      {LAW_CATEGORIES.map((c) => <SelectItem key={c.priority} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>لینک منبع (source_url)</Label>
                    <Input value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>مسیر Drive (drive_path)</Label>
                    <Input value={form.drive_path} onChange={(e) => setForm({ ...form, drive_path: e.target.value })} dir="ltr" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>وضعیت ایندکس</Label>
                  <Select value={form.index_status} onValueChange={(v) => setForm({ ...form, index_status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {INDEX_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>یادداشت کارشناس</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
                <Button onClick={save}>{editing ? "ذخیره تغییرات" : "ثبت سند"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Input
          placeholder="جستجو در عنوان / کد / شماره / یادداشت"
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
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex flex-wrap items-start justify-between gap-3 p-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{r.doc_code}</Badge>
                  <span className="font-medium">{r.title}</span>
                  <Badge variant="outline">{r.doc_type}</Badge>
                  <Badge variant="outline">{r.index_status}</Badge>
                  {r.law_category && <Badge>{r.law_category}</Badge>}
                </div>
                {(r.doc_number || r.doc_date) && (
                  <p className="text-xs text-muted-foreground">
                    {r.doc_number ? `شماره: ${r.doc_number}` : null}
                    {r.doc_number && r.doc_date && " · "}
                    {r.doc_date ? `تاریخ: ${r.doc_date}` : null}
                  </p>
                )}
                {r.notes ? <p className="text-xs text-muted-foreground">{r.notes}</p> : null}
                <CitationsBar docId={r.id} canContribute={canContribute} isStaff={isStaff} />
              </div>
              <div className="flex gap-2">
                {canContribute && <Button size="sm" variant="outline" onClick={() => openEdit(r)}>ویرایش</Button>}
                {isStaff && <Button size="sm" variant="destructive" onClick={() => remove(r)}>حذف</Button>}
                {r.source_url && (
                  <Button asChild size="sm" variant="ghost">
                    <a href={r.source_url} target="_blank" rel="noreferrer">منبع</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            موردی یافت نشد.{" "}
            <Link to="/registry" className="text-primary underline" onClick={openCreate}>ثبت سند جدید</Link>
          </p>
        )}
      </div>
    </AppShell>
  );
}

function CitationsBar({ docId, canContribute, isStaff }: { docId: string; canContribute: boolean; isStaff: boolean }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [page, setPage] = useState("");
  const [section, setSection] = useState("");
  const [snippet, setSnippet] = useState("");
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["citations", docId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_citations")
        .select("*")
        .eq("document_id", docId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CitationRow[];
    },
  });

  const add = async () => {
    if (!title.trim() || !snippet.trim()) { toast.error("عنوان منبع و گزیده متن الزامی است."); return; }
    const { error } = await supabase.from("document_citations").insert({
      document_id: docId,
      source_title: title.trim(),
      page: page.trim() || null,
      section: section.trim() || null,
      snippet: snippet.trim(),
      approved: isStaff,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("استناد ثبت شد.");
    setTitle(""); setPage(""); setSection(""); setSnippet("");
    void qc.invalidateQueries({ queryKey: ["citations", docId] });
  };

  const toggleApprove = async (c: CitationRow) => {
    const { error } = await supabase.from("document_citations").update({ approved: !c.approved }).eq("id", c.id);
    if (error) { toast.error(error.message); return; }
    void qc.invalidateQueries({ queryKey: ["citations", docId] });
  };

  const removeC = async (c: CitationRow) => {
    const { error } = await supabase.from("document_citations").delete().eq("id", c.id);
    if (error) { toast.error(error.message); return; }
    void qc.invalidateQueries({ queryKey: ["citations", docId] });
  };

  return (
    <div className="pt-1">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => setOpen((v) => !v)}>
          استنادها ({(data ?? []).length})
        </Button>
      </div>
      {open && (
        <div className="mt-2 space-y-2 rounded-md border p-2">
          {(data ?? []).map((c) => (
            <div key={c.id} className="rounded border p-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{c.source_title}</span>
                <Badge variant={c.approved ? "default" : "outline"}>{c.approved ? "تأییدشده" : "در انتظار"}</Badge>
              </div>
              {c.page ? <span className="text-muted-foreground"> · صفحه {c.page}</span> : null}
              {c.section ? <span className="text-muted-foreground"> · {c.section}</span> : null}
              <p className="mt-1 text-muted-foreground">{c.snippet}</p>
              {isStaff && (
                <div className="mt-1 flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => toggleApprove(c)}>
                    {c.approved ? "لغو تأیید" : "تأیید"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeC(c)}>حذف</Button>
                </div>
              )}
            </div>
          ))}
          {canContribute && (
            <div className="space-y-2 border-t pt-2">
              <Input placeholder="عنوان منبع" value={title} onChange={(e) => setTitle(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="صفحه" value={page} onChange={(e) => setPage(e.target.value)} />
                <Input placeholder="ماده / بخش" value={section} onChange={(e) => setSection(e.target.value)} />
              </div>
              <Textarea placeholder="گزیده متن (snippet)" value={snippet} onChange={(e) => setSnippet(e.target.value)} rows={2} />
              <Button size="sm" onClick={add}>افزودن استناد</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
