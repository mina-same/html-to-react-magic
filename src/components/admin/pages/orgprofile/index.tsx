import { useState, useEffect } from "react";
import { useEmployees, useContentGenerations, useDonations, useAssocProfile } from "@/api/queries";
import { S, StatusBadge } from "@/components/admin/helpers";
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

  return (
    <div style={{ animation: "fadeUp .3s ease" }}>
      {/* Header */}
      <div
        style={{
          background: "white",
          borderRadius: 14,
          border: "1px solid rgba(45,122,82,.12)",
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg,#2d7a52 0%,#1e5c3a 100%)",
            padding: "20px 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={onBack}
              style={{
                background: "rgba(255,255,255,.15)",
                border: "1px solid rgba(255,255,255,.3)",
                borderRadius: 8,
                color: "white",
                fontFamily: "'Tajawal',sans-serif",
                fontSize: ".78rem",
                fontWeight: 600,
                padding: "6px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              ← رجوع للقائمة
            </button>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 13,
                background: "rgba(255,255,255,.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                flexShrink: 0,
              }}
            >
              🏛️
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 5,
                  flexWrap: "wrap" as const,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    color: "white",
                  }}
                >
                  {org.name}
                </h2>
                <StatusBadge status={org.status} />
              </div>
              <div
                style={{
                  fontSize: ".75rem",
                  color: "rgba(255,255,255,.78)",
                  display: "flex",
                  gap: 18,
                  flexWrap: "wrap" as const,
                }}
              >
                <span>📋 {org.license}</span>
                <span>📍 {org.region}</span>
                <span>📅 {org.date}</span>
                <span>📧 {org.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div
          style={{
            padding: "14px 20px",
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 10,
          }}
        >
          {[
            {
              label: "الموظفون",
              value: loading ? "—" : counts.employees,
              icon: "👥",
              color: "#2d7a52",
              bg: "#f0fdf4",
            },
            {
              label: "الطلبات",
              value: counts.requests,
              icon: "📋",
              color: "#3b82f6",
              bg: "#eff6ff",
            },
            {
              label: "التبرعات",
              value: loading ? "—" : counts.donations,
              icon: "💰",
              color: "#f59e0b",
              bg: "#fffbeb",
            },
            {
              label: "محتوى AI",
              value: loading ? "—" : counts.content,
              icon: "🤖",
              color: "#8b5cf6",
              bg: "#f5f3ff",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: stat.bg,
                borderRadius: 10,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 22 }}>{stat.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 800,
                    color: stat.color,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: ".7rem", color: "#6b7280", marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          border: "1px solid rgba(45,122,82,.12)",
          padding: 5,
          marginBottom: 16,
          display: "flex",
          gap: 4,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: "9px 10px",
              borderRadius: 8,
              border: "none",
              fontFamily: "'Tajawal',sans-serif",
              fontSize: ".78rem",
              fontWeight: tab === t.id ? 700 : 500,
              background: tab === t.id ? "#2d7a52" : "transparent",
              color: tab === t.id ? "white" : "#6b7280",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              transition: "all .15s",
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span
                style={{
                  background: tab === t.id ? "rgba(255,255,255,.25)" : "#e5e7eb",
                  color: tab === t.id ? "white" : "#374151",
                  fontSize: ".65rem",
                  padding: "1px 7px",
                  borderRadius: 20,
                  fontWeight: 700,
                }}
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
