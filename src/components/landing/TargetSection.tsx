const TARGETS = [
  { icon: "🕌", title: "الجمعيات الخيرية" },
  { icon: "🏛️", title: "المؤسسات غير الربحية" },
  { icon: "🌱", title: "المبادرات المجتمعية" },
  { icon: "📿", title: "الأوقاف والمنظمات الإنسانية" },
];

export function TargetSection() {
  return (
    <section id="target" style={{ background: "#f8faf9" }} className="px-6 md:px-16 py-20 md:py-24">
      <div className="fade-up text-center mx-auto mb-4" style={{ maxWidth: 700 }}>
        <span style={{ display: "inline-block", background: "#e8f5ee", color: "#1a5c3a", padding: "0.35rem 1rem", borderRadius: 50, fontSize: "0.85rem", fontWeight: 600, marginBottom: "1rem" }}>الفئة المستهدفة</span>
        <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, color: "#1a1a2e", marginBottom: "1rem" }}>لمن نقدم خدماتنا؟</h2>
        <p style={{ fontSize: "1.05rem", color: "#6b7280", lineHeight: 1.9, margin: "0 auto" }}>نختص في العمل مع جهات العمل الخيري والإنساني</p>
      </div>

      <div className="fade-up grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
        {TARGETS.map(card => (
          <div key={card.title} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem 1.5rem", background: "white", borderRadius: 16, border: "2px solid rgba(45,122,82,0.15)", transition: "all 0.3s" }}>
            <span style={{ fontSize: "1.75rem", flexShrink: 0 }}>{card.icon}</span>
            <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "#1a1a2e", margin: 0 }}>{card.title}</h4>
          </div>
        ))}
      </div>
    </section>
  );
}
