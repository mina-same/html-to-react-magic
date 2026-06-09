import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type Country,
} from "libphonenumber-js";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { adminOrgsDb, adminRequestsDb, adminMatchesDb, influencersDb } from "@/lib/db";
import type { AdminOrg, AdminRequest, AdminMatch } from "@/lib/db";
import saaidLogo from "../assets/saaid-logo.png";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "ساعِد — إدارة المنصة" }] }),
  component: Admin,
});

// ── Types ────────────────────────────────────────────────

type OrgStatus = AdminOrg["status"];
type Org = AdminOrg & { notes: string }; // notes = description alias for UI

type InfStatus = "active" | "pending" | "ended";
interface Influencer {
  id: number;
  name: string;
  platform: string;
  followers: number;
  engagement: number;
  status: InfStatus;
  niche: string;
  notes: string;
  price: number;
  bio?: string;
  location?: string;
  audience?: string;
  instagramHandle?: string;
  xHandle?: string;
  tiktokHandle?: string;
  youtubeHandle?: string;
  snapchatHandle?: string;
  website?: string;
  email?: string;
  phone?: string;
}

type ReqStatus = AdminRequest["status"];
type CampaignRequest = AdminRequest;

type MatchStatus = AdminMatch["status"];
type Match = AdminMatch;

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

// ── Helpers ───────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "م";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "ك";
  return String(n);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active: { bg: "#dcfce7", color: "#166534", label: "نشط" },
    new: { bg: "#dbeafe", color: "#1e40af", label: "جديد" },
    pending: { bg: "#fef9c3", color: "#92400e", label: "قيد المراجعة" },
    suspended: { bg: "#fee2e2", color: "#b91c1c", label: "موقوف" },
    rejected: { bg: "#fee2e2", color: "#b91c1c", label: "مرفوض" },
    matched: { bg: "#f0fdf4", color: "#166534", label: "تم التوافق" },
    completed: { bg: "#dbeafe", color: "#1e40af", label: "مكتمل" },
    ended: { bg: "#f3f4f6", color: "#6b7280", label: "منتهي" },
  };
  const s = map[status] ?? { bg: "#f3f4f6", color: "#6b7280", label: status };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        display: "inline-block",
        fontSize: ".68rem",
        padding: "2px 9px",
        borderRadius: 20,
        fontWeight: 600,
      }}
    >
      {s.label}
    </span>
  );
}

function PlatBadge({ platform }: { platform: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Instagram: { bg: "#fce7f3", color: "#be185d" },
    X: { bg: "#e0f2fe", color: "#0369a1" },
    TikTok: { bg: "#f0fdf4", color: "#166534" },
    YouTube: { bg: "#fee2e2", color: "#b91c1c" },
    Snapchat: { bg: "#fef9c3", color: "#854d0e" },
  };
  const s = map[platform] ?? { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: ".68rem",
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 20,
      }}
    >
      {platform}
    </span>
  );
}

const INF_COLORS = ["#2d7a52", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#14b8a6"];
function infColor(id: number) {
  return INF_COLORS[(id - 1) % INF_COLORS.length];
}

// ── Org Modal ─────────────────────────────────────────────

function OrgModal({
  org,
  onClose,
  onSave,
}: {
  org: Partial<Org> | null;
  onClose: () => void;
  onSave: (data: Partial<Org> & { password?: string }) => void;
}) {
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
    // Only run once when the modal opens or the record changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

// ── Influencer Modal ──────────────────────────────────────

function InfModal({
  inf,
  onClose,
  onSave,
}: {
  inf: Partial<Influencer> | null;
  onClose: () => void;
  onSave: (data: Partial<Influencer>) => void;
}) {
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
            {isNew ? "➕ إضافة مؤثر جديد" : "✏️ تعديل بيانات المؤثر"}
          </DialogTitle>
        </DialogHeader>
        <div style={{ padding: "4px 0" }}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>اسم المؤثر</label>
            <input
              style={inputStyle}
              value={form.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
              placeholder="اسم المؤثر"
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}
          >
            <div>
              <label style={labelStyle}>المنصة</label>
              <select
                style={{ ...inputStyle, background: "white" }}
                value={form.platform ?? "Instagram"}
                onChange={(e) => set("platform", e.target.value)}
              >
                <option>Instagram</option>
                <option>X</option>
                <option>TikTok</option>
                <option>YouTube</option>
                <option>Snapchat</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>الحالة</label>
              <select
                style={{ ...inputStyle, background: "white" }}
                value={form.status ?? "active"}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="active">نشط</option>
                <option value="pending">قيد المراجعة</option>
                <option value="ended">منتهي</option>
              </select>
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}
          >
            <div>
              <label style={labelStyle}>عدد المتابعين</label>
              <input
                style={inputStyle}
                type="number"
                value={form.followers ?? ""}
                onChange={(e) => set("followers", Number(e.target.value))}
                placeholder="320000"
              />
            </div>
            <div>
              <label style={labelStyle}>نسبة التفاعل %</label>
              <input
                style={inputStyle}
                type="number"
                step="0.1"
                value={form.engagement ?? ""}
                onChange={(e) => set("engagement", Number(e.target.value))}
                placeholder="5.2"
              />
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}
          >
            <div>
              <label style={labelStyle}>السعر لكل حملة (ر.س)</label>
              <input
                style={inputStyle}
                type="number"
                value={form.price ?? ""}
                onChange={(e) => set("price", Number(e.target.value))}
                placeholder="1800"
              />
            </div>
            <div>
              <label style={labelStyle}>التخصص</label>
              <input
                style={inputStyle}
                value={form.niche ?? ""}
                onChange={(e) => set("niche", e.target.value)}
                placeholder="محتوى خيري"
              />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>ملاحظات</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 70, lineHeight: 1.65 }}
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
            {isNew ? "إضافة" : "حفظ"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Request Modal ─────────────────────────────────────────

function ReqModal({
  req,
  orgs,
  infs,
  onClose,
  onSave,
}: {
  req: Partial<CampaignRequest> | null;
  orgs: Org[];
  infs: Influencer[];
  onClose: () => void;
  onSave: (data: Partial<CampaignRequest>) => void;
}) {
  const [form, setForm] = useState<Partial<CampaignRequest>>(req ?? {});
  function set(k: keyof CampaignRequest, v: string | number) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function save() {
    onSave(form);
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
            تفاصيل طلب الحملة #{req?.id}
          </DialogTitle>
        </DialogHeader>
        <div style={{ padding: "4px 0" }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}
          >
            <div>
              <label style={labelStyle}>الجمعية</label>
              <select
                style={{ ...inputStyle, background: "white" }}
                value={form.orgId ?? ""}
                onChange={(e) => set("orgId", e.target.value)}
              >
                <option value="">اختر الجمعية</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>المؤثر</label>
              <select
                style={{ ...inputStyle, background: "white" }}
                value={form.infId ?? ""}
                onChange={(e) => set("infId", Number(e.target.value))}
              >
                <option value="">اختر المؤثر</option>
                {infs.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}
          >
            <div>
              <label style={labelStyle}>نوع الحملة</label>
              <input
                style={inputStyle}
                value={form.type ?? ""}
                onChange={(e) => set("type", e.target.value)}
                placeholder="حملة خيرية"
              />
            </div>
            <div>
              <label style={labelStyle}>الميزانية (ر.س)</label>
              <input
                style={inputStyle}
                type="number"
                value={form.budget ?? ""}
                onChange={(e) => set("budget", Number(e.target.value))}
                placeholder="2000"
              />
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}
          >
            <div>
              <label style={labelStyle}>المدة</label>
              <input
                style={inputStyle}
                value={form.duration ?? ""}
                onChange={(e) => set("duration", e.target.value)}
                placeholder="أسبوع"
              />
            </div>
            <div>
              <label style={labelStyle}>الحالة</label>
              <select
                style={{ ...inputStyle, background: "white" }}
                value={form.status ?? "pending"}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="pending">قيد المراجعة</option>
                <option value="matched">تم التوافق</option>
                <option value="completed">مكتمل</option>
                <option value="rejected">مرفوض</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>رسالة الطلب</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 80, lineHeight: 1.65 }}
              value={form.message ?? ""}
              onChange={(e) => set("message", e.target.value)}
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
            حفظ
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Match Modal ───────────────────────────────────────────

