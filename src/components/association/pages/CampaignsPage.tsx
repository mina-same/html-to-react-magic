export default function CampaignsPage() {
  const campaigns = [
    { title: "حملة رمضان 2025", status: "نشطة", budget: "25,000", reach: "120K", statusColor: "#dcfce7", textColor: "#166534" },
    { title: "حملة الأيتام الفصلية", status: "قادمة", budget: "15,000", reach: "—", statusColor: "#fef9c3", textColor: "#854d0e" },
    { title: "حملة نهاية العام", status: "مسودة", budget: "10,000", reach: "—", statusColor: "#f1f5f9", textColor: "#64748b" },
  ];

  return (
    <div style={{ background: "white", borderRadius: 13, border: "1px solid rgba(45,122,82,.12)", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(45,122,82,.12)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center" }}>📣</div>
        <div>
          <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>الحملات</div>
          <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>{campaigns.length} حملات</div>
        </div>
        <button style={{ marginRight: "auto", fontSize: ".78rem", padding: "6px 14px", borderRadius: 8, border: "none", background: "#2d7a52", color: "white", fontFamily: "'Tajawal','Cairo',sans-serif", cursor: "pointer", fontWeight: 600 }}>
          + حملة جديدة
        </button>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {campaigns.map((c, i) => (
          <div key={i} style={{ background: "#f2faf6", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(45,122,82,.1)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>📣</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: ".85rem", fontWeight: 700, color: "#111827" }}>{c.title}</div>
              <div style={{ fontSize: ".72rem", color: "#6b7280", marginTop: 3 }}>الوصول: {c.reach}</div>
            </div>
            <span style={{ fontSize: ".65rem", padding: "2px 9px", borderRadius: 20, fontWeight: 600, background: c.statusColor, color: c.textColor, whiteSpace: "nowrap" }}>{c.status}</span>
            <div style={{ fontSize: ".8rem", fontWeight: 700, color: "#1a5c3a", whiteSpace: "nowrap" }}>{c.budget} ر.س</div>
          </div>
        ))}
      </div>
    </div>
  );
}
