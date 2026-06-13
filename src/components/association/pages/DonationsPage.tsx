import { useState, useEffect } from "react";
import type { Donation } from "../types";
import { donationsDb } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import DonationModal from "../modals/DonationModal";
import {
  CreditCard,
  Plus,
  Download,
  Upload,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Star,
} from "lucide-react";

const PAYMENT_METHOD_ICONS: Record<string, string> = {
  شيك: "🏦",
  "تحويل بنكي": "↔️",
  "STC Pay": "📱",
  "بطاقة رقمية": "💳",
  "Apple Pay": "🍎",
  نقد: "💵",
};

const MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

// All possible fields we can import
const POSSIBLE_FIELDS = [
  { value: "donationNumber", label: "رقم التبرع" },
  { value: "name", label: "اسم المتبرع" },
  { value: "phone", label: "الجوال" },
  { value: "projectName", label: "اسم المشروع" },
  { value: "amount", label: "قيمة التبرع" },
  { value: "paymentMethod", label: "طريقة الدفع" },
  { value: "bank", label: "البنك" },
  { value: "accountNumber", label: "رقم الحساب" },
  { value: "status", label: "الحالة" },
  { value: "source", label: "مصدر التبرع" },
  { value: "date", label: "وقت التبرع" },
];

export default function DonationsPage({ userId }: { userId?: string }) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importHeaders, setImportHeaders] = useState<string[]>([]);
  const [importMapping, setImportMapping] = useState<Record<string, string>>({});
  const [importData, setImportData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (!userId) {
      setDonations([]);
      setLoading(false);
      return;
    }
    donationsDb.list(userId).then((d) => {
      setDonations(d);
      setLoading(false);
    });
  }, [userId]);

  const [filter, setFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  const setFilterAndReset = (v: string) => { setFilter(v); setPage(1); setSelected(new Set()); };
  const setPeriodAndReset = (v: string) => { setPeriodFilter(v); setPage(1); setSelected(new Set()); };

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

  const sel: React.CSSProperties = {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid rgba(45, 122, 82, 0.15)",
    fontFamily: "'Tajawal','Cairo',sans-serif",
    fontSize: "0.82rem",
    color: "#374151",
    background: "white",
    transition: "all 0.2s ease",
    outline: "none",
  };

  // computed stats
  const now = new Date();
  const thisMonthDonations = donations.filter((d) => {
    const dd = new Date(d.date);
    return dd.getFullYear() === now.getFullYear() && dd.getMonth() === now.getMonth();
  });
  const totalThisMonth = thisMonthDonations.reduce((s, d) => s + d.amount, 0);
  const totalCompleted = donations
    .filter((d) => d.status === "completed")
    .reduce((s, d) => s + d.amount, 0);
  const pendingCount = donations.filter((d) => d.status === "pending").length;
  const maxDonation = donations.reduce(
    (m, d) => (d.amount > m.amount ? d : m),
    donations[0] ?? { amount: 0, name: "—" },
  );

  async function handleCreateDonation(payload: Omit<Donation, "id">) {
    if (!userId) {
      toast.error("يلزم تسجيل الدخول أولاً.");
      return;
    }
    const created = await donationsDb.create(userId, payload);
    if (created) {
      setDonations((prev) => [created, ...prev]);
      toast.success("تمت إضافة التبرع بنجاح");
    } else {
      toast.error("تعذر حفظ التبرع");
    }
  }

  const handleExport = () => {
    const headers = [
      "رقم التبرع",
      "اسم المتبرع",
      "الجوال",
      "اسم المشروع",
      "قيمة التبرع",
      "طريقة الدفع",
      "البنك",
      "رقم الحساب",
      "الحالة",
      "مصدر التبرع",
      "وقت التبرع",
    ];
    const rows = filtered.map((d) => [
      d.donationNumber,
      d.name,
      d.phone,
      d.projectName,
      d.amount,
      d.paymentMethod,
      d.bank,
      d.accountNumber,
      d.status === "completed" ? "مكتمل" : "بانتظار الدفع",
      d.source,
      d.date,
    ]);

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "تبرعات");
    XLSX.writeFile(wb, `تبرعات_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleImportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (jsonData.length === 0) {
          toast.error("الملف فارغ");
          return;
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData
          .slice(1)
          .filter((row) => row.some((cell) => cell !== "" && cell !== null && cell !== undefined));

        setImportFile(file);
        setImportHeaders(headers);
        setImportData(rows);
        
        // Set default mapping: first column to name, second to amount
        const defaultMapping: Record<string, string> = {};
        if (headers.length >= 1) {
          defaultMapping[0] = "name";
        }
        if (headers.length >= 2) {
          defaultMapping[1] = "amount";
        }
        
        // Try to auto-map by header name too
        headers.forEach((header, idx) => {
          const h = header.toString().trim();
          if (h.includes("اسم") || h.includes("متبرع")) defaultMapping[idx] = "name";
          if (h.includes("قيمة") || h.includes("مبلغ") || h.includes("مبلغ")) defaultMapping[idx] = "amount";
          if (h.includes("رقم") && h.includes("تبرع")) defaultMapping[idx] = "donationNumber";
          if (h.includes("جوال") || h.includes("هاتف")) defaultMapping[idx] = "phone";
          if (h.includes("مشروع")) defaultMapping[idx] = "projectName";
          if (h.includes("دفع") || h.includes("طريقة")) defaultMapping[idx] = "paymentMethod";
          if (h.includes("بنك")) defaultMapping[idx] = "bank";
          if (h.includes("حساب")) defaultMapping[idx] = "accountNumber";
          if (h.includes("حالة")) defaultMapping[idx] = "status";
          if (h.includes("مصدر")) defaultMapping[idx] = "source";
          if (h.includes("تاريخ") || h.includes("وقت")) defaultMapping[idx] = "date";
        });
        
        setImportMapping(defaultMapping);
        setImportOpen(true);
      } catch (err) {
        toast.error("تعذر قراءة الملف");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleImport = async () => {
    if (!userId) {
      toast.error("يلزم تسجيل الدخول أولاً.");
      return;
    }
    setImporting(true);

    const requiredFields = ["name", "amount"];
    const hasRequired = requiredFields.every((field) =>
      Object.values(importMapping).includes(field),
    );

    if (!hasRequired) {
      toast.error("يرجى تعيين حقلي اسم المتبرع وقيمة التبرع");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const row of importData) {
      try {
        const payload: Partial<Omit<Donation, "id">> = {};
        for (const [headerIndex, targetField] of Object.entries(importMapping)) {
          const idx = parseInt(headerIndex);
          const value = row[idx];

          if (targetField === "amount") {
            const num = Number(value);
            if (!isNaN(num)) payload.amount = num;
          } else if (targetField === "status") {
            const statusStr = String(value).trim();
            payload.status = statusStr === "مكتمل" ? "completed" : "pending";
          } else if (targetField === "date") {
            if (value instanceof Date) {
              const d = new Date(value);
              d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
              payload.date = d.toISOString().slice(0, 10);
            } else {
              payload.date = String(value ?? "");
            }
          } else {
            (payload as any)[targetField] = String(value ?? "");
          }
        }

        if (!payload.name || !payload.amount || payload.amount <= 0) {
          errorCount++;
          continue;
        }

        // Set defaults
        payload.status = payload.status || "pending";
        payload.paymentMethod = payload.paymentMethod || "نقد";
        payload.date = payload.date || new Date().toISOString().split("T")[0];

        const created = await donationsDb.create(userId, payload as Omit<Donation, "id">);
        if (created) {
          successCount++;
          setDonations((prev) => [created, ...prev]);
        } else {
          errorCount++;
        }
      } catch (err) {
        errorCount++;
      }
    }

    setImporting(false);

    if (successCount > 0) {
      toast.success(`تم استيراد ${successCount} تبرعات بنجاح`);
    }
    if (errorCount > 0) {
      toast.error(`فشل استيراد ${errorCount} تبرعات`);
    }

    setImportOpen(false);
    setImportFile(null);
    setImportHeaders([]);
    setImportMapping({});
    setImportData([]);
  };

  const downloadTemplate = () => {
    const headers = [
      "رقم التبرع",
      "اسم المتبرع",
      "الجوال",
      "اسم المشروع",
      "قيمة التبرع",
      "طريقة الدفع",
      "البنك",
      "رقم الحساب",
      "الحالة",
      "مصدر التبرع",
      "وقت التبرع",
    ];
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
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    XLSX.utils.book_append_sheet(wb, ws, "نموذج");
    XLSX.writeFile(wb, "نموذج_تبرعات.xlsx");
  };

  const stats = [
    {
      num: totalThisMonth.toLocaleString(),
      label: "تبرعات هذا الشهر (ر.س)",
      sub: `${thisMonthDonations.length} تبرع`,
      icon: <TrendingUp size={24} color="#3b82f6" />,
      gradient: "linear-gradient(135deg, #dbeafe, #eff6ff)",
      borderColor: "#3b82f6",
    },
    {
      num: totalCompleted.toLocaleString(),
      label: "إجمالي المحصّل (ر.س)",
      sub: `من ${donations.length} تبرع`,
      icon: <CheckCircle size={24} color="#2d7a52" />,
      gradient: "linear-gradient(135deg, #e8f5ee, #f2faf6)",
      borderColor: "#2d7a52",
    },
    {
      num: String(pendingCount),
      label: "تبرعات معلقة",
      sub: pendingCount > 0 ? "⚡ تحتاج متابعة" : "✓ لا شيء معلق",
      icon: <AlertCircle size={24} color="#f59e0b" />,
      gradient: "linear-gradient(135deg, #fef9c3, #fffbeb)",
      borderColor: "#f59e0b",
    },
    {
      num: maxDonation.amount.toLocaleString(),
      label: "أعلى تبرع (ر.س)",
      sub: maxDonation.name,
      icon: <Star size={24} color="#8b5cf6" />,
      gradient: "linear-gradient(135deg, #f3e8ff, #faf5ff)",
      borderColor: "#8b5cf6",
    },
  ];

  return (
    <div>
      {/* Stats */}
      {loading ? (
        <div
          style={{
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
            fontSize: "0.95rem",
            fontFamily: "'Tajawal','Cairo',sans-serif",
          }}
        >
          جاري التحميل...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                background: s.gradient,
                borderRadius: 16,
                border: `1px solid ${s.borderColor}20`,
                padding: "18px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 8px 24px ${s.borderColor}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                {s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color: s.borderColor,
                    lineHeight: 1.1,
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "#4b5563",
                    marginTop: 6,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    color: s.borderColor,
                    marginTop: 4,
                  }}
                >
                  {s.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div
        style={{
          background: "white",
          borderRadius: 18,
          border: "1px solid rgba(45,122,82,.12)",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        }}
      >
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
              onClick={() => setCreateOpen(true)}
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
            <input
              id="excel-import"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportFileSelect}
              style={{ display: "none" }}
            />
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
              style={sel}
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
              style={sel}
            >
              <option value="all">كل التبرعات</option>
              <option value="large">تبرعات كبيرة +2500</option>
              <option value="pending">معلق فقط</option>
              <option value="completed">مكتملة فقط</option>
            </select>
          </div>
        </div>

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
                      if (el) el.indeterminate = paginated.some((d) => selected.has(d.id)) && !paginated.every((d) => selected.has(d.id));
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
                {[
                  "رقم التبرع",
                  "اسم المتبرع",
                  "الجوال",
                  "اسم المشروع",
                  "قيمة التبرع",
                  "طريقة الدفع",
                  "الحالة",
                  "مصدر التبرع",
                  "وقت التبرع",
                ].map((h) => (
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
                    {d.amount.toLocaleString()} ر.س
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
                  <td style={{ padding: "12px 18px", borderBottom: "1px solid rgba(0,0,0,.04)" }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.74rem",
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontWeight: 700,
                        ...(d.status === "completed"
                          ? {
                              background:
                                "linear-gradient(135deg, #dcfce7, #e8f5ee)",
                              color: "#166534",
                            }
                          : {
                              background:
                                "linear-gradient(135deg, #fef9c3, #fef3c7)",
                              color: "#854d0e",
                            }),
                      }}
                    >
                      {d.status === "completed" ? "مكتمل" : "بانتظار الدفع"}
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
            <span style={{ fontWeight: 700, color: "#2d7a52" }}>
              {selected.size} محدد
            </span>
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
                const headers = ["رقم التبرع","اسم المتبرع","الجوال","اسم المشروع","قيمة التبرع","طريقة الدفع","الحالة","مصدر التبرع","وقت التبرع"];
                const data = rows.map((d) => [d.donationNumber,d.name,d.phone,d.projectName,d.amount,d.paymentMethod,d.status==="completed"?"مكتمل":"بانتظار الدفع",d.source,d.date]);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers,...data]), "تبرعات");
                XLSX.writeFile(wb, `تبرعات_محددة.xlsx`);
              }}
              style={{ fontSize: "0.78rem", height: 30, borderRadius: 8, color: "#2d7a52", borderColor: "#2d7a5230" }}
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
              عرض {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} من {filtered.length}
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
                    <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: "#9ca3af" }}>…</span>
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
                  )
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
      </div>

      <DonationModal
        open={createOpen}
        onSave={handleCreateDonation}
        onClose={() => setCreateOpen(false)}
      />

      {/* Import Mapping Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent
          style={{
            maxWidth: 800,
            width: "95vw",
            fontFamily: "'Tajawal','Cairo',sans-serif",
            direction: "rtl",
            maxHeight: "90vh",
            overflowY: "auto",
            overflowX: "auto",
            borderRadius: 16,
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "'Tajawal','Cairo',sans-serif",
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "#111827",
              }}
            >
              استيراد التبرعات
            </DialogTitle>
          </DialogHeader>
          <div>
            <p
              style={{
                marginBottom: 20,
                color: "#6b7280",
                fontSize: "0.9rem",
                lineHeight: 1.6,
              }}
            >
              قم بتعيين الأعمدة من الملف إلى الحقول المناسبة
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {importHeaders.map((header, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#f9fafb",
                    padding: "10px 14px",
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      minWidth: 160,
                      padding: "8px 12px",
                      background: "white",
                      borderRadius: 8,
                      fontSize: "0.87rem",
                      border: "1px solid #e5e7eb",
                      fontWeight: 600,
                    }}
                  >
                    {header}
                  </div>
                  <span style={{ color: "#9ca3af", fontSize: "1.1rem" }}>→</span>
                  <select
                    value={importMapping[idx] || ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        setImportMapping({ ...importMapping, [idx]: e.target.value });
                      } else {
                        const newMapping = { ...importMapping };
                        delete newMapping[idx];
                        setImportMapping(newMapping);
                      }
                    }}
                    style={{ ...sel, flex: 1 }}
                  >
                    <option value="">تجاهل هذا العمود</option>
                    {POSSIBLE_FIELDS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {importData.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <p
                  style={{
                    marginBottom: 12,
                    color: "#4b5563",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  معاينة البيانات ({importData.length} صف):
                </p>
                <div style={{ overflowX: "auto", background: "#f9fafb", borderRadius: 12 }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.8rem",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f3f4f6" }}>
                        {importHeaders.map((h, i) => (
                          <th
                            key={i}
                            style={{
                              padding: "10px 14px",
                              borderBottom: "1px solid #e5e7eb",
                              color: "#4b5563",
                              whiteSpace: "nowrap",
                              textAlign: "right",
                              fontWeight: 700,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importData.slice(0, 3).map((row, i) => (
                        <tr key={i}>
                          {importHeaders.map((_, j) => (
                            <td
                              key={j}
                              style={{
                                padding: "10px 14px",
                                borderBottom: "1px solid #f3f4f6",
                                color: "#374151",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row[j] instanceof Date ? row[j].toISOString().slice(0, 10) : (row[j] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: 24,
            }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportOpen(false)}
              disabled={importing}
              style={{
                borderRadius: 10,
                borderColor: "#e5e7eb",
                color: "#4b5563",
                fontWeight: 600,
              }}
            >
              إلغاء
            </Button>
            <Button
              size="sm"
              onClick={handleImport}
              disabled={importing}
              style={{
                background: importing
                  ? "linear-gradient(135deg, #6b9e85, #8bbfa0)"
                  : "linear-gradient(135deg, #2d7a52, #4a9e70)",
                color: "white",
                borderRadius: 10,
                fontWeight: 600,
                cursor: importing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {importing && (
                <span
                  className="animate-spin"
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                />
              )}
              {importing ? "جاري الاستيراد..." : `استيراد ${importData.length} تبرعات`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
