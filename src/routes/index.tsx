import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { HowSection } from "@/components/landing/HowSection";
import { WhySection } from "@/components/landing/WhySection";
import { ImpactSection } from "@/components/landing/ImpactSection";
import { TargetSection } from "@/components/landing/TargetSection";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { WhatsAppIcon } from "@/components/landing/WhatsAppIcon";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "ساعِد – المساعدة، اليد التي تمتد لتصنع أثرًا" }] }),
  component: Index,
});

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
      { threshold: 0.1 },
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

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Tajawal','Cairo',sans-serif",
        background: "#ffffff",
        color: "#1a1a2e",
        overflowX: "hidden",
        direction: "rtl",
      }}
    >
      <LandingNav navRef={navRef} />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <HowSection />
      <WhySection />
      <ImpactSection />
      <TargetSection />
      <CTASection />
      <LandingFooter />

      {/* Floating WhatsApp */}
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

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spark-float { 0%{transform:translateY(0) scale(1);opacity:0.7} 100%{transform:translateY(-80px) scale(0);opacity:0} }
        @keyframes wa-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
      `}</style>
    </div>
  );
}
