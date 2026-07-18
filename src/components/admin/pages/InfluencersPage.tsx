import { StatusBadge, PlatBadge, S, fmt, infColor } from "../helpers";
import type { Influencer } from "../types";

interface InfluencersPageProps {
  filteredInfs: Influencer[];
  infSearch: string;
  setInfSearch: (val: string) => void;
  infPlatFilter: string;
  setInfPlatFilter: (val: string) => void;
  setInfModal: (data: { open: boolean; data: Partial<Influencer> | null }) => void;
  deleteInf: (id: number) => Promise<void>;
}

export function InfluencersPage({
  filteredInfs,
  infSearch,
  setInfSearch,
  infPlatFilter,
  setInfPlatFilter,
  setInfModal,
  deleteInf,
}: InfluencersPageProps) {
  return (
    <div>
      <div style={S.toolbar}>
        <div style={S.searchBar}>
          <span>🔍</span>
          <input
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "'Tajawal',sans-serif",
              fontSize: ".84rem",
              color: "#111827",
              flex: 1,
              direction: "rtl",
            }}
            placeholder="ابحث عن مؤثر..."
            value={infSearch}
            onChange={(e) => setInfSearch(e.target.value)}
          />
        </div>
        <select
          style={{
            padding: "7px 12px",
            border: "1.5px solid rgba(45,122,82,.12)",
            borderRadius: 8,
            fontFamily: "'Tajawal',sans-serif",
            fontSize: ".82rem",
            color: "#374151",
            background: "white",
            cursor: "pointer",
          }}
          value={infPlatFilter}
          onChange={(e) => setInfPlatFilter(e.target.value)}
        >
          <option value="all">جميع المنصات</option>
          <option>Instagram</option>
          <option>X</option>
          <option>TikTok</option>
          <option>YouTube</option>
          <option>Snapchat</option>
        </select>
        <button
          style={{ ...S.btnPrimary, marginRight: "auto" }}
          onClick={() => setInfModal({ open: true, data: {} })}
        >
          + إضافة مؤثر
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {filteredInfs.map((inf) => (
          <div
            key={inf.id}
            style={{
              background: "white",
              borderRadius: 11,
              border: "1px solid rgba(45,122,82,.12)",
              padding: 15,
              transition: "all .18s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#2d7a52";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 3px 14px rgba(45,122,82,.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(45,122,82,.12)";
              (e.currentTarget as HTMLElement).style.boxShadow = "";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: infColor(inf.id),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "white",
                  flexShrink: 0,
                }}
              >
                {inf.name.slice(0, 1)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#111827" }}>
                  {inf.name}
                </div>
                <div style={{ fontSize: ".72rem", color: "#6b7280", marginTop: 1 }}>
                  {inf.niche}
                </div>
              </div>
              <StatusBadge status={inf.status} />
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
              <PlatBadge platform={inf.platform} />
              <span style={{ fontSize: ".72rem", color: "#9ca3af" }}>
                {inf.price.toLocaleString()} ر.س/حملة
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 5,
                margin: "10px 0",
              }}
            >
              {[
                { num: fmt(inf.followers), lbl: "متابع" },
                { num: `${inf.engagement}%`, lbl: "تفاعل" },
                { num: inf.price.toLocaleString(), lbl: "ر.س" },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "#f2faf6",
                    borderRadius: 7,
                    padding: "6px 4px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: ".82rem", fontWeight: 700, color: "#111827" }}>
                    {s.num}
                  </div>
                  <div style={{ fontSize: ".62rem", color: "#9ca3af", marginTop: 1 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
            {inf.notes && (
              <div
                style={{
                  fontSize: ".72rem",
                  color: "#6b7280",
                  background: "#f2faf6",
                  borderRadius: 6,
                  padding: "5px 9px",
                  marginBottom: 10,
                }}
              >
                {inf.notes}
              </div>
            )}
            <div style={{ display: "flex", gap: 6 }}>
              <button
                style={{ ...S.btnGhost, flex: 1 }}
                onClick={() => setInfModal({ open: true, data: inf })}
              >
                تعديل
              </button>
              <button style={S.btnDanger} onClick={() => deleteInf(inf.id)}>
                حذف
              </button>
            </div>
          </div>
        ))}
        {filteredInfs.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#9ca3af", padding: 48 }}>
            لا توجد نتائج
          </div>
        )}
      </div>
    </div>
  );
}
