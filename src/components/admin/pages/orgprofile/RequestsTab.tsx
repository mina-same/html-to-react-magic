import { useState } from "react";
import { S, StatusBadge } from "../../helpers";
import type { CampaignRequest } from "../../types";
import { pagSlice } from "./constants";
import { Pager } from "./shared";

export function RequestsTab({ requests }: { requests: CampaignRequest[] }) {
  const [page, setPage] = useState(1);
  const pageData = pagSlice(requests, page);

  return (
    <div style={S.secCard}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["المؤثر", "النوع", "الميزانية", "المدة", "التاريخ", "الرسالة", "الحالة"].map(
              (h, i) => (
                <th key={i} style={S.tblTh}>
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {pageData.map((req) => (
            <tr
              key={req.id}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "")}
            >
              <td style={{ ...S.tblTd, fontWeight: 600 }}>{req.infName}</td>
              <td style={S.tblTd}>{req.type}</td>
              <td style={S.tblTd}>{req.budget.toLocaleString()} ر.س</td>
              <td style={S.tblTd}>{req.duration}</td>
              <td style={S.tblTd}>{req.date}</td>
              <td style={S.tblTd}>
                <div
                  style={{
                    maxWidth: 180,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap" as const,
                    color: "#6b7280",
                    fontSize: ".76rem",
                  }}
                  title={req.message}
                >
                  {req.message || "—"}
                </div>
              </td>
              <td style={S.tblTd}>
                <StatusBadge status={req.status} />
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td
                colSpan={7}
                style={{
                  ...S.tblTd,
                  textAlign: "center",
                  color: "#9ca3af",
                  padding: 40,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                لا توجد طلبات حملات
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pager page={page} total={requests.length} onChange={setPage} />
    </div>
  );
}
