import { TrendingUp, CheckCircle, AlertCircle, Star } from "lucide-react";
import type { ReactNode } from "react";
import type { Donation } from "../../types";

interface StatCard {
  num: string;
  label: string;
  sub: string;
  icon: ReactNode;
  gradient: string;
  borderColor: string;
}

/** The four summary cards shown above the donations table. */
export default function StatsCards({ donations }: { donations: Donation[] }) {
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

  const stats: StatCard[] = [
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
  );
}
