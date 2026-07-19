import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PAGE_SIZE } from "./constants";

/** Shared section-card wrapper used across every org-profile tab. */
export function SecCard({
  icon,
  title,
  className,
  children,
}: {
  icon: ReactNode;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center gap-2 space-y-0 border-b py-3">
        <span>{icon}</span>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

export function Pager({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;
  const visible = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 1,
  );
  const withGaps: (number | "…")[] = [];
  visible.forEach((p, i) => {
    if (i > 0 && p - (visible[i - 1] as number) > 1) withGaps.push("…");
    withGaps.push(p);
  });

  return (
    <div className="flex items-center justify-center gap-1 py-3.5">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="rounded-md border bg-card px-2.5 py-1 text-xs text-foreground/70 disabled:opacity-40"
      >
        ‹
      </button>
      {withGaps.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-0.5 text-xs text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={cn(
              "min-w-8 rounded-md border px-2.5 py-1 text-xs",
              p === page
                ? "border-primary bg-primary font-bold text-primary-foreground"
                : "bg-card text-foreground/70",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pages}
        className="rounded-md border bg-card px-2.5 py-1 text-xs text-foreground/70 disabled:opacity-40"
      >
        ›
      </button>
      <span className="mr-2 text-xs text-muted-foreground">
        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} من {total}
      </span>
    </div>
  );
}

export function BulkBar({
  count,
  label,
  onDelete,
  onClear,
}: {
  count: number;
  label: string;
  onDelete: () => void;
  onClear: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="mb-3 flex items-center gap-2.5 rounded-lg border-[1.5px] border-red-200 bg-red-50 px-4 py-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
        {count}
      </span>
      <span className="text-sm font-semibold text-foreground/80">{label} محدد</span>
      <Button variant="destructive" size="sm" className="mr-auto h-7 gap-1.5 text-xs" onClick={onDelete}>
        <Trash2 className="h-3 w-3" />
        حذف المحدد
      </Button>
      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onClear}>
        إلغاء التحديد
      </Button>
    </div>
  );
}
