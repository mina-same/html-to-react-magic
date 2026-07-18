import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { useEmployees, useTasks, useCampaigns, useDonations, useInfluencers } from "@/api/queries";
import {
  useSaveTask,
  useDeleteTask,
  useUpdateTaskStatus,
  useSaveEmployee,
  useDeleteEmployee,
  useUpdateEmployeeStatus,
  useSaveInfluencer,
  useDeleteInfluencer,
  useSubmitCampaignRequest,
} from "@/api/mutations";

import AssocSidebar from "@/components/association/AssocSidebar";
import Onboarding from "@/components/association/Onboarding";
import type { PageId, Task, Employee, Influencer } from "@/components/association/types";
import { PAGE_TITLES } from "@/components/association/types";
import { keys } from "@/api/keys";

import OverviewPage from "@/components/association/pages/OverviewPage";
import ProfilePage from "@/components/association/pages/ProfilePage";
import TeamPage from "@/components/association/pages/TeamPage";
import TasksPage from "@/components/association/pages/TasksPage";
import DonationsPage from "@/components/association/pages/DonationsPage";
import ContentPage from "@/components/association/pages/ContentPage";
import CampaignsPage from "@/components/association/pages/CampaignsPage";
import InfluencersPage from "@/components/association/pages/InfluencersPage";
import ServicesPage from "@/components/association/pages/ServicesPage";
import AnalyticsPage from "@/components/association/pages/AnalyticsPage";
import SettingsPage from "@/components/association/pages/SettingsPage";

import TaskModal from "@/components/association/modals/TaskModal";
import EmployeeModal from "@/components/association/modals/EmployeeModal";
import InfluencerModal from "@/components/association/modals/InfluencerModal";
import InfluencerProfileModal from "@/components/association/modals/InfluencerProfileModal";
import CampaignRequestModal from "@/components/association/modals/CampaignRequestModal";

export const Route = createFileRoute("/association")({
  head: () => ({ meta: [{ title: "ساعِد — لوحة الجمعية" }] }),
  component: Association,
});

