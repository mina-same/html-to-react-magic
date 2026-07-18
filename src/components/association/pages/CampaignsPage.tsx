import { useState } from "react";
import type { Campaign } from "../types";
import { campaignsDb } from "@/lib/db";

const STATUS_MAP: Record<Campaign["status"], { label: string; bg: string; color: string }> = {
  active: { label: "نشطة", bg: "#dcfce7", color: "#166534" },
  draft: { label: "مسودة", bg: "#f1f5f9", color: "#64748b" },
  paused: { label: "متوقفة", bg: "#fef9c3", color: "#854d0e" },
  ended: { label: "منتهية", bg: "#fee2e2", color: "#991b1b" },
};

interface Props {
  campaigns: Campaign[];
  userId?: string;
  onRefresh?: () => void;
}

export default function CampaignsPage({ campaigns, userId, onRefresh }: Props) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", budget: "", reach: "" });
  const [busy, setBusy] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !form.title.trim()) return;
    setBusy(true);
    await campaignsDb.create(userId, {
      title: form.title.trim(),
      status: "draft",
      budget: Number(form.budget) || 0,
      reach: form.reach.trim() || "—",
    });
    setForm({ title: "", budget: "", reach: "" });
    setAdding(false);
    setBusy(false);
    onRefresh?.();
  }

  const inp: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid rgba(45,122,82,.18)",
    fontFamily: "'Tajawal','Cairo',sans-serif",
    fontSize: ".82rem",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
    color: "#111827",
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: 13,
        border: "1px solid rgba(45,122,82,.12)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid rgba(45,122,82,.12)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 7,
            background: "#e8f5ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          📣
        </div>
        <div>
          <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>الحملات</div>
          <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>
            {campaigns.length} حملة
          </div>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          style={{
            marginRight: "auto",
            fontSize: ".78rem",
            padding: "6px 14px",
            borderRadius: 8,
            border: "none",
            background: "#2d7a52",
            color: "white",
            fontFamily: "'Tajawal','Cairo',sans-serif",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {adding ? "✕ إلغاء" : "+ حملة جديدة"}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <form
          onSubmit={handleAdd}
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid rgba(45,122,82,.1)",
            background: "#f8fdfb",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: "1 1 200px" }}>
            <label
              style={{ fontSize: ".72rem", color: "#6b7280", display: "block", marginBottom: 4 }}
            >
              اسم الحملة *
            </label>
            <input
              style={inp}
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="حملة كسوة الشتاء 2026"
            />
          </div>
          <div style={{ flex: "0 1 130px" }}>
            <label
              style={{ fontSize: ".72rem", color: "#6b7280", display: "block", marginBottom: 4 }}
            >
              الميزانية (ر.س)
            </label>
            <input
              style={inp}
              type="number"
              min="0"
              value={form.budget}
              onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
              placeholder="10000"
            />
          </div>
          <div style={{ flex: "0 1 120px" }}>
            <label
              style={{ fontSize: ".72rem", color: "#6b7280", display: "block", marginBottom: 4 }}
            >
              الوصول المتوقع
            </label>
            <input
              style={inp}
              value={form.reach}
              onChange={(e) => setForm((f) => ({ ...f, reach: e.target.value }))}
              placeholder="50K"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background: "#1a5c3a",
              color: "white",
              fontFamily: "'Tajawal','Cairo',sans-serif",
              fontSize: ".82rem",
              fontWeight: 700,
              cursor: busy ? "wait" : "pointer",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "..." : "إضافة"}
          </button>
        </form>
      )}

      {/* List */}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {campaigns.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af", fontSize: ".85rem" }}
          >
            لا توجد حملات بعد — أضف أول حملة
          </div>
        ) : (
          campaigns.map((c) => {
            const s = STATUS_MAP[c.status] ?? STATUS_MAP.draft;
            return (
              <div
                key={c.id}
                style={{
                  background: "#f2faf6",
                  borderRadius: 10,
                  padding: "14px 16px",
                  border: "1px solid rgba(45,122,82,.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "#e8f5ee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    flexShrink: 0,
                  }}
                >
                  📣
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: ".85rem", fontWeight: 700, color: "#111827" }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: ".72rem", color: "#6b7280", marginTop: 3 }}>
                    الوصول: {c.reach}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: ".65rem",
                    padding: "2px 9px",
                    borderRadius: 20,
                    fontWeight: 600,
                    background: s.bg,
                    color: s.color,
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.label}
                </span>
                <div
                  style={{
                    fontSize: ".8rem",
                    fontWeight: 700,
                    color: "#1a5c3a",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.budget.toLocaleString()} ر.س
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
