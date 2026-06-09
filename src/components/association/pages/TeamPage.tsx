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
  away: { background: "#fef9c3", color: "#854d0e" },
  off: { background: "#f1f5f9", color: "#94a3b8" },
};

export default function TeamPage({ employees, onAdd, onEdit, onStatusChange, onDelete }: Props) {
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

      <div>
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="group"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 16px",
              borderBottom: "1px solid rgba(0,0,0,.04)",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f2faf6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "")}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: emp.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: ".78rem",
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
              }}
            >
              {emp.name.charAt(0)}
            </div>
            <div>
              <div
                style={{ fontSize: ".84rem", fontWeight: 600, color: "#111827", lineHeight: 1.2 }}
              >
                {emp.name}
              </div>
              <div style={{ fontSize: ".7rem", color: "#6b7280" }}>{emp.role}</div>
            </div>
            <span
              style={{
                fontSize: ".65rem",
                padding: "2px 8px",
                borderRadius: 20,
                fontWeight: 600,
                whiteSpace: "nowrap",
                marginRight: "auto",
                ...STATUS_STYLE[emp.status],
              }}
            >
              {STATUS_LABELS[emp.status]}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
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
              <Button
                size="sm"
                onClick={() => onStatusChange(emp.id, emp.status === "active" ? "off" : "active")}
                style={{
                  fontSize: ".7rem",
                  padding: "3px 9px",
                  background: emp.status === "active" ? "#fef3c7" : "#dcfce7",
                  color: emp.status === "active" ? "#92400e" : "#166534",
                  border: "1px solid rgba(45,122,82,.12)",
                }}
              >
                {emp.status === "active" ? "غير نشط" : "نشط"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(emp.id)}
                style={{ fontSize: ".7rem", padding: "3px 9px" }}
              >
                حذف
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