function MatchModal({
  match,
  orgs,
  infs,
  onClose,
  onSave,
}: {
  match: Partial<Match> | null;
  orgs: Org[];
  infs: Influencer[];
  onClose: () => void;
  onSave: (data: Partial<Match>) => void;
}) {
  const [form, setForm] = useState<Partial<Match>>(match ?? {});
  function set(k: keyof Match, v: string | number) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function save() {
    onSave(form);
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
            تفاصيل التوافق #{match?.id}
          </DialogTitle>
        </DialogHeader>
        <div style={{ padding: "4px 0" }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}
          >
            <div>
              <label style={labelStyle}>الجمعية</label>
              <select
                style={{ ...inputStyle, background: "white" }}
                value={form.orgId ?? ""}
                onChange={(e) => set("orgId", e.target.value)}
              >
                <option value="">اختر الجمعية</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>المؤثر</label>
              <select
                style={{ ...inputStyle, background: "white" }}
                value={form.infId ?? ""}
                onChange={(e) => set("infId", Number(e.target.value))}
              >
                <option value="">اختر المؤثر</option>
                {infs.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}
          >
            <div>
              <label style={labelStyle}>قيمة العقد (ر.س)</label>
              <input
                style={inputStyle}
                type="number"
                value={form.value ?? ""}
                onChange={(e) => set("value", Number(e.target.value))}
                placeholder="2000"
              />
            </div>
            <div>
              <label style={labelStyle}>الحالة</label>
              <select
                style={{ ...inputStyle, background: "white" }}
                value={form.status ?? "pending"}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="pending">قيد المراجعة</option>
                <option value="active">نشط</option>
                <option value="completed">مكتمل</option>
              </select>
            </div>
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
            حفظ
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Admin Component ──────────────────────────────────

function Admin() {
  const navigate = useNavigate();
  const { user, role, loading, signOut } = useAuth();

  const [activePage, setActivePage] = useState("overview");
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [requests, setRequests] = useState<CampaignRequest[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [orgModal, setOrgModal] = useState<{ open: boolean; data: Partial<Org> | null }>({
    open: false,
    data: null,
  });
  const [infModal, setInfModal] = useState<{ open: boolean; data: Partial<Influencer> | null }>({
    open: false,
    data: null,
  });
  const [reqModal, setReqModal] = useState<{
    open: boolean;
    data: Partial<CampaignRequest> | null;
  }>({ open: false, data: null });
  const [matchModal, setMatchModal] = useState<{ open: boolean; data: Partial<Match> | null }>({
    open: false,
    data: null,
  });

  const [orgSearch, setOrgSearch] = useState("");
  const [orgStatusFilter, setOrgStatusFilter] = useState("all");
  const [infSearch, setInfSearch] = useState("");
  const [infPlatFilter, setInfPlatFilter] = useState("all");
  const [reqStatusFilter, setReqStatusFilter] = useState("all");
  const [matchStatusFilter, setMatchStatusFilter] = useState("all");

  const filteredOrgs = useMemo(
    () =>
      orgs.filter(
        (o) =>
          (orgStatusFilter === "all" || o.status === orgStatusFilter) &&
          (o.name.includes(orgSearch) ||
            o.region.includes(orgSearch) ||
            o.license.includes(orgSearch)),
      ),
    [orgs, orgSearch, orgStatusFilter],
  );

  const filteredInfs = useMemo(
    () =>
      influencers.filter(
        (i) =>
          (infPlatFilter === "all" || i.platform === infPlatFilter) &&
          (i.name.includes(infSearch) ||
            i.niche.includes(infSearch) ||
            i.platform.includes(infSearch)),
      ),
    [influencers, infSearch, infPlatFilter],
  );

  const filteredReqs = useMemo(
    () => requests.filter((r) => reqStatusFilter === "all" || r.status === reqStatusFilter),
    [requests, reqStatusFilter],
  );

  const filteredMatches = useMemo(
    () => matches.filter((m) => matchStatusFilter === "all" || m.status === matchStatusFilter),
    [matches, matchStatusFilter],
  );

  // ─ Auth guard ────────────────────────────────────────────
  useEffect(() => {
    if (!loading) {
      if (!user) navigate({ to: "/login" });
      else if (role !== "admin") navigate({ to: "/association" });
    }
  }, [user, role, loading, navigate]);

  // ─ Data loading ──────────────────────────────────────────
  useEffect(() => {
    if (!user || role !== "admin") return;
    async function load() {
      setDataLoading(true);
      const [orgsData, infsData, reqsData, matchesData] = await Promise.all([
        adminOrgsDb.list(),
        influencersDb.list(),
        adminRequestsDb.list(),
        adminMatchesDb.list(),
      ]);
      setOrgs(orgsData.map((o) => ({ ...o, notes: o.description })));
      setInfluencers(infsData.map((i) => ({ ...i, price: i.basePrice, status: i.status as InfStatus })));
      setRequests(reqsData);
      setMatches(matchesData);
      setDataLoading(false);
    }
    load();
  }, [user, role]);

  if (loading || !user || role !== "admin") return null;

  // ─ Nav items ────────────────────────────────────────────
  type NavItem = { id: string; icon: string; label: string; badge?: { text: string; cls: string } };
  type NavSection = { label: string; items: NavItem[] };
  const navSections: NavSection[] = [
    {
      label: "الرئيسية",
      items: [{ id: "overview", icon: "⊞", label: "لوحة التحكم" }],
    },
    {
      label: "إدارة",
      items: [
        {
          id: "orgs",
          icon: "🏛",
          label: "الجمعيات",
          badge: { text: String(orgs.filter((o) => o.status === "new").length), cls: "gold" },
        },
        {
          id: "influencers",
          icon: "⭐",
          label: "المؤثرون",
          badge: {
            text: String(influencers.filter((i) => i.status === "active").length),
            cls: "green",
          },
        },
        {
          id: "requests",
          icon: "📋",
          label: "الطلبات",
          badge: {
            text: String(requests.filter((r) => r.status === "pending").length),
            cls: "red",
          },
        },
        {
          id: "matches",
          icon: "🤝",
          label: "التوافق",
          badge: {
            text: String(matches.filter((m) => m.status === "active").length),
            cls: "green",
          },
        },
      ],
    },
    {
      label: "تقارير",
      items: [
        { id: "reports", icon: "📊", label: "التقارير المالية" },
        { id: "settings", icon: "⚙", label: "الإعدادات" },
      ],
    },
  ];

  const pageTitles: Record<string, string> = {
    overview: "لوحة التحكم",
    orgs: "الجمعيات",
    influencers: "المؤثرون",
    requests: "الطلبات",
    matches: "التوافق",
    reports: "التقارير المالية",
    settings: "الإعدادات",
  };

  const pageTags: Record<string, string> = {
    overview: "نظرة عامة",
    orgs: `${orgs.length} جمعية`,
    influencers: `${influencers.length} مؤثر`,
    requests: `${requests.length} طلب`,
    matches: `${matches.length} توافق`,
    reports: "الإيرادات",
    settings: "الإعدادات العامة",
  };

  // ─ Derived / filtered data ───────────────────────────────
  // KPI totals
  const totalRevenue = matches.reduce((s, m) => s + m.value, 0);

  // ─ CRUD handlers ────────────────────────────────────────
  async function saveOrg(data: Partial<Org> & { password?: string }) {
    if (!data.id) {
      // New org: create via Edge Function (uses service role key server-side)
      const { error } = await supabase.functions.invoke("create-user", {
        body: {
          email: data.email ?? "",
          password: data.password ?? "",
          assocName: data.name ?? "",
          license: data.license ?? "",
          region: data.region ?? "",
          phone: data.phone ?? "",
          status: data.status ?? "new",
        },
      });
      if (error) {
        toast.error("فشل إنشاء الحساب: " + error.message);
        return;
      }
      const refreshed = await adminOrgsDb.list();
      setOrgs(refreshed.map((o) => ({ ...o, notes: o.description })));
      toast.success("✅ تم إنشاء حساب الجمعية بنجاح");
      return;
    }
    await adminOrgsDb.upsert(
      data.id,
      data.name ?? "",
      {
        license: data.license ?? "",
        region: data.region ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        description: data.notes ?? "",
        status: data.status ?? "active",
      },
    );
    setOrgs((prev) => prev.map((o) => (o.id === data.id ? { ...o, ...data } as Org : o)));
    toast.success("تم تحديث بيانات الجمعية");
  }

  async function suspendOrg(id: string) {
    await adminOrgsDb.setStatus(id, "suspended");
    setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, status: "suspended" as OrgStatus } : o)));
    toast.success("تم توقيف الجمعية");
  }

  async function saveInf(data: Partial<Influencer>) {
    if (data.id) {
      await influencersDb.update(data.id, {
        name: data.name,
        platform: data.platform as "Instagram" | "X" | "TikTok" | "YouTube" | "Snapchat" | undefined,
        followers: data.followers,
        engagement: data.engagement,
        status: data.status as "active" | "pending" | "ended",
        niche: data.niche,
        notes: data.notes,
        basePrice: data.price,
      });
      setInfluencers((prev) => prev.map((i) => (i.id === data.id ? { ...i, ...data } as Influencer : i)));
      toast.success("تم تحديث بيانات المؤثر");
    } else {
      const created = await influencersDb.create({
        name: data.name ?? "",
        platform: (data.platform ?? "Instagram") as "Instagram" | "X" | "TikTok" | "YouTube" | "Snapchat",
        followers: data.followers ?? 0,
        engagement: data.engagement ?? 0,
        status: (data.status ?? "active") as "active" | "pending" | "ended",
        campaigns: 0,
        niche: data.niche ?? "",
        notes: data.notes ?? "",
        basePrice: data.price ?? 0,
        bio: data.bio ?? "",
        location: data.location ?? "",
        audience: data.audience ?? "",
        instagramHandle: data.instagramHandle ?? "",
        xHandle: data.xHandle ?? "",
        tiktokHandle: data.tiktokHandle ?? "",
        youtubeHandle: data.youtubeHandle ?? "",
        snapchatHandle: data.snapchatHandle ?? "",
        website: data.website ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
      });
      if (created) {
        setInfluencers((prev) => [...prev, { ...created, price: created.basePrice, status: created.status as InfStatus }]);
      }
      toast.success("تمت إضافة المؤثر بنجاح");
    }
  }

  async function deleteInf(id: number) {
    await influencersDb.delete(id);
    setInfluencers((prev) => prev.filter((i) => i.id !== id));
    toast.success("تم حذف المؤثر");
  }

  async function saveReq(data: Partial<CampaignRequest>) {
    if (!data.id) return;
    await adminRequestsDb.update(data.id, {
      type: data.type,
      budget: data.budget,
      duration: data.duration,
      message: data.message,
      status: data.status,
    });
    setRequests((prev) => prev.map((r) => (r.id === data.id ? { ...r, ...data } as CampaignRequest : r)));
    toast.success("تم تحديث الطلب");
  }

  async function saveMatch(data: Partial<Match>) {
    if (!data.id) return;
    await adminMatchesDb.update(data.id, { status: data.status, value: data.value, notes: data.notes });
    setMatches((prev) => prev.map((m) => (m.id === data.id ? { ...m, ...data } as Match : m)));
    toast.success("تم تحديث التوافق");
  }

  async function approveMatch(reqId: number) {
    const req = requests.find((r) => r.id === reqId);
    if (!req) return;
    await adminRequestsDb.update(reqId, { status: "matched" });
    const newId = await adminMatchesDb.create({
      assocId: req.orgId,
      infId: req.infId,
      budget: req.budget,
      notes: req.message,
      startDate: req.date,
    });
    setRequests((prev) => prev.map((r) => (r.id === reqId ? { ...r, status: "matched" as ReqStatus } : r)));
    if (newId) {
      setMatches((prev) => [...prev, {
        id: newId,
        orgId: req.orgId,
        infId: req.infId,
        orgName: req.orgName,
        infName: req.infName,
        value: req.budget,
        status: "active" as MatchStatus,
        notes: req.message,
        date: req.date,
      }]);
    }
    toast.success("✅ تم قبول الطلب وإنشاء توافق");
  }

  async function rejectReq(reqId: number) {
    await adminRequestsDb.update(reqId, { status: "rejected" });
    setRequests((prev) => prev.map((r) => (r.id === reqId ? { ...r, status: "rejected" as ReqStatus } : r)));
    toast.error("تم رفض الطلب");
  }

  // ─ Styles ────────────────────────────────────────────────
  const S = {
    app: {
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      fontFamily: "'Tajawal',sans-serif",
      direction: "rtl" as const,
      background: "#f0f4f2",
      color: "#111827",
    },
    sidebar: {
      width: 252,
      minWidth: 252,
      height: "100vh",
      background: "#0d3322",
      display: "flex",
      flexDirection: "column" as const,
      flexShrink: 0,
    },
    main: {
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      overflow: "hidden",
      minWidth: 0,
    },
    content: { flex: 1, overflowY: "auto" as const, padding: 20 },
    topbar: {
      height: 56,
      background: "white",
      borderBottom: "1px solid rgba(45,122,82,.12)",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      gap: 12,
      flexShrink: 0,
    },
    secCard: {
      background: "white",
      borderRadius: 12,
      border: "1px solid rgba(45,122,82,.12)",
      marginBottom: 16,
      overflow: "hidden",
    },
    secHead: {
      padding: "13px 18px",
      borderBottom: "1px solid rgba(45,122,82,.12)",
      display: "flex",
      alignItems: "center",
      gap: 9,
    },
    secBody: { padding: 16 },
    tblTh: {
      padding: "9px 14px",
      textAlign: "right" as const,
      color: "#6b7280",
      fontWeight: 600,
      background: "#f2faf6",
      borderBottom: "1px solid rgba(45,122,82,.12)",
      fontSize: ".82rem",
    },
    tblTd: {
      padding: "10px 14px",
      borderBottom: "1px solid rgba(0,0,0,.04)",
      verticalAlign: "middle" as const,
      color: "#374151",
      fontSize: ".82rem",
    },
    btnPrimary: {
      padding: "7px 15px",
      borderRadius: 7,
      background: "#2d7a52",
      color: "white",
      border: "none",
      fontFamily: "'Tajawal',sans-serif",
      fontSize: ".78rem",
      fontWeight: 700,
      cursor: "pointer",
    },
    btnGhost: {
      padding: "6px 12px",
      borderRadius: 7,
      background: "white",
      border: "1.5px solid rgba(45,122,82,.12)",
      fontFamily: "'Tajawal',sans-serif",
      fontSize: ".76rem",
      color: "#6b7280",
      cursor: "pointer",
    },
    btnDanger: {
      padding: "6px 12px",
      borderRadius: 7,
      background: "white",
      border: "1.5px solid #fecaca",
      fontFamily: "'Tajawal',sans-serif",
      fontSize: ".76rem",
      color: "#dc2626",
      cursor: "pointer",
    },
    searchBar: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "#f0f4f2",
      border: "1.5px solid rgba(45,122,82,.12)",
      borderRadius: 8,
      padding: "7px 13px",
      fontSize: ".84rem",
      color: "#6b7280",
      width: 240,
    },
    toolbar: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 14,
      flexWrap: "wrap" as const,
    },
  };

  // ─ Sub-renders ───────────────────────────────────────────

  function renderOverview() {
    const recentOrgs = [...orgs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    const recentReqs = [...requests].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    return (
      <div>
        {/* KPI row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 11,
            marginBottom: 18,
          }}
        >
          {[
            {
              num: orgs.length,
              lbl: "إجمالي الجمعيات",
              sub: `${orgs.filter((o) => o.status === "new").length} جديدة`,
              subColor: "#2d7a52",
              accent: "#2d7a52",
            },
            {
              num: influencers.length,
              lbl: "المؤثرون النشطون",
              sub: `${influencers.filter((i) => i.status === "active").length} نشط`,
              subColor: "#c9a84c",
              accent: "#c9a84c",
            },
            {
              num: requests.filter((r) => r.status === "pending").length,
              lbl: "طلبات معلقة",
              sub: "بانتظار المراجعة",
              subColor: "#3b82f6",
              accent: "#3b82f6",
            },
            {
              num: `${(totalRevenue / 1000).toFixed(0)}ك`,
              lbl: "الإيرادات (ر.س)",
              sub: "هذا الشهر",
              subColor: "#ef4444",
              accent: "#ef4444",
            },
          ].map((k, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: 11,
                border: "1px solid rgba(45,122,82,.12)",
                padding: "14px 16px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 4,
                  height: "100%",
                  background: k.accent,
                }}
              />
              <div style={{ fontSize: "1.6rem", fontWeight: 800, lineHeight: 1, marginBottom: 3 }}>
                {k.num}
              </div>
              <div style={{ fontSize: ".73rem", color: "#6b7280" }}>{k.lbl}</div>
              <div style={{ fontSize: ".68rem", fontWeight: 600, marginTop: 5, color: k.subColor }}>
                {k.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Recent orgs */}
        <div style={S.secCard}>
          <div style={S.secHead}>
            <div
              style={{
                width: 29,
                height: 29,
                borderRadius: 7,
                background: "#e8f5ee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: ".9rem",
              }}
            >
              🏛
            </div>
            <div>
              <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#111827" }}>
                آخر الجمعيات المسجلة
              </div>
              <div style={{ fontSize: ".74rem", color: "#6b7280", marginTop: 1 }}>
                أحدث 5 جمعيات
              </div>
            </div>
          </div>
          <div style={S.secBody}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["الجمعية", "المنطقة", "تاريخ التسجيل", "الحالة", ""].map((h, i) => (
                    <th key={i} style={S.tblTh}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrgs.map((o) => (
                  <tr
                    key={o.id}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f2faf6")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td style={S.tblTd}>
                      <span style={{ fontWeight: 600, color: "#111827" }}>{o.name}</span>
                    </td>
                    <td style={S.tblTd}>{o.region}</td>
                    <td style={S.tblTd}>{o.date}</td>
                    <td style={S.tblTd}>
                      <StatusBadge status={o.status} />
                    </td>
                    <td style={S.tblTd}>
                      <button
                        onClick={() => setOrgModal({ open: true, data: o })}
                        style={S.btnGhost}
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent requests */}
        <div style={S.secCard}>
          <div style={S.secHead}>
            <div
              style={{
                width: 29,
                height: 29,
                borderRadius: 7,
                background: "#e8f5ee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: ".9rem",
              }}
            >
              📋
            </div>
            <div>
              <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#111827" }}>
                آخر الطلبات
              </div>
              <div style={{ fontSize: ".74rem", color: "#6b7280", marginTop: 1 }}>أحدث 5 طلبات</div>
            </div>
          </div>
          <div style={S.secBody}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["الجمعية", "المؤثر", "النوع", "الميزانية", "الحالة"].map((h, i) => (
                    <th key={i} style={S.tblTh}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentReqs.map((r) => (
                  <tr
                    key={r.id}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f2faf6")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td style={S.tblTd}>{r.orgName}</td>
                    <td style={S.tblTd}>{r.infName}</td>
                    <td style={S.tblTd}>{r.type}</td>
                    <td style={S.tblTd}>{r.budget.toLocaleString()} ر.س</td>
                    <td style={S.tblTd}>
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function renderOrgs() {
    return (
      <div>
        <div style={S.toolbar}>
          <div style={S.searchBar}>
            <span>🔍</span>
            <input
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "'Tajawal',sans-serif",
                fontSize: ".84rem",
                color: "#111827",
                flex: 1,
                direction: "rtl",
              }}
              placeholder="ابحث عن جمعية..."
              value={orgSearch}
              onChange={(e) => setOrgSearch(e.target.value)}
            />
          </div>
          <select
            style={{
              padding: "7px 12px",
              border: "1.5px solid rgba(45,122,82,.12)",
              borderRadius: 8,
              fontFamily: "'Tajawal',sans-serif",
              fontSize: ".82rem",
              color: "#374151",
              background: "white",
              cursor: "pointer",
            }}
            value={orgStatusFilter}
            onChange={(e) => setOrgStatusFilter(e.target.value)}
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="new">جديد</option>
            <option value="pending">قيد المراجعة</option>
            <option value="suspended">موقوف</option>
          </select>
          <button
            style={{ ...S.btnPrimary, marginRight: "auto" }}
            onClick={() => setOrgModal({ open: true, data: {} })}
          >
            + إضافة جمعية
          </button>
        </div>
        <div style={S.secCard}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "الجمعية",
                  "الترخيص",
                  "المنطقة",
                  "التواصل",
                  "الحالة",
                  "تاريخ التسجيل",
                  "إجراءات",
                ].map((h, i) => (
                  <th key={i} style={S.tblTh}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.map((o) => (
                <tr
                  key={o.id}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f2faf6")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <td style={S.tblTd}>
                    <div style={{ fontWeight: 700, color: "#111827" }}>{o.name}</div>
                    {o.notes && (
                      <div style={{ fontSize: ".7rem", color: "#9ca3af", marginTop: 2 }}>
                        {o.notes}
                      </div>
                    )}
                  </td>
                  <td style={S.tblTd}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: ".8rem",
                        background: "#f0f4f2",
                        padding: "2px 7px",
                        borderRadius: 5,
                      }}
                    >
                      {o.license}
                    </span>
                  </td>
                  <td style={S.tblTd}>{o.region}</td>
                  <td style={S.tblTd}>
                    <div style={{ fontSize: ".78rem" }}>{o.email}</div>
                    <div style={{ fontSize: ".75rem", color: "#9ca3af" }}>{o.phone}</div>
                  </td>
                  <td style={S.tblTd}>
                    <StatusBadge status={o.status} />
                  </td>
                  <td style={S.tblTd}>{o.date}</td>
                  <td style={S.tblTd}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button
                        style={S.btnGhost}
                        onClick={() => setOrgModal({ open: true, data: o })}
                      >
                        تعديل
                      </button>
                      <button style={S.btnDanger} onClick={() => suspendOrg(o.id)}>
                        توقيف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrgs.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ ...S.tblTd, textAlign: "center", color: "#9ca3af", padding: 32 }}
                  >
                    لا توجد نتائج
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderInfluencers() {
    return (
      <div>
        <div style={S.toolbar}>
          <div style={S.searchBar}>
            <span>🔍</span>
            <input
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "'Tajawal',sans-serif",
                fontSize: ".84rem",
                color: "#111827",
                flex: 1,
                direction: "rtl",
              }}
              placeholder="ابحث عن مؤثر..."
              value={infSearch}
              onChange={(e) => setInfSearch(e.target.value)}
            />
          </div>
          <select
            style={{
              padding: "7px 12px",
              border: "1.5px solid rgba(45,122,82,.12)",
              borderRadius: 8,
              fontFamily: "'Tajawal',sans-serif",
              fontSize: ".82rem",
              color: "#374151",
              background: "white",
              cursor: "pointer",
            }}
            value={infPlatFilter}
            onChange={(e) => setInfPlatFilter(e.target.value)}
          >
            <option value="all">جميع المنصات</option>
            <option>Instagram</option>
            <option>X</option>
            <option>TikTok</option>
            <option>YouTube</option>
            <option>Snapchat</option>
          </select>
          <button
            style={{ ...S.btnPrimary, marginRight: "auto" }}
            onClick={() => setInfModal({ open: true, data: {} })}
          >
            + إضافة مؤثر
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {filteredInfs.map((inf) => (
            <div
              key={inf.id}
              style={{
                background: "white",
                borderRadius: 11,
                border: "1px solid rgba(45,122,82,.12)",
                padding: 15,
                transition: "all .18s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#2d7a52";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 3px 14px rgba(45,122,82,.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(45,122,82,.12)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: infColor(inf.id),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  {inf.name.slice(0, 1)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#111827" }}>
                    {inf.name}
                  </div>
                  <div style={{ fontSize: ".72rem", color: "#6b7280", marginTop: 1 }}>
                    {inf.niche}
                  </div>
                </div>
                <StatusBadge status={inf.status} />
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
                <PlatBadge platform={inf.platform} />
                <span style={{ fontSize: ".72rem", color: "#9ca3af" }}>
                  {inf.price.toLocaleString()} ر.س/حملة
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 5,
                  margin: "10px 0",
                }}
              >
                {[
                  { num: fmt(inf.followers), lbl: "متابع" },
                  { num: `${inf.engagement}%`, lbl: "تفاعل" },
                  { num: inf.price.toLocaleString(), lbl: "ر.س" },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#f2faf6",
                      borderRadius: 7,
                      padding: "6px 4px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: ".82rem", fontWeight: 700, color: "#111827" }}>
                      {s.num}
                    </div>
                    <div style={{ fontSize: ".62rem", color: "#9ca3af", marginTop: 1 }}>
                      {s.lbl}
                    </div>
                  </div>
                ))}
              </div>
              {inf.notes && (
                <div
                  style={{
                    fontSize: ".72rem",
                    color: "#6b7280",
                    background: "#f2faf6",
                    borderRadius: 6,
                    padding: "5px 9px",
                    marginBottom: 10,
                  }}
                >
                  {inf.notes}
                </div>
              )}
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  style={{ ...S.btnGhost, flex: 1 }}
                  onClick={() => setInfModal({ open: true, data: inf })}
                >
                  تعديل
                </button>
                <button style={S.btnDanger} onClick={() => deleteInf(inf.id)}>
                  حذف
                </button>
              </div>
            </div>
          ))}
          {filteredInfs.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#9ca3af", padding: 48 }}>
              لا توجد نتائج
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderRequests() {
    return (
      <div>
        <div style={S.toolbar}>
          <select
            style={{
              padding: "7px 12px",
              border: "1.5px solid rgba(45,122,82,.12)",
              borderRadius: 8,
              fontFamily: "'Tajawal',sans-serif",
              fontSize: ".82rem",
              color: "#374151",
              background: "white",
              cursor: "pointer",
            }}
            value={reqStatusFilter}
            onChange={(e) => setReqStatusFilter(e.target.value)}
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">معلق</option>
            <option value="matched">تم التوافق</option>
            <option value="completed">مكتمل</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
        <div style={S.secCard}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "#",
                  "الجمعية",
                  "المؤثر",
                  "النوع",
                  "الميزانية",
                  "المدة",
                  "التاريخ",
                  "الحالة",
                  "إجراءات",
                ].map((h, i) => (
                  <th key={i} style={S.tblTh}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReqs.map((r) => (
                <tr
                  key={r.id}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f2faf6")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <td style={{ ...S.tblTd, color: "#9ca3af" }}>#{r.id}</td>
                  <td style={S.tblTd}>{r.orgName}</td>
                  <td style={S.tblTd}>{r.infName}</td>
                  <td style={S.tblTd}>{r.type}</td>
                  <td style={S.tblTd}>{r.budget.toLocaleString()} ر.س</td>
                  <td style={S.tblTd}>{r.duration}</td>
                  <td style={S.tblTd}>{r.date}</td>
                  <td style={S.tblTd}>
                    <StatusBadge status={r.status} />
                  </td>
                  <td style={S.tblTd}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button
                        style={S.btnGhost}
                        onClick={() => setReqModal({ open: true, data: r })}
                      >
                        عرض
                      </button>
                      {r.status === "pending" && (
                        <>
                          <button
                            style={{ ...S.btnPrimary, fontSize: ".72rem", padding: "5px 10px" }}
                            onClick={() => approveMatch(r.id)}
                          >
                            قبول
                          </button>
                          <button style={S.btnDanger} onClick={() => rejectReq(r.id)}>
                            رفض
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReqs.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{ ...S.tblTd, textAlign: "center", color: "#9ca3af", padding: 32 }}
                  >
                    لا توجد نتائج
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderMatches() {
    return (
      <div>
        <div style={S.toolbar}>
          <select
            style={{
              padding: "7px 12px",
              border: "1.5px solid rgba(45,122,82,.12)",
              borderRadius: 8,
              fontFamily: "'Tajawal',sans-serif",
              fontSize: ".82rem",
              color: "#374151",
              background: "white",
              cursor: "pointer",
            }}
            value={matchStatusFilter}
            onChange={(e) => setMatchStatusFilter(e.target.value)}
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="pending">قيد المراجعة</option>
            <option value="completed">مكتمل</option>
          </select>
        </div>
        {filteredMatches.map((m) => (
          <div
            key={m.id}
            style={{
              background: "white",
              borderRadius: 11,
              border: "1px solid rgba(45,122,82,.12)",
              padding: "14px 16px",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: ".85rem", fontWeight: 700, color: "#111827" }}>
                {m.orgName}
              </div>
              <div style={{ fontSize: ".72rem", color: "#6b7280", marginTop: 2 }}>الجمعية</div>
            </div>
            <div style={{ fontSize: "1.2rem", color: "#c9a84c", flexShrink: 0 }}>⇄</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: ".85rem", fontWeight: 700, color: "#111827" }}>
                {m.infName}
              </div>
              <div style={{ fontSize: ".72rem", color: "#6b7280", marginTop: 2 }}>المؤثر</div>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0, minWidth: 90 }}>
              <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#111827" }}>
                {m.value.toLocaleString()} ر.س
              </div>
              <div style={{ fontSize: ".68rem", color: "#9ca3af", marginTop: 1 }}>{m.date}</div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <StatusBadge status={m.status} />
            </div>
            <div style={{ flexShrink: 0 }}>
              {m.notes && (
                <div style={{ fontSize: ".72rem", color: "#6b7280", maxWidth: 160 }}>{m.notes}</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button style={S.btnGhost} onClick={() => setMatchModal({ open: true, data: m })}>
                تعديل
              </button>
            </div>
          </div>
        ))}
        {filteredMatches.length === 0 && (
          <div style={{ textAlign: "center", color: "#9ca3af", padding: 48 }}>لا توجد نتائج</div>
        )}
      </div>
    );
  }

  function renderReports() {
    const totalCommission = Math.round(totalRevenue * 0.15);
    return (
      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 11,
            marginBottom: 18,
          }}
        >
          {[
            {
              num: `${totalRevenue.toLocaleString()} ر.س`,
              lbl: "إجمالي قيمة العقود",
              accent: "#2d7a52",
            },
            {
              num: `${totalCommission.toLocaleString()} ر.س`,
              lbl: "عمولة المنصة (15%)",
              accent: "#c9a84c",
            },
            {
              num: matches.length,
              lbl: "عدد التوافقات",
              accent: "#3b82f6",
            },
          ].map((k, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: 11,
                border: "1px solid rgba(45,122,82,.12)",
                padding: "14px 16px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 4,
                  height: "100%",
                  background: k.accent,
                }}
              />
              <div style={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1, marginBottom: 3 }}>
                {k.num}
              </div>
              <div style={{ fontSize: ".73rem", color: "#6b7280" }}>{k.lbl}</div>
            </div>
          ))}
        </div>
        <div style={S.secCard}>
          <div style={S.secHead}>
            <div
              style={{
                width: 29,
                height: 29,
                borderRadius: 7,
                background: "#e8f5ee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: ".9rem",
              }}
            >
              📊
            </div>
            <div>
              <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#111827" }}>
                تقرير التوافقات
              </div>
              <div style={{ fontSize: ".74rem", color: "#6b7280", marginTop: 1 }}>
                جميع التوافقات المكتملة والنشطة
              </div>
            </div>
          </div>
          <div style={S.secBody}>
            {matches.length === 0 ? (
              <div style={{ textAlign: "center", color: "#9ca3af", padding: 48 }}>لا توجد توافقات بعد</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["الجمعية", "المؤثر", "قيمة العقد", "عمولة المنصة (15%)", "تاريخ البدء", "الحالة"].map(
                      (h, i) => (
                        <th key={i} style={S.tblTh}>
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m) => {
                    const commission = Math.round(m.value * 0.15);
                    return (
                      <tr
                        key={m.id}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f2faf6")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                      >
                        <td style={S.tblTd}>{m.orgName}</td>
                        <td style={S.tblTd}>{m.infName}</td>
                        <td style={{ ...S.tblTd, fontWeight: 700 }}>{m.value.toLocaleString()} ر.س</td>
                        <td style={{ ...S.tblTd, color: "#c9a84c", fontWeight: 700 }}>
                          {commission.toLocaleString()} ر.س
                        </td>
                        <td style={S.tblTd}>{m.date}</td>
                        <td style={S.tblTd}><StatusBadge status={m.status} /></td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: "#f2faf6" }}>
                    <td colSpan={2} style={{ ...S.tblTh, fontWeight: 800, color: "#111827" }}>
                      الإجمالي
                    </td>
                    <td style={{ ...S.tblTh, fontWeight: 800, color: "#111827" }}>
                      {totalRevenue.toLocaleString()} ر.س
                    </td>
                    <td style={{ ...S.tblTh, fontWeight: 800, color: "#c9a84c" }}>
                      {totalCommission.toLocaleString()} ر.س
                    </td>
                    <td colSpan={2} style={S.tblTh}></td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderSettings() {
    return (
      <div style={S.secCard}>
        <div style={S.secHead}>
          <div
            style={{
              width: 29,
              height: 29,
              borderRadius: 7,
              background: "#e8f5ee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: ".9rem",
            }}
          >
            ⚙
          </div>
          <div>
            <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#111827" }}>
              إعدادات المنصة
            </div>
            <div style={{ fontSize: ".74rem", color: "#6b7280", marginTop: 1 }}>
              الإعدادات العامة للمنصة
            </div>
          </div>
        </div>
        <div style={{ ...S.secBody, textAlign: "center", padding: 64, color: "#9ca3af" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>⚙️</div>
          <div style={{ fontWeight: 600 }}>الإعدادات قيد التطوير</div>
          <div style={{ fontSize: ".8rem", marginTop: 6 }}>ستتوفر هذه الصفحة قريباً</div>
        </div>
      </div>
    );
  }

  // ─ Render ────────────────────────────────────────────────
  const pageContent: Record<string, React.ReactNode> = {
    overview: renderOverview(),
    orgs: renderOrgs(),
    influencers: renderInfluencers(),
    requests: renderRequests(),
    matches: renderMatches(),
    reports: renderReports(),
    settings: renderSettings(),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700;800&display=swap');
        html, body { direction: rtl; font-family: 'Tajawal', sans-serif; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-page-anim { animation: fadeUp .3s ease; }
        .admin-content::-webkit-scrollbar { width: 4px; }
        .admin-content::-webkit-scrollbar-thumb { background: rgba(45,122,82,.12); border-radius: 4px; }
      `}</style>
      <div style={S.app}>
        {/* ── Sidebar ── */}
        <aside style={S.sidebar}>
          {/* Logo */}
          <div
            style={{
              padding: "14px 16px 12px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderBottom: "1px solid rgba(255,255,255,.07)",
            }}
          >
            <img
              src={saaidLogo}
              alt="ساعِد"
              style={{ width: 38, height: "auto", filter: "brightness(0) invert(1)" }}
            />
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "white", lineHeight: 1 }}>
                ساعِد
              </div>
              <div
                style={{
                  fontSize: ".58rem",
                  color: "rgba(255,255,255,.3)",
                  letterSpacing: 2,
                  marginTop: 1,
                }}
              >
                SAAID PLATFORM
              </div>
            </div>
          </div>
          {/* Admin badge */}
          <div
            style={{
              margin: "10px 14px",
              background: "rgba(201,168,76,.15)",
              border: "1px solid rgba(201,168,76,.25)",
              borderRadius: 8,
              padding: "7px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#c9a84c",
                animation: "pulse 2s infinite",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: ".75rem", fontWeight: 600, color: "rgba(201,168,76,.9)" }}>
              لوحة الإدارة
            </span>
          </div>
          {/* Nav */}
          <nav style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
            {navSections.map((sec) => (
              <div key={sec.label}>
                <div
                  style={{
                    fontSize: ".6rem",
                    fontWeight: 600,
                    letterSpacing: ".1em",
                    color: "rgba(255,255,255,.25)",
                    padding: "10px 8px 4px",
                    textTransform: "uppercase",
                  }}
                >
                  {sec.label}
                </div>
                {sec.items.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActivePage(item.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        padding: "8px 10px",
                        borderRadius: 7,
                        color: isActive ? "white" : "rgba(255,255,255,.55)",
                        fontSize: ".85rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        marginBottom: 1,
                        border: "none",
                        width: "100%",
                        textAlign: "right",
                        fontFamily: "'Tajawal',sans-serif",
                        direction: "rtl",
                        background: isActive ? "rgba(255,255,255,.12)" : "transparent",
                        transition: "all .15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            "rgba(255,255,255,.08)";
                          (e.currentTarget as HTMLButtonElement).style.color = "white";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "rgba(255,255,255,.55)";
                        }
                      }}
                    >
                      <span
                        style={{
                          fontSize: ".92rem",
                          width: 17,
                          flexShrink: 0,
                          textAlign: "center",
                          color: isActive ? "#c9a84c" : "inherit",
                        }}
                      >
                        {item.icon}
                      </span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.badge && Number(item.badge.text) > 0 && (
                        <span
                          style={{
                            fontSize: ".62rem",
                            fontWeight: 700,
                            padding: "1px 7px",
                            borderRadius: 20,
                            background:
                              item.badge.cls === "gold"
                                ? "rgba(201,168,76,.2)"
                                : item.badge.cls === "red"
                                  ? "rgba(220,38,38,.2)"
                                  : "rgba(74,158,112,.25)",
                            color:
                              item.badge.cls === "gold"
                                ? "#c9a84c"
                                : item.badge.cls === "red"
                                  ? "#f87171"
                                  : "#7dcea0",
                          }}
                        >
                          {item.badge.text}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
          {/* Bottom */}
          <div style={{ padding: 8, borderTop: "1px solid rgba(255,255,255,.07)" }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 10px",
                borderRadius: 7,
                color: "rgba(255,255,255,.55)",
                fontSize: ".85rem",
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                width: "100%",
                textAlign: "right",
                fontFamily: "'Tajawal',sans-serif",
                direction: "rtl",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.08)";
                (e.currentTarget as HTMLButtonElement).style.color = "white";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,.55)";
              }}
              onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
            >
              <span style={{ fontSize: ".92rem", width: 17, textAlign: "center" }}>🚪</span>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={S.main}>
          {/* Topbar */}
          <div style={S.topbar}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", flex: 1 }}>
              {pageTitles[activePage]}
            </div>
            <span
              style={{
                fontSize: ".75rem",
                fontWeight: 600,
                color: "#1a5c3a",
                background: "#e8f5ee",
                padding: "4px 12px",
                borderRadius: 20,
              }}
            >
              {pageTags[activePage]}
            </span>
          </div>
          {/* Content */}
          <div className="admin-content" style={S.content}>
            {dataLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 14 }}>
                <div style={{ width: 40, height: 40, border: "3px solid rgba(45,122,82,.15)", borderTopColor: "#2d7a52", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <span style={{ color: "#6b7280", fontSize: ".88rem", fontFamily: "'Tajawal',sans-serif" }}>جاري تحميل البيانات...</span>
              </div>
            ) : (
              <div key={activePage} className="admin-page-anim">
                {pageContent[activePage]}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      {orgModal.open && (
        <OrgModal
          key={orgModal.data?.id ?? "new"}
          org={orgModal.data}
          onClose={() => setOrgModal({ open: false, data: null })}
          onSave={saveOrg}
        />
      )}
      {infModal.open && (
        <InfModal
          inf={infModal.data}
          onClose={() => setInfModal({ open: false, data: null })}
          onSave={saveInf}
        />
      )}
      {reqModal.open && (
        <ReqModal
          req={reqModal.data}
          orgs={orgs}
          infs={influencers}
          onClose={() => setReqModal({ open: false, data: null })}
          onSave={saveReq}
        />
      )}
      {matchModal.open && (
        <MatchModal
          match={matchModal.data}
          orgs={orgs}
          infs={influencers}
          onClose={() => setMatchModal({ open: false, data: null })}
          onSave={saveMatch}
        />
      )}
    </>
  );
}
