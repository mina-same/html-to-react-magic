import { StatusBadge, S } from "../helpers";
import type { Org } from "../types";

interface OrgsPageProps {
  filteredOrgs: Org[];
  orgSearch: string;
  setOrgSearch: (val: string) => void;
  orgStatusFilter: string;
  setOrgStatusFilter: (val: string) => void;
  setOrgModal: (data: { open: boolean; data: Partial<Org> | null }) => void;
  suspendOrg: (id: number) => Promise<void>;
}

export function OrgsPage({
  filteredOrgs,
  orgSearch,
  setOrgSearch,
  orgStatusFilter,
  setOrgStatusFilter,
  setOrgModal,
  suspendOrg,
}: OrgsPageProps) {
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
            placeholder="ابحث عن جمعية..."
            value={orgSearch}
            onChange={(e) => setOrgSearch(e.target.value)}
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
          value={orgStatusFilter}
          onChange={(e) => setOrgStatusFilter(e.target.value)}
        >
          <option value="all">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="new">جديد</option>
          <option value="pending">قيد المراجعة</option>
          <option value="suspended">موقوف</option>
        </select>
        <button
          style={{ ...S.btnPrimary, marginRight: "auto" }}
          onClick={() => setOrgModal({ open: true, data: {} })}
        >
          + إضافة جمعية
        </button>
      </div>
      <div style={S.secCard}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["الجمعية", "الترخيص", "المنطقة", "التواصل", "الحالة", "تاريخ التسجيل", "إجراءات"].map(
                (h, i) => (
                  <th key={i} style={S.tblTh}>
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filteredOrgs.map((o) => (
              <tr
                key={o.id}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f2faf6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <td style={S.tblTd}>
                  <div style={{ fontWeight: 700, color: "#111827" }}>{o.name}</div>
                  {o.notes && (
                    <div style={{ fontSize: ".7rem", color: "#9ca3af", marginTop: 2 }}>
                      {o.notes}
                    </div>
                  )}
                </td>
                <td style={S.tblTd}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: ".8rem",
                      background: "#f0f4f2",
                      padding: "2px 7px",
                      borderRadius: 5,
                    }}
                  >
                    {o.license}
                  </span>
                </td>
                <td style={S.tblTd}>{o.region}</td>
                <td style={S.tblTd}>
                  <div style={{ fontSize: ".78rem" }}>{o.email}</div>
                  <div style={{ fontSize: ".75rem", color: "#9ca3af" }}>{o.phone}</div>
                </td>
                <td style={S.tblTd}>
                  <StatusBadge status={o.status} />
                </td>
                <td style={S.tblTd}>{o.date}</td>
                <td style={S.tblTd}>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button
                      style={S.btnGhost}
                      onClick={() => setOrgModal({ open: true, data: o })}
                    >
                      تعديل
                    </button>
                    <button style={S.btnDanger} onClick={() => suspendOrg(o.id)}>
                      توقيف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrgs.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{ ...S.tblTd, textAlign: "center", color: "#9ca3af", padding: 32 }}
                >
                  لا توجد نتائج
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
