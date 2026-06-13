import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Org, Influencer, CampaignRequest } from "../types";

interface ReqModalProps {
  req: Partial<CampaignRequest> | null;
  orgs: Org[];
  infs: Influencer[];
  onClose: () => void;
  onSave: (data: Partial<CampaignRequest>) => void;
}

export function ReqModal({ req, orgs, infs, onClose, onSave }: ReqModalProps) {
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
                onChange={(e) =>
                  set("status", e.target.value as "pending" | "approved" | "completed" | "rejected")
                }
              >
                <option value="pending">قيد المراجعة</option>
                <option value="approved">مقبول</option>
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
