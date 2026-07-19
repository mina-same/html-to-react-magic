import { Star, Plus } from "lucide-react";
import type { Influencer } from "../types";
import { formatFollowers } from "../data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlatformBadge } from "@/components/dashboard/StatusBadge";
import { cn } from "@/lib/utils";

interface Props {
  influencers: Influencer[];
  canManage?: boolean;
  onAdd?: () => void;
  onEdit?: (inf: Influencer) => void;
  onView?: (inf: Influencer) => void;
  onRequest: (inf: Influencer) => void;
}

const PLAT_ICON: Record<string, string> = {
  Instagram: "📷",
  X: "🐦",
  TikTok: "🎵",
  Snapchat: "👻",
  YouTube: "▶️",
};

const STATUS_STYLE: Record<Influencer["status"], string> = {
  active: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  ended: "bg-slate-100 text-slate-500",
};

const STATUS_LABEL: Record<Influencer["status"], string> = {
  active: "نشط",
  pending: "قيد التفاوض",
  ended: "منتهي",
};

export default function InfluencersPage({
  influencers,
  canManage = false,
  onAdd,
  onEdit,
  onView,
  onRequest,
}: Props) {
  const activeCount = influencers.filter((i) => i.status === "active").length;
  const socialBadges = (inf: Influencer) =>
    [
      { label: "IG", value: inf.instagramHandle },
      { label: "X", value: inf.xHandle },
      { label: "TT", value: inf.tiktokHandle },
      { label: "YT", value: inf.youtubeHandle },
      { label: "SC", value: inf.snapchatHandle },
    ].filter((item) => item.value);

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center gap-2.5 space-y-0 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
          <Star className="h-4 w-4" />
        </div>
        <div>
          <CardTitle className="text-sm">المؤثرون</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">{influencers.length} مؤثر</p>
        </div>
        <div className="mr-auto flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            {activeCount} نشطين
          </Badge>
          {canManage ? (
            <Button size="sm" onClick={onAdd}>
              <Plus className="h-3.5 w-3.5" />
              إضافة مؤثر
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">الجمعية يمكنها طلب حملة فقط</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {influencers.map((inf) => (
          <div
            key={inf.id}
            className="rounded-xl border bg-secondary/40 p-4 transition-shadow hover:shadow-md hover:border-primary/25"
          >
            <div className="mb-3 flex items-start gap-2.5">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                  {inf.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold leading-tight text-foreground">
                  {inf.name}
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <PlatformBadge platform={`${PLAT_ICON[inf.platform] ?? ""} ${inf.platform}`} />
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[0.63rem] font-semibold",
                      STATUS_STYLE[inf.status],
                    )}
                  >
                    {STATUS_LABEL[inf.status]}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2">
              {[
                { label: "المتابعون", value: formatFollowers(inf.followers) },
                { label: "التفاعل", value: `${inf.engagement}%` },
                { label: "الحملات", value: inf.campaigns },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border bg-card px-2 py-1.5 text-center">
                  <div className="text-sm font-bold text-primary">{s.value}</div>
                  <div className="mt-0.5 text-[0.6rem] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            {inf.niche && (
              <div className="mb-2.5 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
                {inf.niche}
              </div>
            )}

            {inf.notes && (
              <div className="mb-2.5 border-t pt-2 text-xs leading-6 text-muted-foreground">
                {inf.notes}
              </div>
            )}

            {socialBadges(inf).length > 0 && (
              <div className="mb-2.5 flex flex-wrap gap-1.5">
                {socialBadges(inf).map((badge) => (
                  <span
                    key={`${inf.id}-${badge.label}`}
                    className="rounded-full bg-secondary px-1.5 py-0.5 text-[0.63rem] font-bold text-primary"
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 border-t pt-2.5">
              <span className="text-xs font-bold text-primary">
                {inf.basePrice.toLocaleString()} ر.س
              </span>
              <span className="text-[0.62rem] text-muted-foreground">/ حملة</span>
              <div className="mr-auto flex gap-1.5">
                {onView && (
                  <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => onView(inf)}>
                    الملف
                  </Button>
                )}
                {canManage && onEdit && (
                  <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => onEdit(inf)}>
                    تعديل
                  </Button>
                )}
                {inf.status !== "ended" && (
                  <Button size="sm" className="h-7 px-2.5 text-xs" onClick={() => onRequest(inf)}>
                    طلب حملة
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
