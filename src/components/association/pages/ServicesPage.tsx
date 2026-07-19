import { Wrench, ArrowLeft } from "lucide-react";
import type { Service, PageId } from "../types";
import { SERVICES } from "../data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  onNavigate: (page: PageId) => void;
}

const SERVICE_STYLES: Record<string, { bg: string; border: string; title: string }> = {
  profile: { bg: "bg-emerald-50", border: "border-emerald-900/10", title: "text-primary" },
  content: { bg: "bg-indigo-50", border: "border-indigo-500/10", title: "text-indigo-800" },
  campaigns: { bg: "bg-amber-50", border: "border-amber-500/15", title: "text-amber-800" },
  analytics: { bg: "bg-red-50", border: "border-red-500/10", title: "text-red-800" },
  team: { bg: "bg-violet-50", border: "border-violet-500/10", title: "text-violet-800" },
};

export default function ServicesPage({ onNavigate }: Props) {
  return (
    <div>
      <Card className="mb-4">
        <CardHeader className="flex-row items-center gap-2.5 space-y-0 border-b">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm">خدماتنا</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">اختر الخدمات المناسبة لجمعيتك</p>
          </div>
        </CardHeader>
        <CardContent className="pt-4 text-sm leading-7 text-foreground/80">
          منصة <strong>ساعِد</strong> توفر مجموعة متكاملة من الخدمات المصممة خصيصاً للجمعيات
          الخيرية، من توليد المحتوى بالذكاء الاصطناعي إلى إدارة الحملات والمؤثرين.
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((svc: Service) => {
          const style = SERVICE_STYLES[svc.id] ?? { bg: "bg-muted", border: "border-border", title: "text-foreground" };
          return (
            <button
              key={svc.id}
              onClick={() => onNavigate(svc.id as PageId)}
              className={cn(
                "flex flex-col gap-2 rounded-xl border p-5 text-right transition-all hover:-translate-y-0.5 hover:shadow-md",
                style.bg,
                style.border,
              )}
            >
              <div className="text-3xl leading-none">{svc.icon}</div>
              <div className={cn("text-sm font-bold", style.title)}>{svc.title}</div>
              <div className="flex-1 text-xs leading-6 text-muted-foreground">{svc.desc}</div>
              <div className="mt-1 flex items-center justify-between border-t pt-2.5">
                <span className={cn("text-xs font-bold", style.title)}>{svc.price}</span>
                <span className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
                  اضغط للتفعيل
                  <ArrowLeft className="h-3 w-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
