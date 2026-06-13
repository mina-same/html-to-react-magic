import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Influencer } from "../types";

interface InfModalProps {
  inf: Partial<Influencer> | null;
  onClose: () => void;
  onSave: (data: Partial<Influencer>) => void;
}

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
                onChange={(e) => set("status", e.target.value as "active" | "pending" | "ended")}
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
