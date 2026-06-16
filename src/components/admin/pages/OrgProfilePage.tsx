import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { employeesDb, contentGenerationsDb, donationsDb, assocProfileDb } from "@/lib/db";
import { S, StatusBadge } from "../helpers";
import { toast } from "sonner";
import type { Org, CampaignRequest } from "../types";
import type { ContentGeneration, AssocProfile } from "@/lib/db";
import type { Employee, Donation } from "@/components/association/types";

type TabId = "overview" | "employees" | "content" | "requests" | "donations";
const PAGE_SIZE = 10;

interface Props {
  org: Org;
  requests: CampaignRequest[];
  onBack: () => void;
}

const btnPg: React.CSSProperties = {
  padding: "5px 11px",
  border: "1.5px solid rgba(45,122,82,.15)",
  borderRadius: 7,
  background: "white",
  fontFamily: "'Tajawal',sans-serif",
  fontSize: ".76rem",
  cursor: "pointer",
  color: "#374151",
  transition: "all .15s",
};

function empStatusLabel(s: string) {
  if (s === "active") return { bg: "#dcfce7", color: "#166534", label: "نشط" };
  if (s === "away") return { bg: "#fef9c3", color: "#92400e", label: "متغيب" };
  return { bg: "#f3f4f6", color: "#6b7280", label: "إجازة" };
}

function getDisplayableImage(item: { imageUrl?: string; imageBase64?: string }) {
  if (item.imageUrl) {
    return item.imageUrl;
  }
  if (item.imageBase64) {
    return `data:image/png;base64,${item.imageBase64}`;
  }
  return undefined;
}

