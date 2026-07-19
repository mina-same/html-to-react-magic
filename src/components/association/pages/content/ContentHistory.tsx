import { Plus, Sparkles, Loader2 } from "lucide-react";
import { useContentGenerations } from "@/api/queries";
import { QueryState } from "@/components/common/StateViews";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { cn } from "@/lib/utils";
import type { ContentGeneration } from "@/lib/db";
import { fmtDate, TEMP_ID } from "./constants";

interface Props {
  assocId: string | undefined;
  activeId: number | null;
  anyLoading: boolean;
  /** Optional optimistic placeholder (id === TEMP_ID) prepended while a create is in-flight. */
  optimisticTemp: ContentGeneration | null;
  onSelect: (item: ContentGeneration) => void;
  onNew: () => void;
}

/**
 * Left sidebar: the saved-generations list.
 *
 * Data is fetched via the `useContentGenerations` React Query hook and rendered
 * through `QueryState` so loading / error / empty are handled consistently and
 * errors always expose a retry button (no more "stuck loading forever").
 */
export default function ContentHistory({
  assocId,
  activeId,
  anyLoading,
  optimisticTemp,
  onSelect,
  onNew,
}: Props) {
  const contentQ = useContentGenerations(assocId);

  return (
    <div className="flex w-[250px] shrink-0 flex-col border-l bg-muted/20">
      <div className="flex items-center justify-between border-b px-4 py-3.5">
        <div>
          <div className="text-sm font-extrabold text-foreground">المحادثات</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {contentQ.isLoading ? (
              <Skeleton className="h-3 w-12" />
            ) : contentQ.isError ? (
              "تعذّر التحميل"
            ) : (
              `${[...(contentQ.data ?? []), ...(optimisticTemp ? [optimisticTemp] : [])].filter((h) => h.id !== TEMP_ID).length} جلسة`
            )}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={onNew} className="h-8 gap-1 border-primary/25 text-xs text-primary hover:bg-secondary">
          <Plus className="h-3 w-3" />
          جديد
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {contentQ.isLoading ? (
          <div className="space-y-1 p-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-xl px-2.5 py-2.5">
                <Skeleton className="h-7 w-7 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
        <QueryState
          query={contentQ}
          isEmpty={(d: ContentGeneration[]) => d.length === 0 && !optimisticTemp}
          emptyTitle="لا يوجد سجل"
          emptyHint="ابدأ بتوليد أول محتوى"
          emptyIcon="✦"
        >
          {(history) => {
            const items = [...history, ...(optimisticTemp ? [optimisticTemp] : [])];
            if (items.length === 0) {
              return (
                <EmptyState
                  icon={Sparkles}
                  title="لا يوجد سجل"
                  description="ابدأ بتوليد أول محتوى"
                  className="py-10"
                />
              );
            }
            return items.map((item) => {
              const isSel = activeId === item.id;
              const isTmp = item.id === TEMP_ID;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!isTmp && !isSel) onSelect(item);
                  }}
                  className={cn(
                    "mx-2 my-1 rounded-xl border px-2.5 py-2.5 transition-colors",
                    isSel
                      ? "border-primary/25 bg-card shadow-sm"
                      : "border-transparent hover:bg-muted/60",
                    isTmp || isSel ? "cursor-default" : "cursor-pointer",
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        isSel
                          ? "bg-secondary text-primary"
                          : isTmp
                            ? "bg-amber-100 text-amber-700"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isTmp ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <span className="text-sm">✦</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          "mb-0.5 truncate text-xs font-semibold",
                          isSel ? "text-primary" : isTmp ? "text-amber-800" : "text-foreground/80",
                        )}
                      >
                        {item.prompt.trim() || (isTmp ? "جاري التوليد..." : "توليد عام")}
                      </div>
                      {isSel && anyLoading && !isTmp ? (
                        <div className="flex items-center gap-1">
                          <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
                          <span className="text-[0.62rem] font-semibold text-primary">
                            جاري التوليد...
                          </span>
                        </div>
                      ) : (
                        <div className="text-[0.62rem] text-muted-foreground">
                          {isTmp ? "يُحفظ فور الانتهاء" : fmtDate(item.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            });
          }}
        </QueryState>
        )}
      </ScrollArea>
    </div>
  );
}
