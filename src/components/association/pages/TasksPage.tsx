import type { Task, Employee } from "../types";
import { Button } from "@/components/ui/button";

interface Props {
  tasks: Task[];
  employees: Employee[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

const URGENCY_STYLE: Record<Task["urgency"], React.CSSProperties> = {
  urgent: { background: "#fee2e2", color: "#b91c1c" },
  high:   { background: "#fef3c7", color: "#92400e" },
  normal: { background: "#e0f2fe", color: "#0369a1" },
  low:    { background: "#f0fdf4", color: "#166534" },
};
const URGENCY_LABEL: Record<Task["urgency"], string> = { urgent: "⚡ عاجلة", high: "🔶 مرتفعة", normal: "🔵 عادية", low: "🟢 منخفضة" };

const COLS: { id: Task["status"]; label: string; dot: string; top: string }[] = [
  { id: "todo",  label: "لم تبدأ",      dot: "#94a3b8", top: "#94a3b8" },
  { id: "doing", label: "قيد التنفيذ",  dot: "#f59e0b", top: "#f59e0b" },
  { id: "done",  label: "مكتملة",        dot: "#2d7a52", top: "#2d7a52" },
];

function isOverdue(deadline: string) {
  return deadline && new Date(deadline) < new Date();
}

export default function TasksPage({ tasks, employees, onAddTask, onEditTask }: Props) {
  const urgentCount = tasks.filter(t => t.urgency === "urgent" && t.status !== "done").length;

  function empName(id: number) {
    return employees.find(e => e.id === id)?.name ?? "";
  }
  function empColor(id: number) {
    return employees.find(e => e.id === id)?.color ?? "#6b7280";
  }
  function empInitial(id: number) {
    return (employees.find(e => e.id === id)?.name ?? "?")[0];
  }

  return (
    <div style={{ background: "white", borderRadius: 13, border: "1px solid rgba(45,122,82,.12)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(45,122,82,.12)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center" }}>✅</div>
        <div>
          <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>لوحة المهام</div>
          <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>Notion-style Kanban</div>
        </div>
        <div style={{ marginRight: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {urgentCount > 0 && (
            <span style={{ fontSize: ".72rem", background: "#fef3c7", color: "#92400e", padding: "2px 9px", borderRadius: 20, fontWeight: 600 }}>⚡ {urgentCount} عاجلة</span>
          )}
          <Button size="sm" onClick={onAddTask} style={{ background: "#2d7a52", color: "white", fontSize: ".78rem", padding: "6px 13px", borderRadius: 7 }}>+ مهمة جديدة</Button>
        </div>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ padding: 14 }}>
        {COLS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} style={{ background: "#f2faf6", borderRadius: 10, minHeight: 300 }}>
              {/* Col header */}
              <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(45,122,82,.12)", display: "flex", alignItems: "center", gap: 7, borderRadius: "10px 10px 0 0", background: "white", borderTop: `3px solid ${col.top}` }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.dot, flexShrink: 0 }} />
                <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#111827" }}>{col.label}</span>
                <span style={{ fontSize: ".68rem", background: "rgba(0,0,0,.07)", color: "#6b7280", padding: "1px 7px", borderRadius: 20, fontWeight: 600 }}>{colTasks.length}</span>
              </div>
              {/* Cards */}
              <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 200 }}>
                {colTasks.map(task => (
                  <div key={task.id} onClick={() => onEditTask(task)}
                    style={{ background: "white", borderRadius: 9, border: "1px solid rgba(45,122,82,.12)", padding: "11px 13px", cursor: "pointer", transition: "all .18s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(45,122,82,.1)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(45,122,82,.25)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ""; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(45,122,82,.12)"; }}>
                    <div style={{ fontSize: ".83rem", fontWeight: 600, color: "#111827", lineHeight: 1.45, marginBottom: 8 }}>{task.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: ".66rem", padding: "2px 8px", borderRadius: 20, fontWeight: 700, ...URGENCY_STYLE[task.urgency] }}>{URGENCY_LABEL[task.urgency]}</span>
                      {task.category && (
                        <span style={{ fontSize: ".64rem", color: "#2d7a52", fontWeight: 600, background: "#e8f5ee", padding: "1px 7px", borderRadius: 20 }}>{task.category}</span>
                      )}
                      {task.deadline && (
                        <span style={{ fontSize: ".67rem", color: isOverdue(task.deadline) && task.status !== "done" ? "#dc2626" : "#6b7280", display: "flex", alignItems: "center", gap: 3, fontWeight: isOverdue(task.deadline) && task.status !== "done" ? 600 : undefined }}>
                          📅 {task.deadline}
                        </span>
                      )}
                      {task.assignee > 0 && (
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: empColor(task.assignee), display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".6rem", fontWeight: 700, color: "white", marginRight: "auto", flexShrink: 0, border: "2px solid white", boxShadow: "0 0 0 1px rgba(0,0,0,.1)" }}>
                          {empInitial(task.assignee)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