function Association() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const {
    user,
    role,
    assocName: savedName,
    updateAssocName,
    signOut,
    loading: authLoading,
    associationProfile,
  } = useAuth();
  const assocId = user?.id ?? "";

  // Onboarding gate: association with no profile / missing required fields.
  const needsOnboarding =
    role === "association" &&
    !authLoading &&
    (!associationProfile ||
      !associationProfile.license ||
      !associationProfile.region ||
      !associationProfile.phone);

  // ── UI state only ──────────────────────────────────────────────
  const [activePage, _setActivePage] = useState<PageId>("overview");
  const [assocName, setAssocName] = useState(savedName);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contentCount, setContentCount] = useState(0);

  const [taskModal, setTaskModal] = useState<{ open: boolean; task?: Task }>({ open: false });
  const [empModal, setEmpModal] = useState<{ open: boolean; employee?: Employee }>({ open: false });
  const [infModal, setInfModal] = useState<{ open: boolean; inf?: Influencer }>({ open: false });
  const [infProfileModal, setInfProfileModal] = useState<{ open: boolean; inf?: Influencer }>({
    open: false,
  });
  const [campaignModal, setCampaignModal] = useState<{ open: boolean; inf?: Influencer }>({
    open: false,
  });

  // Restore last active tab.
  useEffect(() => {
    const saved = localStorage.getItem("saaid_assoc_page") as PageId | null;
    if (saved) _setActivePage(saved);
  }, []);

  // Sync assocName from auth provider.
  useEffect(() => {
    if (savedName) setAssocName(savedName);
  }, [savedName]);

  function setActivePage(page: PageId) {
    localStorage.setItem("saaid_assoc_page", page);
    _setActivePage(page);
  }

  // ── Auth guard ─────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate({ to: "/login" });
    else if (role === "admin") navigate({ to: "/admin" });
    else if (role === "employee") navigate({ to: "/employee" });
  }, [user, role, authLoading, navigate]);

  // ── Server state (React Query) ─────────────────────────────────
  const enabled = !!user && role === "association";
  const employeesQ = useEmployees(assocId, enabled);
  const tasksQ = useTasks(assocId, enabled);
  const campaignsQ = useCampaigns(assocId, enabled);
  const donationsQ = useDonations(assocId, enabled);
  const influencersQ = useInfluencers(enabled);

  const employees = employeesQ.data ?? [];
  const tasks = tasksQ.data ?? [];
  const campaigns = campaignsQ.data ?? [];
  const donations = donationsQ.data ?? [];
  const influencers = influencersQ.data ?? [];
  const dataFetching = employeesQ.isFetching || tasksQ.isFetching || campaignsQ.isFetching;

  // ── Mutations ──────────────────────────────────────────────────
  const saveTaskMut = useSaveTask(assocId);
  const deleteTaskMut = useDeleteTask(assocId);
  const updateTaskStatusMut = useUpdateTaskStatus(assocId);
  const saveEmployeeMut = useSaveEmployee(assocId);
  const deleteEmployeeMut = useDeleteEmployee(assocId);
  const updateEmployeeStatusMut = useUpdateEmployeeStatus(assocId);
  const saveInfluencerMut = useSaveInfluencer();
  const deleteInfluencerMut = useDeleteInfluencer();
  const submitRequestMut = useSubmitCampaignRequest();

  // ── Handlers ───────────────────────────────────────────────────
  async function logout() {
    await signOut();
    navigate({ to: "/login" });
  }

  async function handleNameChange(name: string) {
    setAssocName(name);
    await updateAssocName(name);
  }

  async function saveTask(data: Omit<Task, "id"> & { id?: number }) {
    try {
      await saveTaskMut.mutateAsync({ id: data.id, data });
      setTaskModal({ open: false });
    } catch (err) {
      toast.error("فشل حفظ المهمة: " + (err instanceof Error ? err.message : String(err)));
    }
  }
  async function deleteTask(id: number) {
    try {
      await deleteTaskMut.mutateAsync(id);
      setTaskModal({ open: false });
    } catch (err) {
      toast.error("فشل حذف المهمة: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function saveEmployee(data: Employee) {
    try {
      await saveEmployeeMut.mutateAsync({ employee: data, count: employees.length });
      setEmpModal({ open: false });
    } catch (err) {
      toast.error("فشل حفظ الموظف: " + (err instanceof Error ? err.message : String(err)));
    }
  }
  async function deleteEmployee(id: number) {
    try {
      await deleteEmployeeMut.mutateAsync(id);
    } catch (err) {
      toast.error("فشل حذف الموظف: " + (err instanceof Error ? err.message : String(err)));
    }
  }
  async function changeEmployeeStatus(id: number, status: Employee["status"]) {
    try {
      await updateEmployeeStatusMut.mutateAsync({ id, status });
    } catch (err) {
      toast.error("فشل تحديث الحالة: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function saveInfluencer(data: Omit<Influencer, "id"> & { id?: number }) {
    try {
      await saveInfluencerMut.mutateAsync(data as Partial<Influencer>);
      setInfModal({ open: false });
    } catch (err) {
      toast.error("فشل حفظ المؤثر: " + (err instanceof Error ? err.message : String(err)));
    }
  }
  async function deleteInfluencer(id: number) {
    try {
      await deleteInfluencerMut.mutateAsync(id);
      setInfModal({ open: false });
    } catch (err) {
      toast.error("فشل حذف المؤثر: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function submitCampaignRequest(
    inf: Influencer,
    payload: { type: string; budget: number; startDate: string; duration: string; message: string },
  ) {
    if (!user) return;
    try {
      await submitRequestMut.mutateAsync({ assocId: user.id, influencerId: inf.id, payload });
      toast.success("تم إرسال طلب الحملة بنجاح!");
      setCampaignModal({ open: false });
    } catch (err) {
      toast.error("فشل إرسال الطلب: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  function refreshAssocData() {
    qc.invalidateQueries({ queryKey: ["assoc", assocId] });
  }

  const incompleteTasksCount = tasks.filter((t) => t.status !== "done").length;
  const assocInitial = assocName ? assocName[0] : "ج";

  if (authLoading) {
    return (
      <div
        dir="rtl"
        suppressHydrationWarning
        style={{
          minHeight: "100dvh",
          background: "#f4f7f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Tajawal','Cairo',sans-serif",
          color: "#2d7a52",
          fontSize: "1rem",
          fontWeight: 600,
        }}
      >
        جاري التحميل…
      </div>
    );
  }

  if (needsOnboarding) return <Onboarding onComplete={() => {}} />;

  function renderPage() {
    switch (activePage) {
      case "overview":
        return (
          <OverviewPage
            assocName={assocName}
            statContent={contentCount}
            tasks={tasks}
            employees={employees}
            campaigns={campaigns}
            donations={donations}
            onNavigate={setActivePage}
          />
        );
      case "profile":
        return (
          <ProfilePage
            onAnalysisComplete={(name, count) => {
              if (name) handleNameChange(name);
              setContentCount((c) => c + count);
            }}
            onNavigate={(p) => setActivePage(p as PageId)}
          />
        );
      case "team":
        return (
          <TeamPage
            employees={employees}
            onAdd={() => setEmpModal({ open: true })}
            onEdit={(employee) => setEmpModal({ open: true, employee })}
            onStatusChange={changeEmployeeStatus}
            onDelete={deleteEmployee}
          />
        );
      case "tasks":
        return (
          <TasksPage
            tasks={tasks}
            employees={employees}
            onAddTask={() => setTaskModal({ open: true })}
            onEditTask={(task) => setTaskModal({ open: true, task })}
            onStatusChange={async (id, status) => {
              try {
                await updateTaskStatusMut.mutateAsync({ id, status });
              } catch (err) {
                toast.error(
                  "فشل تحديث الحالة: " + (err instanceof Error ? err.message : String(err)),
                );
              }
            }}
          />
        );
      case "donations":
        return <DonationsPage userId={user?.id} />;
      case "content":
        return <ContentPage assocName={assocName ?? undefined} />;
      case "campaigns":
        return (
          <CampaignsPage campaigns={campaigns} userId={user?.id} onRefresh={refreshAssocData} />
        );
      case "influencers":
        return (
          <InfluencersPage
            influencers={influencers}
            canManage={false}
            onView={(inf) => setInfProfileModal({ open: true, inf })}
            onRequest={(inf) => setCampaignModal({ open: true, inf })}
          />
        );
      case "services":
        return <ServicesPage onNavigate={setActivePage} />;
      case "analytics":
        return <AnalyticsPage />;
      case "settings":
        return (
          <SettingsPage assocName={assocName} onNameChange={handleNameChange} onLogout={logout} />
        );
      default:
        return (
          <OverviewPage
            assocName={assocName}
            statContent={contentCount}
            tasks={tasks}
            employees={employees}
            campaigns={campaigns}
            donations={donations}
            onNavigate={setActivePage}
          />
        );
    }
  }

  return (
    <div
      dir="rtl"
      suppressHydrationWarning
      style={{
        display: "flex",
        height: "100dvh",
        background: "#f4f7f5",
        fontFamily: "'Tajawal','Cairo',sans-serif",
        overflow: "hidden",
      }}
    >
      <Toaster position="top-center" richColors />

      <AssocSidebar
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          setSidebarOpen(false);
        }}
        assocName={assocName}
        assocInitial={assocInitial}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        tasksCount={incompleteTasksCount}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Topbar */}
        <div
          style={{
            height: 58,
            background: "white",
            borderBottom: "1px solid rgba(45,122,82,.12)",
            display: "flex",
            alignItems: "center",
            padding: "0 22px",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: "1px solid rgba(45,122,82,.15)",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1rem",
              flexShrink: 0,
            }}
          >
            ☰
          </button>
          <div style={{ fontSize: "1.02rem", fontWeight: 700, color: "#111827", flex: 1 }}>
            {PAGE_TITLES[activePage]}
          </div>
          {assocName && (
            <span
              style={{
                fontSize: ".83rem",
                fontWeight: 600,
                color: "#2d7a52",
                background: "#e8f5ee",
                padding: "5px 12px",
                borderRadius: 20,
                whiteSpace: "nowrap",
              }}
            >
              {assocName}
            </span>
          )}
          {dataFetching && (
            <span style={{ fontSize: ".72rem", color: "#9ca3af" }}>جاري التحديث…</span>
          )}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1.5px solid rgba(45,122,82,.12)",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: ".95rem",
              position: "relative",
              flexShrink: 0,
            }}
          >
            🔔
            {incompleteTasksCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 5,
                  left: 5,
                  width: 6,
                  height: 6,
                  background: "#c9a84c",
                  borderRadius: "50%",
                  border: "2px solid white",
                }}
              />
            )}
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>{renderPage()}</div>
        </div>
      </div>

      {/* Modals */}
      {taskModal.open && (
        <TaskModal
          task={taskModal.task ?? null}
          employees={employees}
          onSave={saveTask}
          onDelete={deleteTask}
          onClose={() => setTaskModal({ open: false })}
        />
      )}
      {empModal.open && (
        <EmployeeModal
          employee={empModal.employee ?? null}
          assocId={assocId}
          onSave={saveEmployee}
          onClose={() => setEmpModal({ open: false })}
        />
      )}
      {infModal.open && (
        <InfluencerModal
          influencer={infModal.inf ?? null}
          onSave={saveInfluencer}
          onDelete={deleteInfluencer}
          onClose={() => setInfModal({ open: false })}
        />
      )}
      {infProfileModal.open && (
        <InfluencerProfileModal
          influencer={infProfileModal.inf ?? null}
          onClose={() => setInfProfileModal({ open: false })}
          onRequest={(inf) => setCampaignModal({ open: true, inf })}
        />
      )}
      {campaignModal.open && campaignModal.inf && (
        <CampaignRequestModal
          influencer={campaignModal.inf}
          influencerIndex={influencers.indexOf(campaignModal.inf)}
          onSubmit={(payload) => submitCampaignRequest(campaignModal.inf!, payload)}
          onClose={() => setCampaignModal({ open: false })}
        />
      )}
    </div>
  );
}
