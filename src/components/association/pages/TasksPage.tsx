import { useMemo, useRef, useState } from "react";
import type { Task, Employee } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckSquare, Calendar, RotateCcw, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  tasks: Task[];
  employees: Employee[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onStatusChange: (id: number, status: Task["status"]) => void;
}

const URGENCY_CLASS: Record<Task["urgency"], string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-amber-100 text-amber-800",
  normal: "bg-sky-100 text-sky-700",
  low: "bg-emerald-100 text-emerald-800",
};

const URGENCY_LABEL: Record<Task["urgency"], string> = {
  urgent: "⚡ عاجلة",
  high: "🔶 مرتفعة",
  normal: "🔵 عادية",
  low: "🟢 منخفضة",
};

const STATUS_META: Record<
  Task["status"],
  { label: string; dot: string; top: string; chip: string }
> = {
  todo: { label: "لم تبدأ", dot: "bg-slate-400", top: "border-t-slate-400", chip: "bg-slate-100 text-slate-600" },
  doing: { label: "قيد التنفيذ", dot: "bg-amber-500", top: "border-t-amber-500", chip: "bg-amber-100 text-amber-800" },
  review: { label: "مراجعة", dot: "bg-violet-500", top: "border-t-violet-500", chip: "bg-violet-100 text-violet-700" },
  done: { label: "مكتملة", dot: "bg-primary", top: "border-t-primary", chip: "bg-emerald-100 text-emerald-800" },
};

const COLS: { id: Task["status"]; label: string }[] = [
  { id: "todo", label: "لم تبدأ" },
  { id: "doing", label: "قيد التنفيذ" },
  { id: "review", label: "مراجعة" },
  { id: "done", label: "مكتملة" },
];

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
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2.5 border-b px-4 py-3.5">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-secondary text-primary">
          <CheckSquare className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">لوحة المهام</div>
          <div className="mt-0.5 text-xs text-muted-foreground">اسحب البطاقات لتغيير الحالة</div>
        </div>
        <div className="mr-auto flex items-center gap-2">
          {urgentCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              ⚡ {urgentCount} عاجلة
            </span>
          )}
          <Button size="sm" onClick={onAddTask}>
            <Plus className="h-3.5 w-3.5" />
            مهمة جديدة
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b p-3.5">
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] md:items-end">
          <div>
            <Label className="mb-1.5 block text-xs font-bold text-muted-foreground">البحث</Label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث بعنوان المهمة أو التصنيف..."
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-bold text-muted-foreground">المسؤول</Label>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="unassigned">غير مسند</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={String(emp.id)}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-bold text-muted-foreground">الحالة</Label>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Task["status"] | "all")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {COLS.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-bold text-muted-foreground">الأولوية</Label>
            <Select value={urgencyFilter} onValueChange={(v) => setUrgencyFilter(v as Task["urgency"] | "all")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="urgent">عاجلة</SelectItem>
                <SelectItem value="high">مرتفعة</SelectItem>
                <SelectItem value="normal">عادية</SelectItem>
                <SelectItem value="low">منخفضة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="block text-xs font-bold text-muted-foreground">إضافي</span>
            <button
              type="button"
              onClick={() => setOnlyOverdue((v) => !v)}
              className={cn(
                "h-9 rounded-md border px-3 text-sm font-semibold transition-colors",
                onlyOverdue ? "border-amber-300 bg-amber-100 text-amber-800" : "border-input bg-card text-foreground/80",
              )}
            >
              {onlyOverdue ? "عرض المتأخرة فقط" : "كل المواعيد"}
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 whitespace-nowrap"
            onClick={() => {
              setQuery("");
              setAssigneeFilter("all");
              setStatusFilter("all");
              setUrgencyFilter("all");
              setOnlyOverdue(false);
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            تصفير
          </Button>
        </div>

        <div className="mt-2.5 text-xs text-muted-foreground">
          عرض {filteredTasks.length} من {tasks.length} مهمة
        </div>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 gap-3 p-3.5 md:grid-cols-4">
        {COLS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const meta = STATUS_META[col.id];

          return (
            <div
              key={col.id}
              className="min-h-[300px] rounded-lg bg-secondary/40"
              onDragOver={(e) => {
                e.preventDefault();
                (e.currentTarget as HTMLDivElement).style.outline = "2px dashed var(--green-mid)";
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
              <div className={cn("flex items-center gap-1.5 rounded-t-lg border-b bg-card px-3 py-2.5 border-t-[3px]", meta.top)}>
                <span className={cn("h-2 w-2 shrink-0 rounded-full", meta.dot)} />
                <span className="text-sm font-bold text-foreground">{meta.label}</span>
                <span className="rounded-full bg-black/[0.07] px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex min-h-[200px] flex-col gap-2 p-2.5">
                {colTasks.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-primary/20 bg-card/60 px-3 py-4 text-center text-xs text-muted-foreground">
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
                      className="cursor-grab rounded-lg border bg-card p-3 transition-shadow hover:shadow-md hover:border-primary/25"
                    >
                      <div className="mb-2 text-sm font-semibold leading-6 text-foreground">
                        {task.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={cn("rounded-full px-2 py-0.5 text-[0.66rem] font-bold", URGENCY_CLASS[task.urgency])}>
                          {URGENCY_LABEL[task.urgency]}
                        </span>
                        <span className={cn("rounded-full px-2 py-0.5 text-[0.66rem] font-bold", meta.chip)}>
                          {meta.label}
                        </span>
                        {task.category && (
                          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[0.64rem] font-semibold text-primary">
                            {task.category}
                          </span>
                        )}
                        {task.deadline && (
                          <span
                            className={cn(
                              "flex items-center gap-1 text-[0.67rem]",
                              isOverdue(task.deadline) && task.status !== "done"
                                ? "font-semibold text-destructive"
                                : "text-muted-foreground",
                            )}
                          >
                            <Calendar className="h-2.5 w-2.5" />
                            {task.deadline}
                          </span>
                        )}
                        {task.assignee > 0 && (
                          <Avatar
                            className="mr-auto h-[22px] w-[22px] shrink-0 border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,.1)]"
                            title={empName(task.assignee)}
                          >
                            <AvatarFallback
                              style={{ background: empColor(task.assignee) }}
                              className="text-[0.6rem] font-bold text-white"
                            >
                              {empInitial(task.assignee)}
                            </AvatarFallback>
                          </Avatar>
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
    </Card>
  );
}
