import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  CheckSquare,
  Users,
  CreditCard,
  Megaphone,
  Landmark,
  BarChart3,
  PieChartIcon,
  TrendingDown,
  ClipboardList,
  Rocket,
  ArrowLeft,
} from "lucide-react";
import type { PageId } from "../types";
import type { Task, Employee, Campaign, Donation } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { cn } from "@/lib/utils";

interface Props {
  assocName: string;
  statContent: number;
  tasks: Task[];
  employees: Employee[];
  campaigns: Campaign[];
  donations: Donation[];
  onNavigate: (page: PageId) => void;
}

const STATUS_LABEL: Record<Task["status"], string> = {
  todo: "لم يبدأ",
  doing: "جارٍ",
  review: "مراجعة",
  done: "منتهي",
};
const STATUS_CLASS: Record<Task["status"], string> = {
  todo: "bg-gray-100 text-gray-600",
  doing: "bg-blue-50 text-blue-600",
  review: "bg-amber-50 text-amber-600",
  done: "bg-emerald-50 text-emerald-700",
};
const URGENCY_DOT: Record<Task["urgency"], string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  normal: "bg-gray-400",
  low: "bg-gray-300",
};
const CHANNEL_ICON: Record<string, string> = {
  شيك: "🏦",
  تحويل: "↔️",
  "STC Pay": "📱",
  بطاقة: "💳",
  "Apple Pay": "🍎",
  نقد: "💵",
};

function getDonationMonth(date: string) {
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : `${d.getFullYear()}-${d.getMonth()}`;
}

function SectionCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  sub,
  action,
  onAction,
  children,
}: {
  icon: typeof CheckSquare;
  iconBg?: string;
  iconColor?: string;
  title: string;
  sub?: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b py-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg",
              iconBg ?? "bg-secondary",
              iconColor ?? "text-primary",
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm">{title}</CardTitle>
            {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
          </div>
        </div>
        {action && (
          <Button variant="link" size="sm" className="h-auto gap-1 p-0 text-xs" onClick={onAction}>
            {action}
            <ArrowLeft className="h-3 w-3" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

export default function OverviewPage({
  assocName,
  tasks,
  employees,
  campaigns,
  donations,
  onNavigate,
}: Props) {
  const now = new Date();
  const nowMonthKey = `${now.getFullYear()}-${now.getMonth()}`;

  // Task stats
  const pendingTasks = tasks.filter((t) => t.status !== "done").length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  // Team stats
  const teamSize = employees.length;
  const activeCount = employees.filter((e) => e.status === "active").length;

  // Campaign stats
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  // Donation stats
  const thisMonthDonations = donations.filter((d) => getDonationMonth(d.date) === nowMonthKey);
  const totalThisMonth = thisMonthDonations.reduce((s, d) => s + d.amount, 0);
  const totalCollected = donations
    .filter((d) => d.status === "completed")
    .reduce((s, d) => s + d.amount, 0);
  const pendingDonations = donations.filter((d) => d.status === "pending").length;
  const lastMonthDonations = donations.filter((d) => {
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const key = `${lm.getFullYear()}-${lm.getMonth()}`;
    return getDonationMonth(d.date) === key;
  });
  const lastMonthTotal = lastMonthDonations.reduce((s, d) => s + d.amount, 0);
  const donationTrend =
    lastMonthTotal > 0 ? Math.round(((totalThisMonth - lastMonthTotal) / lastMonthTotal) * 100) : 0;

  const recentTasks = [...tasks]
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      const urgOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      return urgOrder[a.urgency] - urgOrder[b.urgency];
    })
    .slice(0, 4);

  // Chart: last 6 months donations
  const ARABIC_MONTHS = [
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
  const donationChartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const total = donations
      .filter((dn) => getDonationMonth(dn.date) === key && dn.status === "completed")
      .reduce((s, dn) => s + dn.amount, 0);
    return { month: ARABIC_MONTHS[d.getMonth()], total };
  });

  // Chart: tasks by status
  const taskStatusData = [
    { name: "لم يبدأ", value: tasks.filter((t) => t.status === "todo").length, color: "var(--muted-foreground)" },
    { name: "جارٍ", value: tasks.filter((t) => t.status === "doing").length, color: "#3b82f6" },
    { name: "مراجعة", value: tasks.filter((t) => t.status === "review").length, color: "var(--gold)" },
    { name: "منتهي", value: tasks.filter((t) => t.status === "done").length, color: "var(--green-light)" },
  ].filter((d) => d.value > 0);

  const recentDonations = [...donations].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  const kpis = [
    {
      value: pendingTasks || "—",
      label: "مهام قيد التنفيذ",
      sub: pendingTasks > 0 ? `${doneTasks} منتهية` : "لا توجد مهام بعد",
      icon: CheckSquare,
      tone: "primary" as const,
      page: "tasks" as PageId,
    },
    {
      value: teamSize || "—",
      label: "أفراد الفريق",
      sub: teamSize > 0 ? `${activeCount} نشط` : "+ أضف موظفاً",
      icon: Users,
      tone: "gold" as const,
      page: "team" as PageId,
    },
    {
      value: totalThisMonth > 0 ? totalThisMonth.toLocaleString() + " ر.س" : "—",
      label: "تبرعات هذا الشهر",
      sub:
        totalThisMonth > 0
          ? donationTrend !== 0
            ? `${donationTrend > 0 ? "▲" : "▼"} ${Math.abs(donationTrend)}% عن الشهر الماضي`
            : `${thisMonthDonations.length} تبرع`
          : "+ سجّل تبرعاتك",
      icon: CreditCard,
      tone: "blue" as const,
      page: "donations" as PageId,
    },
    {
      value: activeCampaigns || "—",
      label: "حملات نشطة",
      sub: activeCampaigns > 0 ? `${campaigns.length} إجمالي الحملات` : "+ ابدأ حملتك الأولى",
      icon: Megaphone,
      tone: "violet" as const,
      page: "campaigns" as PageId,
    },
  ];

  const quickActions = [
    {
      icon: ClipboardList,
      title: "رفع الملف التعريفي",
      desc: "PDF أو Word — يحلله AI فوراً",
      bg: "bg-secondary",
      titleColor: "text-primary",
      page: "profile" as PageId,
    },
    {
      icon: CreditCard,
      title: "سجّل تبرعاً",
      desc: "تتبع المتبرعين والمبالغ المحصّلة",
      bg: "bg-blue-50",
      titleColor: "text-blue-800",
      page: "donations" as PageId,
    },
    {
      icon: Megaphone,
      title: "ابدأ حملة",
      desc: "حملات رمضان، التبرع، التوعية",
      bg: "bg-indigo-50",
      titleColor: "text-indigo-800",
      page: "campaigns" as PageId,
    },
  ];

  return (
    <div>
      {/* Welcome banner */}
      <div className="relative mb-5 flex flex-wrap items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-green-dark via-green-mid to-green-light px-6 py-5">
        <div className="pointer-events-none absolute -left-8 -top-10 h-44 w-44 rounded-full bg-white/[0.04]" />
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-2xl">
          <Landmark className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 text-sm text-white/60">مرحباً بكم في منصة ساعِد</div>
          <div className="mb-1 text-xl font-extrabold text-white">
            {assocName ? `أهلاً، ${assocName}` : "أهلاً بجمعيتكم الكريمة"}
          </div>
          <div className="text-sm text-white/55">
            ارفعوا ملف الجمعية لبدء توليد المحتوى التسويقي بالذكاء الاصطناعي
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse-gold rounded-full bg-emerald-300" />
          <span className="text-xs font-semibold text-white/80">متصل</span>
        </div>
      </div>

      {/* KPI stats row */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((s) => (
          <button key={s.label} onClick={() => onNavigate(s.page)} className="text-right">
            <StatCardKpi {...s} />
          </button>
        ))}
      </div>

      {/* Donation summary row */}
      {(donations.length > 0 || totalCollected > 0) && (
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">إجمالي التبرعات المحصّلة</span>
                {pendingDonations > 0 && (
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    {pendingDonations} معلق ⚡
                  </Badge>
                )}
              </div>
              <Button variant="link" size="sm" className="h-auto gap-1 p-0 text-xs" onClick={() => onNavigate("donations")}>
                إدارة التبرعات
                <ArrowLeft className="h-3 w-3" />
              </Button>
            </div>

            <div className="mb-2.5 flex flex-wrap items-center gap-3">
              <div className="text-2xl font-extrabold text-primary">
                {totalCollected.toLocaleString()}
                <span className="mr-1 text-sm font-medium text-muted-foreground">ر.س</span>
              </div>
              <div className="min-w-[120px] flex-1">
                <div className="mb-1 text-xs text-muted-foreground">
                  هذا الشهر: {totalThisMonth.toLocaleString()} ر.س
                </div>
                {totalCollected > 0 && (
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-green-mid to-green-light transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((totalThisMonth / totalCollected) * 100))}%`,
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="shrink-0 text-left">
                <div className="text-xs text-muted-foreground">إجمالي التبرعات</div>
                <div className="text-sm font-bold text-foreground">{donations.length} تبرع</div>
              </div>
            </div>

            {donations.length > 0 &&
              (() => {
                const channelTotals: Record<string, number> = {};
                donations
                  .filter((d) => d.status === "completed")
                  .forEach((d) => {
                    channelTotals[d.paymentMethod] = (channelTotals[d.paymentMethod] ?? 0) + d.amount;
                  });
                const channels = Object.entries(channelTotals)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4);
                if (channels.length === 0) return null;
                return (
                  <div className="flex flex-wrap gap-2">
                    {channels.map(([ch, total]) => (
                      <div
                        key={ch}
                        className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary"
                      >
                        <span>{CHANNEL_ICON[ch] ?? "💼"}</span>
                        <span>{ch}</span>
                        <span className="font-normal text-muted-foreground">
                          {total.toLocaleString()} ر.س
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
          </CardContent>
        </Card>
      )}

      {/* Charts row */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard icon={BarChart3} title="التبرعات الشهرية" sub="آخر 6 أشهر (ر.س)">
          {donationChartData.every((d) => d.total === 0) ? (
            <EmptyState icon={TrendingDown} title="لا توجد بيانات تبرعات بعد" className="h-40 py-0" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={donationChartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fontFamily: "'Tajawal','Cairo',sans-serif", fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fontFamily: "'Tajawal','Cairo',sans-serif", fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}ك` : String(v))}
                />
                <Tooltip
                  formatter={(v: number) => [`${v.toLocaleString()} ر.س`, "التبرعات"]}
                  labelStyle={{ fontFamily: "'Tajawal','Cairo',sans-serif", fontSize: 12 }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid rgba(45,122,82,.15)",
                    fontFamily: "'Tajawal','Cairo',sans-serif",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="total" fill="#2d7a52" radius={[5, 5, 0, 0]} maxBarSize={36}>
                  {donationChartData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={idx === donationChartData.length - 1 ? "#1a5c3a" : "rgba(45,122,82,.45)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard icon={PieChartIcon} iconBg="bg-amber-100" iconColor="text-amber-700" title="حالة المهام" sub={`${tasks.length} مهمة إجمالاً`}>
          {tasks.length === 0 ? (
            <EmptyState icon={ClipboardList} title="لا توجد مهام بعد" className="h-40 py-0" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {taskStatusData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, name: string) => [`${v} مهمة`, name]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid rgba(45,122,82,.15)",
                    fontFamily: "'Tajawal','Cairo',sans-serif",
                    fontSize: 12,
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: ".72rem", fontFamily: "'Tajawal','Cairo',sans-serif", color: "#374151" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {/* Tasks + Recent donations */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard icon={CheckSquare} title="المهام الأولى" action="عرض الكل" onAction={() => onNavigate("tasks")}>
          {recentTasks.length === 0 ? (
            <EmptyState title="لا توجد مهام معلقة" className="py-6" />
          ) : (
            <div className="flex flex-col gap-2">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-2.5 py-2">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", URGENCY_DOT[task.urgency])} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{task.title}</div>
                    {task.deadline && (
                      <div className="mt-0.5 text-xs text-muted-foreground">{task.deadline}</div>
                    )}
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-bold", STATUS_CLASS[task.status])}>
                    {STATUS_LABEL[task.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard icon={CreditCard} iconBg="bg-blue-50" iconColor="text-blue-700" title="آخر التبرعات" action="عرض الكل" onAction={() => onNavigate("donations")}>
          {recentDonations.length === 0 ? (
            <EmptyState title="لا توجد تبرعات بعد" className="py-6" />
          ) : (
            <div className="flex flex-col gap-2">
              {recentDonations.map((don) => (
                <div key={don.id} className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-2.5 py-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm">
                    {CHANNEL_ICON[don.paymentMethod] ?? "💼"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{don.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {don.date} · {don.paymentMethod}
                    </div>
                  </div>
                  <div className="shrink-0 text-left">
                    <div className="text-sm font-extrabold text-primary">
                      {don.amount.toLocaleString()} ر.س
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold",
                        don.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
                      )}
                    >
                      {don.status === "completed" ? "مكتمل" : "معلق"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Quick actions */}
      <SectionCard icon={Rocket} title="ابدأ هنا" sub="ارفع ملف جمعيتك التعريفي ليحلله الذكاء الاصطناعي">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickActions.map((action) => (
            <button
              key={action.page}
              onClick={() => onNavigate(action.page)}
              className={cn(
                "flex-1 rounded-xl border p-4 text-right transition-all hover:-translate-y-0.5 hover:shadow-sm",
                action.bg,
              )}
            >
              <action.icon className={cn("mb-1.5 h-6 w-6", action.titleColor)} />
              <div className={cn("mb-0.5 text-sm font-bold", action.titleColor)}>{action.title}</div>
              <div className="text-xs text-muted-foreground">{action.desc}</div>
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function StatCardKpi({
  value,
  label,
  sub,
  icon: Icon,
  tone,
}: {
  value: string | number;
  label: string;
  sub: string;
  icon: typeof CheckSquare;
  tone: "primary" | "gold" | "blue" | "violet";
}) {
  const accent: Record<string, string> = {
    primary: "border-t-primary text-primary",
    gold: "border-t-gold text-gold",
    blue: "border-t-blue-500 text-blue-600",
    violet: "border-t-violet-500 text-violet-600",
  };
  const subColor: Record<string, string> = {
    primary: "text-primary",
    gold: "text-gold",
    blue: "text-blue-600",
    violet: "text-violet-600",
  };
  return (
    <Card className={cn("border-t-[3px] transition-shadow hover:shadow-md", accent[tone])}>
      <CardContent className="p-3.5">
        <Icon className={cn("mb-1 h-4 w-4", accent[tone])} />
        <div className="text-2xl font-extrabold leading-none text-primary">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{label}</div>
        <div className={cn("mt-1.5 text-xs font-semibold", subColor[tone])}>{sub}</div>
      </CardContent>
    </Card>
  );
}
