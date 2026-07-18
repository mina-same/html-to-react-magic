import { S } from "../../helpers";
import { btnPg, PAGE_SIZE } from "./constants";

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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        padding: "14px 0 6px",
      }}
    >
      <button onClick={() => onChange(page - 1)} disabled={page === 1} style={btnPg}>
        ‹
      </button>
      {withGaps.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} style={{ color: "#9ca3af", fontSize: ".76rem", padding: "0 2px" }}>
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            style={{
              ...btnPg,
              background: p === page ? "#2d7a52" : "white",
              color: p === page ? "white" : "#374151",
              fontWeight: p === page ? 700 : 400,
              borderColor: p === page ? "#2d7a52" : "rgba(45,122,82,.15)",
              minWidth: 32,
            }}
          >
            {p}
          </button>
        ),
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === pages} style={btnPg}>
        ›
      </button>
      <span style={{ fontSize: ".72rem", color: "#9ca3af", marginRight: 8 }}>
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
    <div
      style={{
        background: "#fef2f2",
        border: "1.5px solid #fecaca",
        borderRadius: 10,
        padding: "10px 16px",
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          background: "#dc2626",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: ".74rem",
          fontWeight: 700,
        }}
      >
        {count}
      </span>
      <span style={{ fontSize: ".82rem", color: "#374151", fontWeight: 600 }}>{label} محدد</span>
      <button
        onClick={onDelete}
        style={{
          ...S.btnDanger,
          marginRight: "auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        🗑️ حذف المحدد
      </button>
      <button onClick={onClear} style={S.btnGhost}>
        إلغاء التحديد
      </button>
    </div>
  );
}
