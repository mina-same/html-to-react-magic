const STEPS = [
  { num: "١", title: "فهم الرسالة والأهداف", desc: "نبدأ بالاستماع العميق لفهم رسالتكم وطموحاتكم" },
  { num: "٢", title: "تحليل الوضع الإعلامي", desc: "نقيّم الوضع الحالي ونحدد الفجوات والفرص" },
  { num: "٣", title: "بناء الاستراتيجية", desc: "نصمم خطة إعلامية مخصصة لأهداف جمعيتكم" },
  {
    num: "٤",
    title: "تنفيذ المحتوى والحملات",
    desc: "ننفذ بدقة واحترافية كل عناصر الخطة الموضوعة",
  },
  { num: "٥", title: "قياس الأثر والتطوير", desc: "نقيس النتائج ونطور باستمرار لتعظيم الأثر" },
];

export function HowSection() {
  return (
    <section id="how" style={{ background: "#1a5c3a" }} className="px-6 md:px-16 py-20 md:py-24">
      <div className="fade-up text-center mx-auto mb-4" style={{ maxWidth: 700 }}>
        <span
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.8)",
            padding: "0.35rem 1rem",
            borderRadius: 50,
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "1rem",
          }}
        >
          منهجيتنا
        </span>
        <h2
          style={{
            fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
            fontWeight: 800,
            color: "white",
            marginBottom: "1rem",
          }}
        >
          كيف نعمل؟
        </h2>
        <p
          style={{
            fontSize: "1.05rem",
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.9,
            margin: "0 auto",
          }}
        >
          خمس خطوات منهجية نضمن بها أقصى أثر ممكن لكل جمعية نعمل معها
        </p>
      </div>

      <div className="fade-up grid grid-cols-2 md:grid-cols-5 gap-4 mt-12 relative">
        {/* connector line — desktop only */}
        <div
          className="hidden md:block"
          style={{
            position: "absolute",
            top: "2.5rem",
            right: "10%",
            left: "10%",
            height: 2,
            background: "rgba(255,255,255,0.1)",
            zIndex: 0,
          }}
        />
        {STEPS.map((step) => (
          <div key={step.num} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                border: "2px solid rgba(255,255,255,0.15)",
                color: "white",
                fontSize: "1.3rem",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                transition: "all 0.3s",
              }}
            >
              {step.num}
            </div>
            <h4
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "white",
                marginBottom: "0.4rem",
              }}
            >
              {step.title}
            </h4>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
