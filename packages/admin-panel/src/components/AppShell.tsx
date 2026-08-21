import { Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, OWNER_DISPLAY_NAME } from "@/lib/mka-constants";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/dashboard", label: "داشبورد" },
  { to: "/registry", label: "Registry اسناد" },
  { to: "/registry-admin", label: "مدیریت Registry" },
  { to: "/circulars", label: "بخشنامه‌ها" },
  { to: "/ask", label: "پرس‌وجوی RAG" },
  { to: "/waiver", label: "بخشودگی جرائم" },
  { to: "/settings", label: "تنظیمات" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, roles, canContribute } = useAuth();
  const router = useRouter();
  const displayName = canContribute ? OWNER_DISPLAY_NAME : user?.email;


  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth" });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
          <Link to="/dashboard" className="text-lg font-bold text-primary">
            MKA — دستیار دانش مالیاتی
          </Link>
          <nav className="flex flex-wrap gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&.active]:bg-primary/10 [&.active]:font-medium [&.active]:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ms-auto flex items-center gap-2">
            {roles.map((r) => (
              <Badge key={r} variant="secondary">
                {ROLE_LABELS[r] ?? r}
              </Badge>
            ))}
            <span className="hidden text-xs text-muted-foreground sm:inline">{displayName}</span>
            <Button size="sm" variant="outline" onClick={signOut}>
              خروج
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
