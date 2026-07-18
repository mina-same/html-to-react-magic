import type { ReactNode } from "react";

/**
 * Shared loading / error / empty states.
 *
 * Using these everywhere is what guarantees the UI can never get "stuck
 * loading forever" — every async surface renders one of these instead of a
 * bespoke inline spinner, and error states always expose a retry button.
 */

const keyframes = `@keyframes saaid-spin{to{transform:rotate(360deg)}}`;

export function Spinner({ size = 28, color = "#2d7a52" }: { size?: number; color?: string }) {
  return (
    <>
      <span
        aria-label="جاري التحميل"
        style={{
          display: "inline-block",
          width: size,
          height: size,
          borderRadius: "50%",
          border: `3px solid rgba(45,122,82,.15)`,
          borderTopColor: color,
          animation: "saaid-spin .7s linear infinite",
          flexShrink: 0,
        }}
      />
      <style>{keyframes}</style>
    </>
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
      style={{
        minHeight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        color: "#6b7280",
        fontFamily: "'Tajawal','Cairo',sans-serif",
      }}
    >
      <Spinner />
      <div style={{ fontSize: ".88rem", fontWeight: 500 }}>{label}</div>
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
      style={{
        minHeight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        color: "#6b7280",
        fontFamily: "'Tajawal','Cairo',sans-serif",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div style={{ fontSize: "2rem" }}>⚠️</div>
      <div style={{ fontSize: ".9rem", fontWeight: 600, color: "#b91c1c" }}>{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "7px 18px",
            borderRadius: 8,
            border: "1.5px solid rgba(45,122,82,.18)",
            background: "white",
            color: "#2d7a52",
            fontFamily: "inherit",
            fontSize: ".82rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          إعادة المحاولة
        </button>
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
      style={{
        padding: "56px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        color: "#9ca3af",
        fontFamily: "'Tajawal','Cairo',sans-serif",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "2.5rem" }}>{icon}</div>
      <div style={{ fontSize: ".92rem", fontWeight: 600, color: "#6b7280" }}>{title}</div>
      {hint && <div style={{ fontSize: ".8rem", maxWidth: 360 }}>{hint}</div>}
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