export function OrgProfilePage({ org, requests: allRequests, onBack }: Props) {
  const [tab, setTab] = useState<TabId>("overview");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [content, setContent] = useState<ContentGeneration[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [profile, setProfile] = useState<AssocProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [empPage, setEmpPage] = useState(1);
  const [contentPage, setContentPage] = useState(1);
  const [reqPage, setReqPage] = useState(1);
  const [donPage, setDonPage] = useState(1);

  const [selContent, setSelContent] = useState<Set<number>>(new Set());
  const [selEmployees, setSelEmployees] = useState<Set<number>>(new Set());

  const orgRequests = allRequests.filter((r) => r.orgId === org.id);

  useEffect(() => {
    setLoading(true);
    setTab("overview");
    setEmpPage(1);
    setContentPage(1);
    setReqPage(1);
    setDonPage(1);
    setSelContent(new Set());
    setSelEmployees(new Set());
    Promise.all([
      employeesDb.list(org.id),
      contentGenerationsDb.list(org.id),
      donationsDb.list(org.id),
      assocProfileDb.get(org.id),
    ]).then(([emps, gens, dons, prof]) => {
      setEmployees(emps);
      setContent(gens);
      setDonations(dons);
      setProfile(prof);
      setLoading(false);
    });
  }, [org.id]);

  function pagSlice<T>(items: T[], page: number) {
    return items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }

  function Pager({
    page,
    total,
    onChange,
  }: {
    page: number;
    total: number;
    onChange: (p: number) => void;
  }) {
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (pages <= 1) return null;
    const visible = Array.from({ length: pages }, (_, i) => i + 1).filter(
      (p) => p === 1 || p === pages || Math.abs(p - page) <= 1,
    );
    const withGaps: (number | "…")[] = [];
    visible.forEach((p, i) => {
      if (i > 0 && p - (visible[i - 1] as number) > 1) withGaps.push("…");
      withGaps.push(p);
    });

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
          padding: "14px 0 6px",
        }}
      >
        <button onClick={() => onChange(page - 1)} disabled={page === 1} style={btnPg}>
          ‹
        </button>
        {withGaps.map((p, i) =>
          p === "…" ? (
            <span
              key={`gap-${i}`}
              style={{ color: "#9ca3af", fontSize: ".76rem", padding: "0 2px" }}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              style={{
                ...btnPg,
                background: p === page ? "#2d7a52" : "white",
                color: p === page ? "white" : "#374151",
                fontWeight: p === page ? 700 : 400,
                borderColor: p === page ? "#2d7a52" : "rgba(45,122,82,.15)",
                minWidth: 32,
              }}
            >
              {p}
            </button>
          ),
        )}
        <button onClick={() => onChange(page + 1)} disabled={page === pages} style={btnPg}>
          ›
        </button>
        <span style={{ fontSize: ".72rem", color: "#9ca3af", marginRight: 8 }}>
          {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} من {total}
        </span>
      </div>
    );
  }

  function toggleContent(id: number) {
    setSelContent((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleEmployee(id: number) {
    setSelEmployees((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function deleteContent() {
    const ids = [...selContent];
    if (!ids.length) return;
    await supabase.from("content_generations").delete().in("id", ids);
    setContent((prev) => prev.filter((c) => !selContent.has(c.id)));
    setSelContent(new Set());
    toast.success(`تم حذف ${ids.length} عنصر`);
  }

  async function deleteEmployees() {
    const ids = [...selEmployees];
    if (!ids.length) return;
    for (const id of ids) await employeesDb.delete(id);
    setEmployees((prev) => prev.filter((e) => !selEmployees.has(e.id)));
    setSelEmployees(new Set());
    toast.success(`تم حذف ${ids.length} موظف`);
  }

  function BulkBar({
    count,
    label,
    onDelete,
    onClear,
  }: {
    count: number;
    label: string;
    onDelete: () => void;
    onClear: () => void;
  }) {
    if (count === 0) return null;
    return (
      <div
        style={{
          background: "#fef2f2",
          border: "1.5px solid #fecaca",
          borderRadius: 10,
          padding: "10px 16px",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            background: "#dc2626",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: ".74rem",
            fontWeight: 700,
          }}
        >
          {count}
        </span>
        <span style={{ fontSize: ".82rem", color: "#374151", fontWeight: 600 }}>{label} محدد</span>
        <button
          onClick={onDelete}
          style={{
            ...S.btnDanger,
            marginRight: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          🗑️ حذف المحدد
        </button>
        <button onClick={onClear} style={S.btnGhost}>
          إلغاء التحديد
        </button>
      </div>
    );
  }

  function renderOverview() {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ ...S.secCard, gridColumn: "1 / -1" }}>
          <div style={S.secHead}>
            <span>🤖</span>
            <span style={{ fontWeight: 700, fontSize: ".88rem", color: "#111827" }}>
              التحليل الذكي
            </span>
          </div>
          <div style={S.secBody}>
            {profile?.ai_summary ? (
              <p
                style={{
                  margin: 0,
                  color: "#374151",
                  fontSize: ".84rem",
                  lineHeight: 1.9,
                  whiteSpace: "pre-wrap",
                }}
              >
                {profile.ai_summary}
              </p>
            ) : (
              <p style={{ margin: 0, color: "#9ca3af", fontSize: ".82rem" }}>
                لا يوجد تحليل ذكي — يحتاج المشرف لتفعيل ملف الجمعية أولاً
              </p>
            )}
          </div>
        </div>

        <div style={S.secCard}>
          <div style={S.secHead}>
            <span>💡</span>
            <span style={{ fontWeight: 700, fontSize: ".88rem", color: "#111827" }}>
              أفكار تسويقية
            </span>
          </div>
          <div style={S.secBody}>
            {profile?.ai_ideas?.length ? (
              <ul style={{ margin: 0, paddingRight: 18 }}>
                {profile.ai_ideas.map((idea, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: ".82rem",
                      color: "#374151",
                      marginBottom: 8,
                      lineHeight: 1.6,
                    }}
                  >
                    {idea}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, color: "#9ca3af", fontSize: ".82rem" }}>لا توجد أفكار مسجلة</p>
            )}
          </div>
        </div>

        <div style={S.secCard}>
          <div style={S.secHead}>
            <span>⚠️</span>
            <span style={{ fontWeight: 700, fontSize: ".88rem", color: "#111827" }}>
              نقاط التحسين
            </span>
          </div>
          <div style={S.secBody}>
            {profile?.ai_pain_points?.length ? (
              <ul style={{ margin: 0, paddingRight: 18 }}>
                {profile.ai_pain_points.map((pt, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: ".82rem",
                      color: "#374151",
                      marginBottom: 8,
                      lineHeight: 1.6,
                    }}
                  >
                    {pt}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, color: "#9ca3af", fontSize: ".82rem" }}>لا توجد نقاط مسجلة</p>
            )}
          </div>
        </div>

        <div style={{ ...S.secCard, gridColumn: "1 / -1" }}>
          <div style={S.secHead}>
            <span>📄</span>
            <span style={{ fontWeight: 700, fontSize: ".88rem", color: "#111827" }}>
              وصف الجمعية
            </span>
          </div>
          <div style={S.secBody}>
            <p
              style={{
                margin: "0 0 14px",
                color: "#374151",
                fontSize: ".84rem",
                lineHeight: 1.9,
                whiteSpace: "pre-wrap",
              }}
            >
              {profile?.description || org.notes || "لا يوجد وصف مدخل"}
            </p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" as const }}>
              <div
                style={{
                  fontSize: ".78rem",
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                📧 {org.email}
              </div>
              <div
                style={{
                  fontSize: ".78rem",
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                📞 {org.phone}
              </div>
              <div
                style={{
                  fontSize: ".78rem",
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                📍 {org.region}
              </div>
              <div
                style={{
                  fontSize: ".78rem",
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                🪪 {org.license}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderEmployees() {
    const pageData = pagSlice(employees, empPage);
    const allPageSel = pageData.length > 0 && pageData.every((e) => selEmployees.has(e.id));

    return (
      <div>
        <BulkBar
          count={selEmployees.size}
          label="موظف"
          onDelete={deleteEmployees}
          onClear={() => setSelEmployees(new Set())}
        />
        <div style={S.secCard}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...S.tblTh, width: 40, textAlign: "center" as const }}>
                  <input
                    type="checkbox"
                    checked={allPageSel}
                    style={{ cursor: "pointer" }}
                    onChange={() => {
                      setSelEmployees((prev) => {
                        const next = new Set(prev);
                        pageData.forEach((e) => (allPageSel ? next.delete(e.id) : next.add(e.id)));
                        return next;
                      });
                    }}
                  />
                </th>
                {["الاسم", "الدور", "الحالة"].map((h, i) => (
                  <th key={i} style={S.tblTh}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((emp) => {
                const st = empStatusLabel(emp.status);
                return (
                  <tr
                    key={emp.id}
                    style={{
                      background: selEmployees.has(emp.id) ? "#f0fdf4" : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (!selEmployees.has(emp.id)) e.currentTarget.style.background = "#f9fafb";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = selEmployees.has(emp.id) ? "#f0fdf4" : "";
                    }}
                  >
                    <td style={{ ...S.tblTd, textAlign: "center" as const }}>
                      <input
                        type="checkbox"
                        checked={selEmployees.has(emp.id)}
                        style={{ cursor: "pointer" }}
                        onChange={() => toggleEmployee(emp.id)}
                      />
                    </td>
                    <td style={S.tblTd}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: emp.color || "#2d7a52",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: ".75rem",
                            color: "white",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {emp.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600, color: "#111827" }}>{emp.name}</span>
                      </div>
                    </td>
                    <td style={S.tblTd}>{emp.role}</td>
                    <td style={S.tblTd}>
                      <span
                        style={{
                          background: st.bg,
                          color: st.color,
                          fontSize: ".68rem",
                          padding: "2px 9px",
                          borderRadius: 20,
                          fontWeight: 600,
                        }}
                      >
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {employees.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      ...S.tblTd,
                      textAlign: "center",
                      color: "#9ca3af",
                      padding: 40,
                    }}
                  >
                    لا يوجد موظفون مسجلون
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pager page={empPage} total={employees.length} onChange={setEmpPage} />
        </div>
        {employees.length > PAGE_SIZE && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 8,
            }}
          >
            <button
              style={{ ...S.btnGhost, fontSize: ".74rem" }}
              onClick={() => setSelEmployees(new Set(employees.map((e) => e.id)))}
            >
              تحديد الكل ({employees.length})
            </button>
            {selEmployees.size > 0 && (
              <button
                style={{ ...S.btnGhost, fontSize: ".74rem" }}
                onClick={() => setSelEmployees(new Set())}
              >
                إلغاء تحديد الكل
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderContent() {
    const pageData = pagSlice(content, contentPage);
    const allPageSel = pageData.length > 0 && pageData.every((c) => selContent.has(c.id));

    return (
      <div>
        <BulkBar
          count={selContent.size}
          label="عنصر"
          onDelete={deleteContent}
          onClear={() => setSelContent(new Set())}
        />

        {/* Select all bar */}
        {pageData.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
              padding: "8px 14px",
              background: "white",
              borderRadius: 8,
              border: "1px solid rgba(45,122,82,.12)",
            }}
          >
            <input
              type="checkbox"
              checked={allPageSel}
              style={{ cursor: "pointer" }}
              onChange={() => {
                setSelContent((prev) => {
                  const next = new Set(prev);
                  pageData.forEach((c) => (allPageSel ? next.delete(c.id) : next.add(c.id)));
                  return next;
                });
              }}
            />
            <span style={{ fontSize: ".78rem", color: "#6b7280" }}>تحديد الصفحة الحالية</span>
            {content.length > PAGE_SIZE && (
              <button
                style={{ ...S.btnGhost, fontSize: ".72rem", marginRight: "auto" }}
                onClick={() => setSelContent(new Set(content.map((c) => c.id)))}
              >
                تحديد الكل ({content.length})
              </button>
            )}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
            gap: 14,
          }}
        >
          {pageData.map((item) => (
            <div
              key={item.id}
              style={{
                background: "white",
                border: selContent.has(item.id)
                  ? "2px solid #2d7a52"
                  : "1px solid rgba(45,122,82,.12)",
                borderRadius: 12,
                overflow: "hidden",
                transition: "border .15s, box-shadow .15s",
                boxShadow: selContent.has(item.id) ? "0 0 0 3px rgba(45,122,82,.1)" : "none",
              }}
            >
              {/* Card header */}
              <div
                style={{
                  background: selContent.has(item.id) ? "#f0fdf4" : "#f2faf6",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderBottom: "1px solid rgba(45,122,82,.08)",
                }}
              >
                <input
                  type="checkbox"
                  checked={selContent.has(item.id)}
                  style={{ cursor: "pointer" }}
                  onChange={() => toggleContent(item.id)}
                />
                <span style={{ fontSize: ".7rem", color: "#6b7280", flex: 1 }}>
                  📅 {item.createdAt.slice(0, 10)}
                </span>
                {item.tokensUsed > 0 && (
                  <span
                    style={{
                      fontSize: ".66rem",
                      background: "#ede9fe",
                      color: "#7c3aed",
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontWeight: 600,
                    }}
                  >
                    {item.tokensUsed.toLocaleString()} رمز
                  </span>
                )}
              </div>

              {/* Prompt */}
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid rgba(45,122,82,.06)",
                }}
              >
                <div
                  style={{
                    fontSize: ".66rem",
                    color: "#9ca3af",
                    marginBottom: 4,
                    textTransform: "uppercase" as const,
                    letterSpacing: ".04em",
                  }}
                >
                  الطلب
                </div>
                <div
                  style={{
                    fontSize: ".8rem",
                    color: "#111827",
                    fontWeight: 600,
                    lineHeight: 1.6,
                  }}
                >
                  {item.prompt.length > 90 ? item.prompt.slice(0, 90) + "..." : item.prompt}
                </div>
              </div>

              {/* Content preview */}
              <div style={{ padding: "10px 14px" }}>
                {(["post", "story", "donation", "video"] as const).map((type) => {
                  const labels = {
                    post: "منشور",
                    story: "ستوري",
                    donation: "تبرع",
                    video: "فيديو",
                  };
                  const icons = { post: "📝", story: "📷", donation: "💝", video: "🎬" };
                  const c = item.content?.[type];
                  if (!c?.text) return null;
                  return (
                    <div key={type} style={{ marginBottom: 8 }}>
                      <div
                        style={{
                          fontSize: ".66rem",
                          color: "#6b7280",
                          marginBottom: 3,
                          fontWeight: 600,
                        }}
                      >
                        {icons[type]} {labels[type]}
                      </div>
                      <div
                        style={{
                          fontSize: ".76rem",
                          color: "#374151",
                          lineHeight: 1.6,
                          background: "#f9fafb",
                          padding: "7px 10px",
                          borderRadius: 7,
                          borderRight: "2px solid rgba(45,122,82,.2)",
                        }}
                      >
                        {c.text.length > 110 ? c.text.slice(0, 110) + "..." : c.text}
                      </div>
                      {(() => {
                        const imgSrc = getDisplayableImage(c);
                        return imgSrc ? (
                          <img
                            src={imgSrc}
                            alt=""
                            style={{
                              width: "100%",
                              height: 72,
                              objectFit: "cover",
                              borderRadius: 7,
                              marginTop: 5,
                            }}
                          />
                        ) : null;
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {content.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: 50,
                color: "#9ca3af",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
              <div>لا يوجد محتوى مولّد بالذكاء الاصطناعي</div>
            </div>
          )}
        </div>

        <Pager page={contentPage} total={content.length} onChange={setContentPage} />
      </div>
    );
  }

  function renderRequests() {
    const pageData = pagSlice(orgRequests, reqPage);
    return (
      <div style={S.secCard}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["المؤثر", "النوع", "الميزانية", "المدة", "التاريخ", "الرسالة", "الحالة"].map(
                (h, i) => (
                  <th key={i} style={S.tblTh}>
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {pageData.map((req) => (
              <tr
                key={req.id}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <td style={{ ...S.tblTd, fontWeight: 600 }}>{req.infName}</td>
                <td style={S.tblTd}>{req.type}</td>
                <td style={S.tblTd}>{req.budget.toLocaleString()} ر.س</td>
                <td style={S.tblTd}>{req.duration}</td>
                <td style={S.tblTd}>{req.date}</td>
                <td style={S.tblTd}>
                  <div
                    style={{
                      maxWidth: 180,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap" as const,
                      color: "#6b7280",
                      fontSize: ".76rem",
                    }}
                    title={req.message}
                  >
                    {req.message || "—"}
                  </div>
                </td>
                <td style={S.tblTd}>
                  <StatusBadge status={req.status} />
                </td>
              </tr>
            ))}
            {orgRequests.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    ...S.tblTd,
                    textAlign: "center",
                    color: "#9ca3af",
                    padding: 40,
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                  لا توجد طلبات حملات
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pager page={reqPage} total={orgRequests.length} onChange={setReqPage} />
      </div>
    );
  }

  function renderDonations() {
    const pageData = pagSlice(donations, donPage);
    return (
      <div style={S.secCard}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {[
                "رقم التبرع",
                "المتبرع",
                "المشروع",
                "المبلغ",
                "طريقة الدفع",
                "التاريخ",
                "الحالة",
              ].map((h, i) => (
                <th key={i} style={S.tblTh}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((don) => (
              <tr
                key={don.id}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <td style={S.tblTd}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: ".76rem",
                      background: "#f0f4f2",
                      padding: "2px 7px",
                      borderRadius: 5,
                    }}
                  >
                    {don.donationNumber || "—"}
                  </span>
                </td>
                <td style={{ ...S.tblTd, fontWeight: 600, color: "#111827" }}>{don.name}</td>
                <td style={S.tblTd}>{don.projectName || "—"}</td>
                <td style={{ ...S.tblTd, fontWeight: 700, color: "#2d7a52" }} dir="ltr">
                  {don.amount.toLocaleString()} ر.س
                </td>
                <td style={S.tblTd}>{don.paymentMethod}</td>
                <td style={S.tblTd}>{don.date}</td>
                <td style={S.tblTd}>
                  <StatusBadge status={don.status} />
                </td>
              </tr>
            ))}
            {donations.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    ...S.tblTd,
                    textAlign: "center",
                    color: "#9ca3af",
                    padding: 40,
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
                  لا توجد تبرعات مسجلة
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {donations.length > 0 && (
          <div
            style={{
              padding: "10px 16px",
              borderTop: "1px solid rgba(45,122,82,.08)",
              display: "flex",
              gap: 24,
              background: "#f2faf6",
            }}
          >
            <div style={{ fontSize: ".78rem", color: "#6b7280" }}>
              إجمالي التبرعات:{" "}
              <strong style={{ color: "#2d7a52" }}>
                {donations.reduce((s, d) => s + d.amount, 0).toLocaleString()} ر.س
              </strong>
            </div>
            <div style={{ fontSize: ".78rem", color: "#6b7280" }}>
              مكتملة:{" "}
              <strong style={{ color: "#166534" }}>
                {donations.filter((d) => d.status === "completed").length}
              </strong>
            </div>
            <div style={{ fontSize: ".78rem", color: "#6b7280" }}>
              معلّقة:{" "}
              <strong style={{ color: "#92400e" }}>
                {donations.filter((d) => d.status === "pending").length}
              </strong>
            </div>
          </div>
        )}
        <Pager page={donPage} total={donations.length} onChange={setDonPage} />
      </div>
    );
  }

  const TABS: { id: TabId; label: string; icon: string; count?: number }[] = [
    { id: "overview", label: "نظرة عامة", icon: "🏠" },
    { id: "employees", label: "الموظفون", icon: "👥", count: employees.length },
    { id: "content", label: "المحتوى AI", icon: "🤖", count: content.length },
    { id: "requests", label: "الطلبات", icon: "📋", count: orgRequests.length },
    { id: "donations", label: "التبرعات", icon: "💰", count: donations.length },
  ];

  return (
    <div style={{ animation: "fadeUp .3s ease" }}>
      {/* Header */}
      <div
        style={{
          background: "white",
          borderRadius: 14,
          border: "1px solid rgba(45,122,82,.12)",
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg,#2d7a52 0%,#1e5c3a 100%)",
            padding: "20px 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={onBack}
              style={{
                background: "rgba(255,255,255,.15)",
                border: "1px solid rgba(255,255,255,.3)",
                borderRadius: 8,
                color: "white",
                fontFamily: "'Tajawal',sans-serif",
                fontSize: ".78rem",
                fontWeight: 600,
                padding: "6px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              ← رجوع للقائمة
            </button>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 13,
                background: "rgba(255,255,255,.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                flexShrink: 0,
              }}
            >
              🏛️
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 5,
                  flexWrap: "wrap" as const,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    color: "white",
                  }}
                >
                  {org.name}
                </h2>
                <StatusBadge status={org.status} />
              </div>
              <div
                style={{
                  fontSize: ".75rem",
                  color: "rgba(255,255,255,.78)",
                  display: "flex",
                  gap: 18,
                  flexWrap: "wrap" as const,
                }}
              >
                <span>📋 {org.license}</span>
                <span>📍 {org.region}</span>
                <span>📅 {org.date}</span>
                <span>📧 {org.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div
          style={{
            padding: "14px 20px",
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 10,
          }}
        >
          {[
            {
              label: "الموظفون",
              value: loading ? "—" : employees.length,
              icon: "👥",
              color: "#2d7a52",
              bg: "#f0fdf4",
            },
            {
              label: "الطلبات",
              value: orgRequests.length,
              icon: "📋",
              color: "#3b82f6",
              bg: "#eff6ff",
            },
            {
              label: "التبرعات",
              value: loading ? "—" : donations.length,
              icon: "💰",
              color: "#f59e0b",
              bg: "#fffbeb",
            },
            {
              label: "محتوى AI",
              value: loading ? "—" : content.length,
              icon: "🤖",
              color: "#8b5cf6",
              bg: "#f5f3ff",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: stat.bg,
                borderRadius: 10,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 22 }}>{stat.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 800,
                    color: stat.color,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: ".7rem", color: "#6b7280", marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          border: "1px solid rgba(45,122,82,.12)",
          padding: 5,
          marginBottom: 16,
          display: "flex",
          gap: 4,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: "9px 10px",
              borderRadius: 8,
              border: "none",
              fontFamily: "'Tajawal',sans-serif",
              fontSize: ".78rem",
              fontWeight: tab === t.id ? 700 : 500,
              background: tab === t.id ? "#2d7a52" : "transparent",
              color: tab === t.id ? "white" : "#6b7280",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              transition: "all .15s",
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span
                style={{
                  background: tab === t.id ? "rgba(255,255,255,.25)" : "#e5e7eb",
                  color: tab === t.id ? "white" : "#374151",
                  fontSize: ".65rem",
                  padding: "1px 7px",
                  borderRadius: 20,
                  fontWeight: 700,
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 70,
            color: "#6b7280",
            background: "white",
            borderRadius: 14,
            border: "1px solid rgba(45,122,82,.12)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid rgba(45,122,82,.2)",
              borderTopColor: "#2d7a52",
              borderRadius: "50%",
              margin: "0 auto 14px",
              animation: "spin 1s linear infinite",
            }}
          />
          <div style={{ fontSize: ".88rem" }}>جاري تحميل بيانات الجمعية...</div>
        </div>
      ) : (
        <div className="admin-page-anim">
          {tab === "overview" && renderOverview()}
          {tab === "employees" && renderEmployees()}
          {tab === "content" && renderContent()}
          {tab === "requests" && renderRequests()}
          {tab === "donations" && renderDonations()}
        </div>
      )}
    </div>
  );
}
