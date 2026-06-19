import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface ContentVideoProps {
  text: string;
  assocName: string;
  assocInitial?: string;
  imageUrl?: string;
}

// How many characters visible by frame in the "write-on" phase
function charsAt(frame: number, startFrame: number, text: string): string {
  const rate = 4; // chars per frame
  const count = Math.max(0, (frame - startFrame) * rate);
  return text.slice(0, count);
}

export function ContentVideo({
  text,
  assocName,
  assocInitial = "ج",
  imageUrl,
}: ContentVideoProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const titleFade = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const contentFade = interpolate(frame, [60, 90], [0, 1], { extrapolateRight: "clamp" });
  const globalExit = interpolate(
    frame,
    [durationInFrames - 25, durationInFrames - 5],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const visibleText = charsAt(frame, 90, text);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0f3d26 0%, #1a5c3a 55%, #0d3322 100%)",
        fontFamily: "'Tajawal','Cairo',sans-serif",
        direction: "rtl",
        opacity: globalExit,
      }}
    >
      {/* Background image with overlay */}
      {imageUrl && (
        <AbsoluteFill>
          <Img
            src={imageUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.25 }}
          />
        </AbsoluteFill>
      )}

      {/* Decorative gold bar at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background: "linear-gradient(90deg, #c9a84c, #e8c96e, #c9a84c)",
          opacity: titleFade,
        }}
      />

      {/* Main content */}
      <AbsoluteFill style={{ padding: "80px 70px", display: "flex", flexDirection: "column" }}>
        {/* Association header */}
        <div
          style={{
            opacity: titleFade,
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 50,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg,#c9a84c,#e8c96e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              fontWeight: 800,
              color: "#1a5c3a",
              flexShrink: 0,
            }}
          >
            {assocInitial}
          </div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>
              {assocName}
            </div>
            <div
              style={{
                fontSize: ".85rem",
                color: "rgba(201,168,76,.7)",
                letterSpacing: "0.18em",
                marginTop: 4,
              }}
            >
              ساعِد · SAAID PLATFORM
            </div>
          </div>
        </div>

        {/* Separator */}
        <div
          style={{
            width: 60,
            height: 3,
            background: "#c9a84c",
            borderRadius: 2,
            marginBottom: 40,
            opacity: titleFade,
          }}
        />

        {/* Script text */}
        <div
          style={{
            opacity: contentFade,
            flex: 1,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: "1.45rem",
              lineHeight: 2.1,
              color: "rgba(255,255,255,0.93)",
              fontWeight: 500,
              whiteSpace: "pre-wrap",
              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            {visibleText}
          </div>
        </div>

        {/* Bottom watermark */}
        <div
          style={{
            opacity: titleFade,
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 30,
            paddingTop: 24,
            borderTop: "1px solid rgba(201,168,76,.2)",
          }}
        >
          <div
            style={{ width: 8, height: 8, borderRadius: "50%", background: "#c9a84c" }}
          />
          <div style={{ fontSize: ".9rem", color: "rgba(255,255,255,.4)", letterSpacing: "0.1em" }}>
            محتوى تسويقي احترافي
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
