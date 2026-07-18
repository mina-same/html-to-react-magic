import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/common/StateViews";
import { CreditCard, Plus, Download, Upload, FileText } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Donation } from "../../types";
import {
  PAYMENT_METHOD_ICONS,
  MONTHS,
  PAGE_SIZE,
  selStyle,
  TABLE_HEADERS,
  EXPORT_HEADERS,
  formatAmount,
  statusLabel,
} from "./constants";

interface Props {
  donations: Donation[];
  query: UseQueryResult<Donation[], unknown>;
  onCreateClick: () => void;
}

export default function DonationsTable({ donations, query, onCreateClick }: Props) {
  const [filter, setFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);

  const setFilterAndReset = (v: string) => {
    setFilter(v);
    setPage(1);
    setSelected(new Set());
  };
  const setPeriodAndReset = (v: string) => {
    setPeriodFilter(v);
    setPage(1);
    setSelected(new Set());
  };

  const filtered = donations.filter((d) => {
    if (filter === "large" && d.amount < 2500) return false;
    if (filter === "pending" && d.status !== "pending") return false;
    if (filter === "completed" && d.status !== "completed") return false;
    if (periodFilter !== "all") {
      const month = new Date(d.date).getMonth() + 1;
      if (periodFilter === "week") {
        const week = new Date();
        week.setDate(week.getDate() - 7);
        if (new Date(d.date) < week) return false;
      } else if (periodFilter === "month") {
        const mo = new Date();
        mo.setMonth(mo.getMonth() - 1);
        if (new Date(d.date) < mo) return false;
      } else if (periodFilter.startsWith("month-")) {
        if (month !== parseInt(periodFilter.split("-")[1])) return false;
      }
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleExport = () => {
    const rows = filtered.map((d) => [
      d.donationNumber,
      d.name,
      d.phone,
      d.projectName,
      d.amount,
      d.paymentMethod,
      d.bank,
      d.accountNumber,
      statusLabel(d.status),
      d.source,
      d.date,
    ]);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([...EXPORT_HEADERS, ...rows] as (string | number)[][]);
    XLSX.utils.book_append_sheet(wb, ws, "تبرعات");
    XLSX.writeFile(wb, `تبرعات_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const downloadTemplate = () => {
    const example = [
      "21",
      "محمد",
      "",
      "الأجهزة الطبية",
      "50",
      "بطاقة رقمية",
      "",
      "",
      "مكتمل",
      "المتجر",
      "2026-03-25",
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([...EXPORT_HEADERS, example] as string[][]);
    XLSX.utils.book_append_sheet(wb, ws, "نموذج");
    XLSX.writeFile(wb, "نموذج_تبرعات.xlsx");
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        border: "1px solid rgba(45,122,82,.12)",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
      }}
    >
      {/* Toolbar */}
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
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "linear-gradient(135deg, #2d7a52, #4a9e70)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CreditCard size={20} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: "160px" }}>
          <div
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#111827",
              fontFamily: "'Tajawal','Cairo',sans-serif",
            }}
          >
            سجل التبرعات
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "#6b7280",
              marginTop: 2,
              fontFamily: "'Tajawal','Cairo',sans-serif",
            }}
          >
            {filtered.length} تبرعات
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button
            size="sm"
            onClick={onCreateClick}
            style={{
              background: "linear-gradient(135deg, #2d7a52, #4a9e70)",
              color: "white",
              fontSize: "0.8rem",
              padding: "8px 16px",
              borderRadius: 10,
              height: 36,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Plus size={16} />
            تبرع جديد
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            title="تصدير إلى Excel"
            style={{
              fontSize: "0.78rem",
              height: 36,
              padding: "8px 14px",
              borderColor: "#2d7a5230",
              color: "#2d7a52",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderRadius: 10,
            }}
          >
            <Download size={16} />
            تصدير
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => document.getElementById("excel-import")?.click()}
            title="استيراد من Excel"
            style={{
              fontSize: "0.78rem",
              height: 36,
              padding: "8px 14px",
              borderColor: "#2d7a5230",
              color: "#2d7a52",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderRadius: 10,
            }}
          >
            <Upload size={16} />
            استيراد
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={downloadTemplate}
            title="تحميل نموذج Excel"
            style={{
              fontSize: "0.78rem",
              height: 36,
              padding: "8px 14px",
              color: "#6b7280",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderRadius: 10,
            }}
          >
            <FileText size={16} />
            النموذج
          </Button>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <select
            value={periodFilter}
            onChange={(e) => setPeriodAndReset(e.target.value)}
            style={selStyle}
          >
            <option value="all">كل الفترات</option>
            <option value="week">آخر أسبوع</option>
            <option value="month">آخر شهر</option>
            {MONTHS.map((m, i) => (
              <option key={i} value={`month-${i + 1}`}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={filter}
            onChange={(e) => setFilterAndReset(e.target.value)}
            style={selStyle}
          >
            <option value="all">كل التبرعات</option>
            <option value="large">تبرعات كبيرة +2500</option>
            <option value="pending">معلق فقط</option>
            <option value="completed">مكتملة فقط</option>
          </select>
        </div>
      </div>

      <QueryState<Donation[]>
        query={query}
        isEmpty={(data) => data.length === 0}
        emptyTitle="لا توجد تبرعات بعد"
        emptyHint="ابدأ بإضافة تبرع جديد أو استيراد تبرعات من ملف Excel."
        emptyIcon="🤲"
      >
        {() => (
          <>
            <div className="overflow-x-auto">
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.86rem",
                  fontFamily: "'Tajawal','Cairo',sans-serif",
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fdf9" }}>
                    <th
                      style={{
                        padding: "12px 14px",
                        borderBottom: "1px solid rgba(45,122,82,.15)",
                        width: 40,
                        textAlign: "center",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={paginated.length > 0 && paginated.every((d) => selected.has(d.id))}
                        ref={(el) => {
                          if (el)
                            el.indeterminate =
                              paginated.some((d) => selected.has(d.id)) &&
                              !paginated.every((d) => selected.has(d.id));
                        }}
                        onChange={(e) => {
                          setSelected((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) paginated.forEach((d) => next.add(d.id));
                            else paginated.forEach((d) => next.delete(d.id));
                            return next;
                          });
                        }}
                        style={{ cursor: "pointer", accentColor: "#2d7a52" }}
                      />
                    </th>
                    {TABLE_HEADERS.map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 18px",
                          textAlign: "right",
                          color: "#4b5563",
                          fontWeight: 700,
                          borderBottom: "1px solid rgba(45,122,82,.15)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((d) => (
                    <tr
                      key={d.id}
                      style={{
                        transition: "background-color 0.15s ease",
                        background: selected.has(d.id) ? "#f0faf4" : "",
                      }}
                      onMouseEnter={(e) => {
                        if (!selected.has(d.id)) e.currentTarget.style.background = "#f8fdf9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = selected.has(d.id) ? "#f0faf4" : "";
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 14px",
                          borderBottom: "1px solid rgba(0,0,0,.04)",
                          textAlign: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(d.id)}
                          onChange={(e) => {
                            setSelected((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(d.id);
                              else next.delete(d.id);
                              return next;
                            });
                          }}
                          style={{ cursor: "pointer", accentColor: "#2d7a52" }}
                        />
                      </td>
                      <td
                        style={{
                          padding: "12px 18px",
                          borderBottom: "1px solid rgba(0,0,0,.04)",
                          color: "#6b7280",
                        }}
                      >
                        {d.donationNumber || "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 18px",
                          borderBottom: "1px solid rgba(0,0,0,.04)",
                          fontWeight: 700,
                          color: "#374151",
                        }}
                      >
                        {d.name}
                      </td>
                      <td
                        style={{
                          padding: "12px 18px",
                          borderBottom: "1px solid rgba(0,0,0,.04)",
                          color: "#6b7280",
                        }}
                      >
                        {d.phone || "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 18px",
                          borderBottom: "1px solid rgba(0,0,0,.04)",
                          color: "#6b7280",
                        }}
                      >
                        {d.projectName || "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 18px",
                          borderBottom: "1px solid rgba(0,0,0,.04)",
                          fontWeight: 800,
                          color: "#1a5c3a",
                          fontSize: "0.9rem",
                        }}
                      >
                        {formatAmount(d.amount)} ر.س
                      </td>
                      <td
                        style={{
                          padding: "12px 18px",
                          borderBottom: "1px solid rgba(0,0,0,.04)",
                          color: "#374151",
                        }}
                      >
                        <span style={{ fontSize: "0.9rem", marginLeft: 6 }}>
                          {PAYMENT_METHOD_ICONS[d.paymentMethod] ?? ""}
                        </span>
                        {d.paymentMethod}
                      </td>
                      <td
                        style={{ padding: "12px 18px", borderBottom: "1px solid rgba(0,0,0,.04)" }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "0.74rem",
                            padding: "4px 12px",
                            borderRadius: 20,
                            fontWeight: 700,
                            ...(d.status === "completed"
                              ? {
                                  background: "linear-gradient(135deg, #dcfce7, #e8f5ee)",
                                  color: "#166534",
                                }
                              : {
                                  background: "linear-gradient(135deg, #fef9c3, #fef3c7)",
                                  color: "#854d0e",
                                }),
                          }}
                        >
                          {statusLabel(d.status)}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 18px",
                          borderBottom: "1px solid rgba(0,0,0,.04)",
                          color: "#6b7280",
                        }}
                      >
                        {d.source || "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 18px",
                          borderBottom: "1px solid rgba(0,0,0,.04)",
                          color: "#6b7280",
                        }}
                      >
                        {d.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bulk action bar */}
            {selected.size > 0 && (
              <div
                style={{
                  padding: "10px 20px",
                  borderTop: "1px solid rgba(45,122,82,.10)",
                  background: "#f0faf4",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontFamily: "'Tajawal','Cairo',sans-serif",
                  fontSize: "0.85rem",
                }}
              >
                <span style={{ fontWeight: 700, color: "#2d7a52" }}>{selected.size} محدد</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelected(new Set())}
                  style={{ fontSize: "0.78rem", height: 30, borderRadius: 8, color: "#6b7280" }}
                >
                  إلغاء التحديد
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const rows = donations.filter((d) => selected.has(d.id));
                    const headers = [...TABLE_HEADERS];
                    const data = rows.map((d) => [
                      d.donationNumber,
                      d.name,
                      d.phone,
                      d.projectName,
                      d.amount,
                      d.paymentMethod,
                      statusLabel(d.status),
                      d.source,
                      d.date,
                    ]);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(
                      wb,
                      XLSX.utils.aoa_to_sheet([headers, ...data] as (string | number)[][]),
                      "تبرعات",
                    );
                    XLSX.writeFile(wb, `تبرعات_محددة.xlsx`);
                  }}
                  style={{
                    fontSize: "0.78rem",
                    height: 30,
                    borderRadius: 8,
                    color: "#2d7a52",
                    borderColor: "#2d7a5230",
                  }}
                >
                  تصدير المحددة
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  padding: "14px 20px",
                  borderTop: "1px solid rgba(45,122,82,.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontFamily: "'Tajawal','Cairo',sans-serif",
                  fontSize: "0.83rem",
                  color: "#6b7280",
                }}
              >
                <span>
                  عرض {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, filtered.length)} من {filtered.length}
                </span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(45,122,82,.2)",
                      background: safePage === 1 ? "#f3f4f6" : "white",
                      color: safePage === 1 ? "#9ca3af" : "#374151",
                      cursor: safePage === 1 ? "default" : "pointer",
                      fontFamily: "'Tajawal','Cairo',sans-serif",
                      fontSize: "0.83rem",
                    }}
                  >
                    السابق
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
                        <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: "#9ca3af" }}>
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            border: "1px solid",
                            borderColor: safePage === p ? "#2d7a52" : "rgba(45,122,82,.2)",
                            background: safePage === p ? "#2d7a52" : "white",
                            color: safePage === p ? "white" : "#374151",
                            cursor: "pointer",
                            fontFamily: "'Tajawal','Cairo',sans-serif",
                            fontSize: "0.83rem",
                            fontWeight: safePage === p ? 700 : 400,
                          }}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(45,122,82,.2)",
                      background: safePage === totalPages ? "#f3f4f6" : "white",
                      color: safePage === totalPages ? "#9ca3af" : "#374151",
                      cursor: safePage === totalPages ? "default" : "pointer",
                      fontFamily: "'Tajawal','Cairo',sans-serif",
                      fontSize: "0.83rem",
                    }}
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </QueryState>
    </div>
  );
}
