import { useState } from "react";
import type { Employee } from "../types";
import { Button } from "@/components/ui/button";

interface Props {
  employees: Employee[];
  onAdd: () => void;
  onEdit: (employee: Employee) => void;
  onStatusChange: (id: number, status: Employee["status"]) => void;
  onDelete: (id: number) => void;
}

const STATUS_LABELS: Record<Employee["status"], string> = {
  active: "نشط",
  away: "بعيد",
  off: "خارج العمل",
};
const STATUS_STYLE: Record<Employee["status"], React.CSSProperties> = {
  active: { background: "#dcfce7", color: "#166534" },
  away:   { background: "#fef9c3", color: "#854d0e" },
  off:    { background: "#f1f5f9", color: "#94a3b8" },
};
const STATUS_DOT: Record<Employee["status"], string> = {
  active: "#059669",
  away:   "#f59e0b",
  off:    "#9ca3af",
};

export default function TeamPage({ employees, onAdd, onEdit, onStatusChange, onDelete }: Props) {
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const activeCount = employees.filter((e) => e.status === "active").length;

  return (
    <div
      style={{
        background: "white",
        borderRadius: 13,
        border: "1px solid rgba(45,122,82,.12)",
        overflow: "hidden",
      }}
    >
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
            fontSize: ".95rem",
          }}
        >
          👥
        </div>
        <div>
          <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>الفريق</div>
          <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>
            {employees.length} موظفين
          </div>
        </div>
        <div style={{ marginRight: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              fontSize: ".72rem",
              background: "#dcfce7",
              color: "#166534",
              padding: "2px 9px",
              borderRadius: 20,
              fontWeight: 600,
            }}
          >
            {activeCount} نشطين
          </span>
          <Button
            size="sm"
            onClick={onAdd}
            style={{
              background: "#2d7a52",
              color: "white",
              fontSize: ".78rem",
              padding: "6px 14px",
              borderRadius: 8,
            }}
          >
            + إضافة موظف
          </Button>
        </div>
      </div>

      {employees.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "#9ca3af",
            fontSize: ".85rem",
          }}
        >
          لا يوجد موظفون بعد — ابدأ بإضافة أحد أفراد الفريق.
        </div>
      )}

      <div>
        {employees.map((emp) => (
          <div
            key={emp.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              borderBottom: "1px solid rgba(0,0,0,.04)",
              transition: "background .15s",
              flexWrap: "wrap",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f2faf6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "")}
          >
            {/* Avatar with status dot */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: emp.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: ".85rem",
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
                position: "relative",
              }}
            >
              {emp.name.charAt(0)}
              <span
                style={{
                  position: "absolute",
                  bottom: 1,
                  left: 1,
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: STATUS_DOT[emp.status],
                  border: "2px solid white",
                }}
              />
            </div>

            {/* Name + role */}
            <div style={{ flex: 1, minWidth: 80 }}>
              <div style={{ fontSize: ".84rem", fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>
                {emp.name}
              </div>
              <div style={{ fontSize: ".7rem", color: "#6b7280" }}>{emp.role || "—"}</div>
            </div>

            {/* Status badge */}
            <span
              style={{
                fontSize: ".65rem",
                padding: "2px 8px",
                borderRadius: 20,
                fontWeight: 600,
                whiteSpace: "nowrap",
                ...STATUS_STYLE[emp.status],
              }}
            >
              {STATUS_LABELS[emp.status]}
            </span>

            {/* Actions */}
            {confirmId === emp.id ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: ".76rem", color: "#ef4444", fontWeight: 600 }}>
                  تأكيد الحذف؟
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => { onDelete(emp.id); setConfirmId(null); }}
                  style={{ fontSize: ".7rem", padding: "3px 10px" }}
                >
                  نعم، احذف
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmId(null)}
                  style={{ fontSize: ".7rem", padding: "3px 9px" }}
                >
                  إلغاء
                </Button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  flexShrink: 0,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(emp)}
                  style={{
                    fontSize: ".7rem",
                    padding: "3px 9px",
                    borderColor: "rgba(45,122,82,.2)",
                    color: "#2d7a52",
                    background: "white",
                  }}
                >
                  تعديل
                </Button>

                {/* Full 3-state status selector */}
                <select
                  value={emp.status}
                  onChange={(e) =>
                    onStatusChange(emp.id, e.target.value as Employee["status"])
                  }
                  style={{
                    fontSize: ".7rem",
                    padding: "3px 6px",
                    borderRadius: 7,
                    border: "1px solid rgba(45,122,82,.18)",
                    fontFamily: "'Tajawal','Cairo',sans-serif",
                    color: "#374151",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <option value="active">✅ نشط</option>
                  <option value="away">🌙 بعيد</option>
                  <option value="off">⛔ خارج العمل</option>
                </select>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setConfirmId(emp.id)}
                  style={{ fontSize: ".7rem", padding: "3px 9px" }}
                >
                  حذف
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
