import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const inpStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.95)",
  border: "1.5px solid rgba(45,122,82,0.2)",
  color: "#111827",
  fontFamily: "'Tajawal', sans-serif",
  fontSize: "0.93rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const lblStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "#374151",
  display: "block",
  marginBottom: 6,
};

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user, completeOnboarding } = useAuth();
  const [assocName, setAssocName] = useState("");
  const [license, setLicense] = useState("");
  const [region, setRegion] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!assocName.trim()) {
      setError("يرجى إدخال اسم الجمعية");
      return;
    }
    if (!license.trim()) {
      setError("يرجى إدخال رقم ترخيص الجمعية");
      return;
    }
    if (!region.trim()) {
      setError("يرجى إدخال المكان");
      return;
    }
    if (!phone.trim()) {
      setError("يرجى إدخال رقم التلفون");
      return;
    }

    setSubmitting(true);
    try {
      await completeOnboarding({
        assocName: assocName.trim(),
        license: license.trim(),
        region: region.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{
        background: "linear-gradient(135deg,#071a0f 0%,#0d3322 40%,#163d28 70%,#0a2518 100%)",
      }}
    >
      <div
        className="animate-slide-up w-full max-w-md"
        style={{
          background: "rgba(255,255,255,0.98)",
          borderRadius: 24,
          padding: "40px 36px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#2d7a52",
              marginBottom: 8,
            }}
          >
            أهلاً بك!
          </div>
          <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>أكمل إعداد حساب جمعيتك</div>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(220,38,38,0.1)",
              color: "#b91c1c",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 16,
              border: "1px solid rgba(220,38,38,0.2)",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={lblStyle}>اسم الجمعية</label>
            <input
              type="text"
              value={assocName}
              onChange={(e) => setAssocName(e.target.value)}
              placeholder="جمعية تكاتف الخيرية"
              style={inpStyle}
            />
          </div>

          <div>
            <label style={lblStyle}>رقم ترخيص الجمعية</label>
            <input
              type="text"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              placeholder="رقم الترخيص"
              style={inpStyle}
            />
          </div>

          <div>
            <label style={lblStyle}>المكان</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="الرياض"
              style={inpStyle}
            />
          </div>

          <div>
            <label style={lblStyle}>رقم التلفون</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0501234567"
              style={inpStyle}
            />
          </div>

          <div>
            <label style={lblStyle}>البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@assoc.org"
              style={inpStyle}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
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
              cursor: submitting ? "wait" : "pointer",
              opacity: submitting ? 0.7 : 1,
              marginTop: 8,
            }}
          >
            {submitting ? "جاري الحفظ..." : "إكمال الإعداد"}
          </button>
        </form>
      </div>
    </div>
  );
}
