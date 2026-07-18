const VALUES = [
  "الأثر قبل الأرقام",
  "الشفافية والمصداقية",
  "الشراكة لا التنفيذ فقط",
  "الاحترافية في خدمة العمل الخيري",
  "الإنسان أولًا",
];

const CARDS = [
  {
    icon: "🎯",
    title: "رؤيتنا",
    text: "أن نكون الشريك الإعلامي الأول للجمعيات الخيرية في المملكة العربية السعودية",
    mt: 0,
  },
  {
    icon: "📢",
    title: "رسالتنا",
    text: "تمكين الجمعيات الخيرية من إيصال رسالتها الإنسانية لأكبر شريحة ممكنة",
    mt: "2rem",
  },
  {
    icon: "🤝",
    title: "شريك حقيقي",
    text: "لا نعمل من خلف الشاشات فقط، بل نمد أيدينا معكم لصناعة أثر حقيقي",
    mt: 0,
  },
  {
    icon: "⭐",
    title: "تجربة مثبتة",
    text: "عملنا مع جمعيات تكاتف وإحسان وسند وغيرها من الجمعيات الرائدة",
    mt: "-2rem",
  },
];

export function AboutSection() {
  return (
    <section id="about" style={{ background: "#f8faf9" }} className="px-6 md:px-16 py-20 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="fade-up">
          <span
            style={{
              display: "inline-block",
              background: "#e8f5ee",
              color: "#1a5c3a",
              padding: "0.35rem 1rem",
              borderRadius: 50,
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            من نحن
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 800,
              color: "#1a1a2e",
              marginBottom: "1rem",
            }}
          >
            نؤمن أن الخير
            <br />
            يستحق أن يُرى
          </h2>
          <p style={{ fontSize: "1.05rem", color: "#6b7280", maxWidth: 600, lineHeight: 1.9 }}>
            نؤمن أن العمل الخيري لا يحتاج فقط إلى نية صادقة، بل إلى صوت قوي، وصورة واضحة، ورسالة تصل
            في الوقت الصحيح وبالطريقة الصحيحة.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "2rem" }}
          >
            {VALUES.map((val) => (
              <div
                key={val}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  background: "white",
                  borderRadius: 12,
                  border: "1px solid rgba(45,122,82,0.15)",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#2d7a52",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "#3a3a5c" }}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="fade-up grid grid-cols-2 gap-4">
          {CARDS.map((card) => (
            <div
              key={card.title}
              style={{
                background: "white",
                borderRadius: 20,
                padding: "1.5rem",
                border: "1px solid rgba(45,122,82,0.15)",
                transition: "transform 0.3s, box-shadow 0.3s",
                marginTop: typeof card.mt === "string" ? card.mt : 0,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "#e8f5ee",
                  color: "#1a5c3a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                  marginBottom: "0.75rem",
                }}
              >
                {card.icon}
              </div>
              <h4
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#1a1a2e",
                  margin: 0,
                  marginBottom: "0.4rem",
                }}
              >
                {card.title}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", lineHeight: 1.7, margin: 0 }}>
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
