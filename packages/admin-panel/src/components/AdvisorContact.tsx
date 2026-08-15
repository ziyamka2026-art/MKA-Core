import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ADVISOR } from "@/lib/mka-constants";

/** بلوک ثابت ارتباط با مشاور — برای همه بازدیدکنندگان، خارج از خروجی مدل. */
export function AdvisorContact() {
  return (
    <Card dir="rtl" className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-primary">{ADVISOR.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">{ADVISOR.text}</p>
        <div className="space-y-1">
          <p className="font-medium">آقای {ADVISOR.name}</p>
          <p className="text-muted-foreground">{ADVISOR.role}</p>
          <p>
            موبایل: <span dir="ltr">{ADVISOR.mobile}</span>
          </p>
        </div>
        <Button asChild size="sm">
          <a href={ADVISOR.tel}>تماس با مشاور</a>
        </Button>
      </CardContent>
    </Card>
  );
}
