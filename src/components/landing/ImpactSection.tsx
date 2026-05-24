import { useEffect, useRef } from "react";

function animateCounter(el: Element) {
  const target = parseInt((el as HTMLElement).dataset.target || "0");
  const comma = (el as HTMLElement).dataset.comma === "true";
  const prefix = (el as HTMLElement).dataset.prefix || "";
  const duration = 1800;
  const start = performance.now();
  function step(now: number) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(ease * target);
    el.textContent = prefix + (comma ? current.toLocaleString("ar-SA") : current);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = prefix + (comma ? target.toLocaleString("ar-SA") : target);
  }
  requestAnimationFrame(step);
}

const IMPACT_CARDS = [
  { icon: "🏛️", num: "10 جمعيات",         label: "تحت الإدارة الإعلامية الكاملة في المملكة" },
  { icon: "💵", num: "+2,000,000 ريال",   label: "تمويلات محققة لجمعياتنا الشريكة" },
  { icon: "❤️", num: "10,000 ريال",       label: "تبرعات مجمّعة عبر حملاتنا الرقمية" },
  { icon: "📡", num: "وصول أوسع",          label: "لرسالة الجمعية لأكبر شريحة ممكنة من المجتمع" },
  { icon: "🔄", num: "متابع ← داعم",       label: "تحويل المتابع إلى داعم وشريك فاعل" },
];

export function ImpactSection() {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".big-num-value[data-target]").forEach(el => animateCounter(el));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (stripRef.current) observer.observe(stripRef.current);
    return () => observer.disconnect();
  }, []);

  const numStyle: React.CSSProperties = { fontSize: "clamp(2.8rem, 5vw, 4.5rem)", fontWeight: 900, color: "#c9a84c", lineHeight: 1, display: "inline-block", fontVariantNumeric: "tabular-nums" };
  const subStyle: React.CSSProperties = { fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", marginTop: "0.6rem", lineHeight: 1.6 };
  const supStyle: React.CSSProperties = { display: "inline-block", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 900, color: "#c9a84c", verticalAlign: "super", lineHeight: 1 };

  return (
    <section id="impact" style={{ background: "white" }} className="px-6 md:px-16 py-20 md:py-24">
      {/* Numbers strip */}
      <div ref={stripRef} className="numbers-strip fade-up"
        style={{ display: "grid", alignItems: "center", gap: 0, background: "linear-gradient(135deg,#0d3322,#1a5c3a)", borderRadius: 24, padding: "3rem 1.5rem", overflow: "hidden", position: "relative" }}
        /* grid template handled via inline to keep dynamic column approach responsive */
      >
        <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23ffffff' fill-opacity='0.04'/%3E%3C/svg%3E\")", pointerEvents: "none" }} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Stat 1 */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <span className="big-num-value" data-target="10" style={numStyle}>0</span>
            <span style={supStyle}>+</span>
            <div style={subStyle}>جمعية تحت إدارتنا<br />في المملكة العربية السعودية</div>
          </div>
          {/* Stat 2 */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <span className="big-num-value" data-target="2" data-prefix="+" style={numStyle}>0</span>
            <span style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginTop: "0.15rem", letterSpacing: "0.5px" }}>مليون ريال</span>
            <div style={subStyle}>تمويلات محققة<br />لجمعياتنا الشريكة</div>
          </div>
          {/* Stat 3 */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <span className="big-num-value" data-target="10000" data-comma="true" style={numStyle}>0</span>
            <span style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginTop: "0.15rem", letterSpacing: "0.5px" }}>ريال</span>
            <div style={subStyle}>تبرعات مجمّعة<br />عبر حملاتنا الرقمية</div>
          </div>
          {/* Stat 4 */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <span className="big-num-value" data-target="6" style={numStyle}>0</span>
            <span style={supStyle}>+</span>
            <div style={subStyle}>خدمات إعلامية متكاملة<br />تحت سقف واحد</div>
          </div>
        </div>
      </div>

      {/* What does working with us mean */}
      <div className="fade-up text-center mx-auto mt-12 mb-4" style={{ maxWidth: 700 }}>
        <span style={{ display: "inline-block", background: "#e8f5ee", color: "#1a5c3a", padding: "0.35rem 1rem", borderRadius: 50, fontSize: "0.85rem", fontWeight: 600, marginBottom: "1rem" }}>الأثر الذي نصنعه</span>
        <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, color: "#1a1a2e", marginBottom: "1rem" }}>ماذا يعني العمل معنا؟</h2>
        <p style={{ fontSize: "1.05rem", color: "#6b7280", lineHeight: 1.9, margin: "0 auto" }}>نتائج ملموسة تنعكس على رسالة جمعيتكم ومجتمعكم</p>
      </div>

      <div className="fade-up grid gap-6 mt-12" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {IMPACT_CARDS.map(card => (
          <div key={card.num} style={{ textAlign: "center", padding: "2.5rem 1.5rem", borderRadius: 24, border: "1px solid rgba(45,122,82,0.15)", background: "#f8faf9", transition: "all 0.3s" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#e8f5ee", color: "#1a5c3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", margin: "0 auto 1rem", transition: "all 0.3s" }}>{card.icon}</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.5rem" }}>{card.num}</div>
            <div style={{ fontSize: "0.85rem", color: "#6b7280", lineHeight: 1.6 }}>{card.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
