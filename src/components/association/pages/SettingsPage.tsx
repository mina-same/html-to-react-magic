import { useState, useEffect } from "react";
import { Bot, Settings as SettingsIcon, Bell, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAIUsageStats, type AIUsageStats } from "@/lib/ai-usage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Props {
  assocName: string;
  onNameChange: (name: string) => void;
  onLogout: () => void;
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("ar-SA");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  danger,
}: {
  icon?: typeof Bot;
  title: string;
  description?: string;
  danger?: boolean;
}) {
  return (
    <CardHeader className="flex-row items-center gap-2.5 space-y-0 border-b">
      {Icon && (
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            danger ? "bg-red-100 text-red-700" : "bg-secondary text-primary",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div>
        <CardTitle className={cn("text-sm", danger && "text-red-800")}>{title}</CardTitle>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
    </CardHeader>
  );
}

export default function SettingsPage({ assocName, onNameChange, onLogout }: Props) {
  const { user } = useAuth();
  const [stats, setStats] = useState<AIUsageStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setStatsLoading(true);
    getAIUsageStats(user.id)
      .then(setStats)
      .catch((err) => console.error("[SettingsPage] AI usage stats failed:", err))
      .finally(() => setStatsLoading(false));
  }, [user]);

  const pct = stats ? Math.min(100, (stats.totalTokens / 100_000) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* AI token usage */}
      <Card>
        <SectionHeader
          icon={Bot}
          title="استخدام الذكاء الاصطناعي"
          description="كل خدمات الذكاء الاصطناعي: المحتوى · الصور · الصوت · التحليل · الترجمة النصية"
        />
        <CardContent className="pt-5">
          {statsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              جاري التحميل...
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-3">
                <div className="min-w-[110px] flex-1 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3.5">
                  <div className="mb-1 text-[0.67rem] font-semibold uppercase tracking-wide text-emerald-800">
                    إجمالي التوكنات
                  </div>
                  <div className="text-2xl font-extrabold leading-none text-emerald-700">
                    {fmtNum(stats?.totalTokens ?? 0)}
                  </div>
                </div>
                <div className="min-w-[110px] flex-1 rounded-lg border bg-muted/60 px-4 py-3.5">
                  <div className="mb-1 text-[0.67rem] font-semibold uppercase tracking-wide text-slate-600">
                    عمليات الذكاء الاصطناعي
                  </div>
                  <div className="text-2xl font-extrabold leading-none text-slate-800">
                    {stats?.callCount ?? 0}
                  </div>
                </div>
                <div className="min-w-[110px] flex-1 rounded-lg border bg-muted/60 px-4 py-3.5">
                  <div className="mb-1 text-[0.67rem] font-semibold uppercase tracking-wide text-slate-600">
                    آخر استخدام
                  </div>
                  <div className="mt-1 text-sm font-bold leading-tight text-slate-800">
                    {stats?.lastUsed ? fmtDate(stats.lastUsed) : "—"}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    الاستخدام مقابل 100K توكن
                  </span>
                  <span className="text-xs font-bold text-foreground">{pct.toFixed(1)}%</span>
                </div>
                <Progress
                  value={pct}
                  className={cn(
                    "h-[7px]",
                    pct >= 90
                      ? "[&>div]:bg-destructive"
                      : pct >= 70
                        ? "[&>div]:bg-amber-500"
                        : "[&>div]:bg-primary",
                  )}
                />
                <div className="mt-1.5 text-[0.67rem] text-muted-foreground">
                  {fmtNum(stats?.totalTokens ?? 0)} من 100,000 توكن
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Profile settings */}
      <Card>
        <SectionHeader icon={SettingsIcon} title="إعدادات الجمعية" />
        <CardContent className="flex flex-col gap-3.5 pt-5">
          <div>
            <Label className="mb-1.5 block text-sm font-semibold text-foreground/80">
              اسم الجمعية
            </Label>
            <Input
              value={assocName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="أدخل اسم جمعيتك"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm font-semibold text-foreground/80">
              البريد الإلكتروني
            </Label>
            <Input placeholder="example@assoc.org" disabled className="bg-muted/60" />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <SectionHeader icon={Bell} title="الإشعارات" />
        <CardContent className="flex flex-col gap-3.5 pt-5">
          {[
            { label: "إشعارات التبرعات الجديدة", on: true },
            { label: "تذكير المهام المتأخرة", on: true },
            { label: "تقارير الأداء الأسبوعية", on: false },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between">
              <span className="text-sm text-foreground/80">{n.label}</span>
              <Switch defaultChecked={n.on} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200">
        <SectionHeader title="تسجيل الخروج" danger />
        <CardContent className="pt-4">
          <Button
            variant="outline"
            onClick={onLogout}
            className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
          >
            <LogOut className="h-3.5 w-3.5" />
            تسجيل الخروج
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
