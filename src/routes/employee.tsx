import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { useTasks, useEmployees, useMyEmployeeRecord, useAssocOwnerName } from "@/api/queries";
import { useUpdateTaskStatus } from "@/api/mutations";
import { LoadingState } from "@/components/common/StateViews";
import type { Task, Employee } from "@/components/association/types";

export const Route = createFileRoute("/employee")({
  head: () => ({ meta: [{ title: "ساعِد — لوحة الموظف" }] }),
  component: EmployeeDashboard,
});

type PageId = "tasks" | "team" | "profile";

const URGENCY_COLOR: Record<string, string> = {
  urgent: "#dc2626",
  high: "#f97316",
  normal: "#d97706",
  low: "#16a34a",
};
const URGENCY_LABEL: Record<string, string> = {
  urgent: "عاجل جداً",
  high: "عاجل",
  normal: "عادي",
  low: "منخفض",
};
const STATUS_LABEL: Record<string, string> = {
  todo: "قيد الانتظار",
  doing: "قيد التنفيذ",
  done: "مكتمل",
  review: "مراجعة",
};
const STATUS_COLOR: Record<string, string> = {
  todo: "#6b7280",
  doing: "#0369a1",
  done: "#16a34a",
  review: "#9333ea",
};

function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user, role, assocId, loading: authLoading, signOut } = useAuth();

  // ── UI state ───────────────────────────────────────────────────
  const [activePage, _setActivePage] = useState<PageId>(() => {
    const saved = localStorage.getItem("saaid_employee_page") as PageId | null;
    return saved ?? "tasks";
  });
  function setActivePage(page: PageId) {
    localStorage.setItem("saaid_employee_page", page);
    _setActivePage(page);
  }

  // ── Auth guard ─────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate({ to: "/login" });
    else if (role === "admin") navigate({ to: "/admin" });
    else if (role === "association") navigate({ to: "/association" });
  }, [user, role, authLoading, navigate]);

  // ── Server state (React Query) ─────────────────────────────────
  const enabled = !!user && !!assocId && role === "employee";
  const myEmployeeQ = useMyEmployeeRecord(assocId ?? undefined, user?.id, enabled);
  const tasksQ = useTasks(assocId ?? undefined, enabled);
  const teamQ = useEmployees(assocId ?? undefined, enabled);
  const assocNameQ = useAssocOwnerName(assocId ?? undefined, enabled);

  const myEmployee = myEmployeeQ.data ?? null;
  const team = teamQ.data ?? [];
  const assocName = assocNameQ.data ?? "";
  // Tasks assigned to this employee only.
  const myId = myEmployee?.id;
  const tasks = (tasksQ.data ?? []).filter((t) => myId != null && t.assignee === myId);

  const updateTaskStatusMut = useUpdateTaskStatus(assocId ?? undefined);

  async function updateTaskStatus(id: number, status: Task["status"]) {
    try {
      await updateTaskStatusMut.mutateAsync({ id, status });
      toast.success("تم تحديث حالة المهمة");
    } catch (err) {
      toast.error("فشل تحديث الحالة: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function logout() {
    await signOut();
    navigate({ to: "/login" });
  }

  // ── Render gate ────────────────────────────────────────────────
  if (authLoading || myEmployeeQ.isLoading || tasksQ.isLoading) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: "100dvh",
          background: "#f4f7f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LoadingState />
      </div>
    );
  }

  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const pendingTasks = tasks.length - doneTasks;

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100dvh",
        background: "#f0f4f2",
        fontFamily: "'Tajawal','Cairo',sans-serif",
      }}
    >
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid rgba(45,122,82,.1)",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg,#1a5c3a,#2d7a52)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: ".95rem",
            }}
          >
            {myEmployee?.name?.[0] ?? "م"}
          </div>
          <div>
            <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#111827" }}>
              {myEmployee?.name ?? "موظف"}
            </div>
            <div style={{ fontSize: ".72rem", color: "#6b7280" }}>
              {myEmployee?.role ?? ""} · {assocName}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            fontSize: ".78rem",
            color: "#dc2626",
            background: "none",
            border: "1px solid rgba(220,38,38,.2)",
            padding: "5px 12px",
            borderRadius: 7,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          خروج
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ padding: "16px 20px 0", display: "flex", gap: 12 }}>
        {[
          { label: "مهامي", value: tasks.length, icon: "📋", color: "#1a5c3a" },
          { label: "مكتملة", value: doneTasks, icon: "✅", color: "#16a34a" },
          { label: "متبقية", value: pendingTasks, icon: "⏳", color: "#d97706" },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              flex: 1,
              background: "white",
              borderRadius: 11,
              padding: "14px 16px",
              border: "1px solid rgba(45,122,82,.1)",
            }}
          >
            <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>{card.icon}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: card.color }}>
              {card.value}
            </div>
            <div style={{ fontSize: ".72rem", color: "#6b7280", marginTop: 2 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Nav tabs */}
      <div style={{ display: "flex", gap: 6, padding: "14px 20px 0" }}>
        {(
          [
            ["tasks", "مهامي", "📋"],
            ["team", "الفريق", "👥"],
            ["profile", "ملفي", "👤"],
          ] as const
        ).map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() => setActivePage(id)}
            style={{
              padding: "8px 16px",
              borderRadius: 9,
              border: "none",
              fontSize: ".82rem",
              fontWeight: activePage === id ? 700 : 500,
              background: activePage === id ? "#1a5c3a" : "white",
              color: activePage === id ? "white" : "#374151",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "all .15s",
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "16px 20px 32px" }}>
        {/* Tasks page */}
        {activePage === "tasks" && (
          <div>
            {tasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 0", color: "#9ca3af" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>📭</div>
                <div style={{ fontSize: ".88rem" }}>لا توجد مهام مسندة إليك حالياً</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      background: "white",
                      borderRadius: 11,
                      padding: "14px 16px",
                      border: "1px solid rgba(45,122,82,.1)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#111827" }}>
                          {task.title}
                        </div>
                        {task.category && (
                          <div style={{ fontSize: ".72rem", color: "#6b7280", marginTop: 2 }}>
                            {task.category}
                          </div>
                        )}
                        {task.notes && (
                          <div
                            style={{
                              fontSize: ".78rem",
                              color: "#374151",
                              marginTop: 4,
                              lineHeight: 1.5,
                            }}
                          >
                            {task.notes}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 5,
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: ".68rem",
                            padding: "2px 8px",
                            borderRadius: 20,
                            fontWeight: 700,
                            background: `${URGENCY_COLOR[task.urgency]}18`,
                            color: URGENCY_COLOR[task.urgency],
                          }}
                        >
                          {URGENCY_LABEL[task.urgency] ?? task.urgency}
                        </span>
                        {task.deadline && (
                          <div style={{ fontSize: ".68rem", color: "#9ca3af" }}>
                            📅 {new Date(task.deadline).toLocaleDateString("ar-SA")}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Status selector */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(["todo", "doing", "review", "done"] as Task["status"][]).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateTaskStatus(task.id, s)}
                          style={{
                            fontSize: ".7rem",
                            padding: "3px 10px",
                            borderRadius: 20,
                            border: `1.5px solid ${task.status === s ? STATUS_COLOR[s] : "rgba(0,0,0,.1)"}`,
                            background: task.status === s ? `${STATUS_COLOR[s]}15` : "transparent",
                            color: task.status === s ? STATUS_COLOR[s] : "#9ca3af",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontWeight: task.status === s ? 700 : 400,
                            transition: "all .15s",
                          }}
                        >
                          {STATUS_LABEL[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Team page */}
        {activePage === "team" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {team.map((emp) => (
              <div
                key={emp.id}
                style={{
                  background: "white",
                  borderRadius: 11,
                  padding: "12px 16px",
                  border: "1px solid rgba(45,122,82,.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: emp.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: ".9rem",
                    flexShrink: 0,
                  }}
                >
                  {emp.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#111827" }}>
                    {emp.name}
                    {emp.id === myEmployee?.id && (
                      <span
                        style={{
                          fontSize: ".65rem",
                          marginRight: 6,
                          color: "#2d7a52",
                          fontWeight: 700,
                        }}
                      >
                        أنت
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: ".73rem", color: "#6b7280" }}>{emp.role}</div>
                </div>
                <span
                  style={{
                    fontSize: ".68rem",
                    padding: "2px 9px",
                    borderRadius: 20,
                    fontWeight: 600,
                    background:
                      emp.status === "active"
                        ? "#e8f5ee"
                        : emp.status === "away"
                          ? "#fef3c7"
                          : "#fee2e2",
                    color:
                      emp.status === "active"
                        ? "#166534"
                        : emp.status === "away"
                          ? "#92400e"
                          : "#991b1b",
                  }}
                >
                  {emp.status === "active" ? "نشط" : emp.status === "away" ? "بعيد" : "خارج العمل"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Profile page */}
        {activePage === "profile" && (
          <div
            style={{
              background: "white",
              borderRadius: 13,
              padding: 20,
              border: "1px solid rgba(45,122,82,.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: myEmployee?.color ?? "#2d7a52",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 800,
                  fontSize: "1.4rem",
                }}
              >
                {myEmployee?.name?.[0] ?? "م"}
              </div>
              <div>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#111827" }}>
                  {myEmployee?.name}
                </div>
                <div style={{ fontSize: ".8rem", color: "#6b7280" }}>{myEmployee?.role}</div>
              </div>
            </div>
            {[
              { label: "الجمعية", value: assocName, icon: "🏢" },
              {
                label: "الحالة",
                value:
                  myEmployee?.status === "active"
                    ? "نشط"
                    : myEmployee?.status === "away"
                      ? "بعيد"
                      : "خارج العمل",
                icon: "🟢",
              },
              { label: "المهام المسندة", value: `${tasks.length} مهمة`, icon: "📋" },
              { label: "المهام المكتملة", value: `${doneTasks} مهمة`, icon: "✅" },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(0,0,0,.05)",
                }}
              >
                <span style={{ fontSize: "1.1rem", width: 24, textAlign: "center" }}>
                  {row.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: ".72rem", color: "#9ca3af", fontWeight: 600 }}>
                    {row.label}
                  </div>
                  <div
                    style={{ fontSize: ".88rem", color: "#111827", fontWeight: 600, marginTop: 1 }}
                  >
                    {row.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
