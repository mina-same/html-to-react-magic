import { useContentGenerations } from "@/api/queries";
import { QueryState } from "@/components/common/StateViews";
import type { ContentGeneration } from "@/lib/db";
import { fmtDate, Spin, TEMP_ID } from "./constants";

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
    <div
      style={{
        width: 250,
        flexShrink: 0,
        background: "#fcfcfd",
        borderLeft: "1px solid #eef2f6",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "16px 16px 13px",
          borderBottom: "1px solid #eef2f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: ".84rem", fontWeight: 800, color: "#0f172a" }}>المحادثات</div>
          <div style={{ fontSize: ".66rem", color: "#94a3b8", marginTop: 2 }}>
            <QueryState
              query={contentQ}
              isEmpty={(d: ContentGeneration[]) => d.length === 0 && !optimisticTemp}
              emptyTitle="يُحمَّل..."
            >
              {(history) =>
                `${[...history, ...(optimisticTemp ? [optimisticTemp] : [])].filter((h) => h.id !== TEMP_ID).length} جلسة`
              }
            </QueryState>
          </div>
        </div>
        <button
          onClick={onNew}
          className="cg-newbtn"
          style={{
            fontSize: ".72rem",
            padding: "6px 13px",
            borderRadius: 9,
            border: "1px solid #10b981",
            background: "#f0fdf4",
            color: "#059669",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Tajawal',sans-serif",
            transition: "all .15s",
          }}
        >
          + جديد
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
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
                <div style={{ padding: "40px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.4rem", opacity: 0.15, marginBottom: 8 }}>✦</div>
                  <div style={{ fontSize: ".71rem", color: "#94a3b8", lineHeight: 1.7 }}>
                    لا يوجد سجل
                    <br />
                    ابدأ بتوليد أول محتوى
                  </div>
                </div>
              );
            }
            return items.map((item) => {
              const isSel = activeId === item.id;
              const isTmp = item.id === TEMP_ID;
              return (
                <div
                  key={item.id}
                  className="cg-si"
                  data-sel={isSel}
                  data-tmp={isTmp}
                  onClick={() => {
                    if (!isTmp && !isSel) onSelect(item);
                  }}
                  style={{
                    margin: "4px 8px",
                    padding: "10px 11px",
                    borderRadius: 11,
                    background: isSel ? "#fff" : "transparent",
                    border: `1px solid ${isSel ? "#a7f3d0" : "transparent"}`,
                    boxShadow: isSel ? "0 1px 4px rgba(5,150,105,.08)" : "none",
                    cursor: isTmp ? "default" : isSel ? "default" : "pointer",
                    transition: "background .14s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        flexShrink: 0,
                        marginTop: 1,
                        background: isSel ? "#dcfce7" : isTmp ? "#fef9c3" : "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isSel ? "#16a34a" : isTmp ? "#ca8a04" : "#94a3b8",
                      }}
                    >
                      {isTmp ? (
                        <Spin size={11} light={false} />
                      ) : (
                        <span style={{ fontSize: ".8rem" }}>✦</span>
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: ".75rem",
                          fontWeight: 600,
                          color: isSel ? "#166534" : isTmp ? "#92400e" : "#334155",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginBottom: 2,
                        }}
                      >
                        {item.prompt.trim() || (isTmp ? "جاري التوليد..." : "توليد عام")}
                      </div>
                      {isSel && anyLoading && !isTmp ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Spin size={9} light={false} />
                          <span style={{ fontSize: ".62rem", color: "#16a34a", fontWeight: 600 }}>
                            جاري التوليد...
                          </span>
                        </div>
                      ) : (
                        <div style={{ fontSize: ".62rem", color: "#94a3b8" }}>
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
      </div>
    </div>
  );
}
