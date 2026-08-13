import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ورود به پنل MKA — دستیار دانش مالیاتی" },
      {
        name: "description",
        content: "ورود یا ثبت‌نام در پنل مدیریت دانش مالیاتی MKA برای دسترسی به Registry اسناد.",
      },
      { property: "og:title", content: "ورود به پنل MKA" },
      { property: "og:description", content: "ورود به پنل مدیریت دانش مالیاتی MKA." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.navigate({ to: "/dashboard" });
    });
  }, [router]);

  const signIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.navigate({ to: "/dashboard" });
  };

  const signUp = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("ثبت‌نام انجام شد. اگر تأیید ایمیل فعال باشد، ایمیل خود را بررسی کنید.");
  };

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-primary">پنل مدیریت دانش MKA</CardTitle>
          <CardDescription>
            دسترسی فقط برای کاربران دارای نقش معتبر (مالک / مدیر / کارشناس).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="in">
            <TabsList className="w-full">
              <TabsTrigger value="in" className="flex-1">
                ورود
              </TabsTrigger>
              <TabsTrigger value="up" className="flex-1">
                ثبت‌نام
              </TabsTrigger>
            </TabsList>
            <TabsContent value="in" className="space-y-3 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">ایمیل</Label>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pass">گذرواژه</Label>
                <Input
                  id="pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" disabled={busy} onClick={signIn}>
                ورود
              </Button>
            </TabsContent>
            <TabsContent value="up" className="space-y-3 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">نام نمایشی</Label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email2">ایمیل</Label>
                <Input id="email2" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pass2">گذرواژه</Label>
                <Input
                  id="pass2"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" disabled={busy} onClick={signUp}>
                ایجاد حساب
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
