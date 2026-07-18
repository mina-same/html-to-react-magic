import { useState } from "react";
import { useMutation, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { toast } from "sonner";
import { S } from "../../helpers";
import { supabase } from "@/lib/supabase";
import { keys } from "@/api/keys";
import { QueryState } from "@/components/common/StateViews";
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

            {/* Select all bar */}
            {pageData.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                  padding: "8px 14px",
                  background: "white",
                  borderRadius: 8,
                  border: "1px solid rgba(45,122,82,.12)",
                }}
              >
                <input
                  type="checkbox"
                  checked={allPageSel}
                  style={{ cursor: "pointer" }}
                  onChange={() => {
                    setSel((prev) => {
                      const next = new Set(prev);
                      pageData.forEach((c) => (allPageSel ? next.delete(c.id) : next.add(c.id)));
                      return next;
                    });
                  }}
                />
                <span style={{ fontSize: ".78rem", color: "#6b7280" }}>تحديد الصفحة الحالية</span>
                {content.length > PAGE_SIZE && (
                  <button
                    style={{ ...S.btnGhost, fontSize: ".72rem", marginRight: "auto" }}
                    onClick={() => setSel(new Set(content.map((c) => c.id)))}
                  >
                    تحديد الكل ({content.length})
                  </button>
                )}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
                gap: 14,
              }}
            >
              {pageData.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "white",
                    border: sel.has(item.id)
                      ? "2px solid #2d7a52"
                      : "1px solid rgba(45,122,82,.12)",
                    borderRadius: 12,
                    overflow: "hidden",
                    transition: "border .15s, box-shadow .15s",
                    boxShadow: sel.has(item.id) ? "0 0 0 3px rgba(45,122,82,.1)" : "none",
                  }}
                >
                  {/* Card header */}
                  <div
                    style={{
                      background: sel.has(item.id) ? "#f0fdf4" : "#f2faf6",
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      borderBottom: "1px solid rgba(45,122,82,.08)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={sel.has(item.id)}
                      style={{ cursor: "pointer" }}
                      onChange={() => toggleContent(item.id)}
                    />
                    <span style={{ fontSize: ".7rem", color: "#6b7280", flex: 1 }}>
                      📅 {item.createdAt.slice(0, 10)}
                    </span>
                    {item.tokensUsed > 0 && (
                      <span
                        style={{
                          fontSize: ".66rem",
                          background: "#ede9fe",
                          color: "#7c3aed",
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontWeight: 600,
                        }}
                      >
                        {item.tokensUsed.toLocaleString()} رمز
                      </span>
                    )}
                  </div>

                  {/* Prompt */}
                  <div
                    style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid rgba(45,122,82,.06)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: ".66rem",
                        color: "#9ca3af",
                        marginBottom: 4,
                        textTransform: "uppercase" as const,
                        letterSpacing: ".04em",
                      }}
                    >
                      الطلب
                    </div>
                    <div
                      style={{
                        fontSize: ".8rem",
                        color: "#111827",
                        fontWeight: 600,
                        lineHeight: 1.6,
                      }}
                    >
                      {item.prompt.length > 90 ? item.prompt.slice(0, 90) + "..." : item.prompt}
                    </div>
                  </div>

                  {/* Content preview */}
                  <div style={{ padding: "10px 14px" }}>
                    {CONTENT_TYPES.map((type) => {
                      const c = item.content?.[type];
                      if (!c?.text) return null;
                      return (
                        <div key={type} style={{ marginBottom: 8 }}>
                          <div
                            style={{
                              fontSize: ".66rem",
                              color: "#6b7280",
                              marginBottom: 3,
                              fontWeight: 600,
                            }}
                          >
                            {CONTENT_TYPE_ICONS[type]} {CONTENT_TYPE_LABELS[type]}
                          </div>
                          <div
                            style={{
                              fontSize: ".76rem",
                              color: "#374151",
                              lineHeight: 1.6,
                              background: "#f9fafb",
                              padding: "7px 10px",
                              borderRadius: 7,
                              borderRight: "2px solid rgba(45,122,82,.2)",
                            }}
                          >
                            {c.text.length > 110 ? c.text.slice(0, 110) + "..." : c.text}
                          </div>
                          {(() => {
                            const imgSrc = getDisplayableImage(c);
                            return imgSrc ? (
                              <img
                                src={imgSrc}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: 72,
                                  objectFit: "cover",
                                  borderRadius: 7,
                                  marginTop: 5,
                                }}
                              />
                            ) : null;
                          })()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <Pager page={page} total={content.length} onChange={setPage} />
          </div>
        );
      }}
    </QueryState>
  );
}
