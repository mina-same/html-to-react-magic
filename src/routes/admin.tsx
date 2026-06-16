import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { adminOrgsDb, adminRequestsDb, influencersDb } from "@/lib/db";
import { toast } from "sonner";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { OverviewPage } from "@/components/admin/pages/OverviewPage";
import { OrgsPage } from "@/components/admin/pages/OrgsPage";
import { OrgProfilePage } from "@/components/admin/pages/OrgProfilePage";
import { InfluencersPage } from "@/components/admin/pages/InfluencersPage";
import { RequestsPage } from "@/components/admin/pages/RequestsPage";
import { ReportsPage } from "@/components/admin/pages/ReportsPage";
import { SettingsPage } from "@/components/admin/pages/SettingsPage";
import { S } from "@/components/admin/helpers";
import type { Org, Influencer, CampaignRequest, PageId } from "@/components/admin/types";
import { OrgModal } from "@/components/admin/modals/OrgModal";
import { InfModal } from "@/components/admin/modals/InfModal";
import { ReqModal } from "@/components/admin/modals/ReqModal";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "ساعِد — إدارة المنصة" }] }),
  component: Admin,
});

function Admin() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading, signOut } = useAuth();

  const [activePage, _setActivePage] = useState<PageId>("overview");
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);

  useEffect(() => {
    const savedPage = localStorage.getItem("saaid_admin_page") as PageId | null;
    if (savedPage) {
      _setActivePage(savedPage);
    }
  }, []);

  function setActivePage(page: PageId) {
    localStorage.setItem("saaid_admin_page", page);
    _setActivePage(page);
    setSelectedOrg(null);
  }

  const [orgs, setOrgs] = useState<Org[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [requests, setRequests] = useState<CampaignRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [orgModal, setOrgModal] = useState<{ open: boolean; data: Partial<Org> | null }>({
    open: false,
    data: null,
  });
  const [infModal, setInfModal] = useState<{ open: boolean; data: Partial<Influencer> | null }>({
    open: false,
    data: null,
  });
  const [reqModal, setReqModal] = useState<{
    open: boolean;
    data: Partial<CampaignRequest> | null;
  }>({ open: false, data: null });

  const [orgSearch, setOrgSearch] = useState("");
  const [orgStatusFilter, setOrgStatusFilter] = useState("all");
  const [infSearch, setInfSearch] = useState("");
  const [infPlatFilter, setInfPlatFilter] = useState("all");
  const [reqStatusFilter, setReqStatusFilter] = useState("all");

  const filteredOrgs = useMemo(
    () =>
      orgs.filter(
        (o) =>
          (orgStatusFilter === "all" || o.status === orgStatusFilter) &&
          (o.name.includes(orgSearch) ||
            o.region.includes(orgSearch) ||
            o.license.includes(orgSearch)),
      ),
    [orgs, orgSearch, orgStatusFilter],
  );

  const filteredInfs = useMemo(
    () =>
      influencers.filter(
        (i) =>
          (infPlatFilter === "all" || i.platform === infPlatFilter) &&
          (i.name.includes(infSearch) ||
            i.niche.includes(infSearch) ||
            i.platform.includes(infSearch)),
      ),
    [influencers, infSearch, infPlatFilter],
  );

  const filteredReqs = useMemo(
    () => requests.filter((r) => reqStatusFilter === "all" || r.status === reqStatusFilter),
    [requests, reqStatusFilter],
  );

  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate({ to: "/login" });
      else if (role !== "admin") navigate({ to: "/association" });
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (authLoading || !user || role !== "admin") return;
    async function load() {
      setDataLoading(true);
      try {
        const [orgsData, infsData, reqsData] = await Promise.all([
          adminOrgsDb.list(),
          influencersDb.list(),
          adminRequestsDb.list(),
        ]);
        setOrgs(orgsData.map((o) => ({ ...o, notes: o.description })));
        setInfluencers(
          infsData.map((i) => ({
            ...i,
            price: i.basePrice,
            status: i.status as "active" | "pending" | "ended",
          })),
        );
        setRequests(reqsData);
      } finally {
        setDataLoading(false);
      }
    }
    load();
  }, [user, role, authLoading]);

  if (authLoading || !user || role !== "admin") return null;

  const pageTitles: Record<PageId, string> = {
    overview: "لوحة التحكم",
    orgs: "الجمعيات",
    influencers: "المؤثرون",
    requests: "الطلبات",
    reports: "التقارير المالية",
    settings: "الإعدادات",
  };

  const pageTags: Record<PageId, string> = {
    overview: "نظرة عامة",
    orgs: `${orgs.length} جمعية`,
    influencers: `${influencers.length} مؤثر`,
    requests: `${requests.length} طلب`,
    reports: "الإيرادات",
    settings: "الإعدادات العامة",
  };

  async function saveOrg(data: Partial<Org> & { password?: string }) {
    if (!data.id) {
      const { error } = await supabase.functions.invoke("create-user", {
        body: {
          email: data.email ?? "",
          password: data.password ?? "",
          assocName: data.name ?? "",
          license: data.license ?? "",
          region: data.region ?? "",
          phone: data.phone ?? "",
          status: data.status ?? "new",
        },
      });
      if (error) {
        toast.error("فشل إنشاء الحساب: " + error.message);
        return;
      }
      const refreshed = await adminOrgsDb.list();
      setOrgs(refreshed.map((o) => ({ ...o, notes: o.description })));
      toast.success("✅ تم إنشاء حساب الجمعية بنجاح");
      return;
    }
    await adminOrgsDb.upsert(data.id, data.name ?? "", {
      license: data.license ?? "",
      region: data.region ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      description: data.notes ?? "",
      status: data.status ?? "active",
    });
    setOrgs((prev) => prev.map((o) => (o.id === data.id ? ({ ...o, ...data } as Org) : o)));
    toast.success("تم تحديث بيانات الجمعية");
  }

  async function suspendOrg(id: string) {
    await adminOrgsDb.setStatus(id, "suspended");
    setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, status: "suspended" } : o)));
    toast.success("تم توقيف الجمعية");
  }

  async function saveInf(data: Partial<Influencer>) {
    if (data.id) {
      await influencersDb.update(data.id, {
        name: data.name,
        platform: data.platform as
          | "Instagram"
          | "X"
          | "TikTok"
          | "YouTube"
          | "Snapchat"
          | undefined,
        followers: data.followers,
        engagement: data.engagement,
        status: data.status as "active" | "pending" | "ended",
        niche: data.niche,
        notes: data.notes,
        basePrice: data.price,
      });
      setInfluencers((prev) =>
        prev.map((i) => (i.id === data.id ? ({ ...i, ...data } as Influencer) : i)),
      );
      toast.success("تم تحديث بيانات المؤثر");
    } else {
      const created = await influencersDb.create({
        name: data.name ?? "",
        platform: (data.platform ?? "Instagram") as
          | "Instagram"
          | "X"
          | "TikTok"
          | "YouTube"
          | "Snapchat",
        followers: data.followers ?? 0,
        engagement: data.engagement ?? 0,
        status: (data.status ?? "active") as "active" | "pending" | "ended",
        campaigns: 0,
        niche: data.niche ?? "",
        notes: data.notes ?? "",
        basePrice: data.price ?? 0,
        bio: data.bio ?? "",
        location: data.location ?? "",
        audience: data.audience ?? "",
        instagramHandle: data.instagramHandle ?? "",
        xHandle: data.xHandle ?? "",
        tiktokHandle: data.tiktokHandle ?? "",
        youtubeHandle: data.youtubeHandle ?? "",
        snapchatHandle: data.snapchatHandle ?? "",
        website: data.website ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
      });
      if (created) {
        setInfluencers((prev) => [
          ...prev,
          {
            ...created,
            price: created.basePrice,
            status: created.status as "active" | "pending" | "ended",
          },
        ]);
      }
      toast.success("تمت إضافة المؤثر بنجاح");
    }
  }

  async function deleteInf(id: number) {
    await influencersDb.delete(id);
    setInfluencers((prev) => prev.filter((i) => i.id !== id));
    toast.success("تم حذف المؤثر");
  }

  async function saveReq(data: Partial<CampaignRequest>) {
    if (!data.id) return;
    await adminRequestsDb.update(data.id, {
      type: data.type,
      budget: data.budget,
      duration: data.duration,
      message: data.message,
      status: data.status,
    });
    setRequests((prev) =>
      prev.map((r) => (r.id === data.id ? ({ ...r, ...data } as CampaignRequest) : r)),
    );
    toast.success("تم تحديث الطلب");
  }

  async function rejectReq(reqId: number) {
    await adminRequestsDb.update(reqId, { status: "rejected" });
    setRequests((prev) => prev.map((r) => (r.id === reqId ? { ...r, status: "rejected" } : r)));
    toast.error("تم رفض الطلب");
  }

  function renderPage() {
    switch (activePage) {
      case "overview":
        return (
          <OverviewPage
            orgs={orgs}
            influencers={influencers}
            requests={requests}
            setActivePage={setActivePage}
            setOrgModal={setOrgModal}
          />
        );
      case "orgs":
        if (selectedOrg) {
          return (
            <OrgProfilePage
              org={selectedOrg}
              requests={requests}
              onBack={() => setSelectedOrg(null)}
            />
          );
        }
        return (
          <OrgsPage
            filteredOrgs={filteredOrgs}
            orgSearch={orgSearch}
            setOrgSearch={setOrgSearch}
            orgStatusFilter={orgStatusFilter}
            setOrgStatusFilter={setOrgStatusFilter}
            setOrgModal={setOrgModal}
            suspendOrg={async (id: number) => await suspendOrg(id.toString())}
            openOrgProfile={setSelectedOrg}
          />
        );
      case "influencers":
        return (
          <InfluencersPage
            filteredInfs={filteredInfs}
            infSearch={infSearch}
            setInfSearch={setInfSearch}
            infPlatFilter={infPlatFilter}
            setInfPlatFilter={setInfPlatFilter}
            setInfModal={setInfModal}
            deleteInf={deleteInf}
          />
        );
      case "requests":
        return (
          <RequestsPage
            filteredReqs={filteredReqs}
            reqStatusFilter={reqStatusFilter}
            setReqStatusFilter={setReqStatusFilter}
            setReqModal={setReqModal}
            saveReq={saveReq}
            rejectReq={rejectReq}
          />
        );
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return null;
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700;800&display=swap');
        html, body { direction: rtl; font-family: 'Tajawal', sans-serif; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-page-anim { animation: fadeUp .3s ease; }
        .admin-content::-webkit-scrollbar { width: 4px; }
        .admin-content::-webkit-scrollbar-thumb { background: rgba(45,122,82,.12); border-radius: 4px; }
      `}</style>
      <div style={S.app}>
        <AdminSidebar
          activePage={activePage}
          setActivePage={setActivePage}
          orgs={orgs}
          influencers={influencers}
          requests={requests}
        />

        <div style={S.main}>
          <div style={S.topbar}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                marginLeft: "auto",
              }}
            >
              <div
                style={{
                  fontSize: ".82rem",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                {pageTitles[activePage]}
              </div>
              <div
                style={{
                  fontSize: ".72rem",
                  color: "#6b7280",
                }}
              >
                {pageTags[activePage]}
              </div>
            </div>
          </div>

          <div style={S.content} className="admin-content">
            <div className="admin-page-anim">
              {dataLoading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>
                  <div>جاري تحميل البيانات...</div>
                </div>
              ) : (
                renderPage()
              )}
            </div>
          </div>
        </div>

        {orgModal.open && (
          <OrgModal
            org={orgModal.data}
            onClose={() => setOrgModal({ open: false, data: null })}
            onSave={saveOrg}
          />
        )}
        {infModal.open && (
          <InfModal
            inf={infModal.data}
            onClose={() => setInfModal({ open: false, data: null })}
            onSave={saveInf}
          />
        )}
        {reqModal.open && (
          <ReqModal
            req={reqModal.data}
            orgs={orgs}
            infs={influencers}
            onClose={() => setReqModal({ open: false, data: null })}
            onSave={saveReq}
          />
        )}
      </div>
    </>
  );
}
