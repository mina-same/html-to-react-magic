import type { UseQueryResult } from "@tanstack/react-query";
import { QueryState } from "@/components/common/StateViews";
import type { Org } from "../../types";
import type { AssocProfile } from "@/lib/db";
import { SecCard } from "./shared";

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SecCard icon="🤖" title="التحليل الذكي" className="md:col-span-2">
            {profile?.ai_summary ? (
              <p className="whitespace-pre-wrap text-sm leading-8 text-foreground/80">
                {profile.ai_summary}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                لا يوجد تحليل ذكي — يحتاج المشرف لتفعيل ملف الجمعية أولاً
              </p>
            )}
          </SecCard>

          <SecCard icon="💡" title="أفكار تسويقية">
            {profile?.ai_ideas?.length ? (
              <ul className="mr-4 list-disc space-y-2 text-sm leading-6 text-foreground/80">
                {profile.ai_ideas.map((idea, i) => (
                  <li key={i}>{idea}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">لا توجد أفكار مسجلة</p>
            )}
          </SecCard>

          <SecCard icon="⚠️" title="نقاط التحسين">
            {profile?.ai_pain_points?.length ? (
              <ul className="mr-4 list-disc space-y-2 text-sm leading-6 text-foreground/80">
                {profile.ai_pain_points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">لا توجد نقاط مسجلة</p>
            )}
          </SecCard>

          <SecCard icon="📄" title="وصف الجمعية" className="md:col-span-2">
            <p className="mb-3.5 whitespace-pre-wrap text-sm leading-8 text-foreground/80">
              {profile?.description || org.notes || "لا يوجد وصف مدخل"}
            </p>
            <div className="flex flex-wrap gap-5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">📧 {org.email}</div>
              <div className="flex items-center gap-1.5">📞 {org.phone}</div>
              <div className="flex items-center gap-1.5">📍 {org.region}</div>
              <div className="flex items-center gap-1.5">🪪 {org.license}</div>
            </div>
          </SecCard>
        </div>
      )}
    </QueryState>
  );
}
