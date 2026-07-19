import { TrendingUp, CheckCircle, AlertCircle, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Donation } from "../../types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCard {
  num: string;
  label: string;
  sub: string;
  icon: LucideIcon;
  bg: string;
  color: string;
}

/** The four summary cards shown above the donations table. */
export default function StatsCards({ donations }: { donations: Donation[] }) {
  const now = new Date();
  const thisMonthDonations = donations.filter((d) => {
    const dd = new Date(d.date);
    return dd.getFullYear() === now.getFullYear() && dd.getMonth() === now.getMonth();
  });
  const totalThisMonth = thisMonthDonations.reduce((s, d) => s + d.amount, 0);
  const totalCompleted = donations
    .filter((d) => d.status === "completed")
    .reduce((s, d) => s + d.amount, 0);
  const pendingCount = donations.filter((d) => d.status === "pending").length;
  const maxDonation = donations.reduce(
    (m, d) => (d.amount > m.amount ? d : m),
    donations[0] ?? { amount: 0, name: "—" },
  );

  const stats: StatCard[] = [
    {
      num: totalThisMonth.toLocaleString(),
      label: "تبرعات هذا الشهر (ر.س)",
      sub: `${thisMonthDonations.length} تبرع`,
      icon: TrendingUp,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      num: totalCompleted.toLocaleString(),
      label: "إجمالي المحصّل (ر.س)",
      sub: `من ${donations.length} تبرع`,
      icon: CheckCircle,
      bg: "bg-secondary",
      color: "text-primary",
    },
    {
      num: String(pendingCount),
      label: "تبرعات معلقة",
      sub: pendingCount > 0 ? "⚡ تحتاج متابعة" : "✓ لا شيء معلق",
      icon: AlertCircle,
      bg: "bg-amber-50",
      color: "text-amber-600",
    },
    {
      num: maxDonation.amount.toLocaleString(),
      label: "أعلى تبرع (ر.س)",
      sub: maxDonation.name,
      icon: Star,
      bg: "bg-violet-50",
      color: "text-violet-600",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className={cn("gap-3 border-none transition-all hover:-translate-y-0.5 hover:shadow-lg", s.bg)}>
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <s.icon className={cn("h-6 w-6", s.color)} />
            </div>
            <div className="flex-1">
              <div className={cn("text-2xl font-extrabold leading-tight", s.color)}>{s.num}</div>
              <div className="mt-1.5 text-xs text-slate-600">{s.label}</div>
              <div className={cn("mt-1 text-xs font-semibold", s.color)}>{s.sub}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
