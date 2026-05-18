import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import saaidLogo from "../assets/saaid-logo.png";

export const Route = createFileRoute("/gate")({
  head: () => ({ meta: [{ title: "ساعِد — دخول المنصة" }] }),
  component: Gate,
});

const DEV_PASS = "saaid2025dev";

function Gate() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.setAttribute("lang", "ar");
  }, []);

  function tryPass() {
    if (password === DEV_PASS) {
      sessionStorage.setItem("saaid_devAccess", DEV_PASS);
      setLoading(true);
      setTimeout(() => navigate({ to: "/association" }), 600);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setTimeout(() => { setPassword(""); inputRef.current?.focus(); }, 100);
      setTimeout(() => setError(false), 3000);
    }
  }

  return (
    <div className="font-arabic" dir="rtl">
      {/* Background layers */}
      <div className="fixed inset-0" style={{ background: "linear-gradient(135deg,#071a0f 0%,#0d3322 40%,#163d28 70%,#0a2518 100%)" }} />
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(45,122,82,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(45,122,82,.07) 1px,transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{ width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(45,122,82,.12) 0%,transparent 70%)", top: -100, right: -100 }}
      />
      <div
        className="fixed pointer-events-none"
        style={{ width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,168,76,.06) 0%,transparent 70%)", bottom: -50, left: -50 }}
      />

      {/* Gate overlay */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
        <div
          className="animate-slide-up w-full text-center"
          style={{
            maxWidth: 420,
            background: "rgba(255,255,255,.04)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 24,
            padding: "44px 40px",
          }}
        >
          {/* Logo */}
          <img
            src={saaidLogo}
            alt="ساعِد"
            style={{ width: 90, margin: "0 auto 20px", filter: "brightness(0) invert(1)", opacity: 0.95, display: "block" }}
          />

          {/* Badge */}
          <div
            className="inline-flex items-center gap-[7px]"
            style={{
              background: "rgba(201,168,76,.12)",
              border: "1px solid rgba(201,168,76,.25)",
              borderRadius: 20,
              padding: "5px 16px",
              marginBottom: 22,
            }}
          >
            <span
              className="animate-blink"
              style={{ width: 7, height: 7, borderRadius: "50%", background: "#c9a84c", display: "inline-block" }}
            />
            <span style={{ fontSize: ".8rem", fontWeight: 600, color: "#e8c96e", letterSpacing: ".04em" }}>
              قيد الإنشاء
            </span>
          </div>

          {/* Title + subtitle */}
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "rgba(255,255,255,.95)", lineHeight: 1.3, marginBottom: 10 }}>
            المنصة قادمة قريباً
          </div>
          <div style={{ fontSize: ".9rem", color: "rgba(255,255,255,.45)", lineHeight: 1.65, marginBottom: 28 }}>
            نعمل على بناء منصة إدارية متكاملة للجمعيات الخيرية.<br />
            للوصول المبكر أدخل كلمة المرور.
          </div>

          {/* Progress bar */}
          <div
            style={{
              background: "rgba(255,255,255,.07)",
              borderRadius: 20,
              height: 6,
              marginBottom: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 20,
                background: "linear-gradient(90deg,#2d7a52,#4a9e70,#c9a84c)",
                width: "72%",
                transition: "width 0.8s ease 0.3s",
              }}
            />
          </div>
          <div style={{ fontSize: ".74rem", color: "rgba(255,255,255,.3)", textAlign: "left", marginBottom: 26 }}>
            اكتملت نسبة 72% من التطوير
          </div>

          {/* Password input */}
          <input
            ref={inputRef}
            type="password"
            placeholder="كلمة المرور"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryPass()}
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: 10,
              background: "rgba(255,255,255,.07)",
              border: `1.5px solid ${shake ? "rgba(220,38,38,.6)" : "rgba(255,255,255,.12)"}`,
              color: "white",
              fontFamily: "'Tajawal', sans-serif",
              fontSize: "1rem",
              outline: "none",
              textAlign: "center",
              letterSpacing: ".12em",
              direction: "ltr",
              marginBottom: 12,
              transition: "border-color .2s, background .2s",
              animation: shake ? "shake .35s ease" : undefined,
            }}
          />

          {/* Submit button */}
          <button
            onClick={tryPass}
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 10,
              background: "linear-gradient(135deg,#1a5c3a,#2d7a52)",
              color: "white",
              border: "none",
              fontFamily: "'Tajawal', sans-serif",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
              letterSpacing: ".02em",
            }}
          >
            {loading ? "✓ جاري الدخول..." : "دخول المنصة ←"}
          </button>

          {/* Error message */}
          {error && (
            <div style={{ fontSize: ".8rem", color: "#f87171", marginTop: 10, animation: "fadeIn .2s ease" }}>
              كلمة المرور غير صحيحة، حاول مجدداً
            </div>
          )}

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 justify-center" style={{ marginTop: 22 }}>
            {["📋 ملف الجمعية", "✅ لوحة المهام", "💳 تتبع التبرعات", "✦ محتوى AI", "👥 إدارة الفريق"].map((chip) => (
              <span
                key={chip}
                style={{
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 20,
                  padding: "5px 13px",
                  fontSize: ".75rem",
                  color: "rgba(255,255,255,.4)",
                }}
              >
                {chip}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 24,
              fontSize: ".75rem",
              color: "rgba(255,255,255,.2)",
              borderTop: "1px solid rgba(255,255,255,.07)",
              paddingTop: 16,
            }}
          >
            ساعِد ·{" "}
            <span style={{ color: "rgba(201,168,76,.5)", fontWeight: 600 }}>The Bright Station</span>
            {" "}· جميع الحقوق محفوظة
          </div>
        </div>
      </div>

      {/* Inline keyframes needed */}
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      `}</style>
    </div>
  );
}
