import { cn } from "@/lib/utils";

type StatusKey =
  | "active"
  | "new"
  | "pending"
  | "suspended"
  | "rejected"
  | "approved"
  | "completed"
  | "ended"
  | "todo"
  | "doing"
  | "done"
  | "review"
  | "urgent"
  | "high"
  | "normal"
  | "low";

/** One status → color map shared by every dashboard (admin/association/employee). */
const STATUS_STYLES: Record<StatusKey, string> = {
  active: "bg-emerald-100 text-emerald-800",
  new: "bg-blue-100 text-blue-800",
  pending: "bg-amber-100 text-amber-800",
  suspended: "bg-red-100 text-red-800",
  rejected: "bg-red-100 text-red-800",
  approved: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  ended: "bg-gray-100 text-gray-600",
  todo: "bg-gray-100 text-gray-600",
  doing: "bg-sky-100 text-sky-700",
  done: "bg-emerald-100 text-emerald-800",
  review: "bg-purple-100 text-purple-700",
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  normal: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

const STATUS_LABELS_AR: Record<StatusKey, string> = {
  active: "نشط",
  new: "جديد",
  pending: "قيد المراجعة",
  suspended: "موقوف",
  rejected: "مرفوض",
  approved: "مقبول",
  completed: "مكتمل",
  ended: "منتهي",
  todo: "قيد الانتظار",
  doing: "قيد التنفيذ",
  done: "مكتمل",
  review: "مراجعة",
  urgent: "عاجل جداً",
  high: "عاجل",
  normal: "عادي",
  low: "منخفض",
};

interface StatusBadgeProps {
  status: string;
  /** Override the default Arabic label map (e.g. for a custom status string). */
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const key = status as StatusKey;
  const style = STATUS_STYLES[key] ?? "bg-gray-100 text-gray-600";
  const text = label ?? STATUS_LABELS_AR[key] ?? status;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        style,
        className,
      )}
    >
      {text}
    </span>
  );
}

const PLATFORM_STYLES: Record<string, string> = {
  Instagram: "bg-pink-100 text-pink-700",
  X: "bg-sky-100 text-sky-700",
  TikTok: "bg-emerald-100 text-emerald-800",
  YouTube: "bg-red-100 text-red-700",
  Snapchat: "bg-yellow-100 text-yellow-800",
};

export function PlatformBadge({ platform, className }: { platform: string; className?: string }) {
  const style = PLATFORM_STYLES[platform] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        style,
        className,
      )}
    >
      {platform}
    </span>
  );
}
