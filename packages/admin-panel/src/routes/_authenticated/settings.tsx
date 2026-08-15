import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
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
  ROLE_LABELS,
  TRUSTED_SOURCES,
  PRIMARY_KNOWLEDGE_DRIVE_URL,
  FALLBACK_KNOWLEDGE_DRIVE_URL,
  REGISTRY_SHEET_URL,
} from "@/lib/mka-constants";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "تنظیمات MKA — اتصال Backend و نقش‌ها" },
      {
        name: "description",
        content: "پیکربندی آدرس Backend (MKA-Core)، مدیریت نقش کاربران و منابع معتبر.",
      },
      { property: "og:title", content: "تنظیمات MKA" },
      { property: "og:description", content: "اتصال به Backend و مدیریت نقش‌ها در پلتفرم MKA." },
    ],
  }),
  component: SettingsPage,
});

type RoleRow = { id: string; user_id: string; role: string };
type ProfileRow = { id: string; display_name: string | null };

const BACKEND_KEY = "mka_backend_url";

function SettingsPage() {
  const { isOwner } = useAuth();
  const [backend, setBackend] = useState("");
  const [saved, setSaved] = useState(false);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [newRoleUser, setNewRoleUser] = useState("");
  const [newRole, setNewRole] = useState<"owner" | "manager" | "expert" | "viewer">("viewer");

  useEffect(() => {
    setBackend(localStorage.getItem(BACKEND_KEY) ?? "");
  }, []);

  const saveBackend = () => {
    localStorage.setItem(BACKEND_KEY, backend.trim());
    setSaved(true);
    toast.success("آدرس Backend ذخیره شد (در همین مرورگر).");
  };

  const loadRoles = async () => {
    const { data } = await supabase.from("user_roles").select("*");
    setRoles((data as RoleRow[]) ?? []);
    const ids = Array.from(new Set((data ?? []).map((r: RoleRow) => r.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", ids);
      const map: Record<string, ProfileRow> = {};
      for (const p of (profs as ProfileRow[]) ?? []) map[p.id] = p;
      setProfiles(map);
    }
  };

  useEffect(() => {
    void loadRoles();
  }, []);

  const addRole = async () => {
    if (!newRoleUser.trim()) { toast.error("شناسه کاربر را وارد کنید."); return; }
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: newRoleUser.trim(), role: newRole } as never);
    if (error) { toast.error(error.message); return; }
    toast.success("نقش افزوده شد.");
    setNewRoleUser("");
    void loadRoles();
  };

  const removeRole = async (r: RoleRow) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    void loadRoles();
  };

  return (
    <AppShell>
      <h1 className="text-2xl font-bold">تنظیمات</h1>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">اتصال به Backend (MKA-Core)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            اختیاری. وقتی پر شود، پرس‌وجوی RAG به جای شبیه‌سازی ابری، از{" "}
            <code>{`POST {BACKEND_URL}/v1/rag/query`}</code> استفاده می‌کند. اکنون به‌صورت محلی در
            مرورگر ذخیره می‌شود تا بعداً بدون بازنویسی وصل شود.
          </p>
          <div className="flex flex-wrap gap-2">
            <Input
              dir="ltr"
              className="max-w-md"
              placeholder="https://mka-core.example.com"
              value={backend}
              onChange={(e) => { setBackend(e.target.value); setSaved(false); }}
            />
            <Button onClick={saveBackend}>ذخیره</Button>
            {saved && <Badge variant="secondary">ذخیره شد</Badge>}
          </div>
          <div className="space-y-1 text-xs">
            <p>
              مخزن دانش اصلی:{" "}
              <a className="text-primary underline" href={PRIMARY_KNOWLEDGE_DRIVE_URL} target="_blank" rel="noreferrer">
                Google Drive (منبع اول)
              </a>
            </p>
            <p>
              مخزن مکمل:{" "}
              <a className="text-primary underline" href={FALLBACK_KNOWLEDGE_DRIVE_URL} target="_blank" rel="noreferrer">
                Google Drive (منبع دوم)
              </a>
            </p>
            <p>
              شیت Registry:{" "}
              <a className="text-primary underline" href={REGISTRY_SHEET_URL} target="_blank" rel="noreferrer">
                Google Sheet
              </a>
            </p>
          </div>

        </CardContent>
      </Card>

      {isOwner ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">مدیریت نقش کاربران</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Input
                className="max-w-xs"
                placeholder="شناسه کاربر (UUID)"
                value={newRoleUser}
                onChange={(e) => setNewRoleUser(e.target.value)}
                dir="ltr"
              />
              <Select value={newRole} onValueChange={(v) => setNewRole(v as "owner" | "manager" | "expert" | "viewer")}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addRole}>افزودن نقش</Button>
            </div>
            <div className="space-y-1">
              {roles.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded border p-2 text-sm">
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary">{ROLE_LABELS[r.role] ?? r.role}</Badge>
                    <span className="text-muted-foreground" dir="ltr">
                      {profiles[r.user_id]?.display_name ?? r.user_id}
                    </span>
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => removeRole(r)}>حذف</Button>
                </div>
              ))}
              {roles.length === 0 && (
                <p className="text-xs text-muted-foreground">هنوز نقشی تعریف نشده.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          مدیریت نقش‌ها فقط برای نقش «مالک» قابل‌مشاهده است.
        </p>
      )}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">منابع معتبر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {TRUSTED_SOURCES.map((s) => (
            <div key={s.rank} className="flex justify-between rounded border p-2 text-sm">
              <span>{s.rank}. {s.domain}</span>
              <span className="text-xs text-muted-foreground">{s.note}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
