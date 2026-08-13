import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "owner" | "manager" | "expert" | "viewer";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    let active = true;

    const loadRoles = async (user: User | null) => {
      if (!user) {
        if (active) setRoles([]);
        return;
      }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (active) setRoles((data ?? []).map((r) => r.role as AppRole));
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
      void loadRoles(data.session?.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      void loadRoles(next?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isStaff = roles.includes("owner") || roles.includes("manager");
  const canContribute = isStaff || roles.includes("expert");

  return {
    session,
    user: session?.user ?? null,
    loading,
    roles,
    isOwner: roles.includes("owner"),
    isStaff,
    canContribute,
  };
}
