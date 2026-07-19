import { useState, useEffect } from "react";
import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
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
import type { Org } from "../types";

const COUNTRY_DISPLAY_NAMES =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["ar"], { type: "region" })
    : null;

const COUNTRY_OPTIONS = getCountries()
  .map((code) => ({
    code,
    label: `${COUNTRY_DISPLAY_NAMES?.of(code) ?? code} (+${getCountryCallingCode(code)})`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label, "ar"));

interface OrgModalProps {
  org: Partial<Org> | null;
  onClose: () => void;
  onSave: (data: Partial<Org> & { password?: string }) => void;
}

const FIELD_LABEL = "block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5";

export function OrgModal({ org, onClose, onSave }: OrgModalProps) {
  const [form, setForm] = useState<Partial<Org>>(org ?? {});
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState<CountryCode>("SA");
  const isNew = !org?.id;

  function set(k: keyof Org, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function save() {
    if (!form.name?.trim()) {
      toast.error("يجب إدخال اسم الجمعية");
      return;
    }
    if (isNew) {
      if (!form.email?.trim()) {
        toast.error("يجب إدخال البريد الإلكتروني");
        return;
      }
      if (password.length < 8) {
        toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
        return;
      }
    }
    if (form.phone?.trim()) {
      const parsed = parsePhoneNumberFromString(form.phone.trim(), country);
      if (!parsed || !isValidPhoneNumber(form.phone.trim(), country)) {
        toast.error("رقم الهاتف غير صحيح، اختر الدولة وتأكد من الرقم");
        return;
      }
      onSave({ ...form, phone: parsed.number, password: isNew ? password : undefined });
    } else if (isNew) {
      onSave({ ...form, password });
    } else {
      toast.error("يجب إدخال رقم الهاتف");
      return;
    }
    onClose();
  }

  useEffect(() => {
    const parsed = form.phone ? parsePhoneNumberFromString(form.phone) : undefined;
    if (parsed?.country) {
      setCountry(parsed.country);
      setForm((f) => ({
        ...f,
        phone: parsed.formatNational(),
      }));
      return;
    }
    const saParsed = form.phone ? parsePhoneNumberFromString(form.phone, "SA") : undefined;
    if (saParsed?.country) {
      setCountry(saParsed.country);
      setForm((f) => ({
        ...f,
        phone: saParsed.formatNational(),
      }));
    }
  }, [org?.id]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[520px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isNew ? "➕ إضافة جمعية جديدة" : "✏️ تعديل بيانات الجمعية"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3.5">
          <div>
            <Label className={FIELD_LABEL}>اسم الجمعية</Label>
            <Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="اسم الجمعية الخيرية" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>رقم الترخيص</Label>
              <Input value={form.license ?? ""} onChange={(e) => set("license", e.target.value)} placeholder="20250001" />
            </div>
            <div>
              <Label className={FIELD_LABEL}>المنطقة</Label>
              <Input value={form.region ?? ""} onChange={(e) => set("region", e.target.value)} placeholder="الرياض" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>البريد الإلكتروني</Label>
              <Input value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="info@org.org" />
            </div>
            {isNew && (
              <div>
                <Label className={FIELD_LABEL}>كلمة المرور (8 أحرف+)</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            )}
            {!isNew && (
              <div>
                <Label className={FIELD_LABEL}>رقم الهاتف</Label>
                <div className="flex items-stretch gap-2">
                  <Select value={country} onValueChange={(v) => setCountry(v as CountryCode)}>
                    <SelectTrigger className="w-[140px] shrink-0" dir="ltr">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.code} value={opt.code}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    dir="ltr"
                    className="flex-1"
                    value={form.phone ?? ""}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="501234567"
                  />
                </div>
                <div className="mt-1.5 text-xs text-muted-foreground">
                  اختر الدولة أولاً ثم أدخل الرقم. سيتم حفظه بصيغة دولية صحيحة.
                </div>
              </div>
            )}
          </div>
          <div>
            <Label className={FIELD_LABEL}>الحالة</Label>
            <Select value={form.status ?? "new"} onValueChange={(v) => set("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">جديد</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
                <SelectItem value="suspended">موقوف</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className={FIELD_LABEL}>ملاحظات</Label>
            <Textarea
              className="min-h-[80px] resize-y leading-7"
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
            {isNew ? "إضافة" : "حفظ التغييرات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
