import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Influencer } from "../types";

interface InfModalProps {
  inf: Partial<Influencer> | null;
  onClose: () => void;
  onSave: (data: Partial<Influencer>) => void;
}

const FIELD_LABEL = "block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5";

export function InfModal({ inf, onClose, onSave }: InfModalProps) {
  const [form, setForm] = useState<Partial<Influencer>>(inf ?? {});
  const isNew = !inf?.id;

  function set(k: keyof Influencer, v: string | number) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function save() {
    if (!form.name?.trim()) {
      toast.error("يجب إدخال اسم المؤثر");
      return;
    }
    onSave(form);
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[520px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isNew ? "➕ إضافة مؤثر جديد" : "✏️ تعديل بيانات المؤثر"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3.5">
          <div>
            <Label className={FIELD_LABEL}>اسم المؤثر</Label>
            <Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="اسم المؤثر" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>المنصة</Label>
              <Select value={form.platform ?? "Instagram"} onValueChange={(v) => set("platform", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="X">X</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="Snapchat">Snapchat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={FIELD_LABEL}>الحالة</Label>
              <Select
                value={form.status ?? "active"}
                onValueChange={(v) => set("status", v as "active" | "pending" | "ended")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                  <SelectItem value="ended">منتهي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>عدد المتابعين</Label>
              <Input
                type="number"
                dir="ltr"
                value={form.followers ?? ""}
                onChange={(e) => set("followers", Number(e.target.value))}
                placeholder="320000"
              />
            </div>
            <div>
              <Label className={FIELD_LABEL}>نسبة التفاعل %</Label>
              <Input
                type="number"
                dir="ltr"
                step="0.1"
                value={form.engagement ?? ""}
                onChange={(e) => set("engagement", Number(e.target.value))}
                placeholder="5.2"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>السعر لكل حملة (ر.س)</Label>
              <Input
                type="number"
                dir="ltr"
                value={form.price ?? ""}
                onChange={(e) => set("price", Number(e.target.value))}
                placeholder="1800"
              />
            </div>
            <div>
              <Label className={FIELD_LABEL}>التخصص</Label>
              <Input value={form.niche ?? ""} onChange={(e) => set("niche", e.target.value)} placeholder="محتوى خيري" />
            </div>
          </div>
          <div>
            <Label className={FIELD_LABEL}>ملاحظات</Label>
            <Textarea
              className="min-h-[70px] resize-y leading-7"
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            إلغاء
          </Button>
          <Button size="sm" onClick={save}>
            {isNew ? "إضافة" : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
