import { useState, useEffect } from "react";
import type { Donation } from "../types";
import { INITIAL_DONATIONS } from "../data";
import { donationsDb } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DonationModal from "../modals/DonationModal";

const CHANNEL_ICONS: Record<string, string> = {
  شيك: "🏦",
  تحويل: "↔️",
  "STC Pay": "📱",
  بطاقة: "💳",
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

export default function DonationsPage({ userId }: { userId?: string }) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!userId) {
      setDonations(INITIAL_DONATIONS);
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

  const sel: React.CSSProperties = {
    padding: "5px 10px",
    borderRadius: 8,
    border: "1px solid rgba(45,122,82,.12)",
    fontFamily: "'Tajawal','Cairo',sans-serif",
    fontSize: ".76rem",
    color: "#374151",
    background: "white",
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
    const headers = ["المتبرع", "المبلغ", "القناة", "التاريخ", "الحالة", "الجهة"];
    const rows = filtered.map((d) => [
      d.name,
      d.amount,
      d.channel,
      d.date,
      d.status === "completed" ? "مكتمل" : "معلق",
      d.org || "",
    ]);

    const csvContent = [
      "\uFEFF" + headers.join(","), // UTF-8 BOM for Excel
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `تبرعات_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      const dataRows = lines.slice(1); // skip header

      let successCount = 0;
      let errorCount = 0;

      for (const line of dataRows) {
        // Simple CSV parse (handles basic cases)
        const parts = line.split(",").map((p) => p.replace(/^"(.*)"$/, "$1").trim());
        if (parts.length < 2) continue;

        const [name, amountStr, channel, date, statusStr, org] = parts;
        const amount = parseFloat(amountStr);
        if (isNaN(amount)) {
          errorCount++;
          continue;
        }

        const status = statusStr === "مكتمل" ? "completed" : "pending";

        const payload: Omit<Donation, "id"> = {
          name,
          amount,
          channel: channel || "تحويل",
          date: date || new Date().toISOString().split("T")[0],
          status,
          org: org || "",
        };

        const created = await donationsDb.create(userId, payload);
        if (created) {
          successCount++;
          setDonations((prev) => [created, ...prev]);
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`تم استيراد ${successCount} تبرعات بنجاح`);
      }
      if (errorCount > 0) {
        toast.error(`فشل استيراد ${errorCount} تبرعات`);
      }

      // Reset input
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = ["المتبرع", "المبلغ", "القناة", "التاريخ", "الحالة", "الجهة"];
    const example = ["أحمد محمد", "1000", "تحويل", "2024-06-07", "مكتمل", "مؤسسة الأمل"];
    const csvContent = "\uFEFF" + headers.join(",") + "\n" + example.join(",");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "نموذج_تبرعات.csv");
    link.click();
  };

  return (
    <div>
      {/* Stats */}
      {loading ? (
        <div
          style={{
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
            fontSize: ".85rem",
          }}
        >
          جاري التحميل...
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            {
              num: totalThisMonth.toLocaleString(),
              label: "تبرعات هذا الشهر (ر.س)",
              sub: `${thisMonthDonations.length} تبرع`,
              numColor: "#1e40af",
              border: "#3b82f6",
              subColor: "#2563eb",
            },
            {
              num: totalCompleted.toLocaleString(),
              label: "إجمالي المحصّل (ر.س)",
              sub: `من ${donations.length} تبرع`,
              numColor: "#1a5c3a",
              border: "#2d7a52",
              subColor: "#059669",
            },
            {
              num: String(pendingCount),
              label: "تبرعات معلقة",
              sub: pendingCount > 0 ? "⚡ تحتاج متابعة" : "✓ لا شيء معلق",
              numColor: "#92400e",
              border: "#f59e0b",
              subColor: "#d97706",
            },
            {
              num: maxDonation.amount.toLocaleString(),
              label: "أعلى تبرع (ر.س)",
              sub: maxDonation.name,
              numColor: "#5b21b6",
              border: "#8b5cf6",
              subColor: "#7c3aed",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: 11,
                border: "1px solid rgba(45,122,82,.12)",
                padding: "13px 15px",
                borderRight: `3px solid ${s.border}`,
              }}
            >
              <div
                style={{ fontSize: "1.45rem", fontWeight: 800, color: s.numColor, lineHeight: 1 }}
              >
                {s.num}
              </div>
              <div style={{ fontSize: ".73rem", color: "#6b7280", marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: ".7rem", fontWeight: 600, color: s.subColor, marginTop: 5 }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div
        style={{
          background: "white",
          borderRadius: 13,
          border: "1px solid rgba(45,122,82,.12)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid rgba(45,122,82,.12)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background: "#e8f5ee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            💳
          </div>
          <div>
            <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>
              سجل التبرعات
            </div>
            <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>
              {filtered.length} تبرعات
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            style={{
              marginRight: 8,
              background: "#2d7a52",
              color: "white",
              fontSize: ".78rem",
              padding: "6px 13px",
              borderRadius: 7,
            }}
          >
            + تبرع جديد
          </Button>

          <div style={{ display: "flex", gap: 5, marginRight: 5 }}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              title="تصدير إلى CSV"
              style={{
                fontSize: ".72rem",
                height: 30,
                padding: "0 10px",
                borderColor: "rgba(45,122,82,.2)",
                color: "#2d7a52",
              }}
            >
              📥 تصدير
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => document.getElementById("csv-import")?.click()}
              title="استيراد من CSV"
              style={{
                fontSize: ".72rem",
                height: 30,
                padding: "0 10px",
                borderColor: "rgba(45,122,82,.2)",
                color: "#2d7a52",
              }}
            >
              📤 استيراد
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={downloadTemplate}
              title="تحميل نموذج CSV"
              style={{
                fontSize: ".72rem",
                height: 30,
                padding: "0 10px",
                color: "#6b7280",
              }}
            >
              📄 النموذج
            </Button>
            <input
              id="csv-import"
              type="file"
              accept=".csv"
              onChange={handleImport}
              style={{ display: "none" }}
            />
          </div>
          <div
            style={{
              marginRight: "auto",
              display: "flex",
              gap: 7,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
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
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={sel}>
              <option value="all">كل التبرعات</option>
              <option value="large">تبرعات كبيرة +2500</option>
              <option value="pending">معلقة فقط</option>
              <option value="completed">مكتملة فقط</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
            <thead>
              <tr>
                {["المتبرع", "المبلغ", "القناة", "التاريخ", "الحالة"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "9px 15px",
                      textAlign: "right",
                      color: "#6b7280",
                      fontWeight: 600,
                      background: "#f2faf6",
                      borderBottom: "1px solid rgba(45,122,82,.12)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  onMouseEnter={(e) =>
                    Array.from(
                      (e.currentTarget as HTMLTableRowElement).querySelectorAll("td"),
                    ).forEach((td: Element) => ((td as HTMLElement).style.background = "#f2faf6"))
                  }
                  onMouseLeave={(e) =>
                    Array.from(
                      (e.currentTarget as HTMLTableRowElement).querySelectorAll("td"),
                    ).forEach((td: Element) => ((td as HTMLElement).style.background = ""))
                  }
                >
                  <td
                    style={{
                      padding: "10px 15px",
                      borderBottom: "1px solid rgba(0,0,0,.04)",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    {d.name}
                    {d.org && (
                      <span style={{ fontSize: ".72rem", color: "#6b7280", marginRight: 6 }}>
                        ({d.org})
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "10px 15px",
                      borderBottom: "1px solid rgba(0,0,0,.04)",
                      fontWeight: 700,
                      color: "#1a5c3a",
                    }}
                  >
                    {d.amount.toLocaleString()} ر.س
                  </td>
                  <td
                    style={{
                      padding: "10px 15px",
                      borderBottom: "1px solid rgba(0,0,0,.04)",
                      color: "#374151",
                    }}
                  >
                    <span style={{ fontSize: ".85rem", marginLeft: 4 }}>
                      {CHANNEL_ICONS[d.channel] ?? ""}
                    </span>
                    {d.channel}
                  </td>
                  <td
                    style={{
                      padding: "10px 15px",
                      borderBottom: "1px solid rgba(0,0,0,.04)",
                      color: "#374151",
                    }}
                  >
                    {d.date}
                  </td>
                  <td style={{ padding: "10px 15px", borderBottom: "1px solid rgba(0,0,0,.04)" }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: ".68rem",
                        padding: "2px 9px",
                        borderRadius: 20,
                        fontWeight: 600,
                        ...(d.status === "completed"
                          ? { background: "#dcfce7", color: "#166534" }
                          : { background: "#fef9c3", color: "#854d0e" }),
                      }}
                    >
                      {d.status === "completed" ? "مكتمل" : "معلق"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DonationModal
        open={createOpen}
        onSave={handleCreateDonation}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
