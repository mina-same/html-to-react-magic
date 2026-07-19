import { StatusBadge as SharedStatusBadge, PlatformBadge } from "@/components/dashboard/StatusBadge";

export function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "م";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "ك";
  return String(n);
}

export function StatusBadge({ status }: { status: string }) {
  const AR_LABELS: Record<string, string> = {
    active: "نشط",
    new: "جديد",
    pending: "قيد المراجعة",
    suspended: "موقوف",
    rejected: "مرفوض",
    approved: "مقبول",
    completed: "مكتمل",
    ended: "منتهي",
  };
  return <SharedStatusBadge status={status} label={AR_LABELS[status]} />;
}

export function PlatBadge({ platform }: { platform: string }) {
  return <PlatformBadge platform={platform} />;
}

const INF_COLORS = ["#2d7a52", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#14b8a6"] as const;
export function infColor(id: number) {
  return INF_COLORS[(id - 1) % INF_COLORS.length];
}
