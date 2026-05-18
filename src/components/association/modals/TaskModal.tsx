import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Task, Employee } from "../types";

interface Props {
  task: Partial<Task> | null;
  employees: Employee[];
  onSave: (task: Omit<Task, "id"> & { id?: number }) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

const statusBadgeStyle: Record<string, React.CSSProperties> = {
  todo:  { background: "#f1f5f9", color: "#64748b" },
  doing: { background: "#fef9c3", color: "#92400e" },
  done:  { background: "#dcfce7", color: "#166534" },
};

export default function TaskModal({ task, employees, onSave, onDelete, onClose }: Props) {
  const isNew = !task?.id;
  const [title,    setTitle]    = useState(task?.title    ?? "");
  const [status,   setStatus]   = useState<Task["status"]>(task?.status   ?? "todo");
  const [urgency,  setUrgency]  = useState<Task["urgency"]>(task?.urgency ?? "normal");
  const [assignee, setAssignee] = useState(task?.assignee ?? 0);
  const [deadline, setDeadline] = useState(task?.deadline ?? "");
  const [category, setCategory] = useState(task?.category ?? "محتوى");
  const [notes,    setNotes]    = useState(task?.notes    ?? "");

  useEffect(() => {
    setTitle(task?.title ?? "");
    setStatus(task?.status ?? "todo");
    setUrgency(task?.urgency ?? "normal");
    setAssignee(task?.assignee ?? 0);
    setDeadline(task?.deadline ?? "");
    setCategory(task?.category ?? "محتوى");
    setNotes(task?.notes ?? "");
  }, [task]);

  const s = (k: string) => ({ borderRadius: 7, border: "1.5px solid rgba(45,122,82,.12)", fontFamily: "'Tajawal','Cairo',sans-serif", fontSize: ".87rem", color: "#111827", outline: "none", padding: "8px 12px", width: "100%", background: "white", ...({} as Record<string,string>) });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: 520, fontFamily: "'Tajawal','Cairo',sans-serif", direction: "rtl" }}>
        <DialogHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: ".72rem", padding: "3px 10px", borderRadius: 20, fontWeight: 700, flexShrink: 0, ...statusBadgeStyle[status] }}>
              {status === "todo" ? "لم تبدأ" : status === "doing" ? "قيد التنفيذ" : "مكتملة"}
            </span>
            <DialogTitle style={{ fontFamily: "'Tajawal','Cairo',sans-serif" }}>{isNew ? "مهمة جديدة" : "تعديل المهمة"}</DialogTitle>
          </div>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Title */}
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان المهمة..." style={{ ...s(""), fontSize: "1rem", fontWeight: 600 }} />

          {/* Status + Urgency */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: ".75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>الحالة</label>
              <select value={status} onChange={e => setStatus(e.target.value as Task["status"])} style={s("")}>
                <option value="todo">لم تبدأ</option>
                <option value="doing">قيد التنفيذ</option>
                <option value="done">مكتملة</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: ".75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>الأولوية</label>
              <select value={urgency} onChange={e => setUrgency(e.target.value as Task["urgency"])} style={s("")}>
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
              <label style={{ display: "block", fontSize: ".75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>المسؤول</label>
              <select value={assignee} onChange={e => setAssignee(Number(e.target.value))} style={s("")}>
                <option value={0}>غير محدد</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: ".75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>الموعد النهائي</label>
              <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={s("")} />
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={{ display: "block", fontSize: ".75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>التصنيف</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={s("")}>
              {["محتوى","حملات","تبرعات","إدارة","تصميم","شراكات"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: "block", fontSize: ".75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>ملاحظات</label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="تفاصيل إضافية..." style={{ ...s(""), minHeight: 80, resize: "vertical" }} />
          </div>
        </div>

        <DialogFooter style={{ justifyContent: "space-between", display: "flex", gap: 8, flexDirection: "row" }}>
          {!isNew && (
            <Button variant="destructive" size="sm" onClick={() => { onDelete(task!.id!); onClose(); }}>حذف</Button>
          )}
          <div style={{ display: "flex", gap: 8, marginRight: "auto" }}>
            <Button variant="outline" size="sm" onClick={onClose}>إلغاء</Button>
            <Button size="sm" onClick={() => onSave({ id: task?.id, title, status, urgency, assignee, deadline, category, notes })} style={{ background: "#2d7a52", color: "white" }}>
              حفظ المهمة
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
