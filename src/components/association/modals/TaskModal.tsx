import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Task, Employee } from "../types";

interface Props {
  task: Partial<Task> | null;
  employees: Employee[];
  onSave: (task: Omit<Task, "id"> & { id?: number }) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

const statusBadgeStyle: Record<string, React.CSSProperties> = {
  todo: { background: "#f1f5f9", color: "#64748b" },
  doing: { background: "#fef9c3", color: "#92400e" },
  review: { background: "#ede9fe", color: "#6d28d9" },
  done: { background: "#dcfce7", color: "#166534" },
};

function statusLabel(status: Task["status"]) {
  if (status === "todo") return "لم تبدأ";
  if (status === "doing") return "قيد التنفيذ";
  if (status === "review") return "مراجعة";
  return "مكتملة";
}

export default function TaskModal({ task, employees, onSave, onDelete, onClose }: Props) {
  const isNew = !task?.id;
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [title, setTitle] = useState(task?.title ?? "");
  const [status, setStatus] = useState<Task["status"]>(task?.status ?? "todo");
  const [urgency, setUrgency] = useState<Task["urgency"]>(task?.urgency ?? "normal");
  const [assignee, setAssignee] = useState(task?.assignee ?? 0);
  const [deadline, setDeadline] = useState(task?.deadline ?? "");
  const [category, setCategory] = useState(task?.category ?? "محتوى");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const initialNotesHtml = task?.notes?.trim() || "<p><br></p>";

  useEffect(() => {
    setTitle(task?.title ?? "");
    setStatus(task?.status ?? "todo");
    setUrgency(task?.urgency ?? "normal");
    setAssignee(task?.assignee ?? 0);
    setDeadline(task?.deadline ?? "");
    setCategory(task?.category ?? "محتوى");
    setNotes(task?.notes ?? "");
  }, [task]);

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = initialNotesHtml;
  }, [initialNotesHtml]);

  const s = () => ({
    borderRadius: 7,
    border: "1.5px solid rgba(45,122,82,.12)",
    fontFamily: "'Tajawal','Cairo',sans-serif",
    fontSize: ".87rem",
    color: "#111827",
    outline: "none",
    padding: "8px 12px",
    width: "100%",
    background: "white",
    ...({} as Record<string, string>),
  });

  const applyFormat = (command: string, value?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    setNotes(editorRef.current.innerHTML);
  };

  const syncNotes = () => {
    const html = editorRef.current?.innerHTML ?? "";
    setNotes(html === "<p><br></p>" ? "" : html);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        style={{ maxWidth: 520, fontFamily: "'Tajawal','Cairo',sans-serif", direction: "rtl" }}
      >
        <DialogHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: ".72rem",
                padding: "3px 10px",
                borderRadius: 20,
                fontWeight: 700,
                flexShrink: 0,
                ...statusBadgeStyle[status],
              }}
            >
              {statusLabel(status)}
            </span>
            <DialogTitle style={{ fontFamily: "'Tajawal','Cairo',sans-serif" }}>
              {isNew ? "مهمة جديدة" : "تعديل المهمة"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Title */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان المهمة..."
            style={{ ...s(), fontSize: "1rem", fontWeight: 600 }}
          />

          {/* Status + Urgency */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: ".75rem",
                  fontWeight: 700,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 6,
                }}
              >
                الحالة
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Task["status"])}
                style={s()}
              >
                <option value="todo">لم تبدأ</option>
                <option value="doing">قيد التنفيذ</option>
                <option value="review">مراجعة</option>
                <option value="done">مكتملة</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: ".75rem",
                  fontWeight: 700,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 6,
                }}
              >
                الأولوية
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as Task["urgency"])}
                style={s()}
              >
                <option value="urgent">🔴 عاجلة</option>
                <option value="high">🟡 مرتفعة</option>
                <option value="normal">🔵 عادية</option>
                <option value="low">🟢 منخفضة</option>
              </select>
            </div>
          </div>

          {/* Assignee + Deadline */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: ".75rem",
                  fontWeight: 700,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 6,
                }}
              >
                المسؤول
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(Number(e.target.value))}
                style={s()}
              >
                <option value={0}>غير محدد</option>
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
                  fontSize: ".75rem",
                  fontWeight: 700,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 6,
                }}
              >
                الموعد النهائي
              </label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                style={s()}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: ".75rem",
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: 6,
              }}
            >
              التصنيف
            </label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={s()}>
              {["محتوى", "حملات", "تبرعات", "إدارة", "تصميم", "شراكات"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: ".75rem",
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: 6,
              }}
            >
              ملاحظات
            </label>
            <div
              style={{
                border: "1.5px solid rgba(45,122,82,.12)",
                borderRadius: 10,
                background: "white",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  padding: 8,
                  borderBottom: "1px solid rgba(45,122,82,.08)",
                  background: "#f8fafc",
                }}
              >
                {[
                  { label: "B", title: "عريض", command: "bold" },
                  { label: "I", title: "مائل", command: "italic" },
                  { label: "U", title: "تحته خط", command: "underline" },
                  { label: "• قائمة", title: "قائمة نقطية", command: "insertUnorderedList" },
                  { label: "1. قائمة", title: "قائمة رقمية", command: "insertOrderedList" },
                ].map((tool) => (
                  <button
                    key={tool.command}
                    type="button"
                    title={tool.title}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyFormat(tool.command)}
                    style={{
                      border: "1px solid rgba(45,122,82,.14)",
                      background: "white",
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontSize: ".75rem",
                      fontWeight: 700,
                      color: "#374151",
                      cursor: "pointer",
                    }}
                  >
                    {tool.label}
                  </button>
                ))}
                <button
                  type="button"
                  title="مسح التنسيق"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyFormat("removeFormat")}
                  style={{
                    border: "1px solid rgba(45,122,82,.14)",
                    background: "white",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: ".75rem",
                    fontWeight: 700,
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  مسح التنسيق
                </button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={syncNotes}
                onBlur={syncNotes}
                dir="rtl"
                style={{
                  minHeight: 130,
                  padding: 12,
                  outline: "none",
                  fontFamily: "'Tajawal','Cairo',sans-serif",
                  fontSize: ".9rem",
                  lineHeight: 1.7,
                  color: "#111827",
                  background: "white",
                }}
              />
            </div>
            <div style={{ fontSize: ".72rem", color: "#6b7280", marginTop: 6 }}>
              يمكنك تنسيق الملاحظات وسيتم حفظها كنص HTML منسق.
            </div>
          </div>
        </div>

        <DialogFooter
          style={{ justifyContent: "space-between", display: "flex", gap: 8, flexDirection: "row" }}
        >
          {!isNew && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete(task!.id!);
                onClose();
              }}
            >
              حذف
            </Button>
          )}
          <div style={{ display: "flex", gap: 8, marginRight: "auto" }}>
            <Button variant="outline" size="sm" onClick={onClose}>
              إلغاء
            </Button>
            <Button
              size="sm"
              onClick={() =>
                onSave({
                  id: task?.id,
                  title,
                  status,
                  urgency,
                  assignee,
                  deadline,
                  category,
                  notes,
                })
              }
              style={{ background: "#2d7a52", color: "white" }}
            >
              حفظ المهمة
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
