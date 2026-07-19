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
import { Landmark, Star, ClipboardList, Settings as SettingsIcon, PieChartIcon, BarChart3, ArrowLeft } from "lucide-react";
import { StatusBadge, fmt } from "../helpers";
import type { Org, Influencer, CampaignRequest, PageId } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { cn } from "@/lib/utils";

interface OverviewPageProps {
  orgs: Org[];
  influencers: Influencer[];
  requests: CampaignRequest[];
  setActivePage: (page: PageId) => void;
  setOrgModal: (data: { open: boolean; data: Partial<Org> | null }) => void;
}

function SectionCard({
  icon,
  iconBg,
  title,
  sub,
  action,
  onAction,
  children,
}: {
  icon: string;
  iconBg?: string;
  title: string;
  sub?: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b py-3">
        <div className="flex items-center gap-2">
          <div className={cn("flex h-[27px] w-[27px] items-center justify-center rounded-lg text-sm", iconBg ?? "bg-secondary")}>
            {icon}
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
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

export function OverviewPage({
  orgs,
  influencers,
  requests,
  setActivePage,
  setOrgModal,
}: OverviewPageProps) {
  const recentOrgs = [...orgs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const recentReqs = [...requests].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const newOrgs = orgs.filter((o) => o.status === "new").length;
  const pendingOrgs = orgs.filter((o) => o.status === "pending").length;
  const activeOrgs = orgs.filter((o) => o.status === "active").length;
  const pendingReqs = requests.filter((r) => r.status === "pending").length;
  const approvedReqs = requests.filter((r) => r.status === "approved").length;

  // Chart data
  const orgStatusData = [
    { name: "نشط", value: activeOrgs, color: "#2d7a52" },
    { name: "جديد", value: newOrgs, color: "#3b82f6" },
    { name: "قيد المراجعة", value: pendingOrgs, color: "#f59e0b" },
    { name: "موقوف", value: orgs.filter((o) => o.status === "suspended").length, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const reqStatusData = [
    { name: "معلق", value: requests.filter((r) => r.status === "pending").length, fill: "#f59e0b" },
    { name: "مقبول", value: approvedReqs, fill: "#3b82f6" },
    { name: "مكتمل", value: requests.filter((r) => r.status === "completed").length, fill: "#2d7a52" },
    { name: "مرفوض", value: requests.filter((r) => r.status === "rejected").length, fill: "#ef4444" },
  ].filter((d) => d.value > 0);

  const topInfluencers = [...influencers].sort((a, b) => b.followers - a.followers).slice(0, 4);

  const kpis = [
    { icon: Landmark, num: orgs.length, lbl: "إجمالي الجمعيات", sub: `${newOrgs} جديدة`, tone: "text-primary border-t-primary", page: "orgs" as PageId },
    { icon: Star, num: influencers.length, lbl: "المؤثرون", sub: `${influencers.filter((i) => i.status === "active").length} نشط`, tone: "text-gold border-t-gold", page: "influencers" as PageId },
    { icon: ClipboardList, num: pendingReqs, lbl: "طلبات معلقة", sub: `${approvedReqs} مقبولة`, tone: "text-blue-600 border-t-blue-500", page: "requests" as PageId },
    { icon: SettingsIcon, num: "—", lbl: "الإعدادات", sub: "إدارة الخيارات", tone: "text-slate-500 border-t-slate-400", page: "settings" as PageId },
  ];

  return (
    <div>
      {/* Welcome banner */}
      <div className="relative mb-5 flex flex-wrap items-center gap-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f2d1e] via-green-dark to-green-mid px-6 py-5">
        <div className="pointer-events-none absolute -left-10 -top-12 h-48 w-48 rounded-full bg-white/[0.03]" />
        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl">
          🛡️
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 text-xs text-white/50">لوحة تحكم الإدارة</div>
          <div className="mb-1.5 text-xl font-extrabold text-white">مرحباً بالمسؤول — منصة ساعِد</div>
          <div className="flex flex-wrap gap-4">
            {[
              { v: orgs.length, l: "جمعية" },
              { v: influencers.length, l: "مؤثر" },
              { v: approvedReqs, l: "طلب مقبول" },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-1.5 text-sm text-white/70">
                <span className="text-base font-extrabold text-white">{s.v}</span> {s.l}
              </div>
            ))}
          </div>
        </div>
        {(newOrgs > 0 || pendingReqs > 0) && (
          <div className="shrink-0 rounded-lg border border-amber-400/40 bg-amber-400/20 px-3.5 py-2">
            <div className="mb-0.5 text-xs font-bold text-amber-300">⚡ تحتاج مراجعة</div>
            {newOrgs > 0 && <div className="text-xs text-white/80">{newOrgs} جمعية جديدة</div>}
            {pendingReqs > 0 && <div className="text-xs text-white/80">{pendingReqs} طلب معلق</div>}
          </div>
        )}
      </div>

      {/* KPI cards */}
      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {kpis.map((k) => (
          <Card
            key={k.lbl}
            onClick={() => setActivePage(k.page)}
            className={cn("cursor-pointer border-t-[3px] transition-shadow hover:shadow-md", k.tone)}
          >
            <CardContent className="p-3.5">
              <k.icon className={cn("mb-1 h-4 w-4", k.tone)} />
              <div className="text-2xl font-extrabold leading-none">{k.num}</div>
              <div className="mt-1 text-xs text-muted-foreground">{k.lbl}</div>
              <div className={cn("mt-1.5 text-xs font-semibold", k.tone)}>{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="mb-4 grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <SectionCard icon="🏛️" title="حالة الجمعيات" sub={`${orgs.length} جمعية مسجلة`}>
          <div className="p-4 pt-0">
            {orgs.length === 0 ? (
              <EmptyState icon={PieChartIcon} title="لا توجد جمعيات بعد" className="h-[150px] py-0" />
            ) : (
              <ResponsiveContainer width="100%" height={155}>
                <PieChart>
                  <Pie data={orgStatusData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value" nameKey="name">
                    {orgStatusData.map((d, idx) => (
                      <Cell key={idx} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number, name: string) => [`${v}`, name]}
                    contentStyle={{ borderRadius: 8, border: "1px solid rgba(45,122,82,.15)", fontFamily: "'Tajawal','Cairo',sans-serif", fontSize: 12 }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ fontSize: ".7rem", fontFamily: "'Tajawal','Cairo',sans-serif", color: "#374151" }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <SectionCard icon="📊" iconBg="bg-blue-50" title="خط سير الطلبات" sub={`${requests.length} طلب إجمالاً`}>
          <div className="p-4 pt-0">
            {requests.length === 0 ? (
              <EmptyState icon={BarChart3} title="لا توجد طلبات بعد" className="h-[150px] py-0" />
            ) : (
              <ResponsiveContainer width="100%" height={155}>
                <BarChart data={reqStatusData} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "'Tajawal','Cairo',sans-serif", fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontFamily: "'Tajawal','Cairo',sans-serif", fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(45,122,82,.15)", fontFamily: "'Tajawal','Cairo',sans-serif", fontSize: 12 }} />
                  <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={42} name="الطلبات">
                    {reqStatusData.map((d, idx) => (
                      <Cell key={idx} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Recent orgs + recent requests */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <SectionCard icon="🏛️" title="آخر الجمعيات" action="عرض الكل" onAction={() => setActivePage("orgs")}>
          <div className="py-2">
            {recentOrgs.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">لا توجد جمعيات بعد</div>
            ) : (
              recentOrgs.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setOrgModal({ open: true, data: o })}
                  className="flex cursor-pointer items-center gap-2.5 px-4 py-2 transition-colors hover:bg-secondary/40"
                >
                  <Avatar className="h-[34px] w-[34px] shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-green-mid to-green-light text-sm font-bold text-white">
                      {(o.name || "؟")[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{o.name || "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.region || "—"} · {o.date}
                    </div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <div className="flex flex-col gap-3">
          <SectionCard icon="📋" iconBg="bg-amber-100" title="آخر الطلبات" action="عرض الكل" onAction={() => setActivePage("requests")}>
            <div className="py-2">
              {recentReqs.length === 0 ? (
                <div className="py-5 text-center text-sm text-muted-foreground">لا توجد طلبات بعد</div>
              ) : (
                recentReqs.map((r) => (
                  <div key={r.id} className="flex items-center gap-2.5 px-4 py-1.5 transition-colors hover:bg-muted/40">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground">{r.orgName}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.infName} · {r.budget.toLocaleString()} ر.س
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard icon="🌟" iconBg="bg-amber-100" title="أبرز المؤثرين" action="عرض الكل" onAction={() => setActivePage("influencers")}>
            <div className="py-1.5">
              {topInfluencers.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">لا يوجد مؤثرين بعد</div>
              ) : (
                topInfluencers.map((inf) => (
                  <div key={inf.id} className="flex items-center gap-2.5 px-4 py-1.5">
                    <Avatar className="h-[30px] w-[30px] shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-gold to-[#f0d060] text-xs font-bold text-white">
                        {inf.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground">{inf.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {inf.platform} · {fmt(inf.followers)} متابع
                      </div>
                    </div>
                    <div className="text-xs font-bold text-gold">{inf.price.toLocaleString()} ر.س</div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
