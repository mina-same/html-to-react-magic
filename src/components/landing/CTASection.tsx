import { WhatsAppIcon } from "./WhatsAppIcon";

export function CTASection() {
  return (
    <section
      id="cta"
      style={{
        background: "linear-gradient(135deg,#0d3322,#1a5c3a)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
      className="px-6 md:px-16 py-20 md:py-24"
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 30% 50%,rgba(201,168,76,0.08) 0%,transparent 60%),radial-gradient(circle at 70% 50%,rgba(74,158,112,0.1) 0%,transparent 60%)",
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
          في ساعِد لا نعمل من خلف الشاشات فقط، بل نمد أيدينا معكم لصناعة أثر حقيقي يصل للناس ويغيّر
          حياتهم
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <a
            href="https://wa.me/201019268509"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#25d366",
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
  );
}
