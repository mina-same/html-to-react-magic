interface Props {
  assocName: string;
  onNameChange: (name: string) => void;
  onLogout: () => void;
}

export default function SettingsPage({ assocName, onNameChange, onLogout }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Profile settings */}
      <div style={{ background: "white", borderRadius: 13, border: "1px solid rgba(45,122,82,.12)", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(45,122,82,.12)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center" }}>⚙️</div>
          <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>إعدادات الجمعية</div>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: ".78rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>اسم الجمعية</label>
            <input
              value={assocName}
              onChange={e => onNameChange(e.target.value)}
              placeholder="أدخل اسم جمعيتك"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(45,122,82,.2)", fontSize: ".84rem", fontFamily: "'Tajawal','Cairo',sans-serif", color: "#374151", outline: "none", background: "white", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: ".78rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>البريد الإلكتروني</label>
            <input
              placeholder="example@assoc.org"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(45,122,82,.2)", fontSize: ".84rem", fontFamily: "'Tajawal','Cairo',sans-serif", color: "#374151", outline: "none", background: "#f9fafb", boxSizing: "border-box" }}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div style={{ background: "white", borderRadius: 13, border: "1px solid rgba(45,122,82,.12)", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(45,122,82,.12)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center" }}>🔔</div>
          <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>الإشعارات</div>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "إشعارات التبرعات الجديدة", on: true },
            { label: "تذكير المهام المتأخرة", on: true },
            { label: "تقارير الأداء الأسبوعية", on: false },
          ].map(n => (
            <div key={n.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: ".83rem", color: "#374151" }}>{n.label}</span>
              <div style={{ width: 36, height: 20, borderRadius: 10, background: n.on ? "#2d7a52" : "#e5e7eb", position: "relative", cursor: "pointer", flexShrink: 0 }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "white", position: "absolute", top: 2, transition: "left .2s", left: n.on ? 18 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ background: "white", borderRadius: 13, border: "1px solid rgba(239,68,68,.15)", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(239,68,68,.1)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#991b1b" }}>تسجيل الخروج</div>
        </div>
        <div style={{ padding: 16 }}>
          <button onClick={onLogout}
            style={{ fontSize: ".82rem", padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(239,68,68,.25)", background: "#fef2f2", color: "#b91c1c", fontFamily: "'Tajawal','Cairo',sans-serif", cursor: "pointer", fontWeight: 600 }}>
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
}
