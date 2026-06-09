import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import saaidLogo from "../assets/saaid-logo.png";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "ساعِد — تسجيل الدخول" }] }),
  component: LoginPage,
});

type Tab = "login" | "signup" | "forgot";

const inp: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 10,
  background: "rgba(255,255,255,.08)",
  border: "1.5px solid rgba(255,255,255,.12)",
  color: "white",
  fontFamily: "'Tajawal', sans-serif",
  fontSize: ".93rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .2s, background .2s",
};

const lbl: React.CSSProperties = {
  fontSize: ".78rem",
  fontWeight: 600,
  color: "rgba(255,255,255,.6)",
  display: "block",
  marginBottom: 6,
};

const submitBtn = (busy: boolean): React.CSSProperties => ({
  width: "100%",
  padding: 14,
  borderRadius: 10,
  background: "linear-gradient(135deg,#1a5c3a,#2d7a52)",
  color: "white",
  border: "none",
  fontFamily: "'Tajawal', sans-serif",
  fontSize: "1rem",
  fontWeight: 700,
  cursor: busy ? "wait" : "pointer",
  opacity: busy ? 0.7 : 1,
  transition: "all .2s",
});

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, session, loading, role } = useAuth();

  const [tab,          setTab]          = useState<Tab>("login");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [assocName,    setAssocName]    = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [googleBusy,   setGoogleBusy]   = useState(false);
  const [showPass,     setShowPass]     = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.setAttribute("lang", "ar");
  }, []);

  useEffect(() => {
    if (!loading && session) {
      if (role === "admin") navigate({ to: "/admin" });
      else if (role === "employee") navigate({ to: "/employee" });
      else if (role === "association") navigate({ to: "/association" });
    }
  }, [session, loading, role, navigate]);

  function switchTab(t: Tab) {
    setTab(t);
    setError("");
    setSuccess("");
  }

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
    if (password !== confirm)   { setError("كلمتا المرور غير متطابقتين"); return; }
    if (password.length < 6)    { setError("كلمة المرور 6 أحرف على الأقل"); return; }
    if (!assocName.trim())      { setError("يرجى إدخال اسم الجمعية"); return; }
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

  async function handleGoogle() {
    setGoogleBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/login` },
    });
    if (error) { setError(error.message); setGoogleBusy(false); }
    // if no error, browser redirects to Google — googleBusy stays true intentionally
  }

  return (
    <div className="font-arabic" dir="rtl">
      {/* Background */}
      <div
        className="fixed inset-0"
        style={{
          background: "linear-gradient(135deg,#071a0f 0%,#0d3322 40%,#163d28 70%,#0a2518 100%)",
        }}
      />
      <div
        className="fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(45,122,82,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(45,122,82,.07) 1px,transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(45,122,82,.12) 0%,transparent 70%)",
          top: -100, right: -100,
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(201,168,76,.06) 0%,transparent 70%)",
          bottom: -50, left: -50,
        }}
      />

      {/* Card */}
      <div className="fixed inset-0 z-10 flex items-center justify-center p-5 overflow-y-auto">
        <div
          className="animate-slide-up w-full my-auto"
          style={{
            maxWidth: 440,
            background: "rgba(255,255,255,.04)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 24,
            padding: "40px 36px",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 28 }}>
            <img
              src={saaidLogo}
              alt="ساعِد"
              style={{ width: 52, filter: "brightness(0) invert(1)", opacity: 0.95 }}
            />
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "rgba(255,255,255,.95)", lineHeight: 1 }}>ساعِد</div>
              <div style={{ fontSize: ".6rem", color: "#4a9e70", letterSpacing: 2 }}>SAAID PLATFORM</div>
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,.05)",
              borderRadius: 10,
              padding: 3,
              marginBottom: 22,
              border: "1px solid rgba(255,255,255,.08)",
            }}
          >
            {(["login", "signup", "forgot"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                style={{
                  flex: 1,
                  padding: "9px 4px",
                  border: "none",
                  background: tab === t ? "rgba(45,122,82,.65)" : "transparent",
                  color: tab === t ? "white" : "rgba(255,255,255,.4)",
                  fontWeight: tab === t ? 700 : 500,
                  fontSize: ".78rem",
                  cursor: "pointer",
                  fontFamily: "'Tajawal', sans-serif",
                  borderRadius: 7,
                  transition: "all .15s",
                  boxShadow: tab === t ? "0 1px 6px rgba(45,122,82,.35)" : "none",
                  whiteSpace: "nowrap",
                }}
              >
                {t === "login" ? "تسجيل الدخول" : t === "signup" ? "حساب جديد" : "نسيت كلمة المرور"}
              </button>
            ))}
          </div>

          {/* Alerts */}
          {error && (
            <div style={{ background: "rgba(220,38,38,.15)", color: "#fca5a5", borderRadius: 8, padding: "9px 12px", fontSize: ".83rem", marginBottom: 14, border: "1px solid rgba(220,38,38,.25)" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: "rgba(22,101,52,.2)", color: "#86efac", borderRadius: 8, padding: "9px 12px", fontSize: ".83rem", marginBottom: 14, border: "1px solid rgba(22,101,52,.3)" }}>
              {success}
            </div>
          )}

          {/* Google OAuth (login + signup only) */}
          {tab !== "forgot" && (
            <>
              <button
                onClick={handleGoogle}
                disabled={googleBusy}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,.08)",
                  border: "1.5px solid rgba(255,255,255,.15)",
                  color: "rgba(255,255,255,.9)",
                  fontSize: ".9rem",
                  fontWeight: 600,
                  fontFamily: "'Tajawal', sans-serif",
                  cursor: googleBusy ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  marginBottom: 16,
                  transition: "all .2s",
                  opacity: googleBusy ? 0.7 : 1,
                }}
              >
                <GoogleIcon />
                {googleBusy
                  ? "جاري الاتصال..."
                  : tab === "login"
                  ? "الدخول عبر Google"
                  : "التسجيل عبر Google"}
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.1)" }} />
                <span style={{ fontSize: ".75rem", color: "rgba(255,255,255,.3)" }}>أو</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.1)" }} />
              </div>
            </>
          )}

          {/* Login form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={lbl}>البريد الإلكتروني</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="example@assoc.org" style={inp} />
              </div>
              <div>
                <label style={lbl}>كلمة المرور</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inp, paddingLeft: 40 }} />
                  <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.4)", fontSize: "1rem", padding: 0, lineHeight: 1 }}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={submitting} style={submitBtn(submitting)}>
                {submitting ? "جاري الدخول..." : "دخول المنصة ←"}
              </button>
            </form>
          )}

          {/* Signup form */}
          {tab === "signup" && (
            <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={lbl}>اسم الجمعية</label>
                <input type="text" required value={assocName} onChange={e => setAssocName(e.target.value)} placeholder="جمعية تكاتف الخيرية" style={inp} />
              </div>
              <div>
                <label style={lbl}>البريد الإلكتروني</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="example@assoc.org" style={inp} />
              </div>
              <div>
                <label style={lbl}>كلمة المرور</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="6 أحرف على الأقل" style={{ ...inp, paddingLeft: 40 }} />
                  <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.4)", fontSize: "1rem", padding: 0, lineHeight: 1 }}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
              <div>
                <label style={lbl}>تأكيد كلمة المرور</label>
                <div style={{ position: "relative" }}>
                  <input type={showConfirm ? "text" : "password"} required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" style={{ ...inp, paddingLeft: 40 }} />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.4)", fontSize: "1rem", padding: 0, lineHeight: 1 }}>
                    {showConfirm ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={submitting} style={submitBtn(submitting)}>
                {submitting ? "جاري إنشاء الحساب..." : "إنشاء الحساب ←"}
              </button>
            </form>
          )}

          {/* Forgot password form */}
          {tab === "forgot" && (
            <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: ".85rem", color: "rgba(255,255,255,.5)", lineHeight: 1.7, margin: 0 }}>
                أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
              </p>
              <div>
                <label style={lbl}>البريد الإلكتروني</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="example@assoc.org" style={inp} />
              </div>
              <button type="submit" disabled={submitting} style={submitBtn(submitting)}>
                {submitting ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
              </button>
            </form>
          )}

          {/* Footer */}
          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              borderTop: "1px solid rgba(255,255,255,.07)",
              paddingTop: 16,
            }}
          >
            <a href="/" style={{ fontSize: ".78rem", color: "rgba(74,158,112,.85)", textDecoration: "none", fontWeight: 600 }}>
              ← العودة للرئيسية
            </a>
            <div style={{ marginTop: 10, fontSize: ".72rem", color: "rgba(255,255,255,.2)" }}>
              ساعِد ·{" "}
              <span style={{ color: "rgba(201,168,76,.5)", fontWeight: 600 }}>The Bright Station</span>
              {" "}· جميع الحقوق محفوظة
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
