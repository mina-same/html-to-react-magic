import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  /** Tailwind color token driving the icon chip + accent, e.g. "primary", "chart-4". */
  tone?: "primary" | "gold" | "blue" | "violet" | "amber" | "rose";
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  gold: "bg-gold/15 text-gold",
  blue: "bg-blue-500/10 text-blue-600",
  violet: "bg-violet-500/10 text-violet-600",
  amber: "bg-amber-500/10 text-amber-600",
  rose: "bg-rose-500/10 text-rose-600",
};

/** Compact KPI tile used across dashboard overview/analytics pages. */
export function StatCard({ label, value, sub, icon: Icon, tone = "primary", className }: StatCardProps) {
  return (
    <Card className={cn("border-border/70", className)}>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", TONE_CLASSES[tone])}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
