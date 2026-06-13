import { useState, useEffect } from "react";
import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type Country,
} from "libphonenumber-js";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export function OrgModal({ org, onClose, onSave }: OrgModalProps) {
  const [form, setForm] = useState<Partial<Org>>(org ?? {});
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState<Country>("SA");
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 7,
    border: "1.5px solid rgba(45,122,82,.12)",
    fontFamily: "'Tajawal',sans-serif",
    fontSize: ".88rem",
    color: "#111827",
    outline: "none",
    direction: "rtl",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: ".74rem",
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: ".05em",
    marginBottom: 5,
  };

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
      <DialogContent
        style={{
          fontFamily: "'Tajawal',sans-serif",
          direction: "rtl",
          maxWidth: 520,
          borderRadius: 14,
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ fontSize: ".95rem", fontWeight: 700, color: "#111827" }}>
            {isNew ? "➕ إضافة جمعية جديدة" : "✏️ تعديل بيانات الجمعية"}
          </DialogTitle>
        </DialogHeader>
        <div style={{ padding: "4px 0" }}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>اسم الجمعية</label>
            <input
              style={inputStyle}
              value={form.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
              placeholder="اسم الجمعية الخيرية"
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}
          >
            <div>
              <label style={labelStyle}>رقم الترخيص</label>
              <input
                style={inputStyle}
                value={form.license ?? ""}
                onChange={(e) => set("license", e.target.value)}
                placeholder="20250001"
              />
            </div>
            <div>
              <label style={labelStyle}>المنطقة</label>
              <input
                style={inputStyle}
                value={form.region ?? ""}
                onChange={(e) => set("region", e.target.value)}
                placeholder="الرياض"
              />
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}
          >
            <div>
              <label style={labelStyle}>البريد الإلكتروني</label>
              <input
                style={inputStyle}
                value={form.email ?? ""}
                onChange={(e) => set("email", e.target.value)}
                placeholder="info@org.org"
              />
            </div>
            {isNew && (
              <div>
                <label style={labelStyle}>كلمة المرور (8 أحرف+)</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            )}
            {!isNew && (
              <div>
                <label style={labelStyle}>رقم الهاتف</label>
                <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                  <select
                    style={{
                      ...inputStyle,
                      background: "white",
                      width: 140,
                      flexShrink: 0,
                      direction: "ltr",
                    }}
                    value={country}
                    onChange={(e) => setCountry(e.target.value as Country)}
                  >
                    {COUNTRY_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <input
                    style={{ ...inputStyle, flex: 1, direction: "ltr" }}
                    value={form.phone ?? ""}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="501234567"
                  />
                </div>
                <div style={{ fontSize: ".7rem", color: "#6b7280", marginTop: 5 }}>
                  اختر الدولة أولاً ثم أدخل الرقم. سيتم حفظه بصيغة دولية صحيحة.
                </div>
              </div>
            )}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>الحالة</label>
            <select
              style={{ ...inputStyle, background: "white" }}
              value={form.status ?? "new"}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="new">جديد</option>
              <option value="active">نشط</option>
              <option value="pending">قيد المراجعة</option>
              <option value="suspended">موقوف</option>
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>ملاحظات</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 80, lineHeight: 1.65 }}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            borderTop: "1px solid rgba(45,122,82,.12)",
            paddingTop: 13,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "6px 12px",
              borderRadius: 7,
              background: "white",
              border: "1.5px solid rgba(45,122,82,.12)",
              fontFamily: "'Tajawal',sans-serif",
              fontSize: ".76rem",
              color: "#6b7280",
              cursor: "pointer",
            }}
          >
            إلغاء
          </button>
          <button
            onClick={save}
            style={{
              padding: "7px 15px",
              borderRadius: 7,
              background: "#2d7a52",
              color: "white",
              border: "none",
              fontFamily: "'Tajawal',sans-serif",
              fontSize: ".78rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {isNew ? "إضافة" : "حفظ التغييرات"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
