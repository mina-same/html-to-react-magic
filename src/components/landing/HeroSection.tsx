import saaidLogo from "@/assets/saaid-logo.png";
import { useNavigate } from "@tanstack/react-router";
import { WhatsAppIcon } from "./WhatsAppIcon";

const SPARKS = [
  { w: 4, h: 4, l: "30%", t: "70%", dur: "3s",   del: "0s" },
  { w: 3, h: 3, l: "60%", t: "75%", dur: "4s",   del: "1s" },
  { w: 5, h: 5, l: "50%", t: "80%", dur: "2.5s", del: "0.5s" },
  { w: 3, h: 3, l: "40%", t: "65%", dur: "3.5s", del: "1.5s" },
];

const STATS = [
  { num: "10",   label: "جمعية تحت الإدارة" },
  { num: "+2M",  label: "ريال تمويلات محققة" },
  { num: "10K",  label: "ريال تبرعات مجمّعة" },
  { num: "5",    label: "خدمات متكاملة" },
];

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="hero" style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#0d3322 0%,#1a5c3a 50%,#2d7a52 100%)" }}
      className="px-6 md:px-16 py-28 md:py-32">
      {/* bg pattern */}
      <div style={{ position: "absolute", inset: 0, background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")", pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: "-10rem", top: "-10rem", width: "50rem", height: "50rem", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: "-5rem", bottom: "-5rem", width: "30rem", height: "30rem", borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

      {/* Hero text */}
      <div className="fade-up" style={{ maxWidth: 650, position: "relative", zIndex: 2, flex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)", padding: "0.4rem 1rem", borderRadius: 50, fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          <span style={{ width: 6, height: 6, background: "#c9a84c", borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite" }} />
          المبادرة الإعلامية الأولى للجمعيات الخيرية
        </div>

        <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 800, color: "white", lineHeight: 1.2, margin: 0, marginBottom: "0.5rem" }}>
          <span style={{ color: "#c9a84c" }}>ساعِد</span> —<br />
          اليد التي تمتد<br />
          لتصنع أثرًا
        </h1>

        <p style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.7)", fontWeight: 300, lineHeight: 1.8, marginTop: "0.5rem", marginBottom: "0.5rem" }}>
          المساعدة – الأثر قبل الأرقام
        </p>

        <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.9, maxWidth: 520, marginBottom: "2.5rem" }}>
          مبادرة إعلامية وتسويقية متخصصة في دعم الجمعيات الخيرية السعودية، عبر تمكينها من الظهور الإعلامي المؤثر والاحترافي وتحويل رسالتها الإنسانية إلى قصص تصل للناس وتحرّكهم نحو التبرع والمشاركة.
        </p>

        <div className="flex flex-wrap gap-3">
          <a href="#cta" style={{ background: "#c9a84c", color: "#1a5c3a", padding: "0.85rem 2rem", borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: "1rem", transition: "all 0.3s", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            ابدأ الشراكة معنا ←
          </a>
          <button onClick={() => navigate({ to: "/gate" })}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.85rem 1.6rem", background: "white", color: "#1a5c3a", border: "2px solid #1a5c3a", borderRadius: 50, fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Tajawal','Cairo',sans-serif", transition: "all 0.25s" }}>
            🔐 دخول المنصة
          </button>
          <a href="#services" style={{ background: "transparent", color: "white", border: "2px solid rgba(255,255,255,0.3)", padding: "0.85rem 2rem", borderRadius: 50, textDecoration: "none", fontWeight: 600, fontSize: "1rem", transition: "all 0.3s" }}>
            اكتشف خدماتنا
          </a>
          <a href="https://drive.google.com/file/d/1Woa17q3C2o4_HGd3zdTAVoVzp2NjjeNh/view?usp=drive_link" target="_blank" rel="noreferrer"
            style={{ background: "transparent", color: "white", border: "2px solid rgba(255,255,255,0.3)", padding: "0.85rem 2rem", borderRadius: 50, textDecoration: "none", fontWeight: 600, fontSize: "1rem", transition: "all 0.3s" }}>
            📄 الملف التعريفي
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-8 mt-16 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#c9a84c" }}>{s.num}</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginTop: "0.2rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Logo with rings — hidden on small screens */}
      <div className="hidden lg:flex" style={{ position: "absolute", left: "4rem", top: "50%", transform: "translateY(-50%)", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 1 }}>
        <div style={{ position: "relative", width: 320, height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="animate-ring-spin" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.12)" }} />
          <div className="animate-ring-rev" style={{ position: "absolute", inset: 24, borderRadius: "50%", border: "1px dashed rgba(201,168,76,0.25)" }} />
          <div style={{ position: "absolute", inset: 60, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,168,76,0.08) 0%,transparent 70%)", border: "1px solid rgba(201,168,76,0.15)" }} />
          <div className="animate-orbit1" style={{ position: "absolute", width: 8, height: 8, borderRadius: "50%", background: "#c9a84c", top: "50%", left: "50%", transformOrigin: "0 0", boxShadow: "0 0 8px rgba(201,168,76,0.8)" }} />
          <div className="animate-orbit2" style={{ position: "absolute", width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.5)", top: "50%", left: "50%", transformOrigin: "0 0" }} />
          <div className="animate-orbit3" style={{ position: "absolute", width: 4, height: 4, borderRadius: "50%", background: "rgba(201,168,76,0.6)", top: "50%", left: "50%", transformOrigin: "0 0" }} />
          {SPARKS.map((spark, i) => (
            <div key={i} style={{ position: "absolute", borderRadius: "50%", background: "rgba(201,168,76,0.6)", width: spark.w, height: spark.h, left: spark.l, top: spark.t, animation: `spark-float ${spark.dur} ${spark.del} linear infinite` }} />
          ))}
          <img src={saaidLogo} alt="ساعِد SAAID" className="animate-logo-float" style={{ width: 160, height: "auto", position: "relative", zIndex: 3 }} />
        </div>
      </div>
    </section>
  );
}
