import { useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { S, StatusBadge } from "../../helpers";
import { QueryState } from "@/components/common/StateViews";
import type { Donation } from "@/components/association/types";
import { pagSlice } from "./constants";
import { Pager } from "./shared";

export function DonationsTab({ donationsQuery }: { donationsQuery: UseQueryResult<Donation[]> }) {
  const [page, setPage] = useState(1);

  return (
    <QueryState
      query={donationsQuery}
      isEmpty={(d) => d.length === 0}
      emptyTitle="لا توجد تبرعات مسجلة"
      emptyIcon="💰"
    >
      {(donations) => {
        const pageData = pagSlice(donations, page);
        return (
          <div style={S.secCard}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "رقم التبرع",
                    "المتبرع",
                    "المشروع",
                    "المبلغ",
                    "طريقة الدفع",
                    "التاريخ",
                    "الحالة",
                  ].map((h, i) => (
                    <th key={i} style={S.tblTh}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((don) => (
                  <tr
                    key={don.id}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td style={S.tblTd}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: ".76rem",
                          background: "#f0f4f2",
                          padding: "2px 7px",
                          borderRadius: 5,
                        }}
                      >
                        {don.donationNumber || "—"}
                      </span>
                    </td>
                    <td style={{ ...S.tblTd, fontWeight: 600, color: "#111827" }}>{don.name}</td>
                    <td style={S.tblTd}>{don.projectName || "—"}</td>
                    <td style={{ ...S.tblTd, fontWeight: 700, color: "#2d7a52" }} dir="ltr">
                      {don.amount.toLocaleString()} ر.س
                    </td>
                    <td style={S.tblTd}>{don.paymentMethod}</td>
                    <td style={S.tblTd}>{don.date}</td>
                    <td style={S.tblTd}>
                      <StatusBadge status={don.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {donations.length > 0 && (
              <div
                style={{
                  padding: "10px 16px",
                  borderTop: "1px solid rgba(45,122,82,.08)",
                  display: "flex",
                  gap: 24,
                  background: "#f2faf6",
                }}
              >
                <div style={{ fontSize: ".78rem", color: "#6b7280" }}>
                  إجمالي التبرعات:{" "}
                  <strong style={{ color: "#2d7a52" }}>
                    {donations.reduce((s, d) => s + d.amount, 0).toLocaleString()} ر.س
                  </strong>
                </div>
                <div style={{ fontSize: ".78rem", color: "#6b7280" }}>
                  مكتملة:{" "}
                  <strong style={{ color: "#166534" }}>
                    {donations.filter((d) => d.status === "completed").length}
                  </strong>
                </div>
                <div style={{ fontSize: ".78rem", color: "#6b7280" }}>
                  معلّقة:{" "}
                  <strong style={{ color: "#92400e" }}>
                    {donations.filter((d) => d.status === "pending").length}
                  </strong>
                </div>
              </div>
            )}
            <Pager page={page} total={donations.length} onChange={setPage} />
          </div>
        );
      }}
    </QueryState>
  );
}
