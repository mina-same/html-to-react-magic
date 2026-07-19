import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { getLogoTransform, type LogoAnimation } from "./logoAnimations";

export interface LogoVideoProps {
  [key: string]: unknown;
  logoUrl: string;
  animation?: LogoAnimation;
  assocName?: string;
  bgColor?: string;
  showName?: boolean;
  customName?: string;
  namePosition?: "above" | "below";
  nameFont?: string;
  showBg?: boolean;
  showShadow?: boolean;
  logoSize?: number; // 80–400, default 280
}

export function LogoVideo({
  logoUrl,
  animation = "bounce",
  assocName,
  bgColor = "#0f3d26",
  showName = false,
  customName,
  namePosition = "below",
  nameFont = "'Tajawal','Cairo',sans-serif",
  showBg = true,
  showShadow = true,
  logoSize = 280,
}: LogoVideoProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const { x, y, scale, rotate, opacity } = getLogoTransform(animation, frame, fps);

  const idleOffset = interpolate(Math.sin(frame * 0.05), [-1, 1], [-8, 8]);
  const idleRotate = interpolate(Math.sin(frame * 0.04), [-1, 1], [-2, 2]);

  const exitOpacity = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ring1 = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 20, stiffness: 60 } });
  const ring2 = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 20, stiffness: 50 } });

  const displayName = customName || assocName;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* ── Background layer (optional) ── */}
      {showBg && (
        <AbsoluteFill
          style={{
            background: `linear-gradient(160deg, ${bgColor} 0%, #1a5c3a 55%, #0d3322 100%)`,
            opacity: exitOpacity,
          }}
        />
      )}

      {/* ── Decorative rings + glow — only with bg ── */}
      {showBg && (
        <AbsoluteFill style={{ opacity: exitOpacity, pointerEvents: "none" }}>
          {[ring1, ring2].map((r, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: interpolate(r, [0, 1], [0, 800 + i * 300]),
                height: interpolate(r, [0, 1], [0, 800 + i * 300]),
                borderRadius: "50%",
                border: `1px solid rgba(201,168,76,${interpolate(r, [0, 0.5, 1], [0.4, 0.15, 0])})`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(201,168,76,.14) 0%, transparent 70%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
            }}
          />
        </AbsoluteFill>
      )}

      {/* ── Logo + optional name ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `
            translate(-50%, calc(-50% + ${y + idleOffset}px))
            translateX(${x}px)
            scale(${scale})
            rotate(${rotate + idleRotate}deg)
          `,
          opacity: opacity * exitOpacity,
          display: "flex",
          flexDirection: namePosition === "above" ? "column-reverse" : "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        <div
          style={{
            width: logoSize,
            height: logoSize,
            borderRadius: showShadow ? Math.round(logoSize * 0.157) : 0,
            overflow: "hidden",
            boxShadow: showShadow
              ? "0 24px 72px rgba(0,0,0,.55), 0 0 0 3px rgba(201,168,76,.35)"
              : "none",
            background: "transparent",
          }}
        >
          <Img
            src={logoUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: showShadow ? 16 : 0,
            }}
          />
        </div>

        {showName && displayName && (
          <div
            style={{
              fontSize: "2.4rem",
              fontWeight: 800,
              color: showBg ? "white" : "#1f2937",
              textShadow: showBg ? "0 2px 24px rgba(0,0,0,.6)" : "none",
              fontFamily: nameFont,
              direction: "rtl",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}
          >
            {displayName}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
