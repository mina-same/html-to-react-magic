import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/saaid-logo.png";

export const Route = createFileRoute("/gate")({
  head: () => ({ meta: [{ title: "ساعِد — دخول المنصة" }] }),
  component: Gate,
});

const ROLES: Record<string, { path: string; label: string }> = {
  "saaid2025": { path: "/admin", label: "إدارة" },
  "association": { path: "/association", label: "جمعية" },
};

function Gate() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.setAttribute("lang", "ar");
  }, []);

  const tryPass = () => {
    const role = ROLES[pw.trim()];
    if (role) {
      sessionStorage.setItem("saaid-auth", pw.trim());
      navigate({ to: role.path });
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <div className="font-arabic min-h-screen overflow-hidden" dir="rtl">
      {/* backgrounds */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#071a0f] via-[#0d3322] to-[#0a2518]" />
      <div
        className="fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(45,122,82,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(45,122,82,.07) 1px,transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />
      <div className="fixed -top-24 -right-24 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(45,122,82,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed -bottom-12 -left-12 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* gate card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
        <div
          className={
            "w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl px-10 py-11 text-center " +
            "animate-[slide-up_0.5s_cubic-bezier(0.22,1,0.36,1)_both]"
          }
        >
          <img src={logo} alt="ساعِد" className="w-24 mx-auto mb-5 brightness-0 invert opacity-95" />

          <div className="inline-flex items-center gap-2 bg-saaid-gold/10 border border-saaid-gold/25 rounded-full px-4 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-saaid-gold animate-pulse" />
            <span className="text-sm font-semibold text-saaid-gold2 tracking-wide">قيد التطوير</span>
          </div>

          <h1 className="text-2xl font-extrabold text-white/95 leading-snug mb-3">
            منصة ساعِد الذكية
            <br />
            لإدارة العمل الخيري
          </h1>
          <p className="text-sm text-white/45 leading-relaxed mb-7">
            المنصة قيد البناء. أدخل كلمة الوصول للوصول إلى لوحة التحكم.
          </p>

          {/* progress */}
          <div className="bg-white/[0.07] rounded-full h-1.5 mb-2 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-saaid-g3 via-saaid-g4 to-saaid-gold w-[72%] animate-[grow_0.8s_ease_0.3s_both]" />
          </div>
          <div className="text-xs text-white/30 text-left mb-6">72% مكتمل</div>

          {/* input */}
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") tryPass(); }}
            placeholder="كلمة الوصول"
            autoComplete="off"
            dir="ltr"
            className={
              "w-full px-5 py-3.5 rounded-xl bg-white/[0.07] border-[1.5px] text-white text-center tracking-wider outline-none transition-colors mb-3 placeholder:text-white/25 placeholder:tracking-normal " +
              "focus:border-saaid-g3/60 focus:bg-white/10 " +
              (error ? "border-red-500/60 " : "border-white/10 ") +
              (shake ? "animate-[shake_0.35s_ease]" : "")
            }
          />

          <button
            onClick={tryPass}
            className="w-full py-3.5 rounded-xl bg-gradient-to-br from-saaid-g2 to-saaid-g3 text-white font-bold hover:from-saaid-g3 hover:to-saaid-g4 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(45,122,82,0.35)] transition-all"
          >
            دخول المنصة ←
          </button>

          {error && (
            <div className="text-xs text-red-400 mt-3 animate-[fade-in_0.2s_ease]">
              كلمة الوصول غير صحيحة. حاول مرة أخرى.
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {["AI Content", "Smart Reports", "Donation Tracking", "Multi-tenant"].map((c) => (
              <span key={c} className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-white/40">
                {c}
              </span>
            ))}
          </div>

          <div className="mt-6 text-xs text-white/20 border-t border-white/[0.07] pt-4">
            مبادرة من <span className="text-saaid-gold/50 font-semibold">The Bright Station</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }
        @keyframes grow { from { width: 0 } to { width: 72% } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes fade-in { from{opacity:0} to{opacity:1} }
      `}</style>
    </div>
  );
}
