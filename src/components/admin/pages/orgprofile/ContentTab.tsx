import { useState } from "react";
import { useMutation, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { keys } from "@/api/keys";
import { QueryState } from "@/components/common/StateViews";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ContentGeneration } from "@/lib/db";
import {
  CONTENT_TYPES,
  CONTENT_TYPE_ICONS,
  CONTENT_TYPE_LABELS,
  PAGE_SIZE,
  getDisplayableImage,
  pagSlice,
} from "./constants";
import { BulkBar, Pager } from "./shared";

export function ContentTab({
  orgId,
  contentQuery,
}: {
  orgId: string;
  contentQuery: UseQueryResult<ContentGeneration[]>;
}) {
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState<Set<number>>(new Set());
  const qc = useQueryClient();

  const deleteMu = useMutation({
    mutationFn: async (ids: number[]) => {
      const { error } = await supabase.from("content_generations").delete().in("id", ids);
      if (error) throw new Error(error.message);
      return ids;
    },
    onSuccess: (ids) => {
      qc.invalidateQueries({ queryKey: keys.content(orgId) });
      setSel(new Set());
      toast.success(`تم حذف ${ids.length} عنصر`);
    },
    onError: () => toast.error("تعذّر حذف المحتوى"),
  });

  function toggleContent(id: number) {
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <QueryState
      query={contentQuery}
      isEmpty={(d) => d.length === 0}
      emptyTitle="لا يوجد محتوى مولّد بالذكاء الاصطناعي"
      emptyIcon="🤖"
    >
      {(content) => {
        const pageData = pagSlice(content, page);
        const allPageSel = pageData.length > 0 && pageData.every((c) => sel.has(c.id));
        return (
          <div>
            <BulkBar
              count={sel.size}
              label="عنصر"
              onDelete={() => deleteMu.mutate([...sel])}
              onClear={() => setSel(new Set())}
            />

            {pageData.length > 0 && (
              <Card className="mb-3 flex flex-row items-center gap-2.5 px-3.5 py-2">
                <Checkbox
                  checked={allPageSel}
                  onCheckedChange={() => {
                    setSel((prev) => {
                      const next = new Set(prev);
                      pageData.forEach((c) => (allPageSel ? next.delete(c.id) : next.add(c.id)));
                      return next;
                    });
                  }}
                />
                <span className="text-sm text-muted-foreground">تحديد الصفحة الحالية</span>
                {content.length > PAGE_SIZE && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-auto text-xs"
                    onClick={() => setSel(new Set(content.map((c) => c.id)))}
                  >
                    تحديد الكل ({content.length})
                  </Button>
                )}
              </Card>
            )}

            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3.5">
              {pageData.map((item) => (
                <Card
                  key={item.id}
                  className={cn(
                    "overflow-hidden",
                    sel.has(item.id) && "border-2 border-primary shadow-[0_0_0_3px_rgba(45,122,82,.1)]",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2.5 border-b px-3.5 py-2.5",
                      sel.has(item.id) ? "bg-secondary" : "bg-muted/40",
                    )}
                  >
                    <Checkbox checked={sel.has(item.id)} onCheckedChange={() => toggleContent(item.id)} />
                    <span className="flex-1 text-xs text-muted-foreground">
                      📅 {item.createdAt.slice(0, 10)}
                    </span>
                    {item.tokensUsed > 0 && (
                      <Badge variant="secondary" className="bg-violet-100 text-xs text-violet-700 hover:bg-violet-100">
                        {item.tokensUsed.toLocaleString()} رمز
                      </Badge>
                    )}
                  </div>

                  <div className="border-b px-3.5 py-2.5">
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">الطلب</div>
                    <div className="text-sm font-semibold leading-6 text-foreground">
                      {item.prompt.length > 90 ? item.prompt.slice(0, 90) + "..." : item.prompt}
                    </div>
                  </div>

                  <div className="px-3.5 py-2.5">
                    {CONTENT_TYPES.map((type) => {
                      const c = item.content?.[type];
                      if (!c?.text) return null;
                      const imgSrc = getDisplayableImage(c);
                      return (
                        <div key={type} className="mb-2">
                          <div className="mb-1 text-xs font-semibold text-muted-foreground">
                            {CONTENT_TYPE_ICONS[type]} {CONTENT_TYPE_LABELS[type]}
                          </div>
                          <div className="rounded-md border-r-2 border-primary/20 bg-muted/40 px-2.5 py-1.5 text-sm leading-6 text-foreground/80">
                            {c.text.length > 110 ? c.text.slice(0, 110) + "..." : c.text}
                          </div>
                          {imgSrc && (
                            <img
                              src={imgSrc}
                              alt=""
                              className="mt-1.5 h-[72px] w-full rounded-md object-cover"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>

            <Pager page={page} total={content.length} onChange={setPage} />
          </div>
        );
      }}
    </QueryState>
  );
}
