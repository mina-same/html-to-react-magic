import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlatformBadge } from "@/components/dashboard/StatusBadge";
import type { Influencer } from "../types";

interface Props {
  influencer: Influencer | null;
  onClose: () => void;
  onRequest?: (inf: Influencer) => void;
}

function socialUrl(value: string, platform: string) {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  const handle = value.replace(/^@/, "");
  const map: Record<string, string> = {
    Instagram: `https://instagram.com/${handle}`,
    X: `https://x.com/${handle}`,
    TikTok: `https://www.tiktok.com/@${handle}`,
    YouTube: `https://www.youtube.com/${handle.startsWith("@") ? handle : `@${handle}`}`,
    Snapchat: `https://www.snapchat.com/add/${handle}`,
  };
  return map[platform] ?? value;
}

function InfoCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border bg-muted/40 p-3 ${className}`}>{children}</div>;
}

function SocialRow({ label, value, platform }: { label: string; value: string; platform: string }) {
  if (!value) return null;
  const href = socialUrl(value, platform);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block rounded-xl border bg-muted/40 p-3 text-foreground no-underline transition-colors hover:bg-muted"
    >
      <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </a>
  );
}

export default function InfluencerProfileModal({ influencer, onClose, onRequest }: Props) {
  if (!influencer) return null;

  const socials = [
    { label: "Instagram", value: influencer.instagramHandle, platform: "Instagram" },
    { label: "X", value: influencer.xHandle, platform: "X" },
    { label: "TikTok", value: influencer.tiktokHandle, platform: "TikTok" },
    { label: "YouTube", value: influencer.youtubeHandle, platform: "YouTube" },
    { label: "Snapchat", value: influencer.snapchatHandle, platform: "Snapchat" },
  ].filter((item) => item.value);

  const statusLabel =
    influencer.status === "active" ? "نشط" : influencer.status === "pending" ? "قيد التفاوض" : "منتهي";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[760px] max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-3">
            <Avatar className="h-[58px] w-[58px] shrink-0">
              <AvatarFallback className="bg-primary text-lg font-extrabold text-primary-foreground">
                {influencer.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base">{influencer.name}</DialogTitle>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <PlatformBadge platform={influencer.platform} />
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{statusLabel}</Badge>
                {influencer.niche && <Badge variant="secondary">{influencer.niche}</Badge>}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-3.5">
            <InfoCard>
              <div className="mb-1.5 text-xs text-muted-foreground">نبذة</div>
              <div className="text-sm leading-7 text-foreground">
                {influencer.bio || "لا توجد نبذة مضافة بعد."}
              </div>
            </InfoCard>

            <InfoCard>
              <div className="mb-2.5 text-xs text-muted-foreground">إحصائيات سريعة</div>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { label: "المتابعون", value: influencer.followers.toLocaleString() },
                  { label: "التفاعل", value: `${influencer.engagement}%` },
                  { label: "الحملات", value: String(influencer.campaigns) },
                  { label: "السعر", value: `${influencer.basePrice.toLocaleString()} ر.س` },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border bg-card p-2.5 text-center">
                    <div className="text-sm font-extrabold text-primary">{item.value}</div>
                    <div className="mt-1 text-[0.68rem] text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>
            </InfoCard>

            <InfoCard>
              <div className="mb-2 text-xs text-muted-foreground">ملاحظات</div>
              <div className="text-sm leading-7 text-foreground/80">
                {influencer.notes || "لا توجد ملاحظات."}
              </div>
            </InfoCard>
          </div>

          <div className="flex flex-col gap-3.5">
            <InfoCard>
              <div className="mb-2.5 text-xs text-muted-foreground">الملف الاجتماعي</div>
              <div className="grid gap-2.5">
                <InfoCard className="bg-card">
                  <div className="text-xs text-muted-foreground">المدينة</div>
                  <div className="mt-1 text-sm font-bold">{influencer.location || "غير محدد"}</div>
                </InfoCard>
                <InfoCard className="bg-card">
                  <div className="text-xs text-muted-foreground">الجمهور المستهدف</div>
                  <div className="mt-1 text-sm font-bold">{influencer.audience || "غير محدد"}</div>
                </InfoCard>
                {influencer.website && (
                  <a
                    href={influencer.website.startsWith("http") ? influencer.website : `https://${influencer.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border bg-card p-3 text-foreground no-underline hover:bg-muted"
                  >
                    <div className="text-xs text-muted-foreground">الموقع</div>
                    <div className="mt-1 text-sm font-bold">{influencer.website}</div>
                  </a>
                )}
                {influencer.email && (
                  <InfoCard className="bg-card">
                    <div className="text-xs text-muted-foreground">البريد الإلكتروني</div>
                    <div className="mt-1 text-sm font-bold">{influencer.email}</div>
                  </InfoCard>
                )}
                {influencer.phone && (
                  <InfoCard className="bg-card">
                    <div className="text-xs text-muted-foreground">الهاتف</div>
                    <div className="mt-1 text-sm font-bold">{influencer.phone}</div>
                  </InfoCard>
                )}
              </div>
            </InfoCard>

            <InfoCard>
              <div className="mb-2.5 text-xs text-muted-foreground">الحسابات الاجتماعية</div>
              <div className="grid gap-2.5">
                {socials.length ? (
                  socials.map((social) => (
                    <SocialRow key={social.label} label={social.label} value={social.value} platform={social.platform} />
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">لا توجد حسابات اجتماعية مضافة.</div>
                )}
              </div>
            </InfoCard>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">هذا الملف مخصص لعرض بيانات المؤثر فقط.</div>
          <div className="flex gap-2">
            {onRequest && influencer.status !== "ended" && (
              <Button size="sm" onClick={() => onRequest(influencer)}>
                طلب حملة
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
