import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Toaster, toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useAdminOrgs, useAdminInfluencers, useAdminRequests } from "@/api/queries";
import {
  useSaveOrg,
  useSuspendOrg,
  useSaveInfluencer,
  useDeleteInfluencer,
  useUpdateRequest,
} from "@/api/mutations";
import { LoadingState, ErrorState } from "@/components/common/StateViews";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { OverviewPage } from "@/components/admin/pages/OverviewPage";
import { OrgsPage } from "@/components/admin/pages/OrgsPage";
import { OrgProfilePage } from "@/components/admin/pages/OrgProfilePage";
import { InfluencersPage } from "@/components/admin/pages/InfluencersPage";
import { RequestsPage } from "@/components/admin/pages/RequestsPage";
import { ReportsPage } from "@/components/admin/pages/ReportsPage";
import { SettingsPage } from "@/components/admin/pages/SettingsPage";
import { S } from "@/components/admin/helpers";
import {
  PAGE_TITLES,
  PAGE_TAGS,
  type Org,
  type Influencer,
  type CampaignRequest,
  type PageId,
} from "@/components/admin/types";
import { OrgModal } from "@/components/admin/modals/OrgModal";
import { InfModal } from "@/components/admin/modals/InfModal";
import { ReqModal } from "@/components/admin/modals/ReqModal";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "ساعِد — إدارة المنصة" }] }),
  component: Admin,
});

type ModalState<T> = { open: boolean; data: Partial<T> | null };

