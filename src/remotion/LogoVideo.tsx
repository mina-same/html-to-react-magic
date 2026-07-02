import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getLogoTransform, type LogoAnimation } from "./logoAnimations";

export interface LogoVideoProps {
  logoUrl: string;
  animation?: LogoAnimation;
  assocName?: string;
  bgColor?: string;
}

export function LogoVideo({
  logoUrl,
  animation = "bounce",
  assocName,
  bgColor = "#0f3d26",
}: LogoVideoProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const { x, y, scale, rotate, opacity } = getLogoTransform(animation, frame, fps);

  // gentle idle float after spring settles (~frame 60+)
  const idleOffset = interpolate(Math.sin(frame * 0.05), [-1, 1], [-8, 8]);
  const idleRotate = interpolate(Math.sin(frame * 0.04), [-1, 1], [-2, 2]);

  // global exit fade last 20 frames
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ring pulse
  const ring1 = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 20, stiffness: 60 } });
  const ring2 = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 20, stiffness: 50 } });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${bgColor} 0%, #1a5c3a 55%, #0d3322 100%)`,
        opacity: exitOpacity,
        overflow: "hidden",
      }}
    >
      {/* decorative rings that expand on entry */}
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
            pointerEvents: "none",
          }}
        />
      ))}

      {/* golden glow */}
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
          pointerEvents: "none",
        }}
      />

      {/* logo + name */}
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
          opacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: 44,
            overflow: "hidden",
            boxShadow: "0 24px 72px rgba(0,0,0,.55), 0 0 0 3px rgba(201,168,76,.35)",
            background: "rgba(255,255,255,.04)",
          }}
        >
          <Img
            src={logoUrl}
            style={{ width: "100%", height: "100%", objectFit: "contain", padding: 16 }}
          />
        </div>

        {assocName && (
          <div
            style={{
              fontSize: "2.4rem",
              fontWeight: 800,
              color: "white",
              textShadow: "0 2px 24px rgba(0,0,0,.6)",
              fontFamily: "'Tajawal','Cairo',sans-serif",
              direction: "rtl",
              letterSpacing: "-0.01em",
            }}
          >
            {assocName}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
