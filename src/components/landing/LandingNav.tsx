import { useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import saaidLogo from "@/assets/saaid-logo.png";

const NAV_LINKS = [
  { href: "#about",    label: "من نحن" },
  { href: "#services", label: "الخدمات" },
  { href: "#how",      label: "كيف نعمل" },
  { href: "#why",      label: "لماذا ساعِد" },
  { href: "#impact",   label: "أثرنا" },
];

interface Props {
  navRef: React.RefObject<HTMLElement | null>;
}

export function LandingNav({ navRef }: Props) {
  const navigate = useNavigate();

  return (
    <nav
      ref={navRef}
      suppressHydrationWarning
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(45,122,82,0.15)",
        transition: "all 0.3s ease",
      }}
      className="px-6 md:px-16 py-4"
    >
      <a
        href="#hero"
        style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            background: "linear-gradient(135deg,#1a5c3a,#4a9e70)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 800,
            fontSize: "1.1rem",
          }}
        >
          <img
            src={saaidLogo}
            alt="ساعِد"
            style={{ width: 28, filter: "brightness(0) invert(1)" }}
          />
        </div>
        <div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a5c3a" }}>ساعِد</div>
          <div style={{ fontSize: "0.65rem", color: "#4a9e70", letterSpacing: 2 }}>SAAID</div>
        </div>
      </a>

      <ul
        className="hidden md:flex"
        style={{ gap: "2rem", listStyle: "none", margin: 0, padding: 0 }}
      >
        {NAV_LINKS.map((link) => (
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
          className="hidden md:inline-block"
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
        <button
          onClick={() => navigate({ to: "/login" })}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0.5rem 1.1rem",
            background: "#1a5c3a",
            color: "white",
            borderRadius: 8,
            fontSize: "0.88rem",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontFamily: "'Tajawal','Cairo',sans-serif",
            transition: "all 0.2s",
          }}
        >
          دخول المنصة ←
        </button>
      </div>
    </nav>
  );
}
