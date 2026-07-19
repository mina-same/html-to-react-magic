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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { Employee } from "../types";

interface Props {
  employee: Employee | null;
  assocId: string;
  onSave: (emp: Employee) => void;
  onClose: () => void;
}

const FIELD_LABEL = "block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5";

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
          body: {
            email: email.trim(),
            password,
            name: name.trim(),
            role: role.trim(),
            status,
            assocId,
          },
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
      onSave({
        id: employee.id,
        name: name.trim(),
        role: role.trim(),
        status,
        color: employee.color,
      });
      onClose();
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[420px]" dir="rtl">
        <DialogHeader>
          <DialogDescription className="sr-only">
            {isEdit ? "تعديل بيانات الموظف" : "إضافة موظف جديد للفريق"}
          </DialogDescription>
          <div className="flex items-center gap-2.5">
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
              {isEdit ? "تعديل موظف" : "موظف جديد"}
            </Badge>
            <DialogTitle>{isEdit ? "تعديل بيانات الفرد" : "إضافة فرد للفريق"}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3.5">
          <div>
            <Label className={FIELD_LABEL}>الاسم الكامل</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: سارة العمري" />
          </div>
          <div>
            <Label className={FIELD_LABEL}>المسمى الوظيفي</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="مثال: مدير تسويق" />
          </div>
          <div>
            <Label className={FIELD_LABEL}>الحالة</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Employee["status"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="away">بعيد</SelectItem>
                <SelectItem value="off">خارج العمل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isEdit && (
            <div className="border-t pt-3">
              <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <KeyRound className="h-3.5 w-3.5" />
                بيانات تسجيل الدخول
              </div>
              <div className="flex flex-col gap-2.5">
                <div>
                  <Label className={FIELD_LABEL}>البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="employee@example.com"
                  />
                </div>
                <div>
                  <Label className={FIELD_LABEL}>كلمة المرور</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6 أحرف على الأقل"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
            إلغاء
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "جاري الإنشاء..." : isEdit ? "حفظ التعديلات" : "إضافة للفريق"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
