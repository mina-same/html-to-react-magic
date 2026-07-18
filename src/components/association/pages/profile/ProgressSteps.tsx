import { sc, type LogEntry } from "./constants";

interface ProgressStepsProps {
  analyzing: boolean;
  logs: LogEntry[];
}

/**
 * The live "analysis in progress" card — header with a spinner / status icon
 * and a progress bar, plus the step list with per-step status icons.
 */
export default function ProgressSteps({ analyzing, logs }: ProgressStepsProps) {
  if (!analyzing && logs.length === 0) return null;

  const doneCount = logs.filter((l) => l.status === "done").length;
  const hasError = logs.some((l) => l.status === "error");

  return (
    <div style={sc}>
      {/* Header */}
      <div
        style={{
          padding: "13px 18px",
          background: "linear-gradient(135deg,#f0faf5,#e8f5ee)",
          borderBottom: "1px solid rgba(45,122,82,.1)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: ".9rem",
            boxShadow: "0 1px 4px rgba(45,122,82,.12)",
          }}
        >
          {analyzing ? (
            <div
              style={{
                width: 16,
                height: 16,
                border: "2.5px solid rgba(45,122,82,.25)",
                borderTopColor: "#2d7a52",
                borderRadius: "50%",
                animation: "spin .7s linear infinite",
              }}
            />
          ) : hasError ? (
            "⚠️"
          ) : (
            "✦"
          )}
        </div>
        <div>
          <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#111827" }}>
            {analyzing
              ? "جاري التحليل بالذكاء الاصطناعي..."
              : hasError
                ? "حدث خطأ أثناء التحليل"
                : "اكتمل التحليل بنجاح"}
          </div>
          <div style={{ fontSize: ".72rem", color: "#6b7280", marginTop: 1 }}>
            {doneCount} / {logs.length} خطوات مكتملة
          </div>
        </div>
        {/* Progress bar */}
        {logs.length > 0 && (
          <div style={{ flex: 1, marginRight: "auto", marginLeft: 0 }}>
            <div
              style={{
                height: 5,
                background: "rgba(45,122,82,.1)",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 99,
                  background: "linear-gradient(90deg,#2d7a52,#4caf7a)",
                  transition: "width .4s ease",
                  width: `${(doneCount / logs.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
      {/* Steps */}
      <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {logs.map((entry, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Icon */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: ".85rem",
                background:
                  entry.status === "done"
                    ? "#e8f5ee"
                    : entry.status === "error"
                      ? "#fee2e2"
                      : "#f0faf5",
                border: `2px solid ${entry.status === "done" ? "#2d7a52" : entry.status === "error" ? "#dc2626" : "rgba(45,122,82,.25)"}`,
                transition: "all .3s",
              }}
            >
              {entry.status === "done" ? (
                <span style={{ color: "#2d7a52", fontWeight: 700, fontSize: "1rem" }}>✓</span>
              ) : entry.status === "error" ? (
                <span style={{ color: "#dc2626", fontWeight: 700 }}>✕</span>
              ) : (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#2d7a52",
                    display: "inline-block",
                    animation: "blink 1s ease-in-out infinite",
                  }}
                />
              )}
            </div>
            {/* Text */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: ".85rem",
                  fontWeight: entry.status === "pending" ? 600 : 500,
                  color:
                    entry.status === "error"
                      ? "#dc2626"
                      : entry.status === "done"
                        ? "#374151"
                        : "#1a5c3a",
                }}
              >
                {entry.text}
              </div>
              <div style={{ fontSize: ".71rem", color: "#9ca3af", marginTop: 1 }}>{entry.time}</div>
            </div>
            {/* Connector line — all except last */}
            {i < logs.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  right: 34,
                  width: 2,
                  height: 10,
                  background: "rgba(45,122,82,.1)",
                  marginTop: 32,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
