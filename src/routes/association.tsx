import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Toaster, toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { employeesDb, tasksDb, influencersDb, campaignsDb, requestsDb } from "@/lib/db";
import { INF_COLORS } from "@/components/association/data";

import AssocSidebar from "@/components/association/AssocSidebar";
import type { PageId, Task, Employee, Influencer, Campaign } from "@/components/association/types";
import { PAGE_TITLES } from "@/components/association/types";

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

const EMP_COLORS = ["#7c3aed", "#be185d", "#0369a1", "#b91c1c", "#166534", "#92400e", "#0f766e"];

function Association() {
  const navigate = useNavigate();
  const {
    user,
    role,
    assocName: savedName,
    updateAssocName,
    signOut,
    loading: authLoading,
  } = useAuth();
  const assocId = user?.id ?? "";

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
    if (!authLoading && user && role === "admin") navigate({ to: "/admin" });
    if (!authLoading && user && role === "employee") navigate({ to: "/employee" });
  }, [user, role, authLoading, navigate]);

  // Core state
  const [activePage, setActivePage] = useState<PageId>("overview");
  const [assocName, setAssocName] = useState(savedName);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contentCount, setContentCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  // Data state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Modal state
  const [taskModal, setTaskModal] = useState<{ open: boolean; task?: Task }>({ open: false });
  const [empModal, setEmpModal] = useState<{ open: boolean; employee?: Employee }>({ open: false });
  const [infModal, setInfModal] = useState<{ open: boolean; inf?: Influencer }>({ open: false });
  const [infProfileModal, setInfProfileModal] = useState<{ open: boolean; inf?: Influencer }>({
    open: false,
  });
  const [campaignModal, setCampaignModal] = useState<{ open: boolean; inf?: Influencer }>({
    open: false,
  });

  // Sync assocName from auth
  useEffect(() => {
    if (savedName) setAssocName(savedName);
  }, [savedName]);

  // Load all data
  const loadData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    const [emps, tks, infs, camps] = await Promise.all([
      employeesDb.list(user.id),
      tasksDb.list(user.id),
      influencersDb.list(),
      campaignsDb.list(user.id),
    ]);
    setEmployees(emps);
    setTasks(tks);
    setInfluencers(infs);
    setCampaigns(camps);
    setDataLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function logout() {
    await signOut();
    navigate({ to: "/login" });
  }

  // ── Task CRUD ────────────────────────────────────────────────
  async function saveTask(data: Omit<Task, "id">) {
    if (!user) return;
    if (taskModal.task) {
      await tasksDb.update(taskModal.task.id, data);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskModal.task!.id ? { ...data, id: t.id } : t)),
      );
    } else {
      const created = await tasksDb.create(user.id, data);
      if (created) setTasks((prev) => [...prev, created]);
    }
    setTaskModal({ open: false });
  }
  async function deleteTask(id: number) {
    await tasksDb.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setTaskModal({ open: false });
  }

  // ── Employee CRUD ────────────────────────────────────────────
  async function saveEmployee(data: Employee) {
    if (!user) return;
    if (empModal.employee) {
      await employeesDb.update(data.id, {
        name: data.name,
        role: data.role,
        status: data.status,
        color: data.color,
      });
      setEmployees((prev) => prev.map((e) => (e.id === data.id ? data : e)));
    } else {
      const color = EMP_COLORS[employees.length % EMP_COLORS.length];
      const created = await employeesDb.create(user.id, {
        name: data.name,
        role: data.role,
        status: data.status,
        color,
      });
      if (created) setEmployees((prev) => [...prev, created]);
    }
    setEmpModal({ open: false });
  }
  async function deleteEmployee(id: number) {
    await employeesDb.delete(id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }

  async function changeEmployeeStatus(id: number, status: Employee["status"]) {
    const employee = employees.find((e) => e.id === id);
    if (!employee) return;
    const updated = { ...employee, status };
    await employeesDb.update(id, { status });
    setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)));
  }

  // ── Influencer CRUD (admin or global list) ───────────────────
  async function saveInfluencer(data: Omit<Influencer, "id">) {
    if (infModal.inf) {
      await influencersDb.update(infModal.inf.id, data);
      setInfluencers((prev) =>
        prev.map((i) => (i.id === infModal.inf!.id ? { ...data, id: i.id } : i)),
      );
    } else {
      const created = await influencersDb.create(data);
      if (created) setInfluencers((prev) => [...prev, created]);
    }
    setInfModal({ open: false });
  }
  async function deleteInfluencer(id: number) {
    await influencersDb.delete(id);
    setInfluencers((prev) => prev.filter((i) => i.id !== id));
    setInfModal({ open: false });
  }

  // ── Campaign Request ─────────────────────────────────────────
  async function submitCampaignRequest(
    inf: Influencer,
    payload: { type: string; budget: number; startDate: string; duration: string; message: string },
  ) {
    if (!user) return;
    await requestsDb.create(user.id, inf.id, payload);
    toast.success("تم إرسال طلب الحملة بنجاح!");
    setCampaignModal({ open: false });
  }

  // ── Assoc name update ────────────────────────────────────────
  async function handleNameChange(name: string) {
    setAssocName(name);
    await updateAssocName(name);
  }

  const incompleteTasksCount = tasks.filter((t) => t.status !== "done").length;
  const assocInitial = assocName ? assocName[0] : "ج";

  if (authLoading) {
    return (
      <div
        dir="rtl"
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

  function renderPage() {
    switch (activePage) {
      case "overview":
        return (
          <OverviewPage
            assocName={assocName}
            statContent={contentCount}
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
              await tasksDb.update(id, { status });
              setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
            }}
          />
        );
      case "donations":
        return <DonationsPage userId={user?.id} />;
      case "content":
        return <ContentPage assocName={assocName ?? undefined} />;
      case "campaigns":
        return <CampaignsPage campaigns={campaigns} userId={user?.id} onRefresh={loadData} />;
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
          {dataLoading && (
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
