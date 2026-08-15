import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { INDEX_STATUSES, PRIMARY_KNOWLEDGE_DRIVE_URL } from "@/lib/mka-constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/circulars")({
  head: () => ({
    meta: [
      { title: "بخشنامه‌های مالیاتی MKA — فهرست و وضعیت ایندکس" },
      {
        name: "description",
        content:
          "فهرست بخشنامه‌ها و دستورالعمل‌های مالیاتی ثبت‌شده در Registry با شماره، تاریخ، منبع و وضعیت ایندکس.",
      },
      { property: "og:title", content: "بخشنامه‌های مالیاتی MKA" },
      {
        property: "og:description",
        content: "فهرست بخشنامه‌های ثبت‌شده در Registry دانش مالیاتی MKA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CircularsPage,
});

type Row = {
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
  body_text: string | null;
};

function CircularsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data } = useQuery({
    queryKey: ["circulars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registry_documents")
        .select(
          "id,doc_code,doc_type,doc_number,doc_date,title,source_url,drive_path,law_category,index_status,body_text",
        )
        .in("doc_type", ["بخشنامه", "دستورالعمل", "ابلاغیه"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Row[];
    },
  });

  const rows = useMemo(() => {
    const list = data ?? [];
    return list.filter((r) => {
      if (statusFilter !== "all" && r.index_status !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return `${r.doc_code} ${r.title} ${r.doc_number ?? ""} ${r.law_category ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [data, search, statusFilter]);

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">بخشنامه‌ها و دستورالعمل‌ها</h1>
        <Button asChild variant="outline" size="sm">
          <a href={PRIMARY_KNOWLEDGE_DRIVE_URL} target="_blank" rel="noreferrer">
            مخزن اصلی دانش (Drive)
          </a>
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        هر بخشنامه دریافت‌شده از مخزن دانش، یک ردیف Registry با نوع «بخشنامه» دارد. برای ثبت مورد
        جدید به{" "}
        <Link to="/registry" className="text-primary underline">
          Registry اسناد
        </Link>{" "}
        بروید.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Input
          className="max-w-xs"
          placeholder="جستجو در عنوان / شماره / کد"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="وضعیت ایندکس" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه وضعیت‌ها</SelectItem>
            {INDEX_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="self-center">
          {rows.length.toLocaleString("fa-IR")} مورد
        </Badge>
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
                  {r.body_text ? <Badge>متن دارد</Badge> : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {r.doc_number ? `شماره: ${r.doc_number}` : "بدون شماره"}
                  {r.doc_date ? ` · تاریخ: ${r.doc_date}` : null}
                  {r.law_category ? ` · ${r.law_category}` : null}
                </p>
                {r.drive_path ? (
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {r.drive_path}
                  </p>
                ) : null}
              </div>
              {r.source_url && (
                <Button asChild size="sm" variant="ghost">
                  <a href={r.source_url} target="_blank" rel="noreferrer">
                    منبع
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            بخشنامه‌ای مطابق فیلترها یافت نشد.
          </p>
        )}
      </div>
    </AppShell>
  );
}
