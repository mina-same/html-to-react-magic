import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import saaidLogo from "../assets/saaid-logo.png";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "ساعِد — تسجيل الدخول" }] }),
  component: LoginPage,
});

type Tab = "login" | "signup" | "forgot";

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, session, loading } = useAuth();

  const [tab,        setTab]        = useState<Tab>("login");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [assocName,  setAssocName]  = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in → redirect
  useEffect(() => {
    if (!loading && session) navigate({ to: "/association" });
  }, [session, loading, navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSubmitting(true);
    const { error: err } = await signIn(email, password);
    if (err) { setError(err); setSubmitting(false); return; }
    navigate({ to: "/association" });
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("كلمتا المرور غير متطابقتين"); return; }
    if (password.length < 6)  { setError("كلمة المرور 6 أحرف على الأقل"); return; }
    if (!assocName.trim())    { setError("يرجى إدخال اسم الجمعية"); return; }
    setSubmitting(true);
    const { error: err } = await signUp(email, password, assocName.trim());
    if (err) { setError(err); setSubmitting(false); return; }
    setSuccess("تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتأكيد الحساب.");
    setSubmitting(false);
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSubmitting(true);
    const { error: err } = await resetPassword(email);
    if (err) { setError(err); } else { setSuccess("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك."); }
    setSubmitting(false);
  }

  const inp: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 9, border: "1.5px solid rgba(45,122,82,.18)", fontFamily: "'Tajawal','Cairo',sans-serif", fontSize: ".93rem", color: "#111827", outline: "none", background: "white", boxSizing: "border-box", transition: "border-color .2s" };
  const btn: React.CSSProperties = { width: "100%", padding: "11px", borderRadius: 9, border: "none", background: "#1a5c3a", color: "white", fontSize: ".95rem", fontWeight: 700, fontFamily: "'Tajawal','Cairo',sans-serif", cursor: submitting ? "wait" : "pointer", opacity: submitting ? .7 : 1, transition: "all .2s" };
  const tabBtn = (t: Tab): React.CSSProperties => ({ flex: 1, padding: "9px 0", border: "none", background: tab === t ? "white" : "transparent", color: tab === t ? "#1a5c3a" : "#9ca3af", fontWeight: tab === t ? 700 : 500, fontSize: ".85rem", cursor: "pointer", fontFamily: "'Tajawal','Cairo',sans-serif", borderRadius: tab === t ? 7 : 0, transition: "all .15s", boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,.06)" : "none" });

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: "linear-gradient(135deg,#0d3322,#1a5c3a,#2d7a52)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Tajawal','Cairo',sans-serif" }}>
      {/* Decorative circles */}
      <div style={{ position: "fixed", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,.03)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(201,168,76,.06)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, background: "white", borderRadius: 18, padding: "32px 28px", boxShadow: "0 20px 60px rgba(0,0,0,.18)", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,#1a5c3a,#4a9e70)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={saaidLogo} alt="ساعِد" style={{ width: 28, filter: "brightness(0) invert(1)" }} />
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a5c3a", lineHeight: 1 }}>ساعِد</div>
            <div style={{ fontSize: ".6rem", color: "#4a9e70", letterSpacing: 2 }}>SAAID PLATFORM</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#f2faf6", borderRadius: 9, padding: 3, marginBottom: 22 }}>
          <button style={tabBtn("login")}   onClick={() => { setTab("login");  setError(""); setSuccess(""); }}>تسجيل الدخول</button>
          <button style={tabBtn("signup")}  onClick={() => { setTab("signup"); setError(""); setSuccess(""); }}>حساب جديد</button>
          <button style={tabBtn("forgot")}  onClick={() => { setTab("forgot"); setError(""); setSuccess(""); }}>نسيت كلمة المرور</button>
        </div>

        {/* Error / Success */}
        {error   && <div style={{ background: "#fef2f2", color: "#b91c1c", borderRadius: 8, padding: "9px 12px", fontSize: ".83rem", marginBottom: 14, border: "1px solid rgba(185,28,28,.15)" }}>{error}</div>}
        {success && <div style={{ background: "#f0fdf4", color: "#166534", borderRadius: 8, padding: "9px 12px", fontSize: ".83rem", marginBottom: 14, border: "1px solid rgba(22,101,52,.15)" }}>{success}</div>}

        {/* Login form */}
        {tab === "login" && (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: ".78rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>البريد الإلكتروني</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="example@assoc.org" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: ".78rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>كلمة المرور</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inp} />
            </div>
            <button type="submit" disabled={submitting} style={btn}>{submitting ? "جاري الدخول..." : "دخول المنصة ←"}</button>
          </form>
        )}

        {/* Signup form */}
        {tab === "signup" && (
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: ".78rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>اسم الجمعية</label>
              <input type="text" required value={assocName} onChange={e => setAssocName(e.target.value)} placeholder="جمعية تكاتف الخيرية" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: ".78rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>البريد الإلكتروني</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="example@assoc.org" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: ".78rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>كلمة المرور</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="6 أحرف على الأقل" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: ".78rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>تأكيد كلمة المرور</label>
              <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" style={inp} />
            </div>
            <button type="submit" disabled={submitting} style={btn}>{submitting ? "جاري إنشاء الحساب..." : "إنشاء الحساب ←"}</button>
          </form>
        )}

        {/* Forgot password form */}
        {tab === "forgot" && (
          <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: ".85rem", color: "#6b7280", lineHeight: 1.7, margin: 0 }}>
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
            </p>
            <div>
              <label style={{ fontSize: ".78rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>البريد الإلكتروني</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="example@assoc.org" style={inp} />
            </div>
            <button type="submit" disabled={submitting} style={btn}>{submitting ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}</button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: 20, fontSize: ".78rem", color: "#9ca3af" }}>
          <a href="/" style={{ color: "#2d7a52", textDecoration: "none", fontWeight: 600 }}>← العودة للرئيسية</a>
        </div>
      </div>
    </div>
  );
}
