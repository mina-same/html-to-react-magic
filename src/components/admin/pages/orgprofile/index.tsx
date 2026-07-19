import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useEmployees, useContentGenerations, useDonations, useAssocProfile } from "@/api/queries";
import { StatusBadge } from "@/components/admin/helpers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Org, CampaignRequest } from "@/components/admin/types";
import type { TabId } from "./constants";
import { OverviewTab } from "./OverviewTab";
import { EmployeesTab } from "./EmployeesTab";
import { ContentTab } from "./ContentTab";
import { RequestsTab } from "./RequestsTab";
import { DonationsTab } from "./DonationsTab";

interface Props {
  org: Org;
  requests: CampaignRequest[];
  onBack: () => void;
}

export function OrgProfilePage({ org, requests: allRequests, onBack }: Props) {
  const [tab, setTab] = useState<TabId>("overview");

  const employeesQuery = useEmployees(org.id);
  const contentQuery = useContentGenerations(org.id);
  const donationsQuery = useDonations(org.id);
  const profileQuery = useAssocProfile(org.id);

  const orgRequests = allRequests.filter((r) => r.orgId === org.id);

  // Reset to overview when switching orgs (UI state only — data is keyed by org.id).
  useEffect(() => {
    setTab("overview");
  }, [org.id]);

  const loading =
    employeesQuery.isLoading ||
    contentQuery.isLoading ||
    donationsQuery.isLoading ||
    profileQuery.isLoading;

  const counts = {
    employees: employeesQuery.data?.length ?? 0,
    content: contentQuery.data?.length ?? 0,
    donations: donationsQuery.data?.length ?? 0,
    requests: orgRequests.length,
  };

  const TABS: { id: TabId; label: string; icon: string; count?: number }[] = [
    { id: "overview", label: "نظرة عامة", icon: "🏠" },
    { id: "employees", label: "الموظفون", icon: "👥", count: counts.employees },
    { id: "content", label: "المحتوى AI", icon: "🤖", count: counts.content },
    { id: "requests", label: "الطلبات", icon: "📋", count: counts.requests },
    { id: "donations", label: "التبرعات", icon: "💰", count: counts.donations },
  ];

  const stats = [
    { label: "الموظفون", value: loading ? "—" : counts.employees, icon: "👥", color: "text-primary", bg: "bg-emerald-50" },
    { label: "الطلبات", value: counts.requests, icon: "📋", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "التبرعات", value: loading ? "—" : counts.donations, icon: "💰", color: "text-amber-600", bg: "bg-amber-50" },
    { label: "محتوى AI", value: loading ? "—" : counts.content, icon: "🤖", color: "text-violet-600", bg: "bg-violet-50" },
  ];

  return (
    <div className="admin-page-anim">
      {/* Header */}
      <div className="mb-4 overflow-hidden rounded-2xl border">
        <div className="bg-gradient-to-br from-green-mid to-[#1e5c3a] px-6 py-5">
          <div className="flex items-center gap-3.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="gap-1.5 border-white/30 bg-white/15 text-white hover:bg-white/25 hover:text-white"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              رجوع للقائمة
            </Button>
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-white/[0.18] text-2xl">
              🏛️
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-extrabold text-white">{org.name}</h2>
                <StatusBadge status={org.status} />
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-white/80">
                <span>📋 {org.license}</span>
                <span>📍 {org.region}</span>
                <span>📅 {org.date}</span>
                <span>📧 {org.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-2.5 p-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className={cn("flex items-center gap-2.5 rounded-lg px-3.5 py-3", stat.bg)}>
              <span className="text-xl">{stat.icon}</span>
              <div>
                <div className={cn("text-xl font-extrabold leading-none", stat.color)}>{stat.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="mb-4 flex gap-1 rounded-xl border bg-card p-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
              tab === t.id ? "bg-primary font-bold text-primary-foreground" : "font-medium text-muted-foreground",
            )}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold",
                  tab === t.id ? "bg-white/25 text-white" : "bg-muted text-foreground/70",
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active tab — keyed by org.id so pagination/selection resets on org switch */}
      <div className="admin-page-anim" key={org.id}>
        {tab === "overview" && <OverviewTab org={org} profileQuery={profileQuery} />}
        {tab === "employees" && <EmployeesTab orgId={org.id} employeesQuery={employeesQuery} />}
        {tab === "content" && <ContentTab orgId={org.id} contentQuery={contentQuery} />}
        {tab === "requests" && <RequestsTab requests={orgRequests} />}
        {tab === "donations" && <DonationsTab donationsQuery={donationsQuery} />}
      </div>
    </div>
  );
}
