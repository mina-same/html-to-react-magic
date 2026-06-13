import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { Employee } from "../types";

interface Props {
  employee: Employee | null;
  assocId: string;
  onSave: (emp: Employee) => void;
  onClose: () => void;
}

const sel: React.CSSProperties = {
  borderRadius: 7,
  border: "1.5px solid rgba(45,122,82,.12)",
  fontFamily: "'Tajawal','Cairo',sans-serif",
  fontSize: ".87rem",
  color: "#111827",
  outline: "none",
  padding: "8px 12px",
  width: "100%",
  background: "white",
};
const lbl: React.CSSProperties = {
  display: "block",
  fontSize: ".75rem",
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: ".06em",
  marginBottom: 6,
};

export default function EmployeeModal({ employee, assocId, onSave, onClose }: Props) {
  const isEdit = !!employee;
  const [name, setName] = useState(employee?.name ?? "");
  const [role, setRole] = useState(employee?.role ?? "");
  const [status, setStatus] = useState<Employee["status"]>(employee?.status ?? "active");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;

    if (!isEdit) {
      // New employee — create auth account via edge function
      if (!email.trim() || !password.trim()) {
        toast.error("البريد الإلكتروني وكلمة المرور مطلوبان");
        return;
      }
      if (password.length < 6) {
        toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        return;
      }

      setSaving(true);
      try {
        const res = await supabase.functions.invoke("create-employee", {
          body: { email: email.trim(), password, name: name.trim(), role: role.trim(), status, assocId },
        });
        // Business errors come back as 200 + {error: "..."} — check data first
        if (res.data?.error) throw new Error(String(res.data.error));
        // Network/auth errors come from res.error
        if (res.error) throw new Error(String(res.error?.message ?? JSON.stringify(res.error)));

        toast.success("تم إنشاء حساب الموظف بنجاح");
        onSave({
          id: 0,
          name: name.trim(),
          role: role.trim(),
          status,
          color: "#7c3aed",
        });
        onClose();
      } catch (err) {
        console.error("create-employee error:", err);
        toast.error(err instanceof Error ? err.message : "حدث خطأ غير معروف");
      } finally {
        setSaving(false);
      }
    } else {
      // Edit — no auth changes
      onSave({ id: employee.id, name: name.trim(), role: role.trim(), status, color: employee.color });
      onClose();
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        style={{ maxWidth: 420, fontFamily: "'Tajawal','Cairo',sans-serif", direction: "rtl" }}
      >
        <DialogHeader>
          <DialogDescription className="sr-only">
            {isEdit ? "تعديل بيانات الموظف" : "إضافة موظف جديد للفريق"}
          </DialogDescription>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: ".72rem",
                padding: "3px 10px",
                borderRadius: 20,
                fontWeight: 700,
                background: "#fef9c3",
                color: "#92400e",
              }}
            >
              {isEdit ? "تعديل موظف" : "موظف جديد"}
            </span>
            <DialogTitle style={{ fontFamily: "'Tajawal','Cairo',sans-serif" }}>
              {isEdit ? "تعديل بيانات الفرد" : "إضافة فرد للفريق"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={lbl}>الاسم الكامل</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: سارة العمري" style={sel} />
          </div>
          <div>
            <label style={lbl}>المسمى الوظيفي</label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="مثال: مدير تسويق" style={sel} />
          </div>
          <div>
            <label style={lbl}>الحالة</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Employee["status"])} style={sel}>
              <option value="active">نشط</option>
              <option value="away">بعيد</option>
              <option value="off">خارج العمل</option>
            </select>
          </div>

          {!isEdit && (
            <>
              <div style={{ borderTop: "1px solid rgba(45,122,82,.1)", paddingTop: 12 }}>
                <div style={{ fontSize: ".78rem", color: "#6b7280", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>🔐</span> بيانات تسجيل الدخول
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label style={lbl}>البريد الإلكتروني</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="employee@example.com"
                      style={{ ...sel, direction: "ltr" }}
                    />
                  </div>
                  <div>
                    <label style={lbl}>كلمة المرور</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6 أحرف على الأقل"
                      style={sel}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
            إلغاء
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            style={{ background: "#2d7a52", color: "white" }}
          >
            {saving ? "جاري الإنشاء..." : isEdit ? "حفظ التعديلات" : "إضافة للفريق"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
