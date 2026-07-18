export default function AnalyticsPage() {
  const stats = [
    {
      label: "إجمالي التبرعات",
      value: "58,300 ر.س",
      sub: "↑ 22% عن الشهر السابق",
      color: "#1a5c3a",
      border: "#2d7a52",
    },
    {
      label: "المتبرعون النشطون",
      value: "134",
      sub: "↑ 22 جديد هذا الشهر",
      color: "#1e40af",
      border: "#3b82f6",
    },
    {
      label: "معدل التحويل",
      value: "4.7%",
      sub: "من الزوار للمتبرعين",
      color: "#5b21b6",
      border: "#8b5cf6",
    },
    {
      label: "متوسط التبرع",
      value: "435 ر.س",
      sub: "لكل متبرع",
      color: "#92400e",
      border: "#f59e0b",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              background: "white",
              borderRadius: 11,
              border: "1px solid rgba(45,122,82,.12)",
              padding: "13px 15px",
              borderRight: `3px solid ${s.border}`,
            }}
          >
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: ".73rem", color: "#6b7280", marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: ".7rem", fontWeight: 600, color: s.color, marginTop: 5 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "white",
          borderRadius: 13,
          border: "1px solid rgba(45,122,82,.12)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid rgba(45,122,82,.12)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background: "#e8f5ee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            📊
          </div>
          <div>
            <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>التحليلات</div>
            <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>
              تقارير الأداء والوصول
            </div>
          </div>
        </div>
        <div
          style={{
            padding: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ fontSize: "2.5rem" }}>📈</div>
          <div style={{ fontSize: ".9rem", fontWeight: 600, color: "#374151" }}>
            الرسوم البيانية قيد التطوير
          </div>
          <div style={{ fontSize: ".78rem", color: "#9ca3af" }}>
            سيتم إطلاق لوحة التحليلات قريباً
          </div>
        </div>
      </div>
    </div>
  );
}
