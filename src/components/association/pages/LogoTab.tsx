import { useRef, useState, useEffect, useCallback } from "react";
import { Player } from "@remotion/player";
import { LogoVideo } from "@/remotion/LogoVideo";
import { ANIMATION_LABELS, type LogoAnimation, type LogoPosition } from "@/remotion/logoAnimations";
import { supabase } from "@/lib/supabase";

const NAME_FONTS = [
  { label: "تجوال", value: "'Tajawal', sans-serif" },
  { label: "قاهرة", value: "'Cairo', sans-serif" },
  { label: "جورجيا", value: "Georgia, serif" },
  { label: "بسيط", value: "Arial, sans-serif" },
];

const ANIMATIONS: LogoAnimation[] = [
  "bounce",
  "flyRight",
  "flyLeft",
  "flyTop",
  "fadeScale",
  "spin",
];

const ANIMATION_ICONS: Record<LogoAnimation, string> = {
  bounce: "⬇️",
  flyRight: "➡️",
  flyLeft: "⬅️",
  flyTop: "⬆️",
  fadeScale: "🔍",
  spin: "🌀",
};

// 3×3 position grid items (row-major, top→bottom, left→right in LTR grid)
const POSITION_GRID: { key: LogoPosition; label: string }[][] = [
  [
    { key: "topRight", label: "↖" },
    { key: "topLeft", label: "↑" },
    { key: "topLeft", label: "↗" },
  ],
  [
    { key: "topRight", label: "←" },
    { key: "center", label: "·" },
    { key: "topLeft", label: "→" },
  ],
  [
    { key: "bottomRight", label: "↙" },
    { key: "bottomLeft", label: "↓" },
    { key: "bottomLeft", label: "↘" },
  ],
];

// Actual 5-position grid (simplified 3×3 visual, maps to 5 real positions)
const POSITIONS: { key: LogoPosition; label: string; gridArea: string }[] = [
  { key: "topRight", label: "أعلى يمين", gridArea: "1 / 1" },
  { key: "topLeft", label: "أعلى يسار", gridArea: "1 / 3" },
  { key: "center", label: "وسط", gridArea: "2 / 2" },
  { key: "bottomRight", label: "أسفل يمين", gridArea: "3 / 1" },
  { key: "bottomLeft", label: "أسفل يسار", gridArea: "3 / 3" },
];

const LS_KEY_URL = "saaid_logo_overlay_url";
const LS_KEY_ANIM = "saaid_logo_animation";
const LS_KEY_POS = "saaid_logo_position";
const LS_KEY_COLOR = "saaid_logo_bg_color";

interface Props {
  assocId: string;
  assocName: string;
  onLogoChange?: (url: string, animation: LogoAnimation, position: LogoPosition) => void;
}

