import { useMemo, useRef, useState } from "react";
import type { Task, Employee } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  tasks: Task[];
  employees: Employee[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onStatusChange: (id: number, status: Task["status"]) => void;
}

const URGENCY_STYLE: Record<Task["urgency"], React.CSSProperties> = {
  urgent: { background: "#fee2e2", color: "#b91c1c" },
  high: { background: "#fef3c7", color: "#92400e" },
  normal: { background: "#e0f2fe", color: "#0369a1" },
  low: { background: "#f0fdf4", color: "#166534" },
};

const URGENCY_LABEL: Record<Task["urgency"], string> = {
  urgent: "⚡ عاجلة",
  high: "🔶 مرتفعة",
  normal: "🔵 عادية",
  low: "🟢 منخفضة",
};

const STATUS_META: Record<
  Task["status"],
  { label: string; dot: string; top: string; chip: React.CSSProperties }
> = {
  todo: {
    label: "لم تبدأ",
    dot: "#94a3b8",
    top: "#94a3b8",
    chip: { background: "#f1f5f9", color: "#64748b" },
  },
  doing: {
    label: "قيد التنفيذ",
    dot: "#f59e0b",
    top: "#f59e0b",
    chip: { background: "#fef3c7", color: "#92400e" },
  },
  review: {
    label: "مراجعة",
    dot: "#8b5cf6",
    top: "#8b5cf6",
    chip: { background: "#ede9fe", color: "#6d28d9" },
  },
  done: {
    label: "مكتملة",
    dot: "#2d7a52",
    top: "#2d7a52",
    chip: { background: "#dcfce7", color: "#166534" },
  },
};

const COLS: { id: Task["status"]; label: string }[] = [
  { id: "todo", label: "لم تبدأ" },
  { id: "doing", label: "قيد التنفيذ" },
  { id: "review", label: "مراجعة" },
  { id: "done", label: "مكتملة" },
];

const FILTER_INPUT: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1.5px solid rgba(45,122,82,.12)",
  fontFamily: "'Tajawal','Cairo',sans-serif",
  fontSize: ".86rem",
  color: "#111827",
  outline: "none",
  background: "white",
  boxSizing: "border-box",
};

function isOverdue(deadline: string) {
  return deadline && new Date(deadline) < new Date();
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ");
}

