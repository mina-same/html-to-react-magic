import type { UseQueryResult } from "@tanstack/react-query";
import { S } from "../../helpers";
import { QueryState } from "@/components/common/StateViews";
import type { Org } from "../../types";
import type { AssocProfile } from "@/lib/db";

export function OverviewTab({
  org,
  profileQuery,
}: {
  org: Org;
  profileQuery: UseQueryResult<AssocProfile | null>;
}) {
  return (
    <QueryState query={profileQuery} isEmpty={() => false}>
      {(profile) => (
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
                <p style={{ margin: 0, color: "#9ca3af", fontSize: ".82rem" }}>
                  لا توجد أفكار مسجلة
                </p>
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
                <p style={{ margin: 0, color: "#9ca3af", fontSize: ".82rem" }}>
                  لا توجد نقاط مسجلة
                </p>
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
      )}
    </QueryState>
  );
}
