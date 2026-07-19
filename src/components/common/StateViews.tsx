import type { ReactNode } from "react";
import { Loader2, AlertTriangle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shared loading / error / empty states.
 *
 * Using these everywhere is what guarantees the UI can never get "stuck
 * loading forever" — every async surface renders one of these instead of a
 * bespoke inline spinner, and error states always expose a retry button.
 */

export function Spinner({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <Loader2
      aria-label="جاري التحميل"
      className={cn("animate-spin text-primary", className)}
      style={{ width: size, height: size }}
    />
  );
}

export function LoadingState({
  label = "جاري تحميل البيانات…",
  minHeight = 220,
}: {
  label?: string;
  minHeight?: number | string;
}) {
  return (
    <div
      dir="rtl"
      className="flex flex-col items-center justify-center gap-3.5 text-muted-foreground"
      style={{ minHeight }}
    >
      <Spinner />
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
}

export function ErrorState({
  message = "تعذّر تحميل البيانات",
  onRetry,
  minHeight = 220,
}: {
  message?: string;
  onRetry?: () => void;
  minHeight?: number | string;
}) {
  return (
    <div
      dir="rtl"
      className="flex flex-col items-center justify-center gap-3.5 p-6 text-center text-muted-foreground"
      style={{ minHeight }}
    >
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <div className="text-sm font-semibold text-destructive">{message}</div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  icon = "📭",
  title,
  hint,
  action,
}: {
  icon?: string;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div
      dir="rtl"
      className="flex flex-col items-center justify-center gap-2.5 px-6 py-14 text-center text-muted-foreground"
    >
      {icon === "📭" ? (
        <Inbox className="h-9 w-9 text-muted-foreground/40" />
      ) : (
        <div className="text-4xl">{icon}</div>
      )}
      <div className="text-sm font-semibold text-foreground/70">{title}</div>
      {hint && <div className="max-w-[360px] text-xs">{hint}</div>}
      {action}
    </div>
  );
}

/**
 * Renders the right state for an async query: loading / error / empty / data.
 * Pass `isEmpty` to control when the empty state should show, and `children`
 * receives the resolved data.
 */
export function QueryState<T>({
  query,
  isEmpty,
  emptyTitle,
  emptyHint,
  emptyIcon,
  children,
}: {
  query: {
    isLoading: boolean;
    isError: boolean;
    error?: unknown;
    refetch: () => unknown;
    data?: T;
  };
  isEmpty?: (data: T) => boolean;
  emptyTitle?: string;
  emptyHint?: string;
  emptyIcon?: string;
  children: (data: T) => ReactNode;
}) {
  if (query.isLoading) return <LoadingState />;
  if (query.isError) {
    const msg = query.error instanceof Error ? query.error.message : "حدث خطأ غير متوقع";
    return <ErrorState message={msg} onRetry={() => query.refetch()} />;
  }
  if (query.data === undefined) return <LoadingState />;
  if (isEmpty && isEmpty(query.data)) {
    return <EmptyState icon={emptyIcon} title={emptyTitle ?? "لا توجد بيانات"} hint={emptyHint} />;
  }
  return <>{children(query.data)}</>;
}
