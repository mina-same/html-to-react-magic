export function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "م";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "ك";
  return String(n);
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active: { bg: "#dcfce7", color: "#166534", label: "نشط" },
    new: { bg: "#dbeafe", color: "#1e40af", label: "جديد" },
    pending: { bg: "#fef9c3", color: "#92400e", label: "قيد المراجعة" },
    suspended: { bg: "#fee2e2", color: "#b91c1c", label: "موقوف" },
    rejected: { bg: "#fee2e2", color: "#b91c1c", label: "مرفوض" },
    approved: { bg: "#f0fdf4", color: "#166534", label: "مقبول" },
    completed: { bg: "#dbeafe", color: "#1e40af", label: "مكتمل" },
    ended: { bg: "#f3f4f6", color: "#6b7280", label: "منتهي" },
  };
  const s = map[status] ?? { bg: "#f3f4f6", color: "#6b7280", label: status };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        display: "inline-block",
        fontSize: ".68rem",
        padding: "2px 9px",
        borderRadius: 20,
        fontWeight: 600,
      }}
    >
      {s.label}
    </span>
  );
}

export function PlatBadge({ platform }: { platform: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Instagram: { bg: "#fce7f3", color: "#be185d" },
    X: { bg: "#e0f2fe", color: "#0369a1" },
    TikTok: { bg: "#f0fdf4", color: "#166534" },
    YouTube: { bg: "#fee2e2", color: "#b91c1c" },
    Snapchat: { bg: "#fef9c3", color: "#854d0e" },
  };
  const s = map[platform] ?? { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: ".68rem",
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 20,
      }}
    >
      {platform}
    </span>
  );
}

const INF_COLORS = ["#2d7a52", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#14b8a6"] as const;
export function infColor(id: number) {
  return INF_COLORS[(id - 1) % INF_COLORS.length];
}

export const S = {
  app: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    fontFamily: "'Tajawal',sans-serif",
    direction: "rtl" as const,
    background: "#f0f4f2",
    color: "#111827",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    minWidth: 0,
  },
  content: { flex: 1, overflowY: "auto" as const, padding: 20 },
  topbar: {
    height: 56,
    background: "white",
    borderBottom: "1px solid rgba(45,122,82,.12)",
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
    gap: 12,
    flexShrink: 0,
  },
  secCard: {
    background: "white",
    borderRadius: 12,
    border: "1px solid rgba(45,122,82,.12)",
    marginBottom: 16,
    overflow: "hidden",
  },
  secHead: {
    padding: "13px 18px",
    borderBottom: "1px solid rgba(45,122,82,.12)",
    display: "flex",
    alignItems: "center",
    gap: 9,
  },
  secBody: { padding: 16 },
  tblTh: {
    padding: "9px 14px",
    textAlign: "right" as const,
    color: "#6b7280",
    fontWeight: 600,
    background: "#f2faf6",
    borderBottom: "1px solid rgba(45,122,82,.12)",
    fontSize: ".82rem",
  },
  tblTd: {
    padding: "10px 14px",
    borderBottom: "1px solid rgba(0,0,0,.04)",
    verticalAlign: "middle" as const,
    color: "#374151",
    fontSize: ".82rem",
  },
  btnPrimary: {
    padding: "7px 15px",
    borderRadius: 7,
    background: "#2d7a52",
    color: "white",
    border: "none",
    fontFamily: "'Tajawal',sans-serif",
    fontSize: ".78rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  btnGhost: {
    padding: "6px 12px",
    borderRadius: 7,
    background: "white",
    border: "1.5px solid rgba(45,122,82,.12)",
    fontFamily: "'Tajawal',sans-serif",
    fontSize: ".76rem",
    color: "#6b7280",
    cursor: "pointer",
  },
  btnDanger: {
    padding: "6px 12px",
    borderRadius: 7,
    background: "white",
    border: "1.5px solid #fecaca",
    fontFamily: "'Tajawal',sans-serif",
    fontSize: ".76rem",
    color: "#dc2626",
    cursor: "pointer",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f0f4f2",
    border: "1.5px solid rgba(45,122,82,.12)",
    borderRadius: 8,
    padding: "7px 13px",
    fontSize: ".84rem",
    color: "#6b7280",
    width: 240,
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    flexWrap: "wrap" as const,
  },
};
