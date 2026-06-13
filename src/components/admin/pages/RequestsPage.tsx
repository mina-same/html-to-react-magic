import { StatusBadge, S } from "../helpers";
import type { CampaignRequest } from "../types";
import { toast } from "sonner";

interface RequestsPageProps {
  filteredReqs: CampaignRequest[];
  reqStatusFilter: string;
  setReqStatusFilter: (val: string) => void;
  setReqModal: (data: { open: boolean; data: Partial<CampaignRequest> | null }) => void;
  saveReq: (req: CampaignRequest) => Promise<void>;
  rejectReq: (id: number) => Promise<void>;
}

export function RequestsPage({
  filteredReqs,
  reqStatusFilter,
  setReqStatusFilter,
  setReqModal,
  saveReq,
  rejectReq,
}: RequestsPageProps) {
  return (
    <div>
      <div style={S.toolbar}>
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
          value={reqStatusFilter}
          onChange={(e) => setReqStatusFilter(e.target.value)}
        >
          <option value="all">جميع الحالات</option>
          <option value="pending">معلق</option>
          <option value="approved">مقبول</option>
          <option value="completed">مكتمل</option>
          <option value="rejected">مرفوض</option>
        </select>
      </div>
      <div style={S.secCard}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {[
                "#",
                "الجمعية",
                "المؤثر",
                "النوع",
                "الميزانية",
                "المدة",
                "التاريخ",
                "الحالة",
                "إجراءات",
              ].map((h, i) => (
                <th key={i} style={S.tblTh}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredReqs.map((r) => (
              <tr
                key={r.id}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f2faf6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <td style={{ ...S.tblTd, color: "#9ca3af" }}>#{r.id}</td>
                <td style={S.tblTd}>{r.orgName}</td>
                <td style={S.tblTd}>{r.infName}</td>
                <td style={S.tblTd}>{r.type}</td>
                <td style={S.tblTd}>{r.budget.toLocaleString()} ر.س</td>
                <td style={S.tblTd}>{r.duration}</td>
                <td style={S.tblTd}>{r.date}</td>
                <td style={S.tblTd}>
                  <StatusBadge status={r.status} />
                </td>
                <td style={S.tblTd}>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button style={S.btnGhost} onClick={() => setReqModal({ open: true, data: r })}>
                      عرض
                    </button>
                    {r.status === "pending" && (
                      <>
                        <button
                          style={{ ...S.btnPrimary, fontSize: ".72rem", padding: "5px 10px" }}
                          onClick={() => {
                            saveReq({ ...r, status: "approved" });
                            toast.success("✅ تم قبول الطلب");
                          }}
                        >
                          قبول
                        </button>
                        <button style={S.btnDanger} onClick={() => rejectReq(r.id)}>
                          رفض
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredReqs.length === 0 && (
              <tr>
                <td
                  colSpan={9}
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
