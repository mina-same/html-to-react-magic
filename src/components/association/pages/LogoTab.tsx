import { useRef, useState, useEffect } from "react";
import { Player } from "@remotion/player";
import { LogoVideo } from "@/remotion/LogoVideo";
import {
  ANIMATION_LABELS,
  type LogoAnimation,
  type LogoPosition,
} from "@/remotion/logoAnimations";
import { supabase } from "@/lib/supabase";

const ANIMATIONS: LogoAnimation[] = [
  "bounce",
  "flyRight",
  "flyLeft",
  "flyTop",
  "fadeScale",
  "spin",
];

const ANIMATION_ICONS: Record<LogoAnimation, string> = {
  bounce:    "⬇️",
  flyRight:  "➡️",
  flyLeft:   "⬅️",
  flyTop:    "⬆️",
  fadeScale: "🔍",
  spin:      "🌀",
};

// 3×3 position grid items (row-major, top→bottom, left→right in LTR grid)
const POSITION_GRID: { key: LogoPosition; label: string }[][] = [
  [
    { key: "topRight",    label: "↖" },
    { key: "topLeft",     label: "↑" },
    { key: "topLeft",     label: "↗" },
  ],
  [
    { key: "topRight",    label: "←" },
    { key: "center",      label: "·" },
    { key: "topLeft",     label: "→" },
  ],
  [
    { key: "bottomRight", label: "↙" },
    { key: "bottomLeft",  label: "↓" },
    { key: "bottomLeft",  label: "↘" },
  ],
];

// Actual 5-position grid (simplified 3×3 visual, maps to 5 real positions)
const POSITIONS: { key: LogoPosition; label: string; gridArea: string }[] = [
  { key: "topRight",    label: "أعلى يمين",  gridArea: "1 / 1" },
  { key: "topLeft",     label: "أعلى يسار",  gridArea: "1 / 3" },
  { key: "center",      label: "وسط",         gridArea: "2 / 2" },
  { key: "bottomRight", label: "أسفل يمين",  gridArea: "3 / 1" },
  { key: "bottomLeft",  label: "أسفل يسار",  gridArea: "3 / 3" },
];

const LS_KEY_URL   = "saaid_logo_overlay_url";
const LS_KEY_ANIM  = "saaid_logo_animation";
const LS_KEY_POS   = "saaid_logo_position";
const LS_KEY_COLOR = "saaid_logo_bg_color";

interface Props {
  assocId: string;
  assocName: string;
  onLogoChange?: (url: string, animation: LogoAnimation, position: LogoPosition) => void;
}

