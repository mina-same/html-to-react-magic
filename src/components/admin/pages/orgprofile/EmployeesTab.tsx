import { useState } from "react";
import { useMutation, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { toast } from "sonner";
import { S } from "../../helpers";
import { employeesDb } from "@/lib/db";
import { keys } from "@/api/keys";
import { QueryState } from "@/components/common/StateViews";
import type { Employee } from "@/components/association/types";
import { empStatusLabel, PAGE_SIZE, pagSlice } from "./constants";
import { BulkBar, Pager } from "./shared";

export function EmployeesTab({
  orgId,
  employeesQuery,
}: {
  orgId: string;
  employeesQuery: UseQueryResult<Employee[]>;
}) {
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState<Set<number>>(new Set());
  const qc = useQueryClient();

  const deleteMu = useMutation({
    mutationFn: async (ids: number[]) => {
      for (const id of ids) await employeesDb.delete(id);
      return ids;
    },
    onSuccess: (ids) => {
      qc.invalidateQueries({ queryKey: keys.employees(orgId) });
      setSel(new Set());
      toast.success(`تم حذف ${ids.length} موظف`);
    },
    onError: () => toast.error("تعذّر حذف الموظفين"),
  });

  function toggleEmployee(id: number) {
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <QueryState
      query={employeesQuery}
      isEmpty={(d) => d.length === 0}
      emptyTitle="لا يوجد موظفون مسجلون"
      emptyIcon="👥"
    >
      {(employees) => {
        const pageData = pagSlice(employees, page);
        const allPageSel = pageData.length > 0 && pageData.every((e) => sel.has(e.id));
        return (
          <div>
            <BulkBar
              count={sel.size}
              label="موظف"
              onDelete={() => deleteMu.mutate([...sel])}
              onClear={() => setSel(new Set())}
            />
            <div style={S.secCard}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ ...S.tblTh, width: 40, textAlign: "center" as const }}>
                      <input
                        type="checkbox"
                        checked={allPageSel}
                        style={{ cursor: "pointer" }}
                        onChange={() => {
                          setSel((prev) => {
                            const next = new Set(prev);
                            pageData.forEach((e) =>
                              allPageSel ? next.delete(e.id) : next.add(e.id),
                            );
                            return next;
                          });
                        }}
                      />
                    </th>
                    {["الاسم", "الدور", "الحالة"].map((h, i) => (
                      <th key={i} style={S.tblTh}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((emp) => {
                    const st = empStatusLabel(emp.status);
                    return (
                      <tr
                        key={emp.id}
                        style={{
                          background: sel.has(emp.id) ? "#f0fdf4" : undefined,
                        }}
                        onMouseEnter={(e) => {
                          if (!sel.has(emp.id)) e.currentTarget.style.background = "#f9fafb";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = sel.has(emp.id) ? "#f0fdf4" : "";
                        }}
                      >
                        <td style={{ ...S.tblTd, textAlign: "center" as const }}>
                          <input
                            type="checkbox"
                            checked={sel.has(emp.id)}
                            style={{ cursor: "pointer" }}
                            onChange={() => toggleEmployee(emp.id)}
                          />
                        </td>
                        <td style={S.tblTd}>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                background: emp.color || "#2d7a52",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: ".75rem",
                                color: "white",
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {emp.name.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600, color: "#111827" }}>{emp.name}</span>
                          </div>
                        </td>
                        <td style={S.tblTd}>{emp.role}</td>
                        <td style={S.tblTd}>
                          <span
                            style={{
                              background: st.bg,
                              color: st.color,
                              fontSize: ".68rem",
                              padding: "2px 9px",
                              borderRadius: 20,
                              fontWeight: 600,
                            }}
                          >
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Pager page={page} total={employees.length} onChange={setPage} />
            </div>
            {employees.length > PAGE_SIZE && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <button
                  style={{ ...S.btnGhost, fontSize: ".74rem" }}
                  onClick={() => setSel(new Set(employees.map((e) => e.id)))}
                >
                  تحديد الكل ({employees.length})
                </button>
                {sel.size > 0 && (
                  <button
                    style={{ ...S.btnGhost, fontSize: ".74rem" }}
                    onClick={() => setSel(new Set())}
                  >
                    إلغاء تحديد الكل
                  </button>
                )}
              </div>
            )}
          </div>
        );
      }}
    </QueryState>
  );
}
