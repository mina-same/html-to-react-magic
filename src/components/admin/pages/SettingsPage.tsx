import { S } from "../helpers";

export function SettingsPage() {
  return (
    <div style={S.secCard}>
      <div style={S.secHead}>
        <div
          style={{
            width: 29,
            height: 29,
            borderRadius: 7,
            background: "#e8f5ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: ".9rem",
          }}
        >
          ⚙
        </div>
        <div>
          <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#111827" }}>إعدادات المنصة</div>
          <div style={{ fontSize: ".74rem", color: "#6b7280", marginTop: 1 }}>الإعدادات العامة للمنصة</div>
        </div>
      </div>
      <div style={{ ...S.secBody, textAlign: "center", padding: 64, color: "#9ca3af" }}>
        <div style={{ fontSize: "2rem", marginBottom: 12 }}>⚙️</div>
        <div style={{ fontWeight: 600 }}>الإعدادات قيد التطوير</div>
        <div style={{ fontSize: ".8rem", marginTop: 6 }}>ستتوفر هذه الصفحة قريباً</div>
      </div>
    </div>
  );
}
