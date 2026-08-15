import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvisorContact } from "@/components/AdvisorContact";
import { LAW_CATEGORIES, PHASES } from "@/lib/mka-constants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MKA — پنل دانش مالیاتی با استناد" },
      {
        name: "description",
        content:
          "پنل مدیریت Registry اسناد مالیاتی و پرس‌وجوی RAG با استناد (Citation) بر پایه منابع معتبر سازمان امور مالیاتی.",
      },
      { property: "og:title", content: "MKA — پنل دانش مالیاتی با استناد" },
      {
        property: "og:description",
        content: "Registry اسناد مالیاتی، وضعیت ایندکس و پاسخ‌های مستند فاز A پلتفرم MKA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <section className="border-b bg-gradient-to-l from-primary/10 to-accent/10">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <p className="text-sm font-medium text-primary">MKA — Modular Knowledge Assistant</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight">
            دانش مالیاتی، همیشه با استناد
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            فاز A: پنل مدیریت Registry اسناد مالیاتی، ثبت استنادهای نمونه و پرس‌وجوی RAG روی همان
            ردیف‌های ثبت‌شده. ایندکس سنگین و ربات‌ها در هسته MKA-Core انجام می‌شود.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">ورود به پنل</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/circulars">بخشنامه‌ها</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/registry">Registry اسناد</Link>
            </Button>
          </div>
          <div className="mt-8 max-w-xl">
            <AdvisorContact />
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-xl font-semibold">اولویت‌های ایندکس</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LAW_CATEGORIES.map((c) => (
            <Card key={c.priority}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {c.priority}. {c.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">{c.drive}</CardContent>
            </Card>
          ))}
        </div>

        <h2 className="mt-12 text-xl font-semibold">نقشه راه</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {PHASES.map((p) => (
            <Card key={p.code}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                  {p.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
