import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "ساعِد – المساعدة، اليد التي تمتد لتصنع أثرًا" }] }),
  component: Index,
});

const STYLES = `
  :root {
    --green-dark: #1a5c3a;
    --green-mid: #2d7a52;
    --green-light: #4a9e70;
    --green-pale: #e8f5ee;
    --green-accent: #3d9e68;
    --gold: #c9a84c;
    --text-dark: #1a1a2e;
    --text-mid: #3a3a5c;
    --text-light: #6b7280;
    --white: #ffffff;
    --off-white: #f8faf9;
    --border: rgba(45, 122, 82, 0.15);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Tajawal', 'Cairo', sans-serif;
    background: var(--white);
    color: var(--text-dark);
    overflow-x: hidden;
    direction: rtl;
  }

  /* ── NAV ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 4rem;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    transition: all 0.3s ease;
  }
  .nav-logo { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
  .nav-logo-icon {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, var(--green-dark), var(--green-light));
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 800; font-size: 1.1rem;
  }
  .nav-logo-text { font-size: 1.4rem; font-weight: 800; color: var(--green-dark); }
  .nav-logo-sub { font-size: 0.65rem; color: var(--green-light); letter-spacing: 2px; }
  .nav-links { display: flex; gap: 2rem; list-style: none; }
  .nav-links a { text-decoration: none; color: var(--text-mid); font-weight: 500; font-size: 0.95rem; transition: color 0.2s; }
  .nav-links a:hover { color: var(--green-dark); }
  .nav-cta {
    background: var(--green-dark); color: white;
    padding: 0.6rem 1.5rem; border-radius: 50px;
    text-decoration: none; font-weight: 600; font-size: 0.9rem;
    transition: all 0.3s; border: 2px solid var(--green-dark);
  }
  .nav-cta:hover { background: transparent; color: var(--green-dark); }

  /* ── HERO ── */
  .hero {
    min-height: 100vh;
    display: flex; align-items: center;
    padding: 7rem 4rem 4rem;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #0d3322 0%, #1a5c3a 50%, #2d7a52 100%);
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .hero-circle-1 {
    position: absolute; right: -10rem; top: -10rem;
    width: 50rem; height: 50rem; border-radius: 50%;
    background: rgba(255,255,255,0.04);
    pointer-events: none;
  }
  .hero-circle-2 {
    position: absolute; left: -5rem; bottom: -5rem;
    width: 30rem; height: 30rem; border-radius: 50%;
    background: rgba(255,255,255,0.03);
    pointer-events: none;
  }
  .hero-content { max-width: 650px; position: relative; z-index: 2; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.85); padding: 0.4rem 1rem;
    border-radius: 50px; font-size: 0.85rem; margin-bottom: 1.5rem;
  }
  .hero-badge span { width: 6px; height: 6px; background: var(--gold); border-radius: 50%; display: inline-block; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .hero h1 {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 800; color: white; line-height: 1.2;
    margin-bottom: 0.5rem;
  }
  .hero h1 .accent { color: var(--gold); }
  .hero-sub {
    font-size: 1.2rem; color: rgba(255,255,255,0.7);
    margin-bottom: 2rem; font-weight: 300; line-height: 1.8;
  }
  .hero-desc {
    font-size: 1rem; color: rgba(255,255,255,0.6);
    margin-bottom: 2.5rem; line-height: 1.9; max-width: 520px;
  }
  .hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; }
  .btn-primary {
    background: var(--gold); color: var(--green-dark);
    padding: 0.85rem 2rem; border-radius: 50px;
    text-decoration: none; font-weight: 700; font-size: 1rem;
    transition: all 0.3s; display: inline-flex; align-items: center; gap: 0.5rem;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(201,168,76,0.4); }
  .btn-secondary {
    background: transparent; color: white;
    border: 2px solid rgba(255,255,255,0.3);
    padding: 0.85rem 2rem; border-radius: 50px;
    text-decoration: none; font-weight: 600; font-size: 1rem;
    transition: all 0.3s;
  }
  .btn-secondary:hover { border-color: white; background: rgba(255,255,255,0.08); }
  .hero-stats {
    display: flex; gap: 3rem; margin-top: 4rem;
    padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);
  }
  .stat-item { text-align: center; }
  .stat-num { font-size: 2rem; font-weight: 800; color: var(--gold); }
  .stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-top: 0.2rem; }
  .hero-visual {
    position: absolute; left: 4rem; top: 50%; transform: translateY(-50%);
    display: flex; align-items: center; justify-content: center;
    pointer-events: none; z-index: 1;
  }
  .hero-logo-wrap {
    position: relative;
    display: flex; align-items: center; justify-content: center;
    width: 320px; height: 320px;
  }
  .hero-logo-wrap img {
    width: 160px; height: auto;
    animation: logo-float 4s ease-in-out infinite;
    position: relative; z-index: 3;
  }
  @keyframes logo-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-14px); }
  }
  /* Rotating outer ring */
  .hero-ring-outer {
    position: absolute; inset: 0; border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.12);
    animation: ring-spin 18s linear infinite;
  }
  /* Dashed mid ring */
  .hero-ring-mid {
    position: absolute; inset: 24px; border-radius: 50%;
    border: 1px dashed rgba(201,168,76,0.25);
    animation: ring-spin 10s linear infinite reverse;
  }
  /* Inner glow circle */
  .hero-ring-inner {
    position: absolute; inset: 60px; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%);
    border: 1px solid rgba(201,168,76,0.15);
  }
  @keyframes ring-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  /* Orbiting dots */
  .hero-orbit-dot {
    position: absolute; width: 8px; height: 8px;
    border-radius: 50%; background: var(--gold);
    top: 50%; left: 50%;
    transform-origin: 0 0;
    box-shadow: 0 0 8px rgba(201,168,76,0.8);
  }
  .hero-orbit-dot:nth-child(1) { animation: orbit1 8s linear infinite; }
  .hero-orbit-dot:nth-child(2) { animation: orbit2 12s linear infinite; background: rgba(255,255,255,0.5); width:5px; height:5px; }
  .hero-orbit-dot:nth-child(3) { animation: orbit3 6s linear infinite; background: rgba(201,168,76,0.6); width:4px; height:4px; }
  @keyframes orbit1 {
    from { transform: rotate(0deg) translateX(155px) translateY(-4px); }
    to   { transform: rotate(360deg) translateX(155px) translateY(-4px); }
  }
  @keyframes orbit2 {
    from { transform: rotate(120deg) translateX(130px) translateY(-2.5px); }
    to   { transform: rotate(480deg) translateX(130px) translateY(-2.5px); }
  }
  @keyframes orbit3 {
    from { transform: rotate(240deg) translateX(108px) translateY(-2px); }
    to   { transform: rotate(600deg) translateX(108px) translateY(-2px); }
  }
  /* Particle sparks */
  .hero-spark {
    position: absolute; border-radius: 50%;
    background: rgba(201,168,76,0.6);
    animation: spark-float linear infinite;
  }
  @keyframes spark-float {
    0%   { transform: translateY(0) scale(1); opacity: 0.7; }
    100% { transform: translateY(-80px) scale(0); opacity: 0; }
  }

  /* ── SECTION COMMON ── */
  section { padding: 6rem 4rem; }
  .section-tag {
    display: inline-block;
    background: var(--green-pale); color: var(--green-dark);
    padding: 0.35rem 1rem; border-radius: 50px;
    font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem;
  }
  .section-title { font-size: clamp(1.8rem, 3vw, 2.5rem); font-weight: 800; color: var(--text-dark); margin-bottom: 1rem; }
  .section-desc { font-size: 1.05rem; color: var(--text-light); max-width: 600px; line-height: 1.9; }

  /* ── WHO WE ARE ── */
  #about { background: var(--off-white); }
  .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
  .about-visual {
    display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
  }
  .about-card {
    background: white; border-radius: 20px; padding: 1.5rem;
    border: 1px solid var(--border);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  .about-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(26,92,58,0.1); }
  .about-card:nth-child(2) { margin-top: 2rem; }
  .about-card:nth-child(4) { margin-top: -2rem; }
  .about-card-icon {
    width: 48px; height: 48px; border-radius: 12px;
    background: var(--green-pale); color: var(--green-dark);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem; margin-bottom: 0.75rem;
  }
  .about-card h4 { font-size: 1rem; font-weight: 700; color: var(--text-dark); margin-bottom: 0.4rem; }
  .about-card p { font-size: 0.85rem; color: var(--text-light); line-height: 1.7; }
  .values-list { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 2rem; }
  .value-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem 1rem; background: white; border-radius: 12px;
    border: 1px solid var(--border);
  }
  .value-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green-mid); flex-shrink: 0; }
  .value-item span { font-size: 0.95rem; font-weight: 500; color: var(--text-mid); }

  /* ── SERVICES ── */
  #services { background: white; }
  .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 3rem; }
  .service-card {
    background: var(--off-white); border-radius: 24px; padding: 2rem;
    border: 1px solid var(--border); position: relative; overflow: hidden;
    transition: all 0.3s;
  }
  .service-card::before {
    content: ''; position: absolute; top: 0; right: 0;
    width: 100px; height: 100px; border-radius: 0 24px 0 100%;
    background: var(--green-pale); opacity: 0.5;
    transition: all 0.3s;
  }
  .service-card:hover { transform: translateY(-6px); box-shadow: 0 16px 50px rgba(26,92,58,0.12); }
  .service-card:hover::before { opacity: 1; }
  .service-icon {
    width: 56px; height: 56px; border-radius: 16px;
    background: var(--green-dark); color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; margin-bottom: 1.25rem; position: relative; z-index: 1;
  }
  .service-card h3 { font-size: 1.15rem; font-weight: 700; color: var(--text-dark); margin-bottom: 0.75rem; position: relative; z-index: 1; }
  .service-card p { font-size: 0.9rem; color: var(--text-light); line-height: 1.8; position: relative; z-index: 1; }
  .service-list { list-style: none; margin-top: 1rem; display: flex; flex-direction: column; gap: 0.4rem; position: relative; z-index: 1; }
  .service-list li { font-size: 0.85rem; color: var(--text-mid); display: flex; align-items: flex-start; gap: 0.4rem; }
  .service-list li::before { content: '✓'; color: var(--green-light); font-weight: 700; flex-shrink: 0; }

  /* ── HOW WE WORK ── */
  #how { background: var(--green-dark); }
  #how .section-title { color: white; }
  #how .section-desc { color: rgba(255,255,255,0.65); }
  #how .section-tag { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }
  .steps-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin-top: 3rem; position: relative; }
  .steps-grid::before {
    content: ''; position: absolute;
    top: 2.5rem; right: 10%; left: 10%;
    height: 2px; background: rgba(255,255,255,0.1);
    z-index: 0;
  }
  .step-item { text-align: center; position: relative; z-index: 1; }
  .step-num {
    width: 56px; height: 56px; border-radius: 50%;
    background: rgba(255,255,255,0.08); border: 2px solid rgba(255,255,255,0.15);
    color: white; font-size: 1.3rem; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem;
    transition: all 0.3s;
  }
  .step-item:hover .step-num { background: var(--gold); border-color: var(--gold); color: var(--green-dark); }
  .step-item h4 { font-size: 0.95rem; font-weight: 600; color: white; margin-bottom: 0.4rem; }
  .step-item p { font-size: 0.8rem; color: rgba(255,255,255,0.5); line-height: 1.7; }

  /* ── WHY SAAID ── */
  #why { background: var(--off-white); }
  .why-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; margin-top: 3rem; }
  .why-item {
    display: flex; gap: 1rem; padding: 1.5rem;
    background: white; border-radius: 20px; border: 1px solid var(--border);
    transition: all 0.3s;
  }
  .why-item:hover { box-shadow: 0 8px 30px rgba(26,92,58,0.08); transform: translateX(-4px); }
  .why-item-icon {
    width: 52px; height: 52px; flex-shrink: 0;
    border-radius: 14px; background: var(--green-pale);
    color: var(--green-dark); display: flex; align-items: center;
    justify-content: center; font-size: 1.4rem;
  }
  .why-item h4 { font-size: 1rem; font-weight: 700; color: var(--text-dark); margin-bottom: 0.4rem; }
  .why-item p { font-size: 0.875rem; color: var(--text-light); line-height: 1.8; }

  /* ── IMPACT ── */
  #impact { background: white; }
  .impact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 3rem; }
  .impact-card {
    text-align: center; padding: 2.5rem 1.5rem;
    border-radius: 24px; border: 1px solid var(--border);
    background: var(--off-white);
    transition: all 0.3s;
  }
  .impact-card:hover { background: var(--green-dark); }
  .impact-card:hover .impact-num { color: var(--gold); }
  .impact-card:hover .impact-label { color: rgba(255,255,255,0.65); }
  .impact-card:hover .impact-icon { background: rgba(255,255,255,0.1); color: white; }
  .impact-icon {
    width: 60px; height: 60px; border-radius: 50%;
    background: var(--green-pale); color: var(--green-dark);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; margin: 0 auto 1rem;
    transition: all 0.3s;
  }
  .impact-num { font-size: 1.1rem; font-weight: 700; color: var(--text-dark); margin-bottom: 0.5rem; transition: all 0.3s; }
  .impact-label { font-size: 0.85rem; color: var(--text-light); line-height: 1.6; transition: all 0.3s; }

  /* ── TARGET ── */
  #target { background: var(--off-white); }
  .target-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-top: 3rem; }
  .target-card {
    display: flex; align-items: center; gap: 1rem;
    padding: 1.25rem 1.5rem; background: white;
    border-radius: 16px; border: 2px solid var(--border);
    transition: all 0.3s;
  }
  .target-card:hover { border-color: var(--green-mid); background: var(--green-pale); }
  .target-card-icon { font-size: 1.75rem; flex-shrink: 0; }
  .target-card h4 { font-size: 1rem; font-weight: 600; color: var(--text-dark); }

  /* ── CTA ── */
  #cta {
    background: linear-gradient(135deg, #0d3322, #1a5c3a);
    text-align: center; position: relative; overflow: hidden;
  }
  #cta::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 30% 50%, rgba(201,168,76,0.08) 0%, transparent 60%),
                radial-gradient(circle at 70% 50%, rgba(74,158,112,0.1) 0%, transparent 60%);
  }
  #cta .section-tag { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }
  #cta .section-title { color: white; }
  #cta .section-desc { color: rgba(255,255,255,0.65); margin: 0 auto 2.5rem; }
  .cta-content { position: relative; z-index: 1; }

  /* ── FOOTER ── */
  footer {
    background: #0a2518; color: rgba(255,255,255,0.5);
    padding: 3rem 4rem 2rem;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 3rem; margin-bottom: 2rem; }
  .footer-brand h3 { color: white; font-size: 1.3rem; font-weight: 800; margin-bottom: 0.75rem; }
  .footer-brand p { font-size: 0.85rem; line-height: 1.8; }
  .footer-col h4 { color: white; font-size: 0.95rem; font-weight: 600; margin-bottom: 1rem; }
  .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
  .footer-col ul li a { color: rgba(255,255,255,0.5); text-decoration: none; font-size: 0.875rem; transition: color 0.2s; }
  .footer-col ul li a:hover { color: var(--gold); }
  .footer-bottom {
    padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.05);
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.8rem;
  }
  .footer-bottom a { color: var(--gold); text-decoration: none; }

  /* ── MOBILE ── */
  @media (max-width: 768px) {
    .ai-platform-content { grid-template-columns: 1fr; }
    .ai-platform-visual { display: none; }
    .ai-platform-card { padding: 2rem 1.5rem; }
    nav { padding: 1rem 1.5rem; }
    .nav-links { display: none; }
    section { padding: 4rem 1.5rem; }
    .hero { padding: 6rem 1.5rem 3rem; }
    .hero-visual { display: none; }
    .hero-stats { gap: 1.5rem; }
    .about-grid, .why-grid { grid-template-columns: 1fr; }
    .steps-grid { grid-template-columns: 1fr 1fr; }
    .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
    .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
  }

  /* ── ANIMATIONS ── */
  .fade-up {
    opacity: 0; transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .fade-up.visible { opacity: 1; transform: translateY(0); }

  /* ── AI PLATFORM ── */
  .ai-platform-card {
    margin-top: 3rem; border-radius: 28px;
    background: linear-gradient(135deg, #0d3322 0%, #1a5c3a 60%, #2d7a52 100%);
    padding: 3rem; position: relative; overflow: hidden;
  }
  .ai-platform-card::before {
    content: ''; position: absolute; top: -4rem; left: -4rem;
    width: 20rem; height: 20rem; border-radius: 50%;
    background: rgba(201,168,76,0.06); pointer-events: none;
  }
  .ai-platform-card::after {
    content: ''; position: absolute; bottom: -4rem; right: -4rem;
    width: 24rem; height: 24rem; border-radius: 50%;
    background: rgba(255,255,255,0.03); pointer-events: none;
  }
  .ai-platform-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.3);
    color: var(--gold); padding: 0.4rem 1.1rem; border-radius: 50px;
    font-size: 0.85rem; font-weight: 600; margin-bottom: 2rem; position: relative; z-index: 1;
  }
  .ai-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); display: inline-block; animation: pulse 2s infinite; }
  .ai-platform-content { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; position: relative; z-index: 1; }
  .ai-platform-text h3 { font-size: 2rem; font-weight: 800; color: white; line-height: 1.25; margin-bottom: 1rem; }
  .ai-platform-text h3 span { color: var(--gold); }
  .ai-platform-text p { font-size: 0.95rem; color: rgba(255,255,255,0.65); line-height: 1.9; margin-bottom: 1.75rem; }
  .ai-features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 2rem; }
  .ai-feat { display: flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 0.55rem 0.8rem; transition: all 0.25s; }
  .ai-feat:hover { background: rgba(255,255,255,0.1); border-color: rgba(201,168,76,0.35); }
  .ai-feat-icon { font-size: 1rem; flex-shrink: 0; }
  .ai-feat span:last-child { font-size: 0.82rem; color: rgba(255,255,255,0.8); font-weight: 500; }
  .ai-platform-btn { display: inline-flex; align-items: center; gap: 0.6rem; background: #25d366; color: white; padding: 0.85rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 0.95rem; transition: all 0.3s; }
  .ai-platform-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(37,211,102,0.45); }
  .ai-dashboard-mock { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 18px; overflow: hidden; }
  .mock-topbar { background: rgba(0,0,0,0.2); padding: 0.65rem 1rem; display: flex; align-items: center; gap: 0.75rem; }
  .mock-dots { display: flex; gap: 5px; }
  .mock-dots span { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.2); }
  .mock-dots span:nth-child(1) { background: rgba(255,95,87,0.7); }
  .mock-dots span:nth-child(2) { background: rgba(255,189,68,0.7); }
  .mock-dots span:nth-child(3) { background: rgba(40,200,64,0.7); }
  .mock-title { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
  .mock-stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; padding: 0.75rem; }
  .mock-stat { background: rgba(255,255,255,0.05); border-radius: 10px; padding: 0.6rem; text-align: center; }
  .mock-stat-gold { background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.2); }
  .mock-stat-num { font-size: 0.95rem; font-weight: 700; color: white; }
  .mock-stat-gold .mock-stat-num { color: var(--gold); }
  .mock-stat-lbl { font-size: 0.6rem; color: rgba(255,255,255,0.4); margin-top: 2px; }
  .mock-content-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; padding: 0 0.75rem; }
  .mock-content-block, .mock-tasks-block { background: rgba(255,255,255,0.04); border-radius: 10px; padding: 0.7rem; }
  .mock-content-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.5rem; }
  .mock-badge { font-size: 0.6rem; background: rgba(201,168,76,0.2); color: var(--gold); padding: 2px 6px; border-radius: 6px; }
  .mock-content-title { font-size: 0.7rem; color: rgba(255,255,255,0.7); font-weight: 600; }
  .mock-content-lines { display: flex; flex-direction: column; gap: 4px; margin-bottom: 0.5rem; }
  .mock-line { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.1); }
  .mock-line-lg { width: 100%; } .mock-line-md { width: 75%; } .mock-line-sm { width: 50%; }
  .mock-gen-btn { font-size: 0.65rem; background: rgba(201,168,76,0.2); color: var(--gold); border-radius: 6px; padding: 3px 8px; text-align: center; }
  .mock-task { font-size: 0.65rem; padding: 3px 0; color: rgba(255,255,255,0.5); }
  .mock-task-done { color: rgba(74,200,120,0.8); }
  .mock-task-active { color: rgba(255,200,60,0.8); }
  .mock-task-pending { color: rgba(255,255,255,0.35); }
  .mock-bar-chart { display: flex; align-items: flex-end; gap: 4px; padding: 0.75rem; height: 70px; }
  .mock-bar { flex: 1; border-radius: 4px 4px 0 0; background: rgba(255,255,255,0.1); }
  .mock-bar-active { background: rgba(201,168,76,0.5); }


  /* ── BIG NUMBERS STRIP ── */
  .numbers-strip {
    display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
    align-items: center; gap: 0;
    background: linear-gradient(135deg, #0d3322, #1a5c3a);
    border-radius: 24px; padding: 3rem 2.5rem;
    margin-bottom: 0; overflow: hidden; position: relative;
  }
  .numbers-strip::before {
    content: ''; position: absolute; inset: 0; border-radius: 24px;
    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23ffffff' fill-opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
  }
  .big-num-item { text-align: center; padding: 0 1.5rem; position: relative; z-index: 1; }
  .big-num-value {
    font-size: clamp(2.8rem, 5vw, 4.5rem);
    font-weight: 900; color: var(--gold);
    line-height: 1; display: inline-block;
    font-variant-numeric: tabular-nums;
  }
  .big-num-plus {
    display: inline-block; font-size: clamp(1.8rem, 3vw, 2.8rem);
    font-weight: 900; color: var(--gold); vertical-align: super;
    line-height: 1;
  }
  .big-num-unit {
    display: block; font-size: 0.85rem; font-weight: 600;
    color: rgba(255,255,255,0.5); margin-top: 0.15rem;
    letter-spacing: 0.5px;
  }
  .big-num-label {
    font-size: 0.82rem; color: rgba(255,255,255,0.55);
    margin-top: 0.6rem; line-height: 1.6;
  }
  .big-num-divider {
    width: 1px; height: 70px;
    background: rgba(255,255,255,0.1);
  }
  @media (max-width: 768px) {
    .numbers-strip {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      gap: 2rem;
      padding: 2rem 1.5rem;
    }
    .big-num-divider { display: none; }
    .big-num-value { font-size: 2.2rem; }
  }


  /* ── LOGIN BUTTONS ── */
  .nav-login-btn {
    display: inline-flex; align-items: center;
    padding: 0.5rem 1.1rem;
    background: var(--green-dark);
    color: white !important;
    border-radius: 8px;
    font-size: 0.88rem; font-weight: 700;
    text-decoration: none;
    transition: all 0.2s;
    margin-right: 0.5rem;
    letter-spacing: 0.01em;
  }
  .nav-login-btn:hover {
    background: var(--green-mid);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(26,92,58,0.25);
  }

  .btn-login {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.85rem 1.6rem;
    background: white;
    color: var(--green-dark) !important;
    border: 2px solid var(--green-dark);
    border-radius: 50px;
    font-size: 1rem; font-weight: 700;
    text-decoration: none;
    transition: all 0.25s;
  }
  .btn-login:hover {
    background: var(--green-dark);
    color: white !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26,92,58,0.3);
  }


  #wa-float {
    position: fixed; bottom: 2rem; left: 2rem;
    width: 60px; height: 60px; border-radius: 50%;
    background: #25d366;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(37,211,102,0.5);
    z-index: 999; text-decoration: none;
    transition: transform 0.3s, box-shadow 0.3s;
    animation: wa-bounce 3s ease-in-out infinite;
  }
  #wa-float:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(37,211,102,0.65); animation: none; }
  @keyframes wa-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
`;
const BODY = `<!-- NAV -->
<nav>
  <a href="#" class="nav-logo">
    <img src="data:image/png;base64,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" alt="ساعِد SAAID" style="height:52px; width:auto;">
  </a>
  <ul class="nav-links">
    <li><a href="#about">من نحن</a></li>
    <li><a href="#services">خدماتنا</a></li>
    <li><a href="#how">كيف نعمل</a></li>
    <li><a href="#why">لماذا ساعِد</a></li>
    <li><a href="#impact">أثرنا</a></li>
  </ul>
  <a href="#cta" class="nav-cta">تواصل معنا</a>
  <a href="dashboard.html" class="nav-login-btn">دخول المنصة ←</a>
</nav>

<!-- HERO -->
<section class="hero" id="hero">
  <div class="hero-circle-1"></div>
  <div class="hero-circle-2"></div>

  <div class="hero-content fade-up">
    <div class="hero-badge">
      <span></span>
      المبادرة الإعلامية الأولى للجمعيات الخيرية
    </div>
    <h1>
      <span class="accent">ساعِد</span> —
      <br>اليد التي تمتد
      <br>لتصنع أثرًا
    </h1>
    <p class="hero-sub">المساعدة – الأثر قبل الأرقام</p>
    <p class="hero-desc">
      مبادرة إعلامية وتسويقية متخصصة في دعم الجمعيات الخيرية السعودية،
      عبر تمكينها من الظهور الإعلامي المؤثر واالحترافي وتحويل رسالتها
      الإنسانية إلى قصص تصل للناس وتحرّكهم نحو التبرع والمشاركة.
    </p>
    <div class="hero-btns">
      <a href="#cta" class="btn-primary">ابدأ الشراكة معنا ←</a>
      <a href="dashboard.html" class="btn-login">🔐 دخول المنصة</a>
      <a href="#services" class="btn-secondary">اكتشف خدماتنا</a>
      <a href="https://drive.google.com/file/d/1Woa17q3C2o4_HGd3zdTAVoVzp2NjjeNh/view?usp=drive_link" target="_blank" class="btn-secondary">📄 الملف التعريفي</a>
    </div>
    <div class="hero-stats">
      <div class="stat-item">
        <div class="stat-num">10</div>
        <div class="stat-label">جمعية تحت الإدارة</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">+2M</div>
        <div class="stat-label">ريال تمويلات محققة</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">10K</div>
        <div class="stat-label">ريال تبرعات مجمّعة</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">5</div>
        <div class="stat-label">خدمات متكاملة</div>
      </div>
    </div>
  </div>

  <div class="hero-visual">
    <div class="hero-logo-wrap">
      <div class="hero-ring-outer"></div>
      <div class="hero-ring-mid"></div>
      <div class="hero-ring-inner"></div>
      <div class="hero-orbit-dot"></div>
      <div class="hero-orbit-dot"></div>
      <div class="hero-orbit-dot"></div>
      <img src="data:image/png;base64,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" alt="ساعِد SAAID">
      <!-- Sparks -->
      <div class="hero-spark" style="width:4px;height:4px;left:30%;top:70%;animation-duration:3s;animation-delay:0s;"></div>
      <div class="hero-spark" style="width:3px;height:3px;left:60%;top:75%;animation-duration:4s;animation-delay:1s;"></div>
      <div class="hero-spark" style="width:5px;height:5px;left:50%;top:80%;animation-duration:2.5s;animation-delay:0.5s;"></div>
      <div class="hero-spark" style="width:3px;height:3px;left:40%;top:65%;animation-duration:3.5s;animation-delay:1.5s;"></div>
    </div>
  </div>
</section>

<!-- ABOUT -->
<section id="about">
  <div class="about-grid">
    <div class="fade-up">
      <span class="section-tag">من نحن</span>
      <h2 class="section-title">نؤمن أن الخير<br>يستحق أن يُرى</h2>
      <p class="section-desc">
        نؤمن أن العمل الخيري لا يحتاج فقط إلى نية صادقة، بل إلى صوت قوي،
        وصورة واضحة، ورسالة تصل في الوقت الصحيح وبالطريقة الصحيحة.
      </p>
      <div class="values-list">
        <div class="value-item"><div class="value-dot"></div><span>الأثر قبل الأرقام</span></div>
        <div class="value-item"><div class="value-dot"></div><span>الشفافية والمصداقية</span></div>
        <div class="value-item"><div class="value-dot"></div><span>الشراكة لا التنفيذ فقط</span></div>
        <div class="value-item"><div class="value-dot"></div><span>الاحترافية في خدمة العمل الخيري</span></div>
        <div class="value-item"><div class="value-dot"></div><span>الإنسان أولًا</span></div>
      </div>
    </div>
    <div class="about-visual fade-up">
      <div class="about-card">
        <div class="about-card-icon">🎯</div>
        <h4>رؤيتنا</h4>
        <p>أن نكون الشريك الإعلامي الأول للجمعيات الخيرية في المملكة العربية السعودية</p>
      </div>
      <div class="about-card">
        <div class="about-card-icon">📢</div>
        <h4>رسالتنا</h4>
        <p>تمكين الجمعيات الخيرية من إيصال رسالتها الإنسانية لأكبر شريحة ممكنة</p>
      </div>
      <div class="about-card">
        <div class="about-card-icon">🤝</div>
        <h4>شريك حقيقي</h4>
        <p>لا نعمل من خلف الشاشات فقط، بل نمد أيدينا معكم لصناعة أثر حقيقي</p>
      </div>
      <div class="about-card">
        <div class="about-card-icon">⭐</div>
        <h4>تجربة مثبتة</h4>
        <p>عملنا مع جمعيات تكاتف وإحسان وسند وغيرها من الجمعيات الرائدة</p>
      </div>
    </div>
  </div>
</section>

<!-- SERVICES -->
<section id="services">
  <div class="fade-up" style="text-align:center; max-width:700px; margin: 0 auto 3rem;">
    <span class="section-tag">خدماتنا</span>
    <h2 class="section-title">ماذا نقدم؟</h2>
    <p class="section-desc" style="margin: 0 auto;">
      خمس خدمات متكاملة تغطي كل احتياجات الجمعية الخيرية الإعلامية
    </p>
  </div>
  <div class="services-grid">
    <div class="service-card fade-up">
      <div class="service-icon">📱</div>
      <h3>الظهور الإعلامي وبناء الهوية</h3>
      <p>نبني هويتك الإعلامية بالكامل ونديرها باحترافية</p>
      <ul class="service-list">
        <li>إدارة الحسابات على منصات التواصل الاجتماعي</li>
        <li>بناء الهوية الإعلامية واللغة البصرية</li>
        <li>توحيد الرسائل والمحتوى مع أهداف الجمعية</li>
      </ul>
    </div>
    <div class="service-card fade-up">
      <div class="service-icon">🎬</div>
      <h3>صناعة المحتوى المؤثر</h3>
      <p>محتوى يحرّك القلوب ويدفع نحو التبرع والمشاركة</p>
      <ul class="service-list">
        <li>محتوى قصصي إنساني Storytelling</li>
        <li>فيديوهات توعوية وتعريفية بالمشاريع</li>
        <li>تغطيات ميدانية للمبادرات والأنشطة</li>
        <li>محتوى تفاعلي يزيد من الانتشار</li>
      </ul>
    </div>
    <div class="service-card fade-up">
      <div class="service-icon">📊</div>
      <h3>تصميم التقارير والملفات التعريفية</h3>
      <p>نحوّل بياناتك إلى محتوى بصري واضح ومؤثر</p>
      <ul class="service-list">
        <li>تصميم الملف التعريفي الرسمي</li>
        <li>إعداد تقارير المشاريع</li>
        <li>تحويل التقارير إلى موشن جرافيك</li>
      </ul>
    </div>
    <div class="service-card fade-up">
      <div class="service-icon">🚀</div>
      <h3>الحملات الإعلامية وجمع التبرعات</h3>
      <p>حملات رقمية مدروسة ترفع معدلات التبرع</p>
      <ul class="service-list">
        <li>حملات موسمية: رمضان، الحج، الأعياد</li>
        <li>صفحات هبوط مخصصة للحملات</li>
        <li>تحسين الرسائل التحفيزية للتبرع</li>
      </ul>
    </div>
    <div class="service-card fade-up">
      <div class="service-icon">🌟</div>
      <h3>إدارة المؤثرين والشراكات</h3>
      <p>نربطك بالمؤثرين المناسبين لرسالتك</p>
      <ul class="service-list">
        <li>ربط الجمعيات بالمؤثرين المناسبين</li>
        <li>إدارة حملات المؤثرين باحترافية</li>
        <li>توثيق الشراكات الإعلامية</li>
      </ul>
    </div>
    <div class="service-card fade-up">
      <div class="service-icon">📰</div>
      <h3>التغطية الإعلامية والمناسبات</h3>
      <p>نبرز إنجازات جمعيتك في كل مناسبة</p>
      <ul class="service-list">
        <li>تغطية الفعاليات والملتقيات الخيرية</li>
        <li>إدارة الحضور الإعلامي للمناسبات</li>
        <li>إبراز إنجازات الجمعية إعلاميًا</li>
      </ul>
    </div>
  </div>

  <!-- AI PLATFORM CARD -->
  <div class="ai-platform-card fade-up">
    <div class="ai-platform-badge"><span class="ai-dot"></span>مدعوم بالذكاء الاصطناعي — حصريًا لعملاء ساعِد</div>
    <div class="ai-platform-content">
      <div class="ai-platform-text">
        <h3>منصة ساعِد الذكية<br><span>لإدارة التسويق الخيري</span></h3>
        <p>منصة متكاملة تجمع كل أدوات إدارة محتواك الخيري في مكان واحد — من توليد المحتوى والصور والفيديوهات بالذكاء الاصطناعي، إلى تتبع المهام والداشبورد التحليلي الكامل.</p>
        <div class="ai-features-grid">
          <div class="ai-feat"><span class="ai-feat-icon">🤖</span><span>توليد محتوى بالذكاء الاصطناعي</span></div>
          <div class="ai-feat"><span class="ai-feat-icon">🖼️</span><span>توليد صور احترافية</span></div>
          <div class="ai-feat"><span class="ai-feat-icon">🎬</span><span>إنتاج فيديوهات تلقائية</span></div>
          <div class="ai-feat"><span class="ai-feat-icon">✅</span><span>إدارة المهام والتاسكات</span></div>
          <div class="ai-feat"><span class="ai-feat-icon">📈</span><span>داشبورد تتبع وتحليل</span></div>
          <div class="ai-feat"><span class="ai-feat-icon">📅</span><span>جدولة ونشر تلقائي</span></div>
          <div class="ai-feat"><span class="ai-feat-icon">🔔</span><span>تتبع الأداء لحظة بلحظة</span></div>
          <div class="ai-feat"><span class="ai-feat-icon">🤝</span><span>تعاون الفريق بالكامل</span></div>
        </div>
        <a href="https://wa.me/201019268509" target="_blank" class="ai-platform-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          احصل على وصول مبكر
        </a>
      </div>
      <div class="ai-platform-visual">
        <div class="ai-dashboard-mock">
          <div class="mock-topbar">
            <div class="mock-dots"><span></span><span></span><span></span></div>
            <div class="mock-title">منصة ساعِد — لوحة التحكم</div>
          </div>
          <div class="mock-stats-row">
            <div class="mock-stat"><div class="mock-stat-num">١٢٤</div><div class="mock-stat-lbl">منشور هذا الشهر</div></div>
            <div class="mock-stat mock-stat-gold"><div class="mock-stat-num">٣٨ ألف</div><div class="mock-stat-lbl">وصول إجمالي</div></div>
            <div class="mock-stat"><div class="mock-stat-num">٨٩٪</div><div class="mock-stat-lbl">نسبة الإنجاز</div></div>
          </div>
          <div class="mock-content-row">
            <div class="mock-content-block">
              <div class="mock-content-header"><span class="mock-badge">🤖 AI</span><span class="mock-content-title">توليد محتوى</span></div>
              <div class="mock-content-lines">
                <div class="mock-line mock-line-lg"></div>
                <div class="mock-line mock-line-md"></div>
                <div class="mock-line mock-line-sm"></div>
              </div>
              <div class="mock-gen-btn">توليد الآن ✨</div>
            </div>
            <div class="mock-tasks-block">
              <div class="mock-content-header"><span class="mock-content-title">المهام النشطة</span></div>
              <div class="mock-task mock-task-done">✓ تصميم بوست رمضان</div>
              <div class="mock-task mock-task-done">✓ فيديو حملة التبرع</div>
              <div class="mock-task mock-task-active">⟳ تقرير الأداء الأسبوعي</div>
              <div class="mock-task mock-task-pending">◯ محتوى يوم الوطني</div>
            </div>
          </div>
          <div class="mock-bar-chart">
            <div class="mock-bar" style="height:55%"></div>
            <div class="mock-bar" style="height:70%"></div>
            <div class="mock-bar" style="height:45%"></div>
            <div class="mock-bar mock-bar-active" style="height:90%"></div>
            <div class="mock-bar" style="height:65%"></div>
            <div class="mock-bar" style="height:80%"></div>
            <div class="mock-bar" style="height:50%"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

</section>

<!-- HOW WE WORK -->
<section id="how">
  <div class="fade-up" style="text-align:center; max-width:700px; margin: 0 auto 1rem;">
    <span class="section-tag">منهجيتنا</span>
    <h2 class="section-title">كيف نعمل؟</h2>
    <p class="section-desc" style="margin: 0 auto; color: rgba(255,255,255,0.65);">
      خمس خطوات منهجية نضمن بها أقصى أثر ممكن لكل جمعية نعمل معها
    </p>
  </div>
  <div class="steps-grid fade-up">
    <div class="step-item">
      <div class="step-num">١</div>
      <h4>فهم الرسالة والأهداف</h4>
      <p>نبدأ بالاستماع العميق لفهم رسالتكم وطموحاتكم</p>
    </div>
    <div class="step-item">
      <div class="step-num">٢</div>
      <h4>تحليل الوضع الإعلامي</h4>
      <p>نقيّم الوضع الحالي ونحدد الفجوات والفرص</p>
    </div>
    <div class="step-item">
      <div class="step-num">٣</div>
      <h4>بناء الاستراتيجية</h4>
      <p>نصمم خطة إعلامية مخصصة لأهداف جمعيتكم</p>
    </div>
    <div class="step-item">
      <div class="step-num">٤</div>
      <h4>تنفيذ المحتوى والحملات</h4>
      <p>ننفذ بدقة واحترافية كل عناصر الخطة الموضوعة</p>
    </div>
    <div class="step-item">
      <div class="step-num">٥</div>
      <h4>قياس الأثر والتطوير</h4>
      <p>نقيس النتائج ونطور باستمرار لتعظيم الأثر</p>
    </div>
  </div>
</section>

<!-- WHY SAAID -->
<section id="why">
  <div class="fade-up">
    <span class="section-tag">تميّزنا</span>
    <h2 class="section-title">لماذا ساعِد؟</h2>
    <p class="section-desc">ما يميّزنا عن غيرنا من الوكالات والمقدمين</p>
  </div>
  <div class="why-grid fade-up">
    <div class="why-item">
      <div class="why-item-icon">🏛️</div>
      <div>
        <h4>فهم عميق للقطاع الخيري السعودي</h4>
        <p>خبرة متخصصة في القطاع غير الربحي وفهم عميق لاحتياجاته وخصوصيته</p>
      </div>
    </div>
    <div class="why-item">
      <div class="why-item-icon">💡</div>
      <div>
        <h4>خبرة في الإعلام الرقمي وصناعة التأثير</h4>
        <p>فريق متخصص في المحتوى الرقمي والحملات التي تصنع فارقًا حقيقيًا</p>
      </div>
    </div>
    <div class="why-item">
      <div class="why-item-icon">❤️</div>
      <div>
        <h4>محتوى إنساني يحترم الرسالة ولا يبتذلها</h4>
        <p>نروي القصص بطريقة تحترم كرامة المستفيدين وتعكس نبل رسالتكم</p>
      </div>
    </div>
    <div class="why-item">
      <div class="why-item-icon">📈</div>
      <div>
        <h4>تركيز على النتائج والأثر الحقيقي</h4>
        <p>لا نكتفي بالجمال البصري، بل نقيس الأثر الحقيقي على التبرعات والوعي</p>
      </div>
    </div>
    <div class="why-item">
      <div class="why-item-icon">🤝</div>
      <div>
        <h4>شريك طويل المدى وليس مزود خدمة مؤقت</h4>
        <p>نبني علاقات شراكة حقيقية وطويلة الأمد، لا مجرد تعاقدات موسمية</p>
      </div>
    </div>
    <div class="why-item">
      <div class="why-item-icon">🏆</div>
      <div>
        <h4>تجربة مثبتة مع جمعيات رائدة</h4>
        <p>سجل حافل مع جمعيات تكاتف وإحسان وسند وغيرها من الجمعيات المرموقة</p>
      </div>
    </div>
  </div>
</section>

<!-- IMPACT -->
<section id="impact">
  <!-- BIG NUMBERS STRIP -->
  <div class="numbers-strip fade-up">
    <div class="big-num-item">
      <div class="big-num-value" data-target="10">0</div>
      <div class="big-num-plus">+</div>
      <div class="big-num-label">جمعية تحت إدارتنا<br>في المملكة العربية السعودية</div>
    </div>
    <div class="big-num-divider"></div>
    <div class="big-num-item">
      <div class="big-num-value" data-target="2" data-prefix="+">0</div>
      <div class="big-num-unit">مليون ريال</div>
      <div class="big-num-label">تمويلات محققة<br>لجمعياتنا الشريكة</div>
    </div>
    <div class="big-num-divider"></div>
    <div class="big-num-item">
      <div class="big-num-value" data-target="10000" data-comma="true">0</div>
      <div class="big-num-unit">ريال</div>
      <div class="big-num-label">تبرعات مجمّعة<br>عبر حملاتنا الرقمية</div>
    </div>
    <div class="big-num-divider"></div>
    <div class="big-num-item">
      <div class="big-num-value" data-target="6">0</div>
      <div class="big-num-plus">+</div>
      <div class="big-num-label">خدمات إعلامية متكاملة<br>تحت سقف واحد</div>
    </div>
  </div>

  <div class="fade-up" style="text-align:center; max-width:700px; margin: 3rem auto 1rem;">
    <span class="section-tag">الأثر الذي نصنعه</span>
    <h2 class="section-title">ماذا يعني العمل معنا؟</h2>
    <p class="section-desc" style="margin: 0 auto;">نتائج ملموسة تنعكس على رسالة جمعيتكم ومجتمعكم</p>
  </div>
  <div class="impact-grid fade-up">
    <div class="impact-card">
      <div class="impact-icon">🏛️</div>
      <div class="impact-num">10 جمعيات</div>
      <div class="impact-label">تحت الإدارة الإعلامية الكاملة في المملكة</div>
    </div>
    <div class="impact-card">
      <div class="impact-icon">💵</div>
      <div class="impact-num">+2,000,000 ريال</div>
      <div class="impact-label">تمويلات محققة لجمعياتنا الشريكة</div>
    </div>
    <div class="impact-card">
      <div class="impact-icon">❤️</div>
      <div class="impact-num">10,000 ريال</div>
      <div class="impact-label">تبرعات مجمّعة عبر حملاتنا الرقمية</div>
    </div>
    <div class="impact-card">
      <div class="impact-icon">📡</div>
      <div class="impact-num">وصول أوسع</div>
      <div class="impact-label">لرسالة الجمعية لأكبر شريحة ممكنة من المجتمع</div>
    </div>
    <div class="impact-card">
      <div class="impact-icon">🔄</div>
      <div class="impact-num">متابع ← داعم</div>
      <div class="impact-label">تحويل المتابع إلى داعم وشريك فاعل</div>
    </div>
  </div>
</section>

<!-- TARGET -->
<section id="target">
  <div class="fade-up" style="text-align:center; max-width:700px; margin: 0 auto 1rem;">
    <span class="section-tag">الفئة المستهدفة</span>
    <h2 class="section-title">لمن نقدم خدماتنا؟</h2>
    <p class="section-desc" style="margin: 0 auto;">نختص في العمل مع جهات العمل الخيري والإنساني</p>
  </div>
  <div class="target-grid fade-up">
    <div class="target-card">
      <div class="target-card-icon">🕌</div>
      <h4>الجمعيات الخيرية</h4>
    </div>
    <div class="target-card">
      <div class="target-card-icon">🏛️</div>
      <h4>المؤسسات غير الربحية</h4>
    </div>
    <div class="target-card">
      <div class="target-card-icon">🌱</div>
      <h4>المبادرات المجتمعية</h4>
    </div>
    <div class="target-card">
      <div class="target-card-icon">📿</div>
      <h4>الأوقاف والمنظمات الإنسانية</h4>
    </div>
  </div>
</section>

<!-- CTA -->
<section id="cta">
  <div class="cta-content fade-up" style="text-align:center;">
    <span class="section-tag">دعوة للتعاون</span>
    <h2 class="section-title" style="margin-bottom:1rem;">معًا… نُظهر الخير<br>ونُضاعف أثره</h2>
    <p class="section-desc">
      في ساعِد لا نعمل من خلف الشاشات فقط، بل نمد أيدينا معكم لصناعة
      أثر حقيقي يصل للناس ويغيّر حياتهم
    </p>
    <div class="hero-btns" style="justify-content:center; margin-top:2rem;">
      <a href="https://wa.me/201019268509" target="_blank" class="btn-primary" style="background:#25d366; border:none; color:white;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        تواصل عبر واتساب
      </a>
 <a href="https://drive.google.com/file/d/1Woa17q3C2o4_HGd3zdTAVoVzp2NjjeNh/view?usp=drive_link" target="_blank" class="btn-secondary">📄 الملف التعريفي</a>
      <a href="https://www.thebrightstation.com" target="_blank" class="btn-secondary">The Bright Station</a>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-grid">
    <div class="footer-brand">
      <h3>ساعِد — SAAID</h3>
      <p>مبادرة إعلامية وتسويقية متخصصة في دعم الجمعيات الخيرية السعودية. نحوّل رسالتك الإنسانية إلى أثر مجتمعي حقيقي.</p>
      <p style="margin-top:0.75rem;">مبادرة من <a href="https://www.thebrightstation.com" target="_blank" style="color:var(--gold); text-decoration:none;">The Bright Station</a> للإعلان والتسويق</p>
    </div>
    <div class="footer-col">
      <h4>روابط سريعة</h4>
      <ul>
        <li><a href="#about">من نحن</a></li>
        <li><a href="#services">الخدمات</a></li>
        <li><a href="#how">كيف نعمل</a></li>
        <li><a href="#why">لماذا ساعِد</a></li>
        <li><a href="#impact">أثرنا</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>تواصل معنا</h4>
      <ul>
        <li><a href="mailto:info@saaid-platform.com">info@saaid-platform.com</a></li>
        <li><a href="https://www.thebrightstation.com" target="_blank">The Bright Station</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2025 ساعِد — جميع الحقوق محفوظة</span>
    <span>مبادرة من <a href="https://www.thebrightstation.com" target="_blank">The Bright Station</a></span>
  </div>
</footer>

<!-- Floating WhatsApp -->
<a href="https://wa.me/201019268509" target="_blank" id="wa-float" title="تواصل عبر واتساب">
  <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>


`;
const SCRIPT = `
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  nav.style.boxShadow = window.scrollY > 50 ? '0 4px 20px rgba(0,0,0,0.08)' : 'none';
});

// Animate counters when visible
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const comma = el.dataset.comma === 'true';
  const prefix = el.dataset.prefix || '';
  const duration = 1800;
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(ease * target);
    el.textContent = prefix + (comma ? current.toLocaleString('ar-SA') : current);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = prefix + (comma ? target.toLocaleString('ar-SA') : target);
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.big-num-value[data-target]').forEach(el => {
        animateCounter(el);
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.numbers-strip').forEach(el => counterObserver.observe(el));

`;

function Index() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.setAttribute("lang", "ar");
    if (!SCRIPT.trim() || !ref.current) return;
    const s = document.createElement("script");
    s.text = SCRIPT;
    ref.current.appendChild(s);
    return () => { try { ref.current?.removeChild(s); } catch {} };
  }, []);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div ref={ref} dangerouslySetInnerHTML={{ __html: BODY }} />
    </>
  );
}
