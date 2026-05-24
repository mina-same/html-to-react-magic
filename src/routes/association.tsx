import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

import AssocSidebar from "@/components/association/AssocSidebar";
import type { PageId, Task, Employee, Influencer } from "@/components/association/types";
import { PAGE_TITLES } from "@/components/association/types";
import {
  INITIAL_INFLUENCERS,
  INITIAL_EMPLOYEES,
  INITIAL_TASKS,
} from "@/components/association/data";

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
import CampaignRequestModal from "@/components/association/modals/CampaignRequestModal";

export const Route = createFileRoute("/association")({
  head: () => ({ meta: [{ title: "ساعِد — لوحة الجمعية" }] }),
  component: Association,
});

function Association() {
  const navigate = useNavigate();

  // Auth guard
  useEffect(() => {
    if (sessionStorage.getItem("saaid_devAccess") !== "saaid2025dev") {
      navigate({ to: "/gate" });
    }
  }, [navigate]);

  // Core state
  const [activePage, setActivePage] = useState<PageId>("overview");
  const [assocName, setAssocName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contentCount, setContentCount] = useState(0);

  // Data state
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [influencers, setInfluencers] = useState<Influencer[]>(INITIAL_INFLUENCERS);

  // Modal state
  const [taskModal, setTaskModal] = useState<{ open: boolean; task?: Task }>({ open: false });
  const [empModal, setEmpModal] = useState(false);
  const [infModal, setInfModal] = useState<{ open: boolean; inf?: Influencer }>({ open: false });
  const [campaignModal, setCampaignModal] = useState<{ open: boolean; inf?: Influencer }>({
    open: false,
  });

  function logout() {
    sessionStorage.removeItem("saaid_devAccess");
    navigate({ to: "/gate" });
  }

  // Task CRUD
  function saveTask(data: Omit<Task, "id">) {
    if (taskModal.task) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskModal.task!.id ? { ...data, id: t.id } : t)),
      );
    } else {
      setTasks((prev) => [...prev, { ...data, id: Date.now() }]);
    }
    setTaskModal({ open: false });
  }
  function deleteTask(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setTaskModal({ open: false });
  }

  // Employee CRUD — EmployeeModal doesn't send a color, so we pick one
  const EMP_COLORS = ["#7c3aed", "#be185d", "#0369a1", "#b91c1c", "#166534", "#92400e", "#0f766e"];
  function saveEmployee(data: Omit<Employee, "id" | "color">) {
    const color = EMP_COLORS[employees.length % EMP_COLORS.length];
    setEmployees((prev) => [...prev, { ...data, color, id: Date.now() }]);
    setEmpModal(false);
  }
  function deleteEmployee(id: number) {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }

  // Influencer CRUD
  function saveInfluencer(data: Omit<Influencer, "id">) {
    if (infModal.inf) {
      setInfluencers((prev) =>
        prev.map((i) => (i.id === infModal.inf!.id ? { ...data, id: i.id } : i)),
      );
    } else {
      setInfluencers((prev) => [...prev, { ...data, id: Date.now() }]);
    }
    setInfModal({ open: false });
  }
  function deleteInfluencer(id: number) {
    setInfluencers((prev) => prev.filter((i) => i.id !== id));
    setInfModal({ open: false });
  }

  const urgentTasks = tasks.filter((t) => t.urgency === "urgent" && t.status !== "done").length;
  const assocInitial = assocName ? assocName[0] : "ج";

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
              if (name) setAssocName(name);
              setContentCount((c) => c + count);
            }}
          />
        );
      case "team":
        return (
          <TeamPage
            employees={employees}
            onAdd={() => setEmpModal(true)}
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
          />
        );
      case "donations":
        return <DonationsPage />;
      case "content":
        return <ContentPage />;
      case "campaigns":
        return <CampaignsPage />;
      case "influencers":
        return (
          <InfluencersPage
            influencers={influencers}
            onAdd={() => setInfModal({ open: true })}
            onEdit={(inf) => setInfModal({ open: true, inf })}
            onRequest={(inf) => setCampaignModal({ open: true, inf })}
          />
        );
      case "services":
        return <ServicesPage onNavigate={setActivePage} />;
      case "analytics":
        return <AnalyticsPage />;
      case "settings":
        return <SettingsPage assocName={assocName} onNameChange={setAssocName} onLogout={logout} />;
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
      style={{
        display: "flex",
        height: "100dvh",
        background: "#f4f7f5",
        fontFamily: "'Tajawal','Cairo',sans-serif",
        overflow: "hidden",
      }}
    >
      <Toaster position="top-center" richColors />

      {/* Sidebar */}
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
        urgentCount={urgentTasks}
      />

      {/* Main area */}
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
          {/* Mobile menu button */}
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
            {urgentTasks > 0 && (
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
        <div
          style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}
          className="scrollbar-thin scrollbar-thumb-green-100"
        >
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

      {empModal && <EmployeeModal onSave={saveEmployee} onClose={() => setEmpModal(false)} />}

      {infModal.open && (
        <InfluencerModal
          influencer={infModal.inf ?? null}
          onSave={saveInfluencer}
          onDelete={deleteInfluencer}
          onClose={() => setInfModal({ open: false })}
        />
      )}

      {campaignModal.open && campaignModal.inf && (
        <CampaignRequestModal
          influencer={campaignModal.inf}
          influencerIndex={influencers.indexOf(campaignModal.inf)}
          onSubmit={() => setCampaignModal({ open: false })}
          onClose={() => setCampaignModal({ open: false })}
        />
      )}
    </div>
  );
}