export default function TasksPage({
  tasks,
  employees,
  onAddTask,
  onEditTask,
  onStatusChange,
}: Props) {
  const draggingId = useRef<number | null>(null);
  const [query, setQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<Task["status"] | "all">("all");
  const [urgencyFilter, setUrgencyFilter] = useState<Task["urgency"] | "all">("all");
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  const urgentCount = tasks.filter((t) => t.urgency === "urgent" && t.status !== "done").length;

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();

    return tasks.filter((task) => {
      const searchable = [task.title, task.category, stripHtml(task.notes)].join(" ").toLowerCase();
      const matchesQuery = !q || searchable.includes(q);

      const matchesAssignee =
        assigneeFilter === "all"
          ? true
          : assigneeFilter === "unassigned"
            ? task.assignee === 0
            : task.assignee === Number(assigneeFilter);

      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesUrgency = urgencyFilter === "all" || task.urgency === urgencyFilter;
      const matchesOverdue = !onlyOverdue || (task.deadline ? isOverdue(task.deadline) : false);

      return matchesQuery && matchesAssignee && matchesStatus && matchesUrgency && matchesOverdue;
    });
  }, [tasks, query, assigneeFilter, statusFilter, urgencyFilter, onlyOverdue]);

  function empName(id: number) {
    return employees.find((e) => e.id === id)?.name ?? "";
  }
  function empColor(id: number) {
    return employees.find((e) => e.id === id)?.color ?? "#6b7280";
  }
  function empInitial(id: number) {
    return (employees.find((e) => e.id === id)?.name ?? "?")[0];
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: 13,
        border: "1px solid rgba(45,122,82,.12)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid rgba(45,122,82,.12)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 7,
            background: "#e8f5ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✅
        </div>
        <div>
          <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>لوحة المهام</div>
          <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>
            اسحب البطاقات لتغيير الحالة
          </div>
        </div>
        <div style={{ marginRight: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {urgentCount > 0 && (
            <span
              style={{
                fontSize: ".72rem",
                background: "#fef3c7",
                color: "#92400e",
                padding: "2px 9px",
                borderRadius: 20,
                fontWeight: 600,
              }}
            >
              ⚡ {urgentCount} عاجلة
            </span>
          )}
          <Button
            size="sm"
            onClick={onAddTask}
            style={{
              background: "#2d7a52",
              color: "white",
              fontSize: ".78rem",
              padding: "6px 13px",
              borderRadius: 7,
            }}
          >
            + مهمة جديدة
          </Button>
        </div>
      </div>

      <div style={{ padding: 14, borderBottom: "1px solid rgba(45,122,82,.10)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr auto",
            gap: 10,
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: ".72rem",
                fontWeight: 700,
                color: "#6b7280",
                marginBottom: 5,
              }}
            >
              البحث
            </label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث بعنوان المهمة أو التصنيف..."
              style={FILTER_INPUT}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: ".72rem",
                fontWeight: 700,
                color: "#6b7280",
                marginBottom: 5,
              }}
            >
              المسؤول
            </label>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              style={FILTER_INPUT}
            >
              <option value="all">الكل</option>
              <option value="unassigned">غير مسند</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: ".72rem",
                fontWeight: 700,
                color: "#6b7280",
                marginBottom: 5,
              }}
            >
              الحالة
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Task["status"] | "all")}
              style={FILTER_INPUT}
            >
              <option value="all">الكل</option>
              {COLS.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: ".72rem",
                fontWeight: 700,
                color: "#6b7280",
                marginBottom: 5,
              }}
            >
              الأولوية
            </label>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value as Task["urgency"] | "all")}
              style={FILTER_INPUT}
            >
              <option value="all">الكل</option>
              <option value="urgent">عاجلة</option>
              <option value="high">مرتفعة</option>
              <option value="normal">عادية</option>
              <option value="low">منخفضة</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span
              style={{
                display: "block",
                fontSize: ".72rem",
                fontWeight: 700,
                color: "#6b7280",
              }}
            >
              إضافي
            </span>
            <button
              type="button"
              onClick={() => setOnlyOverdue((v) => !v)}
              style={{
                ...FILTER_INPUT,
                cursor: "pointer",
                fontWeight: 600,
                color: onlyOverdue ? "#92400e" : "#374151",
                background: onlyOverdue ? "#fef3c7" : "white",
              }}
            >
              {onlyOverdue ? "عرض المتأخرة فقط" : "كل المواعيد"}
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setQuery("");
              setAssigneeFilter("all");
              setStatusFilter("all");
              setUrgencyFilter("all");
              setOnlyOverdue(false);
            }}
            style={{
              height: 38,
              borderColor: "rgba(45,122,82,.2)",
              color: "#2d7a52",
              background: "white",
              whiteSpace: "nowrap",
            }}
          >
            تصفير
          </Button>
        </div>

        <div style={{ marginTop: 10, fontSize: ".75rem", color: "#6b7280" }}>
          عرض {filteredTasks.length} من {tasks.length} مهمة
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3" style={{ padding: 14 }}>
        {COLS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const meta = STATUS_META[col.id];

          return (
            <div
              key={col.id}
              style={{ background: "#f2faf6", borderRadius: 10, minHeight: 300 }}
              onDragOver={(e) => {
                e.preventDefault();
                (e.currentTarget as HTMLDivElement).style.outline = "2px dashed #2d7a52";
              }}
              onDragLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.outline = "";
              }}
              onDrop={(e) => {
                e.preventDefault();
                (e.currentTarget as HTMLDivElement).style.outline = "";
                const rawId = e.dataTransfer.getData("text/plain");
                const taskId = Number(rawId || draggingId.current);
                if (!Number.isNaN(taskId) && taskId > 0) {
                  onStatusChange(taskId, col.id);
                }
                draggingId.current = null;
              }}
            >
              <div
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid rgba(45,122,82,.12)",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  borderRadius: "10px 10px 0 0",
                  background: "white",
                  borderTop: `3px solid ${meta.top}`,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: meta.dot,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#111827" }}>
                  {meta.label}
                </span>
                <span
                  style={{
                    fontSize: ".68rem",
                    background: "rgba(0,0,0,.07)",
                    color: "#6b7280",
                    padding: "1px 7px",
                    borderRadius: 20,
                    fontWeight: 600,
                  }}
                >
                  {colTasks.length}
                </span>
              </div>

              <div
                style={{
                  padding: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  minHeight: 200,
                }}
              >
                {colTasks.length === 0 ? (
                  <div
                    style={{
                      border: "1px dashed rgba(45,122,82,.18)",
                      borderRadius: 10,
                      padding: "18px 12px",
                      fontSize: ".76rem",
                      color: "#94a3b8",
                      textAlign: "center",
                      background: "rgba(255,255,255,.6)",
                    }}
                  >
                    لا توجد مهام هنا
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        draggingId.current = task.id;
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", String(task.id));
                        (e.currentTarget as HTMLDivElement).style.opacity = "0.5";
                      }}
                      onDragEnd={(e) => {
                        (e.currentTarget as HTMLDivElement).style.opacity = "";
                      }}
                      onClick={() => onEditTask(task)}
                      style={{
                        background: "white",
                        borderRadius: 9,
                        border: "1px solid rgba(45,122,82,.12)",
                        padding: "11px 13px",
                        cursor: "grab",
                        transition: "all .18s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow =
                          "0 2px 12px rgba(45,122,82,.1)";
                        (e.currentTarget as HTMLDivElement).style.borderColor =
                          "rgba(45,122,82,.25)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                        (e.currentTarget as HTMLDivElement).style.borderColor =
                          "rgba(45,122,82,.12)";
                      }}
                    >
                      <div
                        style={{
                          fontSize: ".83rem",
                          fontWeight: 600,
                          color: "#111827",
                          lineHeight: 1.45,
                          marginBottom: 8,
                        }}
                      >
                        {task.title}
                      </div>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}
                      >
                        <span
                          style={{
                            fontSize: ".66rem",
                            padding: "2px 8px",
                            borderRadius: 20,
                            fontWeight: 700,
                            ...URGENCY_STYLE[task.urgency],
                          }}
                        >
                          {URGENCY_LABEL[task.urgency]}
                        </span>
                        <span
                          style={{
                            fontSize: ".66rem",
                            padding: "2px 8px",
                            borderRadius: 20,
                            fontWeight: 700,
                            ...meta.chip,
                          }}
                        >
                          {meta.label}
                        </span>
                        {task.category && (
                          <span
                            style={{
                              fontSize: ".64rem",
                              color: "#2d7a52",
                              fontWeight: 600,
                              background: "#e8f5ee",
                              padding: "1px 7px",
                              borderRadius: 20,
                            }}
                          >
                            {task.category}
                          </span>
                        )}
                        {task.deadline && (
                          <span
                            style={{
                              fontSize: ".67rem",
                              color:
                                isOverdue(task.deadline) && task.status !== "done"
                                  ? "#dc2626"
                                  : "#6b7280",
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                              fontWeight:
                                isOverdue(task.deadline) && task.status !== "done"
                                  ? 600
                                  : undefined,
                            }}
                          >
                            📅 {task.deadline}
                          </span>
                        )}
                        {task.assignee > 0 && (
                          <span
                            title={empName(task.assignee)}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              background: empColor(task.assignee),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: ".6rem",
                              fontWeight: 700,
                              color: "white",
                              marginRight: "auto",
                              flexShrink: 0,
                              border: "2px solid white",
                              boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
                            }}
                          >
                            {empInitial(task.assignee)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
