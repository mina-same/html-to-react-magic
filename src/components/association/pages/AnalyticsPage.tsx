import { BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";

const STATS = [
  { label: "إجمالي التبرعات", value: "58,300 ر.س", sub: "↑ 22% عن الشهر السابق", tone: "primary" as const },
  { label: "المتبرعون النشطون", value: "134", sub: "↑ 22 جديد هذا الشهر", tone: "blue" as const },
  { label: "معدل التحويل", value: "4.7%", sub: "من الزوار للمتبرعين", tone: "violet" as const },
  { label: "متوسط التبرع", value: "435 ر.س", sub: "لكل متبرع", tone: "amber" as const },
];

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader title="التحليلات" description="تقارير الأداء والوصول" />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-2.5 space-y-0 border-b">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm">التحليلات</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">تقارير الأداء والوصول</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <EmptyState
            icon={TrendingUp}
            title="الرسوم البيانية قيد التطوير"
            description="سيتم إطلاق لوحة التحليلات قريباً"
          />
        </CardContent>
      </Card>
    </div>
  );
}
