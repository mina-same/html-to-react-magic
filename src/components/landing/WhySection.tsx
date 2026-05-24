const WHY_ITEMS = [
  { icon: "🏛️", title: "فهم عميق للقطاع الخيري السعودي",          desc: "خبرة متخصصة في القطاع غير الربحي وفهم عميق لاحتياجاته وخصوصيته" },
  { icon: "💡", title: "خبرة في الإعلام الرقمي وصناعة التأثير",    desc: "فريق متخصص في المحتوى الرقمي والحملات التي تصنع فارقًا حقيقيًا" },
  { icon: "❤️", title: "محتوى إنساني يحترم الرسالة ولا يبتذلها", desc: "نروي القصص بطريقة تحترم كرامة المستفيدين وتعكس نبل رسالتكم" },
  { icon: "📈", title: "تركيز على النتائج والأثر الحقيقي",          desc: "لا نكتفي بالجمال البصري، بل نقيس الأثر الحقيقي على التبرعات والوعي" },
  { icon: "🤝", title: "شريك طويل المدى وليس مزود خدمة مؤقت",     desc: "نبني علاقات شراكة حقيقية وطويلة الأمد، لا مجرد تعاقدات موسمية" },
  { icon: "🏆", title: "تجربة مثبتة مع جمعيات رائدة",               desc: "سجل حافل مع جمعيات تكاتف وإحسان وسند وغيرها من الجمعيات المرموقة" },
];

export function WhySection() {
  return (
    <section id="why" style={{ background: "#f8faf9" }} className="px-6 md:px-16 py-20 md:py-24">
      <div className="fade-up">
        <span style={{ display: "inline-block", background: "#e8f5ee", color: "#1a5c3a", padding: "0.35rem 1rem", borderRadius: 50, fontSize: "0.85rem", fontWeight: 600, marginBottom: "1rem" }}>تميّزنا</span>
        <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, color: "#1a1a2e", marginBottom: "1rem" }}>لماذا ساعِد؟</h2>
        <p style={{ fontSize: "1.05rem", color: "#6b7280", maxWidth: 600, lineHeight: 1.9 }}>ما يميّزنا عن غيرنا من الوكالات والمقدمين</p>
      </div>

      <div className="fade-up grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        {WHY_ITEMS.map(item => (
          <div key={item.title} style={{ display: "flex", gap: "1rem", padding: "1.5rem", background: "white", borderRadius: 20, border: "1px solid rgba(45,122,82,0.15)", transition: "all 0.3s" }}>
            <div style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 14, background: "#e8f5ee", color: "#1a5c3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
              {item.icon}
            </div>
            <div>
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a1a2e", margin: 0, marginBottom: "0.4rem" }}>{item.title}</h4>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.8, margin: 0 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