function Admin() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();

  // ── UI state only ──────────────────────────────────────────────
  const [activePage, _setActivePage] = useState<PageId>("overview");
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);

  const [orgModal, setOrgModal] = useState<ModalState<Org>>({ open: false, data: null });
  const [infModal, setInfModal] = useState<ModalState<Influencer>>({ open: false, data: null });
  const [reqModal, setReqModal] = useState<ModalState<CampaignRequest>>({
    open: false,
    data: null,
  });

  const [orgSearch, setOrgSearch] = useState("");
  const [orgStatusFilter, setOrgStatusFilter] = useState("all");
  const [infSearch, setInfSearch] = useState("");
  const [infPlatFilter, setInfPlatFilter] = useState("all");
  const [reqStatusFilter, setReqStatusFilter] = useState("all");

  // Restore last active tab.
  useEffect(() => {
    const saved = localStorage.getItem("saaid_admin_page") as PageId | null;
    if (saved) _setActivePage(saved);
  }, []);

  function setActivePage(page: PageId) {
    localStorage.setItem("saaid_admin_page", page);
    _setActivePage(page);
    setSelectedOrg(null);
  }

  // ── Server state (React Query) ─────────────────────────────────
  const orgsQuery = useAdminOrgs(!!user && role === "admin");
  const infsQuery = useAdminInfluencers(!!user && role === "admin");
  const reqsQuery = useAdminRequests(!!user && role === "admin");

  const orgs = orgsQuery.data ?? [];
  const influencers = infsQuery.data ?? [];
  const requests = reqsQuery.data ?? [];

  // ── Mutations ──────────────────────────────────────────────────
  const saveOrgMut = useSaveOrg();
  const suspendOrgMut = useSuspendOrg();
  const saveInfMut = useSaveInfluencer();
  const deleteInfMut = useDeleteInfluencer();
  const updateReqMut = useUpdateRequest();

  // ── Auth guard ─────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate({ to: "/login" });
    else if (role !== "admin") navigate({ to: "/association" });
  }, [user, role, authLoading, navigate]);

  // ── Derived (filtered) collections ─────────────────────────────
  const filteredOrgs = useMemo(
    () =>
      (orgsQuery.data ?? []).filter(
        (o) =>
          (orgStatusFilter === "all" || o.status === orgStatusFilter) &&
          (o.name.includes(orgSearch) ||
            o.region.includes(orgSearch) ||
            o.license.includes(orgSearch)),
      ),
    [orgsQuery.data, orgSearch, orgStatusFilter],
  );

  const filteredInfs = useMemo(
    () =>
      (infsQuery.data ?? []).filter(
        (i) =>
          (infPlatFilter === "all" || i.platform === infPlatFilter) &&
          (i.name.includes(infSearch) ||
            i.niche.includes(infSearch) ||
            i.platform.includes(infSearch)),
      ),
    [infsQuery.data, infSearch, infPlatFilter],
  );

  const filteredReqs = useMemo(
    () =>
      (reqsQuery.data ?? []).filter(
        (r) => reqStatusFilter === "all" || r.status === reqStatusFilter,
      ),
    [reqsQuery.data, reqStatusFilter],
  );

  // ── Mutation handlers ──────────────────────────────────────────
  async function saveOrg(data: Partial<Org> & { password?: string }) {
    try {
      await saveOrgMut.mutateAsync(data);
      toast.success(data.id ? "تم تحديث بيانات الجمعية" : "✅ تم إنشاء حساب الجمعية بنجاح");
      setOrgModal({ open: false, data: null });
    } catch (err) {
      toast.error("فشل حفظ الجمعية: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function suspendOrg(id: string) {
    try {
      await suspendOrgMut.mutateAsync(id);
      toast.success("تم توقيف الجمعية");
    } catch (err) {
      toast.error("فشل التوقيف: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function saveInf(data: Partial<Influencer>) {
    try {
      await saveInfMut.mutateAsync(data);
      toast.success(data.id ? "تم تحديث بيانات المؤثر" : "تمت إضافة المؤثر بنجاح");
      setInfModal({ open: false, data: null });
    } catch (err) {
      toast.error("فشل حفظ المؤثر: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function deleteInf(id: number) {
    try {
      await deleteInfMut.mutateAsync(id);
      toast.success("تم حذف المؤثر");
      setInfModal({ open: false, data: null });
    } catch (err) {
      toast.error("فشل حذف المؤثر: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function saveReq(data: Partial<CampaignRequest>) {
    if (!data.id) return;
    try {
      await updateReqMut.mutateAsync({
        id: data.id,
        fields: {
          type: data.type,
          budget: data.budget,
          duration: data.duration,
          message: data.message,
          status: data.status,
        },
      });
      toast.success("تم تحديث الطلب");
      setReqModal({ open: false, data: null });
    } catch (err) {
      toast.error("فشل تحديث الطلب: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function rejectReq(reqId: number) {
    try {
      await updateReqMut.mutateAsync({ id: reqId, fields: { status: "rejected" } });
      toast.error("تم رفض الطلب");
    } catch (err) {
      toast.error("فشل رفض الطلب: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  // ── Render gates ───────────────────────────────────────────────
  if (authLoading || !user || role !== "admin") return null;

  const anyError = orgsQuery.isError || infsQuery.isError || reqsQuery.isError;
  const firstLoad = orgsQuery.isLoading || infsQuery.isLoading || reqsQuery.isLoading;
  const refetchAll = () => {
    orgsQuery.refetch();
    infsQuery.refetch();
    reqsQuery.refetch();
  };

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
            suspendOrg={(id: string) => suspendOrg(id)}
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
        .admin-page-anim { animation: fadeUp .3s ease; }
        .admin-content::-webkit-scrollbar { width: 4px; }
        .admin-content::-webkit-scrollbar-thumb { background: rgba(45,122,82,.12); border-radius: 4px; }
      `}</style>
      <Toaster position="top-center" richColors />
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
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginLeft: "auto" }}>
              <div style={{ fontSize: ".82rem", fontWeight: 700, color: "#111827" }}>
                {PAGE_TITLES[activePage]}
              </div>
              <div style={{ fontSize: ".72rem", color: "#6b7280" }}>
                {PAGE_TAGS[activePage]({ orgs, influencers, requests })}
              </div>
            </div>
          </div>

          <div style={S.content} className="admin-content">
            <div className="admin-page-anim">
              {anyError ? (
                <ErrorState onRetry={refetchAll} />
              ) : firstLoad ? (
                <LoadingState />
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