export default function LogoTab({ assocId, assocName, onLogoChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [logoUrl, setLogoUrl] = useState<string>(() => localStorage.getItem(LS_KEY_URL) ?? "");
  const [animation, setAnimation] = useState<LogoAnimation>(
    () => (localStorage.getItem(LS_KEY_ANIM) as LogoAnimation | null) ?? "bounce",
  );
  const [position, setPosition] = useState<LogoPosition>(
    () => (localStorage.getItem(LS_KEY_POS) as LogoPosition | null) ?? "topRight",
  );
  const [bgColor, setBgColor] = useState<string>(
    () => localStorage.getItem(LS_KEY_COLOR) ?? "#0f3d26",
  );
  const [uploading, setUploading] = useState(false);
  const [bgRemoving, setBgRemoving] = useState(false);
  const [originalLogoUrl, setOriginalLogoUrl] = useState("");
  const [error, setError] = useState("");
  const [key, setKey] = useState(0);

  // Name options
  const [showName, setShowName] = useState(false);
  const [customName, setCustomName] = useState(assocName);
  const [namePosition, setNamePosition] = useState<"above" | "below">("below");
  const [nameFont, setNameFont] = useState(NAME_FONTS[0].value);

  // Appearance toggles
  const [showBg, setShowBg] = useState(true);
  const [showShadow, setShowShadow] = useState(true);
  const [logoSize, setLogoSize] = useState(280);

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

  // Sample 4 corners to detect background color, then erase matching pixels
  const stripBackground = useCallback((url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const W = canvas.width, H = canvas.height;
        const imageData = ctx.getImageData(0, 0, W, H);
        const d = imageData.data;

        // Average the 4 corner pixels to get background color
        const corners = [0, (W - 1) * 4, (H - 1) * W * 4, ((H - 1) * W + W - 1) * 4];
        let bgR = 0, bgG = 0, bgB = 0;
        corners.forEach((i) => { bgR += d[i]; bgG += d[i + 1]; bgB += d[i + 2]; });
        bgR = Math.round(bgR / 4); bgG = Math.round(bgG / 4); bgB = Math.round(bgB / 4);

        const HARD = 40, SOFT = 80; // px distance thresholds
        for (let i = 0; i < d.length; i += 4) {
          const dist = Math.max(
            Math.abs(d[i] - bgR),
            Math.abs(d[i + 1] - bgG),
            Math.abs(d[i + 2] - bgB),
          );
          if (dist < HARD) {
            d[i + 3] = 0;
          } else if (dist < SOFT) {
            // Soft anti-aliased edge
            d[i + 3] = Math.round(((dist - HARD) / (SOFT - HARD)) * d[i + 3]);
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = url;
    });
  }, []);

  async function handleRemoveBg() {
    if (!logoUrl) return;
    // Toggle: if already removed, restore original
    if (originalLogoUrl) {
      setLogoUrl(originalLogoUrl);
      setOriginalLogoUrl("");
      setKey((k) => k + 1);
      return;
    }
    setBgRemoving(true);
    setError("");
    try {
      const processed = await stripBackground(logoUrl);
      setOriginalLogoUrl(logoUrl);
      setLogoUrl(processed);
      setKey((k) => k + 1);
    } catch {
      setError("تعذّر إزالة الخلفية — جرّب صورة بخلفية لون واحد");
    } finally {
      setBgRemoving(false);
    }
  }

  async function handleUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("صورة فقط (PNG/JPG/SVG/WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("الحجم الأقصى 5MB");
      return;
    }
    setError("");
    setUploading(true);

    // Show preview immediately from local data URL — no network needed
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setLogoUrl(dataUrl);
    setKey((k) => k + 1);
    setUploading(false);

    // Try Supabase upload in background (best-effort — won't block preview)
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `logos/${assocId}/${Date.now()}.${ext}`;
      const uploadPromise = supabase.storage
        .from("images")
        .upload(path, file, { upsert: true });
      // 15s timeout so it doesn't hang forever
      const result = await Promise.race([
        uploadPromise,
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 15_000)),
      ]);
      if (!result.error) {
        const { data } = supabase.storage.from("images").getPublicUrl(path);
        setLogoUrl(data.publicUrl);
      }
    } catch {
      // Supabase upload failed/timed out — data URL in state is still valid for preview
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
    setOriginalLogoUrl("");
    localStorage.removeItem(LS_KEY_URL);
  };

  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        gap: 20,
        minHeight: 520,
        alignItems: "flex-start",
        fontFamily: "'Tajawal','Cairo',sans-serif",
      }}
    >
      {/* ── Left: preview card ── */}
      <div
        style={{
          flex: 1,
          minWidth: 280,
          maxWidth: 440,
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,.03)",
          position: "sticky",
          top: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: "#f0fdf4",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
            }}
          >
            🎬
          </span>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
            معاينة مباشرة
          </span>
          {logoUrl && (
            <span
              style={{
                marginRight: "auto",
                fontSize: "10px",
                fontWeight: 700,
                color: "#059669",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 999,
                padding: "3px 10px",
              }}
            >
              مباشر
            </span>
          )}
        </div>
        <div
          dir="ltr"
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #eef2f6",
            background: showBg
              ? undefined
              : "repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 16px 16px",
          }}
        >
          {logoUrl ? (
            <Player
              key={key}
              component={LogoVideo}
              inputProps={{
                logoUrl,
                animation,
                assocName,
                bgColor,
                showName,
                customName,
                namePosition,
                nameFont,
                showBg,
                showShadow,
                logoSize,
              }}
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
      <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Upload zone */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,.03)",
          }}
        >
          <SectionTitle icon="🏷" title="شعار الجمعية" />
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
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
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{
                      padding: "4px 14px",
                      borderRadius: 6,
                      fontSize: "12px",
                      border: "1px solid #d1d5db",
                      background: "white",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    استبدال
                  </button>
                  <button
                    onClick={handleRemoveBg}
                    disabled={bgRemoving}
                    style={{
                      padding: "4px 14px",
                      borderRadius: 6,
                      fontSize: "12px",
                      border: `1px solid ${originalLogoUrl ? "#a855f7" : "#6366f1"}`,
                      background: originalLogoUrl ? "#faf5ff" : "#eef2ff",
                      color: originalLogoUrl ? "#7e22ce" : "#4338ca",
                      cursor: bgRemoving ? "wait" : "pointer",
                      fontFamily: "inherit",
                      opacity: bgRemoving ? 0.6 : 1,
                    }}
                  >
                    {bgRemoving ? "⏳" : originalLogoUrl ? "↩ استعادة" : "✨ إزالة الخلفية"}
                  </button>
                  <button
                    onClick={removeLogo}
                    style={{
                      padding: "4px 14px",
                      borderRadius: 6,
                      fontSize: "12px",
                      border: "1px solid #fca5a5",
                      background: "#fef2f2",
                      color: "#dc2626",
                      cursor: "pointer",
                      fontFamily: "inherit",
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
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                  PNG / JPG / SVG / WEBP · حتى 5MB
                </span>
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
          {error && <div style={{ fontSize: "12px", color: "#dc2626", marginTop: 6 }}>{error}</div>}
        </div>

        {/* Animation picker */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,.03)",
          }}
        >
          <SectionTitle icon="🪄" title="نوع الحركة" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {ANIMATIONS.map((anim) => {
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
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: active ? 700 : 500,
                      color: active ? "#059669" : "#6b7280",
                    }}
                  >
                    {ANIMATION_LABELS[anim]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Position picker */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,.03)",
          }}
        >
          <SectionTitle icon="📍" title="موضع الشعار في الفيديو" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gridTemplateRows: "1fr 1fr 1fr",
              gap: 6,
              width: 150,
            }}
          >
            {/* Row 1 */}
            {(["topRight", "___", "topLeft"] as const).map((key, ci) =>
              key === "___" ? (
                <div key={ci} />
              ) : (
                <PosBtn key={key} posKey={key as LogoPosition} cur={position} set={setPosition} />
              ),
            )}
            {/* Row 2 */}
            <div />
            <PosBtn posKey="center" cur={position} set={setPosition} />
            <div />
            {/* Row 3 */}
            {(["bottomRight", "___", "bottomLeft"] as const).map((key, ci) =>
              key === "___" ? (
                <div key={ci} />
              ) : (
                <PosBtn key={key} posKey={key as LogoPosition} cur={position} set={setPosition} />
              ),
            )}
          </div>
          <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: 6 }}>
            {POSITIONS.find((p) => p.key === position)?.label ?? position}
          </div>
        </div>

        {/* Name section */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: showName ? 12 : 0,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: "#f0fdf4",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                }}
              >
                ✏️
              </span>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
                اسم مع الشعار
              </span>
            </span>
            <button
              onClick={() => setShowName((v) => !v)}
              style={{
                width: 40,
                height: 22,
                borderRadius: 11,
                border: "none",
                background: showName ? "#10b981" : "#d1d5db",
                cursor: "pointer",
                position: "relative",
                transition: "background .2s",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 2,
                  left: showName ? 20 : 2,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "white",
                  transition: "left .2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                }}
              />
            </button>
          </div>

          {showName && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Text input */}
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={assocName || "اكتب الاسم هنا"}
                dir="rtl"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1.5px solid #e5e7eb",
                  fontSize: "13px",
                  fontFamily: nameFont,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

              {/* Position: above / below */}
              <div style={{ display: "flex", gap: 8 }}>
                {(["below", "above"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setNamePosition(pos)}
                    style={{
                      flex: 1,
                      padding: "6px 0",
                      borderRadius: 8,
                      border: `1.5px solid ${namePosition === pos ? "#10b981" : "#e5e7eb"}`,
                      background: namePosition === pos ? "rgba(16,185,129,.08)" : "white",
                      color: namePosition === pos ? "#059669" : "#6b7280",
                      fontWeight: namePosition === pos ? 700 : 500,
                      fontSize: "12px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {pos === "below" ? "⬇ أسفل" : "⬆ أعلى"}
                  </button>
                ))}
              </div>

              {/* Font picker */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {NAME_FONTS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setNameFont(f.value)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1.5px solid ${nameFont === f.value ? "#10b981" : "#e5e7eb"}`,
                      background: nameFont === f.value ? "rgba(16,185,129,.08)" : "white",
                      color: nameFont === f.value ? "#059669" : "#374151",
                      fontWeight: nameFont === f.value ? 700 : 500,
                      fontSize: "12px",
                      fontFamily: f.value,
                      cursor: "pointer",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Appearance: bg + shadow */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,.03)",
          }}
        >
          <SectionTitle icon="🎨" title="المظهر" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Show background toggle + color */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setShowBg((v) => !v)}
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 11,
                  border: "none",
                  background: showBg ? "#10b981" : "#d1d5db",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background .2s",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 2,
                    left: showBg ? 20 : 2,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "white",
                    transition: "left .2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                  }}
                />
              </button>
              <span style={{ fontSize: "12px", color: "#374151", flex: 1 }}>خلفية ملونة</span>
              {showBg && (
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  style={{ width: 32, height: 32, border: "none", borderRadius: 6, cursor: "pointer", padding: 2 }}
                />
              )}
            </div>

            {/* Show shadow toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setShowShadow((v) => !v)}
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 11,
                  border: "none",
                  background: showShadow ? "#10b981" : "#d1d5db",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background .2s",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 2,
                    left: showShadow ? 20 : 2,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "white",
                    transition: "left .2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                  }}
                />
              </button>
              <span style={{ fontSize: "12px", color: "#374151" }}>ظل الشعار</span>
            </div>

            {/* Logo size slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: "12px", color: "#374151" }}>حجم الشعار</span>
                <span style={{ fontSize: "11px", color: "#6b7280", fontFamily: "monospace" }}>
                  {logoSize}px
                </span>
              </div>
              <input
                type="range"
                min={80}
                max={500}
                step={10}
                value={logoSize}
                onChange={(e) => setLogoSize(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#10b981" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span style={{ fontSize: "10px", color: "#9ca3af" }}>صغير</span>
                <span style={{ fontSize: "10px", color: "#9ca3af" }}>كبير</span>
              </div>
            </div>
          </div>
        </div>

        {/* Apply hint */}
        {logoUrl && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(16,185,129,.06)",
              border: "1px solid rgba(16,185,129,.2)",
              borderRadius: 10,
              fontSize: "12px",
              color: "#065f46",
              lineHeight: 1.7,
            }}
          >
            ✅ الشعار محفوظ. سيظهر في تبويب الفيديو تلقائياً مع الحركة المختارة.
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          background: "#f0fdf4",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>{title}</span>
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
