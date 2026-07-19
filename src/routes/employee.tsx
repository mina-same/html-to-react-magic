import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClipboardList, CheckCircle2, Clock3, Users, User, Inbox, Calendar } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useTasks, useEmployees, useMyEmployeeRecord, useAssocOwnerName } from "@/api/queries";
import { useUpdateTaskStatus } from "@/api/mutations";
import { LoadingState } from "@/components/common/StateViews";
import { DashboardShell, type DashboardNavGroup } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Task, Employee } from "@/components/association/types";

export const Route = createFileRoute("/employee")({
  head: () => ({ meta: [{ title: "ساعِد — لوحة الموظف" }] }),
  component: EmployeeDashboard,
});

type PageId = "tasks" | "team" | "profile";

const NAV_GROUPS: DashboardNavGroup[] = [
  {
    label: "لوحتي",
    items: [
      { id: "tasks", label: "مهامي", icon: ClipboardList },
      { id: "team", label: "الفريق", icon: Users },
      { id: "profile", label: "ملفي", icon: User },
    ],
  },
];

const URGENCY_LABEL: Record<string, string> = {
  urgent: "عاجل جداً",
  high: "عاجل",
  normal: "عادي",
  low: "منخفض",
};
const URGENCY_CLASS: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  normal: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
};
const STATUS_LABEL: Record<string, string> = {
  todo: "قيد الانتظار",
  doing: "قيد التنفيذ",
  done: "مكتمل",
  review: "مراجعة",
};
const STATUS_CLASS: Record<string, string> = {
  todo: "border-slate-300 text-slate-500",
  doing: "border-sky-300 text-sky-700",
  done: "border-emerald-300 text-emerald-700",
  review: "border-violet-300 text-violet-700",
};
const STATUS_CLASS_ACTIVE: Record<string, string> = {
  todo: "bg-slate-100",
  doing: "bg-sky-100",
  done: "bg-emerald-100",
  review: "bg-violet-100",
};
const EMP_STATUS_LABEL: Record<Employee["status"], string> = {
  active: "نشط",
  away: "بعيد",
  off: "خارج العمل",
};
const EMP_STATUS_CLASS: Record<Employee["status"], string> = {
  active: "bg-secondary text-primary",
  away: "bg-amber-100 text-amber-800",
  off: "bg-red-100 text-red-800",
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
      <div dir="rtl" className="flex min-h-dvh items-center justify-center bg-app-bg">
        <LoadingState />
      </div>
    );
  }

  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const pendingTasks = tasks.length - doneTasks;
  const employeeInitial = myEmployee?.name?.[0] ?? "م";

  const PAGE_TITLES: Record<PageId, string> = {
    tasks: "مهامي",
    team: "الفريق",
    profile: "ملفي",
  };

  return (
    <div dir="rtl">
      <DashboardShell
        navGroups={NAV_GROUPS}
        activePage={activePage}
        onNavigate={(page) => setActivePage(page as PageId)}
        pageTitle={PAGE_TITLES[activePage]}
        identityName={myEmployee?.name ?? "موظف"}
        identityInitial={employeeInitial}
        identitySubtitle={myEmployee?.role ? `${myEmployee.role} · ${assocName}` : assocName}
        onLogout={logout}
      >
        {/* Summary cards */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <StatCard label="مهامي" value={tasks.length} icon={ClipboardList} tone="primary" />
          <StatCard label="مكتملة" value={doneTasks} icon={CheckCircle2} tone="primary" />
          <StatCard label="متبقية" value={pendingTasks} icon={Clock3} tone="gold" />
        </div>

        {/* Tasks page */}
        {activePage === "tasks" && (
          <div>
            {tasks.length === 0 ? (
              <EmptyState icon={Inbox} title="لا توجد مهام مسندة إليك حالياً" />
            ) : (
              <div className="flex flex-col gap-2.5">
                {tasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="flex flex-col gap-2.5 p-4">
                      <div className="flex items-start justify-between gap-2.5">
                        <div>
                          <div className="text-sm font-bold text-foreground">{task.title}</div>
                          {task.category && (
                            <div className="mt-0.5 text-xs text-muted-foreground">{task.category}</div>
                          )}
                          {task.notes && (
                            <div className="mt-1 text-sm leading-6 text-foreground/80">{task.notes}</div>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-bold",
                              URGENCY_CLASS[task.urgency],
                            )}
                          >
                            {URGENCY_LABEL[task.urgency] ?? task.urgency}
                          </span>
                          {task.deadline && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.deadline).toLocaleDateString("ar-SA")}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(["todo", "doing", "review", "done"] as Task["status"][]).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateTaskStatus(task.id, s)}
                            className={cn(
                              "rounded-full border-[1.5px] px-2.5 py-1 text-xs font-medium transition-colors",
                              task.status === s
                                ? cn(STATUS_CLASS[s], STATUS_CLASS_ACTIVE[s], "font-bold")
                                : "border-border text-muted-foreground",
                            )}
                          >
                            {STATUS_LABEL[s]}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Team page */}
        {activePage === "team" && (
          <div className="flex flex-col gap-2.5">
            {team.map((emp) => (
              <Card key={emp.id}>
                <CardContent className="flex items-center gap-3 p-3.5">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback style={{ background: emp.color }} className="text-sm font-bold text-white">
                      {emp.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-foreground">
                      {emp.name}
                      {emp.id === myEmployee?.id && (
                        <span className="mr-1.5 text-xs font-bold text-primary">أنت</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{emp.role}</div>
                  </div>
                  <Badge className={cn("hover:bg-inherit", EMP_STATUS_CLASS[emp.status])}>
                    {EMP_STATUS_LABEL[emp.status]}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Profile page */}
        {activePage === "profile" && (
          <Card>
            <CardContent className="p-5">
              <div className="mb-5 flex items-center gap-3.5">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-extrabold text-white"
                  style={{ background: myEmployee?.color ?? "#2d7a52" }}
                >
                  {myEmployee?.name?.[0] ?? "م"}
                </div>
                <div>
                  <div className="text-lg font-extrabold text-foreground">{myEmployee?.name}</div>
                  <div className="text-sm text-muted-foreground">{myEmployee?.role}</div>
                </div>
              </div>
              {[
                { label: "الجمعية", value: assocName, icon: "🏢" },
                {
                  label: "الحالة",
                  value: myEmployee ? EMP_STATUS_LABEL[myEmployee.status] : "—",
                  icon: "🟢",
                },
                { label: "المهام المسندة", value: `${tasks.length} مهمة`, icon: "📋" },
                { label: "المهام المكتملة", value: `${doneTasks} مهمة`, icon: "✅" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 border-b py-2.5 last:border-b-0">
                  <span className="w-6 text-center text-lg">{row.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-muted-foreground">{row.label}</div>
                    <div className="mt-0.5 text-sm font-semibold text-foreground">{row.value}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </DashboardShell>
    </div>
  );
}
