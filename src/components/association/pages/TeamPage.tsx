import { useState } from "react";
import type { Employee } from "../types";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Pencil, Trash2, ChevronRight, ChevronLeft } from "lucide-react";

interface Props {
  employees: Employee[];
  onAdd: () => void;
  onEdit: (employee: Employee) => void;
  onStatusChange: (id: number, status: Employee["status"]) => void;
  onDelete: (id: number) => void;
}

const STATUS_LABEL: Record<Employee["status"], string> = {
  active: "نشط",
  away: "بعيد",
  off: "خارج العمل",
};
const STATUS_STYLE: Record<Employee["status"], React.CSSProperties> = {
  active: { background: "#dcfce7", color: "#166534" },
  away: { background: "#fef9c3", color: "#854d0e" },
  off: { background: "#f1f5f9", color: "#64748b" },
};
const STATUS_DOT: Record<Employee["status"], string> = {
  active: "#22c55e",
  away: "#f59e0b",
  off: "#94a3b8",
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const th: React.CSSProperties = {
  padding: "11px 16px",
  textAlign: "right",
  color: "#6b7280",
  fontWeight: 600,
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  borderBottom: "1px solid rgba(45,122,82,.12)",
  whiteSpace: "nowrap",
  background: "#f9fafb",
};

export default function TeamPage({ employees, onAdd, onEdit, onStatusChange, onDelete }: Props) {
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(employees.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = employees.slice((safePage - 1) * pageSize, safePage * pageSize);

  const activeCount = employees.filter((e) => e.status === "active").length;
  const allOnPage = paginated.length > 0 && paginated.every((e) => selected.has(e.id));
  const someOnPage = paginated.some((e) => selected.has(e.id));

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPage) paginated.forEach((e) => next.delete(e.id));
      else paginated.forEach((e) => next.add(e.id));
      return next;
    });
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    for (const id of selected) onDelete(id);
    setSelected(new Set());
    setConfirmBulk(false);
    setPage(1);
  }

  function handlePageSize(n: number) {
    setPageSize(n);
    setPage(1);
    setSelected(new Set());
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid rgba(45,122,82,.12)",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        fontFamily: "'Tajawal','Cairo',sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(45,122,82,.10)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          background: "linear-gradient(to bottom, #f8fdf9, white)",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "linear-gradient(135deg, #2d7a52, #4a9e70)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Users size={20} color="white" />
        </div>
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}>الفريق</div>
          <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: 1 }}>
            {employees.length} موظف · {activeCount} نشط
          </div>
        </div>

        <div style={{ marginRight: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* Active badge */}
          <span
            style={{
              fontSize: "0.74rem",
              background: "#dcfce7",
              color: "#166534",
              padding: "3px 10px",
              borderRadius: 20,
              fontWeight: 600,
              border: "1px solid #bbf7d0",
            }}
          >
            {activeCount} نشطين
          </span>

          {/* Bulk delete — shown when something is selected */}
          {selected.size > 0 && (
            confirmBulk ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "0.78rem", color: "#ef4444", fontWeight: 600 }}>
                  حذف {selected.size} موظف؟
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                  style={{ fontSize: "0.75rem", height: 32, borderRadius: 8 }}
                >
                  تأكيد
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmBulk(false)}
                  style={{ fontSize: "0.75rem", height: 32, borderRadius: 8 }}
                >
                  إلغاء
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmBulk(true)}
                style={{
                  fontSize: "0.78rem",
                  height: 34,
                  borderRadius: 9,
                  borderColor: "#fca5a5",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Trash2 size={14} />
                حذف المحددين ({selected.size})
              </Button>
            )
          )}

          <Button
            size="sm"
            onClick={onAdd}
            style={{
              background: "linear-gradient(135deg, #2d7a52, #4a9e70)",
              color: "white",
              fontSize: "0.8rem",
              height: 36,
              padding: "0 16px",
              borderRadius: 10,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <UserPlus size={15} />
            إضافة موظف
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {employees.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "56px 0",
            color: "#9ca3af",
            fontSize: "0.9rem",
          }}
        >
          <Users size={40} color="#d1d5db" style={{ margin: "0 auto 12px" }} />
          <div>لا يوجد موظفون بعد</div>
          <div style={{ fontSize: "0.8rem", marginTop: 4 }}>ابدأ بإضافة أحد أفراد الفريق</div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
              <thead>
                <tr>
                  <th style={{ ...th, width: 44, padding: "11px 14px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={allOnPage}
                      ref={(el) => { if (el) el.indeterminate = someOnPage && !allOnPage; }}
                      onChange={toggleAll}
                      style={{ cursor: "pointer", accentColor: "#2d7a52", width: 15, height: 15 }}
                    />
                  </th>
                  <th style={th}>الموظف</th>
                  <th style={th}>المنصب</th>
                  <th style={{ ...th, textAlign: "center" }}>الحالة</th>
                  <th style={{ ...th, textAlign: "center" }}>تغيير الحالة</th>
                  <th style={{ ...th, textAlign: "center", width: 140 }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((emp) => {
                  const isSelected = selected.has(emp.id);
                  const isConfirming = confirmId === emp.id;

                  return (
                    <tr
                      key={emp.id}
                      style={{
                        background: isSelected ? "#f0faf4" : "",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "#f8fdf9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isSelected ? "#f0faf4" : "";
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(0,0,0,.04)", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(emp.id)}
                          style={{ cursor: "pointer", accentColor: "#2d7a52", width: 15, height: 15 }}
                        />
                      </td>

                      {/* Employee name + avatar */}
                      <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: emp.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "white",
                              flexShrink: 0,
                              position: "relative",
                            }}
                          >
                            {emp.name.charAt(0)}
                            <span
                              style={{
                                position: "absolute",
                                bottom: 1,
                                left: 1,
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: STATUS_DOT[emp.status],
                                border: "2px solid white",
                              }}
                            />
                          </div>
                          <span style={{ fontWeight: 600, color: "#111827" }}>{emp.name}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,.04)", color: "#6b7280" }}>
                        {emp.role || "—"}
                      </td>

                      {/* Status badge */}
                      <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,.04)", textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "0.74rem",
                            padding: "4px 12px",
                            borderRadius: 20,
                            fontWeight: 700,
                            ...STATUS_STYLE[emp.status],
                          }}
                        >
                          {STATUS_LABEL[emp.status]}
                        </span>
                      </td>

                      {/* Status selector */}
                      <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,.04)", textAlign: "center" }}>
                        <select
                          value={emp.status}
                          onChange={(e) => onStatusChange(emp.id, e.target.value as Employee["status"])}
                          style={{
                            fontSize: "0.78rem",
                            padding: "5px 10px",
                            borderRadius: 8,
                            border: "1px solid rgba(45,122,82,.2)",
                            fontFamily: "'Tajawal','Cairo',sans-serif",
                            color: "#374151",
                            background: "white",
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option value="active">نشط</option>
                          <option value="away">بعيد</option>
                          <option value="off">خارج العمل</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,.04)", textAlign: "center" }}>
                        {isConfirming ? (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: "0.74rem", color: "#ef4444", fontWeight: 600 }}>تأكيد؟</span>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => { onDelete(emp.id); setConfirmId(null); }}
                              style={{ fontSize: "0.72rem", height: 28, borderRadius: 7 }}
                            >
                              نعم
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmId(null)}
                              style={{ fontSize: "0.72rem", height: 28, borderRadius: 7 }}
                            >
                              لا
                            </Button>
                          </div>
                        ) : (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <button
                              onClick={() => onEdit(emp)}
                              title="تعديل"
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 8,
                                border: "1px solid rgba(45,122,82,.2)",
                                background: "white",
                                color: "#2d7a52",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.15s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0faf4")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setConfirmId(emp.id)}
                              title="حذف"
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 8,
                                border: "1px solid #fca5a5",
                                background: "white",
                                color: "#dc2626",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.15s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid rgba(45,122,82,.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              background: "#fafafa",
            }}
          >
            {/* Left: rows per page + count */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.82rem", color: "#6b7280" }}>
              <span>عدد الصفوف:</span>
              <div style={{ display: "flex", gap: 4 }}>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => handlePageSize(n)}
                    style={{
                      width: 32,
                      height: 28,
                      borderRadius: 6,
                      border: "1px solid",
                      borderColor: pageSize === n ? "#2d7a52" : "rgba(45,122,82,.18)",
                      background: pageSize === n ? "#2d7a52" : "white",
                      color: pageSize === n ? "white" : "#374151",
                      fontSize: "0.78rem",
                      fontWeight: pageSize === n ? 700 : 400,
                      cursor: "pointer",
                      fontFamily: "'Tajawal','Cairo',sans-serif",
                      transition: "all 0.15s",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <span style={{ color: "#9ca3af" }}>|</span>
              <span>
                {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, employees.length)} من {employees.length}
              </span>
            </div>

            {/* Right: page navigation */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 7,
                    border: "1px solid rgba(45,122,82,.18)",
                    background: safePage === 1 ? "#f3f4f6" : "white",
                    color: safePage === 1 ? "#9ca3af" : "#374151",
                    cursor: safePage === 1 ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronRight size={15} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce<(number | "…")[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…" ? (
                      <span key={`el-${i}`} style={{ padding: "0 3px", color: "#9ca3af", fontSize: "0.82rem" }}>…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 7,
                          border: "1px solid",
                          borderColor: safePage === p ? "#2d7a52" : "rgba(45,122,82,.18)",
                          background: safePage === p ? "#2d7a52" : "white",
                          color: safePage === p ? "white" : "#374151",
                          fontSize: "0.82rem",
                          fontWeight: safePage === p ? 700 : 400,
                          cursor: "pointer",
                          fontFamily: "'Tajawal','Cairo',sans-serif",
                          transition: "all 0.15s",
                        }}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 7,
                    border: "1px solid rgba(45,122,82,.18)",
                    background: safePage === totalPages ? "#f3f4f6" : "white",
                    color: safePage === totalPages ? "#9ca3af" : "#374151",
                    cursor: safePage === totalPages ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronLeft size={15} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
