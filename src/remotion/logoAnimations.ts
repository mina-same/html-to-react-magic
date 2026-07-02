import { interpolate, spring } from "remotion";

export type LogoAnimation =
  | "bounce"
  | "flyRight"
  | "flyLeft"
  | "flyTop"
  | "fadeScale"
  | "spin";

export type LogoPosition =
  | "topLeft"
  | "topRight"
  | "center"
  | "bottomLeft"
  | "bottomRight";

export interface LogoTransform {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
}

export function getLogoTransform(
  animation: LogoAnimation,
  frame: number,
  fps: number,
): LogoTransform {
  switch (animation) {
    case "bounce": {
      const scale = spring({ frame, fps, config: { damping: 5, stiffness: 200, mass: 0.5 } });
      return { x: 0, y: 0, scale, rotate: 0, opacity: 1 };
    }
    case "flyRight": {
      const spr = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });
      return { x: interpolate(spr, [0, 1], [700, 0]), y: 0, scale: 1, rotate: 0, opacity: 1 };
    }
    case "flyLeft": {
      const spr = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });
      return { x: interpolate(spr, [0, 1], [-700, 0]), y: 0, scale: 1, rotate: 0, opacity: 1 };
    }
    case "flyTop": {
      const spr = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });
      return { x: 0, y: interpolate(spr, [0, 1], [-700, 0]), scale: 1, rotate: 0, opacity: 1 };
    }
    case "fadeScale": {
      const scale   = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
      const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
      return { x: 0, y: 0, scale, rotate: 0, opacity };
    }
    case "spin": {
      const spr    = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });
      const rotate = interpolate(spr, [0, 1], [360, 0]);
      const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
      return { x: 0, y: 0, scale: 1, rotate, opacity };
    }
    default:
      return { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 };
  }
}

export const ANIMATION_LABELS: Record<LogoAnimation, string> = {
  bounce:    "قفز",
  flyRight:  "من اليسار",
  flyLeft:   "من اليمين",
  flyTop:    "من الأعلى",
  fadeScale: "تلاشي وكبر",
  spin:      "دوران",
};

export const POSITION_OFFSETS: Record<LogoPosition, { top?: number | string; bottom?: number | string; left?: number | string; right?: number | string }> = {
  topLeft:     { top: 30,   left: 30 },
  topRight:    { top: 30,   right: 30 },
  center:      { top: "50%", left: "50%" },
  bottomLeft:  { bottom: 30, left: 30 },
  bottomRight: { bottom: 30, right: 30 },
};
