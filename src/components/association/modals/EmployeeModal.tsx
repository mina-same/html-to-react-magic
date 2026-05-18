import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Employee } from "../types";

interface Props {
  onSave: (emp: Omit<Employee, "id" | "color">) => void;
  onClose: () => void;
}

const sel: React.CSSProperties = { borderRadius: 7, border: "1.5px solid rgba(45,122,82,.12)", fontFamily: "'Tajawal','Cairo',sans-serif", fontSize: ".87rem", color: "#111827", outline: "none", padding: "8px 12px", width: "100%", background: "white" };
const lbl: React.CSSProperties = { display: "block", fontSize: ".75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 };

export default function EmployeeModal({ onSave, onClose }: Props) {
  const [name,   setName]   = useState("");
  const [role,   setRole]   = useState("");
  const [status, setStatus] = useState<Employee["status"]>("active");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: 400, fontFamily: "'Tajawal','Cairo',sans-serif", direction: "rtl" }}>
        <DialogHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: ".72rem", padding: "3px 10px", borderRadius: 20, fontWeight: 700, background: "#fef9c3", color: "#92400e" }}>موظف جديد</span>
            <DialogTitle style={{ fontFamily: "'Tajawal','Cairo',sans-serif" }}>إضافة فرد للفريق</DialogTitle>
          </div>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={lbl}>الاسم الكامل</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="مثال: سارة العمري" style={sel} />
          </div>
          <div>
            <label style={lbl}>المسمى الوظيفي</label>
            <Input value={role} onChange={e => setRole(e.target.value)} placeholder="مثال: مدير تسويق" style={sel} />
          </div>
          <div>
            <label style={lbl}>الحالة</label>
            <select value={status} onChange={e => setStatus(e.target.value as Employee["status"])} style={sel}>
              <option value="active">نشط</option>
              <option value="away">بعيد</option>
              <option value="off">خارج العمل</option>
            </select>
          </div>
        </div>

        <DialogFooter style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="outline" size="sm" onClick={onClose}>إلغاء</Button>
          <Button size="sm" onClick={() => { if (name.trim()) { onSave({ name: name.trim(), role: role.trim(), status }); onClose(); } }} style={{ background: "#2d7a52", color: "white" }}>
            إضافة للفريق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
