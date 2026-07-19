import { useState } from "react";
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
import type { Org, Influencer, CampaignRequest } from "../types";

interface ReqModalProps {
  req: Partial<CampaignRequest> | null;
  orgs: Org[];
  infs: Influencer[];
  onClose: () => void;
  onSave: (data: Partial<CampaignRequest>) => void;
}

const FIELD_LABEL = "block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5";
const NONE = "_none_";

export function ReqModal({ req, orgs, infs, onClose, onSave }: ReqModalProps) {
  const [form, setForm] = useState<Partial<CampaignRequest>>(req ?? {});

  function set(k: keyof CampaignRequest, v: string | number) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function save() {
    onSave(form);
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[520px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تفاصيل طلب الحملة #{req?.id}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>الجمعية</Label>
              <Select
                value={form.orgId ? String(form.orgId) : NONE}
                onValueChange={(v) => set("orgId", v === NONE ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الجمعية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>اختر الجمعية</SelectItem>
                  {orgs.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={FIELD_LABEL}>المؤثر</Label>
              <Select
                value={form.infId ? String(form.infId) : NONE}
                onValueChange={(v) => set("infId", v === NONE ? "" : Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المؤثر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>اختر المؤثر</SelectItem>
                  {infs.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>نوع الحملة</Label>
              <Input value={form.type ?? ""} onChange={(e) => set("type", e.target.value)} placeholder="حملة خيرية" />
            </div>
            <div>
              <Label className={FIELD_LABEL}>الميزانية (ر.س)</Label>
              <Input
                type="number"
                dir="ltr"
                value={form.budget ?? ""}
                onChange={(e) => set("budget", Number(e.target.value))}
                placeholder="2000"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>المدة</Label>
              <Input value={form.duration ?? ""} onChange={(e) => set("duration", e.target.value)} placeholder="أسبوع" />
            </div>
            <div>
              <Label className={FIELD_LABEL}>الحالة</Label>
              <Select
                value={form.status ?? "pending"}
                onValueChange={(v) => set("status", v as "pending" | "approved" | "completed" | "rejected")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                  <SelectItem value="approved">مقبول</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className={FIELD_LABEL}>رسالة الطلب</Label>
            <Textarea
              className="min-h-[80px] resize-y leading-7"
              value={form.message ?? ""}
              onChange={(e) => set("message", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            إلغاء
          </Button>
          <Button size="sm" onClick={save}>
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
