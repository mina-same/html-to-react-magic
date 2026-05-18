import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import saaidLogo from "../assets/saaid-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "ساعِد – المساعدة، اليد التي تمتد لتصنع أثرًا" }] }),
  component: Index,
});

const WA_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

function WhatsAppIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
      <path d={WA_PATH} />
    </svg>
  );
}

function Index() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.setAttribute("lang", "ar");

    // Fade-up scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), i * 100);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

    // Nav shadow on scroll
    const handleScroll = () => {
      if (navRef.current) {
        navRef.current.style.boxShadow =
          window.scrollY > 50 ? "0 4px 20px rgba(0,0,0,0.08)" : "none";
      }
    };
    window.addEventListener("scroll", handleScroll);

    // Animate counters when visible
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

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target
              .querySelectorAll(".big-num-value[data-target]")
              .forEach((el) => animateCounter(el));
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    document.querySelectorAll(".numbers-strip").forEach((el) => counterObserver.observe(el));

    return () => {
      observer.disconnect();
      counterObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Tajawal', 'Cairo', sans-serif",
        background: "#ffffff",
        color: "#1a1a2e",
        overflowX: "hidden",
        direction: "rtl",
      }}
    >
      {/* ── NAV ── */}
      <nav
        ref={navRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 4rem",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(45,122,82,0.15)",
          transition: "all 0.3s ease",
        }}
      >
        <a
          href="#hero"
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              background: "linear-gradient(135deg, #1a5c3a, #4a9e70)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: "1.1rem",
            }}
          >
            س
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a5c3a" }}>ساعِد</div>
            <div style={{ fontSize: "0.65rem", color: "#4a9e70", letterSpacing: 2 }}>SAAID</div>
          </div>
        </a>

        <ul
          style={{
            display: "flex",
            gap: "2rem",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {[
            { href: "#about", label: "من نحن" },
            { href: "#services", label: "الخدمات" },
            { href: "#how", label: "كيف نعمل" },
            { href: "#why", label: "لماذا ساعِد" },
            { href: "#impact", label: "أثرنا" },
          ].map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                style={{
                  textDecoration: "none",
                  color: "#3a3a5c",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#1a5c3a")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#3a3a5c")}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <a
            href="#cta"
            style={{
              background: "#1a5c3a",
              color: "white",
              padding: "0.6rem 1.5rem",
              borderRadius: 50,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              transition: "all 0.3s",
              border: "2px solid #1a5c3a",
            }}
          >
            تواصل معنا
          </a>
          <a
            href="dashboard.html"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.5rem 1.1rem",
              background: "#1a5c3a",
              color: "white",
              borderRadius: 8,
              fontSize: "0.88rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.2s",
              marginRight: "0.5rem",
            }}
          >
            دخول المنصة ←
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        id="hero"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "7rem 4rem 4rem",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0d3322 0%, #1a5c3a 50%, #2d7a52 100%)",
        }}
      >
        {/* bg pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            pointerEvents: "none",
          }}
        />
        {/* decorative circles */}
        <div
          style={{
            position: "absolute",
            right: "-10rem",
            top: "-10rem",
            width: "50rem",
            height: "50rem",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "-5rem",
            bottom: "-5rem",
            width: "30rem",
            height: "30rem",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            pointerEvents: "none",
          }}
        />

        {/* Hero content */}
        <div
          className="fade-up"
          style={{ maxWidth: 650, position: "relative", zIndex: 2 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.85)",
              padding: "0.4rem 1rem",
              borderRadius: 50,
              fontSize: "0.85rem",
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: "#c9a84c",
                borderRadius: "50%",
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            المبادرة الإعلامية الأولى للجمعيات الخيرية
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.2,
              marginBottom: "0.5rem",
              margin: 0,
            }}
          >
            <span style={{ color: "#c9a84c" }}>ساعِد</span> —<br />
            اليد التي تمتد
            <br />
            لتصنع أثرًا
          </h1>

          <p
            style={{
              fontSize: "1.2rem",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "2rem",
              fontWeight: 300,
              lineHeight: 1.8,
              marginTop: "0.5rem",
            }}
          >
            المساعدة – الأثر قبل الأرقام
          </p>

          <p
            style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.6)",
              marginBottom: "2.5rem",
              lineHeight: 1.9,
              maxWidth: 520,
            }}
          >
            مبادرة إعلامية وتسويقية متخصصة في دعم الجمعيات الخيرية السعودية، عبر تمكينها من
            الظهور الإعلامي المؤثر واالحترافي وتحويل رسالتها الإنسانية إلى قصص تصل للناس وتحرّكهم
            نحو التبرع والمشاركة.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a
              href="#cta"
              style={{
                background: "#c9a84c",
                color: "#1a5c3a",
                padding: "0.85rem 2rem",
                borderRadius: 50,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "1rem",
                transition: "all 0.3s",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              ابدأ الشراكة معنا ←
            </a>
            <a
              href="dashboard.html"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.85rem 1.6rem",
                background: "white",
                color: "#1a5c3a",
                border: "2px solid #1a5c3a",
                borderRadius: 50,
                fontSize: "1rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.25s",
              }}
            >
              🔐 دخول المنصة
            </a>
            <a
              href="#services"
              style={{
                background: "transparent",
                color: "white",
                border: "2px solid rgba(255,255,255,0.3)",
                padding: "0.85rem 2rem",
                borderRadius: 50,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "1rem",
                transition: "all 0.3s",
              }}
            >
              اكتشف خدماتنا
            </a>
            <a
              href="https://drive.google.com/file/d/1Woa17q3C2o4_HGd3zdTAVoVzp2NjjeNh/view?usp=drive_link"
              target="_blank"
              rel="noreferrer"
              style={{
                background: "transparent",
                color: "white",
                border: "2px solid rgba(255,255,255,0.3)",
                padding: "0.85rem 2rem",
                borderRadius: 50,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "1rem",
                transition: "all 0.3s",
              }}
            >
              📄 الملف التعريفي
            </a>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "3rem",
              marginTop: "4rem",
              paddingTop: "2rem",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {[
              { num: "10", label: "جمعية تحت الإدارة" },
              { num: "+2M", label: "ريال تمويلات محققة" },
              { num: "10K", label: "ريال تبرعات مجمّعة" },
              { num: "5", label: "خدمات متكاملة" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#c9a84c" }}>{s.num}</div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "rgba(255,255,255,0.5)",
                    marginTop: "0.2rem",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual: logo with rings */}
        <div
          style={{
            position: "absolute",
            left: "4rem",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 320,
              height: 320,
            }}
          >
            {/* Outer ring */}
            <div
              className="animate-ring-spin"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "1.5px solid rgba(255,255,255,0.12)",
              }}
            />
            {/* Mid dashed ring */}
            <div
              className="animate-ring-rev"
              style={{
                position: "absolute",
                inset: 24,
                borderRadius: "50%",
                border: "1px dashed rgba(201,168,76,0.25)",
              }}
            />
            {/* Inner glow */}
            <div
              style={{
                position: "absolute",
                inset: 60,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
                border: "1px solid rgba(201,168,76,0.15)",
              }}
            />
            {/* Orbit dots */}
            <div
              className="animate-orbit1"
              style={{
                position: "absolute",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#c9a84c",
                top: "50%",
                left: "50%",
                transformOrigin: "0 0",
                boxShadow: "0 0 8px rgba(201,168,76,0.8)",
              }}
            />
            <div
              className="animate-orbit2"
              style={{
                position: "absolute",
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.5)",
                top: "50%",
                left: "50%",
                transformOrigin: "0 0",
              }}
            />
            <div
              className="animate-orbit3"
              style={{
                position: "absolute",
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "rgba(201,168,76,0.6)",
                top: "50%",
                left: "50%",
                transformOrigin: "0 0",
              }}
            />
            {/* Sparks */}
            {[
              { w: 4, h: 4, l: "30%", t: "70%", dur: "3s", del: "0s" },
              { w: 3, h: 3, l: "60%", t: "75%", dur: "4s", del: "1s" },
              { w: 5, h: 5, l: "50%", t: "80%", dur: "2.5s", del: "0.5s" },
              { w: 3, h: 3, l: "40%", t: "65%", dur: "3.5s", del: "1.5s" },
            ].map((spark, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  borderRadius: "50%",
                  background: "rgba(201,168,76,0.6)",
                  width: spark.w,
                  height: spark.h,
                  left: spark.l,
                  top: spark.t,
                  animation: `spark-float ${spark.dur} ${spark.del} linear infinite`,
                }}
              />
            ))}
            {/* Logo */}
            <img
              src={saaidLogo}
              alt="ساعِد SAAID"
              className="animate-logo-float"
              style={{ width: 160, height: "auto", position: "relative", zIndex: 3 }}
            />
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section
        id="about"
        style={{ padding: "6rem 4rem", background: "#f8faf9" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5rem",
            alignItems: "center",
          }}
        >
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
            <p
              style={{
                fontSize: "1.05rem",
                color: "#6b7280",
                maxWidth: 600,
                lineHeight: 1.9,
              }}
            >
              نؤمن أن العمل الخيري لا يحتاج فقط إلى نية صادقة، بل إلى صوت قوي، وصورة واضحة،
              ورسالة تصل في الوقت الصحيح وبالطريقة الصحيحة.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                marginTop: "2rem",
              }}
            >
              {[
                "الأثر قبل الأرقام",
                "الشفافية والمصداقية",
                "الشراكة لا التنفيذ فقط",
                "الاحترافية في خدمة العمل الخيري",
                "الإنسان أولًا",
              ].map((val) => (
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

          <div
            className="fade-up"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
          >
            {[
              { icon: "🎯", title: "رؤيتنا", text: "أن نكون الشريك الإعلامي الأول للجمعيات الخيرية في المملكة العربية السعودية", mt: 0 },
              { icon: "📢", title: "رسالتنا", text: "تمكين الجمعيات الخيرية من إيصال رسالتها الإنسانية لأكبر شريحة ممكنة", mt: "2rem" },
              { icon: "🤝", title: "شريك حقيقي", text: "لا نعمل من خلف الشاشات فقط، بل نمد أيدينا معكم لصناعة أثر حقيقي", mt: 0 },
              { icon: "⭐", title: "تجربة مثبتة", text: "عملنا مع جمعيات تكاتف وإحسان وسند وغيرها من الجمعيات الرائدة", mt: "-2rem" },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: "1.5rem",
                  border: "1px solid rgba(45,122,82,0.15)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  marginTop: card.mt,
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
                    marginBottom: "0.4rem",
                    margin: 0,
                  }}
                >
                  {card.title}
                </h4>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#6b7280",
                    lineHeight: 1.7,
                    margin: "0.4rem 0 0",
                  }}
                >
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: "6rem 4rem", background: "white" }}>
        <div
          className="fade-up"
          style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 3rem" }}
        >
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
            خدماتنا
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 800,
              color: "#1a1a2e",
              marginBottom: "1rem",
            }}
          >
            ماذا نقدم؟
          </h2>
          <p
            style={{
              fontSize: "1.05rem",
              color: "#6b7280",
              maxWidth: 600,
              lineHeight: 1.9,
              margin: "0 auto",
            }}
          >
            خمس خدمات متكاملة تغطي كل احتياجات الجمعية الخيرية الإعلامية
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {[
            {
              icon: "📱",
              title: "الظهور الإعلامي وبناء الهوية",
              desc: "نبني هويتك الإعلامية بالكامل ونديرها باحترافية",
              items: [
                "إدارة الحسابات على منصات التواصل الاجتماعي",
                "بناء الهوية الإعلامية واللغة البصرية",
                "توحيد الرسائل والمحتوى مع أهداف الجمعية",
              ],
            },
            {
              icon: "🎬",
              title: "صناعة المحتوى المؤثر",
              desc: "محتوى يحرّك القلوب ويدفع نحو التبرع والمشاركة",
              items: [
                "محتوى قصصي إنساني Storytelling",
                "فيديوهات توعوية وتعريفية بالمشاريع",
                "تغطيات ميدانية للمبادرات والأنشطة",
                "محتوى تفاعلي يزيد من الانتشار",
              ],
            },
            {
              icon: "📊",
              title: "تصميم التقارير والملفات التعريفية",
              desc: "نحوّل بياناتك إلى محتوى بصري واضح ومؤثر",
              items: [
                "تصميم الملف التعريفي الرسمي",
                "إعداد تقارير المشاريع",
                "تحويل التقارير إلى موشن جرافيك",
              ],
            },
            {
              icon: "🚀",
              title: "الحملات الإعلامية وجمع التبرعات",
              desc: "حملات رقمية مدروسة ترفع معدلات التبرع",
              items: [
                "حملات موسمية: رمضان، الحج، الأعياد",
                "صفحات هبوط مخصصة للحملات",
                "تحسين الرسائل التحفيزية للتبرع",
              ],
            },
            {
              icon: "🌟",
              title: "إدارة المؤثرين والشراكات",
              desc: "نربطك بالمؤثرين المناسبين لرسالتك",
              items: [
                "ربط الجمعيات بالمؤثرين المناسبين",
                "إدارة حملات المؤثرين باحترافية",
                "توثيق الشراكات الإعلامية",
              ],
            },
            {
              icon: "📰",
              title: "التغطية الإعلامية والمناسبات",
              desc: "نبرز إنجازات جمعيتك في كل مناسبة",
              items: [
                "تغطية الفعاليات والملتقيات الخيرية",
                "إدارة الحضور الإعلامي للمناسبات",
                "إبراز إنجازات الجمعية إعلاميًا",
              ],
            },
          ].map((svc) => (
            <div
              key={svc.title}
              className="fade-up"
              style={{
                background: "#f8faf9",
                borderRadius: 24,
                padding: "2rem",
                border: "1px solid rgba(45,122,82,0.15)",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 100,
                  height: 100,
                  borderRadius: "0 24px 0 100%",
                  background: "#e8f5ee",
                  opacity: 0.5,
                  transition: "all 0.3s",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "#1a5c3a",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  marginBottom: "1.25rem",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {svc.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "#1a1a2e",
                  marginBottom: "0.75rem",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {svc.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#6b7280",
                  lineHeight: 1.8,
                  position: "relative",
                  zIndex: 1,
                  margin: 0,
                }}
              >
                {svc.desc}
              </p>
              <ul
                style={{
                  listStyle: "none",
                  marginTop: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                  position: "relative",
                  zIndex: 1,
                  padding: 0,
                }}
              >
                {svc.items.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontSize: "0.85rem",
                      color: "#3a3a5c",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.4rem",
                    }}
                  >
                    <span style={{ color: "#4a9e70", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* AI Platform Card */}
        <div
          className="fade-up"
          style={{
            marginTop: "3rem",
            borderRadius: 28,
            background: "linear-gradient(135deg, #0d3322 0%, #1a5c3a 60%, #2d7a52 100%)",
            padding: "3rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* decorative blobs */}
          <div
            style={{
              position: "absolute",
              top: "-4rem",
              left: "-4rem",
              width: "20rem",
              height: "20rem",
              borderRadius: "50%",
              background: "rgba(201,168,76,0.06)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-4rem",
              right: "-4rem",
              width: "24rem",
              height: "24rem",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.03)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(201,168,76,0.15)",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "#c9a84c",
              padding: "0.4rem 1.1rem",
              borderRadius: 50,
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "2rem",
              position: "relative",
              zIndex: 1,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#c9a84c",
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            مدعوم بالذكاء الاصطناعي — حصريًا لعملاء ساعِد
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "3rem",
              alignItems: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "white",
                  lineHeight: 1.25,
                  marginBottom: "1rem",
                }}
              >
                منصة ساعِد الذكية
                <br />
                <span style={{ color: "#c9a84c" }}>لإدارة التسويق الخيري</span>
              </h3>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.9,
                  marginBottom: "1.75rem",
                }}
              >
                منصة متكاملة تجمع كل أدوات إدارة محتواك الخيري في مكان واحد — من توليد المحتوى
                والصور والفيديوهات بالذكاء الاصطناعي، إلى تتبع المهام والداشبورد التحليلي الكامل.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.6rem",
                  marginBottom: "2rem",
                }}
              >
                {[
                  { icon: "🤖", label: "توليد محتوى بالذكاء الاصطناعي" },
                  { icon: "🖼️", label: "توليد صور احترافية" },
                  { icon: "🎬", label: "إنتاج فيديوهات تلقائية" },
                  { icon: "✅", label: "إدارة المهام والتاسكات" },
                  { icon: "📈", label: "داشبورد تتبع وتحليل" },
                  { icon: "📅", label: "جدولة ونشر تلقائي" },
                  { icon: "🔔", label: "تتبع الأداء لحظة بلحظة" },
                  { icon: "🤝", label: "تعاون الفريق بالكامل" },
                ].map((feat) => (
                  <div
                    key={feat.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      padding: "0.55rem 0.8rem",
                      transition: "all 0.25s",
                    }}
                  >
                    <span style={{ fontSize: "1rem", flexShrink: 0 }}>{feat.icon}</span>
                    <span
                      style={{
                        fontSize: "0.82rem",
                        color: "rgba(255,255,255,0.8)",
                        fontWeight: 500,
                      }}
                    >
                      {feat.label}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href="https://wa.me/201019268509"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  background: "#25d366",
                  color: "white",
                  padding: "0.85rem 2rem",
                  borderRadius: 50,
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  transition: "all 0.3s",
                }}
              >
                <WhatsAppIcon size={18} />
                احصل على وصول مبكر
              </a>
            </div>

            {/* Dashboard mock */}
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 18,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "rgba(0,0,0,0.2)",
                  padding: "0.65rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", gap: 5 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "rgba(255,95,87,0.7)",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "rgba(255,189,68,0.7)",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "rgba(40,200,64,0.7)",
                      display: "inline-block",
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
                  منصة ساعِد — لوحة التحكم
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "0.5rem",
                  padding: "0.75rem",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 10,
                    padding: "0.6rem",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{ fontSize: "0.95rem", fontWeight: 700, color: "white" }}
                  >
                    ١٢٤
                  </div>
                  <div
                    style={{
                      fontSize: "0.6rem",
                      color: "rgba(255,255,255,0.4)",
                      marginTop: 2,
                    }}
                  >
                    منشور هذا الشهر
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(201,168,76,0.12)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    borderRadius: 10,
                    padding: "0.6rem",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{ fontSize: "0.95rem", fontWeight: 700, color: "#c9a84c" }}
                  >
                    ٣٨ ألف
                  </div>
                  <div
                    style={{
                      fontSize: "0.6rem",
                      color: "rgba(255,255,255,0.4)",
                      marginTop: 2,
                    }}
                  >
                    وصول إجمالي
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 10,
                    padding: "0.6rem",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{ fontSize: "0.95rem", fontWeight: 700, color: "white" }}
                  >
                    ٨٩٪
                  </div>
                  <div
                    style={{
                      fontSize: "0.6rem",
                      color: "rgba(255,255,255,0.4)",
                      marginTop: 2,
                    }}
                  >
                    نسبة الإنجاز
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                  padding: "0 0.75rem",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 10,
                    padding: "0.7rem",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}
                  >
                    <span
                      style={{
                        fontSize: "0.6rem",
                        background: "rgba(201,168,76,0.2)",
                        color: "#c9a84c",
                        padding: "2px 6px",
                        borderRadius: 6,
                      }}
                    >
                      🤖 AI
                    </span>
                    <span
                      style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                    >
                      توليد محتوى
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: "0.5rem" }}>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.1)",
                        width: "100%",
                      }}
                    />
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.1)",
                        width: "75%",
                      }}
                    />
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.1)",
                        width: "50%",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      background: "rgba(201,168,76,0.2)",
                      color: "#c9a84c",
                      borderRadius: 6,
                      padding: "3px 8px",
                      textAlign: "center",
                    }}
                  >
                    توليد الآن ✨
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 10,
                    padding: "0.7rem",
                  }}
                >
                  <div style={{ marginBottom: "0.5rem" }}>
                    <span
                      style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                    >
                      المهام النشطة
                    </span>
                  </div>
                  <div style={{ fontSize: "0.65rem", padding: "3px 0", color: "rgba(74,200,120,0.8)" }}>
                    ✓ تصميم بوست رمضان
                  </div>
                  <div style={{ fontSize: "0.65rem", padding: "3px 0", color: "rgba(74,200,120,0.8)" }}>
                    ✓ فيديو حملة التبرع
                  </div>
                  <div style={{ fontSize: "0.65rem", padding: "3px 0", color: "rgba(255,200,60,0.8)" }}>
                    ⟳ تقرير الأداء الأسبوعي
                  </div>
                  <div style={{ fontSize: "0.65rem", padding: "3px 0", color: "rgba(255,255,255,0.35)" }}>
                    ◯ محتوى يوم الوطني
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 4,
                  padding: "0.75rem",
                  height: 70,
                }}
              >
                {[
                  { h: "55%", active: false },
                  { h: "70%", active: false },
                  { h: "45%", active: false },
                  { h: "90%", active: true },
                  { h: "65%", active: false },
                  { h: "80%", active: false },
                  { h: "50%", active: false },
                ].map((bar, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      borderRadius: "4px 4px 0 0",
                      background: bar.active
                        ? "rgba(201,168,76,0.5)"
                        : "rgba(255,255,255,0.1)",
                      height: bar.h,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW WE WORK ── */}
      <section
        id="how"
        style={{ padding: "6rem 4rem", background: "#1a5c3a" }}
      >
        <div
          className="fade-up"
          style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 1rem" }}
        >
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
              maxWidth: 600,
              lineHeight: 1.9,
              margin: "0 auto",
            }}
          >
            خمس خطوات منهجية نضمن بها أقصى أثر ممكن لكل جمعية نعمل معها
          </p>
        </div>

        <div
          className="fade-up"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "1rem",
            marginTop: "3rem",
            position: "relative",
          }}
        >
          {/* connector line */}
          <div
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
          {[
            { num: "١", title: "فهم الرسالة والأهداف", desc: "نبدأ بالاستماع العميق لفهم رسالتكم وطموحاتكم" },
            { num: "٢", title: "تحليل الوضع الإعلامي", desc: "نقيّم الوضع الحالي ونحدد الفجوات والفرص" },
            { num: "٣", title: "بناء الاستراتيجية", desc: "نصمم خطة إعلامية مخصصة لأهداف جمعيتكم" },
            { num: "٤", title: "تنفيذ المحتوى والحملات", desc: "ننفذ بدقة واحترافية كل عناصر الخطة الموضوعة" },
            { num: "٥", title: "قياس الأثر والتطوير", desc: "نقيس النتائج ونطور باستمرار لتعظيم الأثر" },
          ].map((step) => (
            <div
              key={step.num}
              style={{ textAlign: "center", position: "relative", zIndex: 1 }}
            >
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

      {/* ── WHY SAAID ── */}
      <section id="why" style={{ padding: "6rem 4rem", background: "#f8faf9" }}>
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
            تميّزنا
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 800,
              color: "#1a1a2e",
              marginBottom: "1rem",
            }}
          >
            لماذا ساعِد؟
          </h2>
          <p style={{ fontSize: "1.05rem", color: "#6b7280", maxWidth: 600, lineHeight: 1.9 }}>
            ما يميّزنا عن غيرنا من الوكالات والمقدمين
          </p>
        </div>

        <div
          className="fade-up"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
            alignItems: "start",
            marginTop: "3rem",
          }}
        >
          {[
            { icon: "🏛️", title: "فهم عميق للقطاع الخيري السعودي", desc: "خبرة متخصصة في القطاع غير الربحي وفهم عميق لاحتياجاته وخصوصيته" },
            { icon: "💡", title: "خبرة في الإعلام الرقمي وصناعة التأثير", desc: "فريق متخصص في المحتوى الرقمي والحملات التي تصنع فارقًا حقيقيًا" },
            { icon: "❤️", title: "محتوى إنساني يحترم الرسالة ولا يبتذلها", desc: "نروي القصص بطريقة تحترم كرامة المستفيدين وتعكس نبل رسالتكم" },
            { icon: "📈", title: "تركيز على النتائج والأثر الحقيقي", desc: "لا نكتفي بالجمال البصري، بل نقيس الأثر الحقيقي على التبرعات والوعي" },
            { icon: "🤝", title: "شريك طويل المدى وليس مزود خدمة مؤقت", desc: "نبني علاقات شراكة حقيقية وطويلة الأمد، لا مجرد تعاقدات موسمية" },
            { icon: "🏆", title: "تجربة مثبتة مع جمعيات رائدة", desc: "سجل حافل مع جمعيات تكاتف وإحسان وسند وغيرها من الجمعيات المرموقة" },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                display: "flex",
                gap: "1rem",
                padding: "1.5rem",
                background: "white",
                borderRadius: 20,
                border: "1px solid rgba(45,122,82,0.15)",
                transition: "all 0.3s",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  flexShrink: 0,
                  borderRadius: 14,
                  background: "#e8f5ee",
                  color: "#1a5c3a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                }}
              >
                {item.icon}
              </div>
              <div>
                <h4
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#1a1a2e",
                    marginBottom: "0.4rem",
                    margin: 0,
                  }}
                >
                  {item.title}
                </h4>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    lineHeight: 1.8,
                    margin: "0.4rem 0 0",
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── IMPACT ── */}
      <section id="impact" style={{ padding: "6rem 4rem", background: "white" }}>
        {/* Big numbers strip */}
        <div
          className="numbers-strip fade-up"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr",
            alignItems: "center",
            gap: 0,
            background: "linear-gradient(135deg, #0d3322, #1a5c3a)",
            borderRadius: 24,
            padding: "3rem 2.5rem",
            marginBottom: 0,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 24,
              background:
                "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23ffffff' fill-opacity='0.04'/%3E%3C/svg%3E\")",
              pointerEvents: "none",
            }}
          />
          {/* Stat 1 */}
          <div style={{ textAlign: "center", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>
            <span
              className="big-num-value"
              data-target="10"
              style={{
                fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
                fontWeight: 900,
                color: "#c9a84c",
                lineHeight: 1,
                display: "inline-block",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              0
            </span>
            <span
              style={{
                display: "inline-block",
                fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
                fontWeight: 900,
                color: "#c9a84c",
                verticalAlign: "super",
                lineHeight: 1,
              }}
            >
              +
            </span>
            <div
              style={{
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.55)",
                marginTop: "0.6rem",
                lineHeight: 1.6,
              }}
            >
              جمعية تحت إدارتنا
              <br />
              في المملكة العربية السعودية
            </div>
          </div>
          <div style={{ width: 1, height: 70, background: "rgba(255,255,255,0.1)" }} />

          {/* Stat 2 */}
          <div style={{ textAlign: "center", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>
            <span
              className="big-num-value"
              data-target="2"
              data-prefix="+"
              style={{
                fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
                fontWeight: 900,
                color: "#c9a84c",
                lineHeight: 1,
                display: "inline-block",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              0
            </span>
            <span
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                marginTop: "0.15rem",
                letterSpacing: "0.5px",
              }}
            >
              مليون ريال
            </span>
            <div
              style={{
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.55)",
                marginTop: "0.6rem",
                lineHeight: 1.6,
              }}
            >
              تمويلات محققة
              <br />
              لجمعياتنا الشريكة
            </div>
          </div>
          <div style={{ width: 1, height: 70, background: "rgba(255,255,255,0.1)" }} />

          {/* Stat 3 */}
          <div style={{ textAlign: "center", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>
            <span
              className="big-num-value"
              data-target="10000"
              data-comma="true"
              style={{
                fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
                fontWeight: 900,
                color: "#c9a84c",
                lineHeight: 1,
                display: "inline-block",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              0
            </span>
            <span
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                marginTop: "0.15rem",
                letterSpacing: "0.5px",
              }}
            >
              ريال
            </span>
            <div
              style={{
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.55)",
                marginTop: "0.6rem",
                lineHeight: 1.6,
              }}
            >
              تبرعات مجمّعة
              <br />
              عبر حملاتنا الرقمية
            </div>
          </div>
          <div style={{ width: 1, height: 70, background: "rgba(255,255,255,0.1)" }} />

          {/* Stat 4 */}
          <div style={{ textAlign: "center", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>
            <span
              className="big-num-value"
              data-target="6"
              style={{
                fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
                fontWeight: 900,
                color: "#c9a84c",
                lineHeight: 1,
                display: "inline-block",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              0
            </span>
            <span
              style={{
                display: "inline-block",
                fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
                fontWeight: 900,
                color: "#c9a84c",
                verticalAlign: "super",
                lineHeight: 1,
              }}
            >
              +
            </span>
            <div
              style={{
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.55)",
                marginTop: "0.6rem",
                lineHeight: 1.6,
              }}
            >
              خدمات إعلامية متكاملة
              <br />
              تحت سقف واحد
            </div>
          </div>
        </div>

        <div
          className="fade-up"
          style={{ textAlign: "center", maxWidth: 700, margin: "3rem auto 1rem" }}
        >
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
            الأثر الذي نصنعه
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 800,
              color: "#1a1a2e",
              marginBottom: "1rem",
            }}
          >
            ماذا يعني العمل معنا؟
          </h2>
          <p
            style={{
              fontSize: "1.05rem",
              color: "#6b7280",
              maxWidth: 600,
              lineHeight: 1.9,
              margin: "0 auto",
            }}
          >
            نتائج ملموسة تنعكس على رسالة جمعيتكم ومجتمعكم
          </p>
        </div>

        <div
          className="fade-up"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            marginTop: "3rem",
          }}
        >
          {[
            { icon: "🏛️", num: "10 جمعيات", label: "تحت الإدارة الإعلامية الكاملة في المملكة" },
            { icon: "💵", num: "+2,000,000 ريال", label: "تمويلات محققة لجمعياتنا الشريكة" },
            { icon: "❤️", num: "10,000 ريال", label: "تبرعات مجمّعة عبر حملاتنا الرقمية" },
            { icon: "📡", num: "وصول أوسع", label: "لرسالة الجمعية لأكبر شريحة ممكنة من المجتمع" },
            { icon: "🔄", num: "متابع ← داعم", label: "تحويل المتابع إلى داعم وشريك فاعل" },
          ].map((card) => (
            <div
              key={card.num}
              style={{
                textAlign: "center",
                padding: "2.5rem 1.5rem",
                borderRadius: 24,
                border: "1px solid rgba(45,122,82,0.15)",
                background: "#f8faf9",
                transition: "all 0.3s",
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "#e8f5ee",
                  color: "#1a5c3a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  margin: "0 auto 1rem",
                  transition: "all 0.3s",
                }}
              >
                {card.icon}
              </div>
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#1a1a2e",
                  marginBottom: "0.5rem",
                  transition: "all 0.3s",
                }}
              >
                {card.num}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#6b7280",
                  lineHeight: 1.6,
                  transition: "all 0.3s",
                }}
              >
                {card.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TARGET ── */}
      <section id="target" style={{ padding: "6rem 4rem", background: "#f8faf9" }}>
        <div
          className="fade-up"
          style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 1rem" }}
        >
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
            الفئة المستهدفة
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 800,
              color: "#1a1a2e",
              marginBottom: "1rem",
            }}
          >
            لمن نقدم خدماتنا؟
          </h2>
          <p
            style={{
              fontSize: "1.05rem",
              color: "#6b7280",
              maxWidth: 600,
              lineHeight: 1.9,
              margin: "0 auto",
            }}
          >
            نختص في العمل مع جهات العمل الخيري والإنساني
          </p>
        </div>

        <div
          className="fade-up"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
            marginTop: "3rem",
          }}
        >
          {[
            { icon: "🕌", title: "الجمعيات الخيرية" },
            { icon: "🏛️", title: "المؤسسات غير الربحية" },
            { icon: "🌱", title: "المبادرات المجتمعية" },
            { icon: "📿", title: "الأوقاف والمنظمات الإنسانية" },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1.25rem 1.5rem",
                background: "white",
                borderRadius: 16,
                border: "2px solid rgba(45,122,82,0.15)",
                transition: "all 0.3s",
              }}
            >
              <span style={{ fontSize: "1.75rem", flexShrink: 0 }}>{card.icon}</span>
              <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "#1a1a2e", margin: 0 }}>
                {card.title}
              </h4>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        id="cta"
        style={{
          padding: "6rem 4rem",
          background: "linear-gradient(135deg, #0d3322, #1a5c3a)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 30% 50%, rgba(201,168,76,0.08) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(74,158,112,0.1) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div className="fade-up" style={{ position: "relative", zIndex: 1 }}>
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
            دعوة للتعاون
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 800,
              color: "white",
              marginBottom: "1rem",
            }}
          >
            معًا… نُظهر الخير
            <br />
            ونُضاعف أثره
          </h2>
          <p
            style={{
              fontSize: "1.05rem",
              color: "rgba(255,255,255,0.65)",
              maxWidth: 600,
              lineHeight: 1.9,
              margin: "0 auto 2.5rem",
            }}
          >
            في ساعِد لا نعمل من خلف الشاشات فقط، بل نمد أيدينا معكم لصناعة أثر حقيقي يصل للناس
            ويغيّر حياتهم
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "2rem",
            }}
          >
            <a
              href="https://wa.me/201019268509"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "#25d366",
                border: "none",
                color: "white",
                padding: "0.85rem 2rem",
                borderRadius: 50,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "1rem",
                transition: "all 0.3s",
              }}
            >
              <WhatsAppIcon size={20} />
              تواصل عبر واتساب
            </a>
            <a
              href="https://drive.google.com/file/d/1Woa17q3C2o4_HGd3zdTAVoVzp2NjjeNh/view?usp=drive_link"
              target="_blank"
              rel="noreferrer"
              style={{
                background: "transparent",
                color: "white",
                border: "2px solid rgba(255,255,255,0.3)",
                padding: "0.85rem 2rem",
                borderRadius: 50,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "1rem",
                transition: "all 0.3s",
              }}
            >
              📄 الملف التعريفي
            </a>
            <a
              href="https://www.thebrightstation.com"
              target="_blank"
              rel="noreferrer"
              style={{
                background: "transparent",
                color: "white",
                border: "2px solid rgba(255,255,255,0.3)",
                padding: "0.85rem 2rem",
                borderRadius: 50,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "1rem",
                transition: "all 0.3s",
              }}
            >
              The Bright Station
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: "#0a2518",
          color: "rgba(255,255,255,0.5)",
          padding: "3rem 4rem 2rem",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "3rem",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h3
              style={{
                color: "white",
                fontSize: "1.3rem",
                fontWeight: 800,
                marginBottom: "0.75rem",
              }}
            >
              ساعِد — SAAID
            </h3>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.8, margin: 0 }}>
              مبادرة إعلامية وتسويقية متخصصة في دعم الجمعيات الخيرية السعودية. نحوّل رسالتك
              الإنسانية إلى أثر مجتمعي حقيقي.
            </p>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.8, marginTop: "0.75rem" }}>
              مبادرة من{" "}
              <a
                href="https://www.thebrightstation.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#c9a84c", textDecoration: "none" }}
              >
                The Bright Station
              </a>{" "}
              للإعلان والتسويق
            </p>
          </div>

          <div>
            <h4
              style={{ color: "white", fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem" }}
            >
              روابط سريعة
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { href: "#about", label: "من نحن" },
                { href: "#services", label: "الخدمات" },
                { href: "#how", label: "كيف نعمل" },
                { href: "#why", label: "لماذا ساعِد" },
                { href: "#impact", label: "أثرنا" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      transition: "color 0.2s",
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              style={{ color: "white", fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem" }}
            >
              تواصل معنا
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>
                <a
                  href="mailto:info@saaid-platform.com"
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    transition: "color 0.2s",
                  }}
                >
                  info@saaid-platform.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.thebrightstation.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    transition: "color 0.2s",
                  }}
                >
                  The Bright Station
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            paddingTop: "2rem",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.8rem",
          }}
        >
          <span>© 2025 ساعِد — جميع الحقوق محفوظة</span>
          <span>
            مبادرة من{" "}
            <a
              href="https://www.thebrightstation.com"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#c9a84c", textDecoration: "none" }}
            >
              The Bright Station
            </a>
          </span>
        </div>
      </footer>

      {/* ── FLOATING WHATSAPP ── */}
      <a
        href="https://wa.me/201019268509"
        target="_blank"
        rel="noreferrer"
        title="تواصل عبر واتساب"
        style={{
          position: "fixed",
          bottom: "2rem",
          left: "2rem",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#25d366",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(37,211,102,0.5)",
          zIndex: 999,
          textDecoration: "none",
          transition: "transform 0.3s, box-shadow 0.3s",
          animation: "wa-bounce 3s ease-in-out infinite",
        }}
      >
        <WhatsAppIcon size={28} color="white" />
      </a>

      {/* ── KEYFRAMES ── */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spark-float { 0%{transform:translateY(0) scale(1);opacity:0.7} 100%{transform:translateY(-80px) scale(0);opacity:0} }
        @keyframes wa-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        @media (max-width: 768px) {
          nav { padding: 1rem 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}
