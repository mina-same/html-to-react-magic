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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { Task, Employee } from "../types";

interface Props {
  task: Partial<Task> | null;
  employees: Employee[];
  onSave: (task: Omit<Task, "id"> & { id?: number }) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

const FIELD_LABEL = "block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5";

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
      <DialogContent className="max-w-[520px]" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <StatusBadge status={status} />
            <DialogTitle>{isNew ? "مهمة جديدة" : "تعديل المهمة"}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3.5">
          {/* Title */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان المهمة..."
            className="text-base font-semibold"
          />

          {/* Status + Urgency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>الحالة</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Task["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">لم تبدأ</SelectItem>
                  <SelectItem value="doing">قيد التنفيذ</SelectItem>
                  <SelectItem value="review">مراجعة</SelectItem>
                  <SelectItem value="done">مكتملة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={FIELD_LABEL}>الأولوية</Label>
              <Select value={urgency} onValueChange={(v) => setUrgency(v as Task["urgency"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">🔴 عاجلة</SelectItem>
                  <SelectItem value="high">🟡 مرتفعة</SelectItem>
                  <SelectItem value="normal">🔵 عادية</SelectItem>
                  <SelectItem value="low">🟢 منخفضة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee + Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>المسؤول</Label>
              <Select value={String(assignee)} onValueChange={(v) => setAssignee(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">غير محدد</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={FIELD_LABEL}>الموعد النهائي</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className={FIELD_LABEL}>التصنيف</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["محتوى", "حملات", "تبرعات", "إدارة", "تصميم", "شراكات"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label className={FIELD_LABEL}>ملاحظات</Label>
            <div className="overflow-hidden rounded-lg border">
              <div className="flex flex-wrap gap-1.5 border-b bg-muted/40 p-2">
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
                    className="rounded-md border bg-card px-2.5 py-1.5 text-xs font-bold text-foreground/80 hover:bg-muted"
                  >
                    {tool.label}
                  </button>
                ))}
                <button
                  type="button"
                  title="مسح التنسيق"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyFormat("removeFormat")}
                  className="rounded-md border bg-card px-2.5 py-1.5 text-xs font-bold text-foreground/80 hover:bg-muted"
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
                className="min-h-[130px] bg-card p-3 text-sm leading-7 text-foreground outline-none"
              />
            </div>
            <div className="mt-1.5 text-xs text-muted-foreground">
              يمكنك تنسيق الملاحظات وسيتم حفظها كنص HTML منسق.
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-between gap-2">
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
          <div className="mr-auto flex gap-2">
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
            >
              حفظ المهمة
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