export default function LogoTab({ assocId, assocName, onLogoChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [logoUrl, setLogoUrl]     = useState<string>(() => localStorage.getItem(LS_KEY_URL) ?? "");
  const [animation, setAnimation] = useState<LogoAnimation>(
    () => (localStorage.getItem(LS_KEY_ANIM) as LogoAnimation | null) ?? "bounce"
  );
  const [position, setPosition]   = useState<LogoPosition>(
    () => (localStorage.getItem(LS_KEY_POS) as LogoPosition | null) ?? "topRight"
  );
  const [bgColor, setBgColor]     = useState<string>(() => localStorage.getItem(LS_KEY_COLOR) ?? "#0f3d26");
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const [key, setKey]             = useState(0); // force Player remount on logo change

  // persist to localStorage + notify parent on any change
  useEffect(() => {
    localStorage.setItem(LS_KEY_ANIM, animation);
    if (logoUrl) {
      localStorage.setItem(LS_KEY_URL, logoUrl);
      onLogoChange?.(logoUrl, animation, position);
    }
  }, [animation, logoUrl, position, onLogoChange]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_POS, position);
  }, [position]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_COLOR, bgColor);
  }, [bgColor]);

  async function handleUpload(file: File) {
    if (!file.type.startsWith("image/")) { setError("صورة فقط (PNG/JPG/SVG/WEBP)"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("الحجم الأقصى 5MB"); return; }
    setError("");
    setUploading(true);
    try {
      const ext  = file.name.split(".").pop() ?? "png";
      const path = `logos/${assocId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("content").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("content").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
      setKey(k => k + 1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "خطأ في رفع الملف");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleUpload(f);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleUpload(f);
  }

  const removeLogo = () => {
    setLogoUrl("");
    localStorage.removeItem(LS_KEY_URL);
  };

  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        gap: 24,
        padding: "24px 20px",
        minHeight: 520,
        alignItems: "flex-start",
        fontFamily: "'Tajawal','Cairo',sans-serif",
      }}
    >
      {/* ── Left: preview ── */}
      <div style={{ flex: 1, minWidth: 280, maxWidth: 420 }}>
        <div style={{ marginBottom: 10, fontSize: "13px", fontWeight: 700, color: "#374151" }}>
          معاينة مباشرة
        </div>
        <div dir="ltr" style={{ borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,.12)" }}>
          {logoUrl ? (
            <Player
              key={key}
              component={LogoVideo}
              inputProps={{ logoUrl, animation, assocName, bgColor }}
              durationInFrames={150}
              fps={30}
              compositionWidth={1080}
              compositionHeight={1080}
              style={{ width: "100%", aspectRatio: "1" }}
              controls
              loop
            />
          ) : (
            <div
              style={{
                aspectRatio: "1",
                background: "linear-gradient(160deg,#0f3d26,#1a5c3a)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                color: "rgba(255,255,255,.4)",
              }}
            >
              <span style={{ fontSize: 48 }}>🏷</span>
              <span style={{ fontSize: "14px" }}>ارفع شعار الجمعية لترى المعاينة</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: controls ── */}
      <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Upload zone */}
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: 8 }}>
            شعار الجمعية
          </div>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => !logoUrl && fileRef.current?.click()}
            style={{
              border: `2px dashed ${logoUrl ? "#10b981" : "#d1d5db"}`,
              borderRadius: 12,
              padding: "20px 16px",
              textAlign: "center",
              cursor: logoUrl ? "default" : "pointer",
              background: logoUrl ? "rgba(16,185,129,.04)" : "#fafafa",
              transition: "border-color .2s",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            {logoUrl ? (
              <>
                <img
                  src={logoUrl}
                  alt="logo"
                  style={{ height: 72, objectFit: "contain", borderRadius: 8 }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{
                      padding: "4px 14px", borderRadius: 6, fontSize: "12px",
                      border: "1px solid #d1d5db", background: "white",
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    استبدال
                  </button>
                  <button
                    onClick={removeLogo}
                    style={{
                      padding: "4px 14px", borderRadius: 6, fontSize: "12px",
                      border: "1px solid #fca5a5", background: "#fef2f2",
                      color: "#dc2626", cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    حذف
                  </button>
                </div>
              </>
            ) : uploading ? (
              <>
                <div style={{ fontSize: 32, animation: "spin 1s linear infinite" }}>⏳</div>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>جاري الرفع…</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 36 }}>🖼</span>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>
                  اسحب الشعار هنا أو اضغط للاختيار
                </span>
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>PNG / JPG / SVG / WEBP · حتى 5MB</span>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          {error && (
            <div style={{ fontSize: "12px", color: "#dc2626", marginTop: 6 }}>{error}</div>
          )}
        </div>

        {/* Animation picker */}
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: 10 }}>
            نوع الحركة
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {ANIMATIONS.map(anim => {
              const active = animation === anim;
              return (
                <button
                  key={anim}
                  onClick={() => setAnimation(anim)}
                  style={{
                    padding: "10px 6px",
                    borderRadius: 10,
                    border: `2px solid ${active ? "#10b981" : "#e5e7eb"}`,
                    background: active ? "rgba(16,185,129,.08)" : "white",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    transition: "all .15s",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{ANIMATION_ICONS[anim]}</span>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: active ? 700 : 500,
                    color: active ? "#059669" : "#6b7280",
                  }}>
                    {ANIMATION_LABELS[anim]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Position picker */}
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: 10 }}>
            موضع الشعار في الفيديو
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr 1fr",
            gap: 6,
            width: 150,
          }}>
            {/* Row 1 */}
            {(["topRight", "___", "topLeft"] as const).map((key, ci) => key === "___" ? (
              <div key={ci} />
            ) : (
              <PosBtn key={key} posKey={key as LogoPosition} cur={position} set={setPosition} />
            ))}
            {/* Row 2 */}
            <div />
            <PosBtn posKey="center" cur={position} set={setPosition} />
            <div />
            {/* Row 3 */}
            {(["bottomRight", "___", "bottomLeft"] as const).map((key, ci) => key === "___" ? (
              <div key={ci} />
            ) : (
              <PosBtn key={key} posKey={key as LogoPosition} cur={position} set={setPosition} />
            ))}
          </div>
          <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: 6 }}>
            {POSITIONS.find(p => p.key === position)?.label ?? position}
          </div>
        </div>

        {/* Background color for logo stinger */}
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: 8 }}>
            لون خلفية المعاينة
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="color"
              value={bgColor}
              onChange={e => setBgColor(e.target.value)}
              style={{ width: 40, height: 40, border: "none", borderRadius: 8, cursor: "pointer", padding: 2 }}
            />
            <span style={{ fontSize: "12px", color: "#6b7280", fontFamily: "monospace" }}>{bgColor}</span>
          </div>
        </div>

        {/* Apply hint */}
        {logoUrl && (
          <div style={{
            padding: "10px 14px",
            background: "rgba(16,185,129,.06)",
            border: "1px solid rgba(16,185,129,.2)",
            borderRadius: 10,
            fontSize: "12px",
            color: "#065f46",
            lineHeight: 1.7,
          }}>
            ✅ الشعار محفوظ. سيظهر في تبويب الفيديو تلقائياً مع الحركة المختارة.
          </div>
        )}
      </div>
    </div>
  );
}

function PosBtn({
  posKey,
  cur,
  set,
}: {
  posKey: LogoPosition;
  cur: LogoPosition;
  set: (p: LogoPosition) => void;
}) {
  const active = cur === posKey;
  return (
    <button
      onClick={() => set(posKey)}
      style={{
        width: 44,
        height: 44,
        borderRadius: 8,
        border: `2px solid ${active ? "#10b981" : "#e5e7eb"}`,
        background: active ? "rgba(16,185,129,.15)" : "#f9fafb",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        transition: "all .15s",
      }}
    >
      {active ? "🟢" : "⚪"}
    </button>
  );
}
