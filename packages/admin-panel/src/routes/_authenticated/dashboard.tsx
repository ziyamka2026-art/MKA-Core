import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DOC_TYPES, INDEX_STATUSES, LAW_CATEGORIES } from "@/lib/mka-constants";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "داشبورد MKA — وضعیت ایندکس اسناد" },
      {
        name: "description",
        content: "شمارش اسناد Registry به تفکیک نوع سند و وضعیت ایندکس، همراه آخرین ثبت‌ها.",
      },
      { property: "og:title", content: "داشبورد MKA" },
      { property: "og:description", content: "وضعیت ایندکس اسناد مالیاتی در پلتفرم MKA." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard-docs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registry_documents")
        .select("id, doc_code, title, doc_type, index_status, law_category, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const docs = data ?? [];
  const countBy = (key: "doc_type" | "index_status", value: string) =>
    docs.filter((d) => d[key] === value).length;

  return (
    <AppShell>
      <h1 className="text-2xl font-bold">داشبورد</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        مجموع اسناد ثبت‌شده: {docs.length.toLocaleString("fa-IR")}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">به تفکیک نوع سند</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {DOC_TYPES.map((t) => (
              <Badge key={t} variant="secondary">
                {t}: {countBy("doc_type", t).toLocaleString("fa-IR")}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">به تفکیک وضعیت ایندکس</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {INDEX_STATUSES.map((s) => (
              <Badge key={s} variant="outline">
                {s}: {countBy("index_status", s).toLocaleString("fa-IR")}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">قوانین ضروری و وضعیت ایندکس</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {LAW_CATEGORIES.map((c) => {
            const rows = docs.filter((d) => d.law_category === c.name);
            const indexed = rows.filter((d) => d.index_status === "ایندکس‌شده").length;
            return (
              <div
                key={c.priority}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm"
              >
                <span>
                  {c.priority}. {c.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {rows.length === 0
                    ? "بدون ردیف Registry"
                    : `${indexed.toLocaleString("fa-IR")} از ${rows.length.toLocaleString("fa-IR")} ایندکس‌شده`}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">آخرین ثبت‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {docs.slice(0, 8).map((d) => (
            <div key={d.id} className="rounded-md border p-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{d.doc_code}</Badge>
                <span className="font-medium">{d.title}</span>
                <Badge variant="outline">{d.index_status}</Badge>
              </div>
            </div>
          ))}
          {docs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              هنوز سندی ثبت نشده است.{" "}
              <Link to="/registry" className="text-primary underline">
                ثبت اولین سند
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
