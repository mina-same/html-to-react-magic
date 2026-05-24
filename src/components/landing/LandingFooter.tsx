const FOOTER_LINKS = [
  { href: "#about",    label: "من نحن" },
  { href: "#services", label: "الخدمات" },
  { href: "#how",      label: "كيف نعمل" },
  { href: "#why",      label: "لماذا ساعِد" },
  { href: "#impact",   label: "أثرنا" },
];

export function LandingFooter() {
  const linkStyle: React.CSSProperties = { color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.2s" };

  return (
    <footer style={{ background: "#0a2518", color: "rgba(255,255,255,0.5)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      className="px-6 md:px-16 pt-12 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-8">
        <div>
          <h3 style={{ color: "white", fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.75rem" }}>ساعِد — SAAID</h3>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.8, margin: 0 }}>
            مبادرة إعلامية وتسويقية متخصصة في دعم الجمعيات الخيرية السعودية. نحوّل رسالتك الإنسانية إلى أثر مجتمعي حقيقي.
          </p>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.8, marginTop: "0.75rem" }}>
            مبادرة من{" "}
            <a href="https://www.thebrightstation.com" target="_blank" rel="noreferrer" style={{ color: "#c9a84c", textDecoration: "none" }}>
              The Bright Station
            </a>{" "}
            للإعلان والتسويق
          </p>
        </div>

        <div>
          <h4 style={{ color: "white", fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem" }}>روابط سريعة</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {FOOTER_LINKS.map(link => (
              <li key={link.href}><a href={link.href} style={linkStyle}>{link.label}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={{ color: "white", fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem" }}>تواصل معنا</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li><a href="mailto:info@saaid-platform.com" style={linkStyle}>info@saaid-platform.com</a></li>
            <li><a href="https://www.thebrightstation.com" target="_blank" rel="noreferrer" style={linkStyle}>The Bright Station</a></li>
          </ul>
        </div>
      </div>

      <div style={{ paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <span>© 2025 ساعِد — جميع الحقوق محفوظة</span>
        <span>مبادرة من{" "}
          <a href="https://www.thebrightstation.com" target="_blank" rel="noreferrer" style={{ color: "#c9a84c", textDecoration: "none" }}>
            The Bright Station
          </a>
        </span>
      </div>
    </footer>
  );
}
