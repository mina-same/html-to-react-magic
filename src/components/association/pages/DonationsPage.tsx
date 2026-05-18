import { useState } from "react";
import type { Donation } from "../types";
import { INITIAL_DONATIONS } from "../data";

const CHANNEL_ICONS: Record<string, string> = { شيك: "🏦", تحويل: "↔️", "STC Pay": "📱", بطاقة: "💳", "Apple Pay": "🍎", نقد: "💵" };

const MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

export default function DonationsPage() {
  const [donations] = useState<Donation[]>(INITIAL_DONATIONS);
  const [filter,       setFilter]       = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  const filtered = donations.filter(d => {
    if (filter === "large"     && d.amount < 2500)             return false;
    if (filter === "pending"   && d.status !== "pending")       return false;
    if (filter === "completed" && d.status !== "completed")     return false;
    if (periodFilter !== "all") {
      const month = new Date(d.date).getMonth() + 1;
      if (periodFilter === "week") {
        const week = new Date(); week.setDate(week.getDate() - 7);
        if (new Date(d.date) < week) return false;
      } else if (periodFilter === "month") {
        const mo = new Date(); mo.setMonth(mo.getMonth() - 1);
        if (new Date(d.date) < mo) return false;
      } else if (periodFilter.startsWith("month-")) {
        if (month !== parseInt(periodFilter.split("-")[1])) return false;
      }
    }
    return true;
  });

  const sel: React.CSSProperties = { padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(45,122,82,.12)", fontFamily: "'Tajawal','Cairo',sans-serif", fontSize: ".76rem", color: "#374151", background: "white" };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { num: "48,500", label: "تبرعات هذا الشهر (ر.س)", sub: "↑ 18% عن السابق", numColor: "#1e40af", border: "#3b82f6", subColor: "#2563eb" },
          { num: "134",    label: "متبرع نشط",               sub: "↑ 22 جديد هذا الشهر", numColor: "#1a5c3a", border: "#2d7a52", subColor: "#059669" },
          { num: "2",      label: "تبرعات معلقة",             sub: "⚡ تحتاج متابعة",      numColor: "#92400e", border: "#f59e0b", subColor: "#d97706" },
          { num: "20,000", label: "أعلى تبرع (ر.س)",         sub: "شيك — مؤسسة الأمل",    numColor: "#5b21b6", border: "#8b5cf6", subColor: "#7c3aed" },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", borderRadius: 11, border: "1px solid rgba(45,122,82,.12)", padding: "13px 15px", borderRight: `3px solid ${s.border}` }}>
            <div style={{ fontSize: "1.45rem", fontWeight: 800, color: s.numColor, lineHeight: 1 }}>{s.num}</div>
            <div style={{ fontSize: ".73rem", color: "#6b7280", marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: ".7rem", fontWeight: 600, color: s.subColor, marginTop: 5 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 13, border: "1px solid rgba(45,122,82,.12)", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(45,122,82,.12)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center" }}>💳</div>
          <div>
            <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>سجل التبرعات</div>
            <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>{filtered.length} تبرعات</div>
          </div>
          <div style={{ marginRight: "auto", display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
            <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} style={sel}>
              <option value="all">كل الفترات</option>
              <option value="week">آخر أسبوع</option>
              <option value="month">آخر شهر</option>
              {MONTHS.map((m, i) => <option key={i} value={`month-${i+1}`}>{m}</option>)}
            </select>
            <select value={filter} onChange={e => setFilter(e.target.value)} style={sel}>
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
                {["المتبرع","المبلغ","القناة","التاريخ","الحالة"].map(h => (
                  <th key={h} style={{ padding: "9px 15px", textAlign: "right", color: "#6b7280", fontWeight: 600, background: "#f2faf6", borderBottom: "1px solid rgba(45,122,82,.12)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}
                  onMouseEnter={e => Array.from((e.currentTarget as HTMLTableRowElement).querySelectorAll("td")).forEach((td: Element) => (td as HTMLElement).style.background = "#f2faf6")}
                  onMouseLeave={e => Array.from((e.currentTarget as HTMLTableRowElement).querySelectorAll("td")).forEach((td: Element) => (td as HTMLElement).style.background = "")}>
                  <td style={{ padding: "10px 15px", borderBottom: "1px solid rgba(0,0,0,.04)", fontWeight: 600, color: "#374151" }}>{d.name}{d.org && <span style={{ fontSize: ".72rem", color: "#6b7280", marginRight: 6 }}>({d.org})</span>}</td>
                  <td style={{ padding: "10px 15px", borderBottom: "1px solid rgba(0,0,0,.04)", fontWeight: 700, color: "#1a5c3a" }}>{d.amount.toLocaleString()} ر.س</td>
                  <td style={{ padding: "10px 15px", borderBottom: "1px solid rgba(0,0,0,.04)", color: "#374151" }}><span style={{ fontSize: ".85rem", marginLeft: 4 }}>{CHANNEL_ICONS[d.channel] ?? ""}</span>{d.channel}</td>
                  <td style={{ padding: "10px 15px", borderBottom: "1px solid rgba(0,0,0,.04)", color: "#374151" }}>{d.date}</td>
                  <td style={{ padding: "10px 15px", borderBottom: "1px solid rgba(0,0,0,.04)" }}>
                    <span style={{ display: "inline-block", fontSize: ".68rem", padding: "2px 9px", borderRadius: 20, fontWeight: 600, ...(d.status === "completed" ? { background: "#dcfce7", color: "#166534" } : { background: "#fef9c3", color: "#854d0e" }) }}>
                      {d.status === "completed" ? "مكتمل" : "معلق"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
