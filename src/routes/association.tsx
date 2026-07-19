import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutGrid,
  ClipboardList,
  Users,
  CheckSquare,
  CreditCard,
  Sparkles,
  Captions,
  Megaphone,
  Star,
  Wrench,
  BarChart3,
  Settings,
} from "lucide-react";

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

import { DashboardShell, type DashboardNavGroup } from "@/components/dashboard/DashboardShell";
import Onboarding from "@/components/association/Onboarding";
import type { PageId, Task, Employee, Influencer } from "@/components/association/types";
import { PAGE_TITLES } from "@/components/association/types";
import { keys } from "@/api/keys";

const NAV_GROUPS: DashboardNavGroup[] = [
  {
    label: "الرئيسية",
    items: [
      { id: "overview", label: "نظرة عامة", icon: LayoutGrid },
      { id: "profile", label: "ملف الجمعية", icon: ClipboardList, badge: "AI" },
    ],
  },
  {
    label: "الإدارة",
    items: [
      { id: "team", label: "الفريق", icon: Users },
      { id: "tasks", label: "المهام", icon: CheckSquare },
      { id: "donations", label: "التبرعات", icon: CreditCard },
    ],
  },
  {
    label: "المحتوى",
    items: [
      { id: "content", label: "محتوى تسويقي", icon: Sparkles },
      { id: "captions", label: "ترجمة الفيديو", icon: Captions },
      { id: "campaigns", label: "الحملات", icon: Megaphone },
      { id: "influencers", label: "المؤثرون", icon: Star },
    ],
  },
  {
    label: "الخدمات",
    items: [
      { id: "services", label: "خدماتنا", icon: Wrench },
      { id: "analytics", label: "التحليلات", icon: BarChart3 },
    ],
  },
  {
    label: "الإعدادات",
    items: [{ id: "settings", label: "الإعدادات", icon: Settings }],
  },
];

import OverviewPage from "@/components/association/pages/OverviewPage";
import ProfilePage from "@/components/association/pages/ProfilePage";
import TeamPage from "@/components/association/pages/TeamPage";
import TasksPage from "@/components/association/pages/TasksPage";
import DonationsPage from "@/components/association/pages/DonationsPage";
import ContentPage from "@/components/association/pages/ContentPage";
import CaptionsWorkspace from "@/components/captions/CaptionsWorkspace";
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
        className="flex min-h-dvh items-center justify-center bg-app-bg text-base font-semibold text-green-mid"
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
      case "captions":
        return <CaptionsWorkspace embedded />;
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

  const navGroups: DashboardNavGroup[] = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.map((item) =>
      item.id === "tasks" && incompleteTasksCount > 0
        ? { ...item, badge: incompleteTasksCount, badgeVariant: "destructive" as const }
        : item,
    ),
  }));

  return (
    <div dir="rtl" suppressHydrationWarning>
      <DashboardShell
        navGroups={navGroups}
        activePage={activePage}
        onNavigate={(page) => setActivePage(page as PageId)}
        pageTitle={PAGE_TITLES[activePage]}
        identityName={assocName}
        identityInitial={assocInitial}
        identitySubtitle="جمعية خيرية"
        onLogout={logout}
        notificationCount={incompleteTasksCount}
        topbarExtras={
          dataFetching ? (
            <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
              جاري التحديث…
            </span>
          ) : undefined
        }
      >
        {renderPage()}
      </DashboardShell>

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
