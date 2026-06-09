import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Influencer } from "../types";

interface Props {
  influencer: Influencer | null;
  onClose: () => void;
  onRequest?: (inf: Influencer) => void;
}

const cardStyle: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid rgba(45,122,82,.10)",
  borderRadius: 12,
  padding: 12,
};

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

function SocialRow({
  label,
  value,
  platform,
}: {
  label: string;
  value: string;
  platform: string;
}) {
  if (!value) return null;
  const href = socialUrl(value, platform);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        ...cardStyle,
        display: "block",
        textDecoration: "none",
        color: "#111827",
      }}
    >
      <div style={{ fontSize: ".7rem", color: "#6b7280", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: ".84rem", fontWeight: 700 }}>{value}</div>
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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        style={{
          maxWidth: 760,
          fontFamily: "'Tajawal','Cairo',sans-serif",
          direction: "rtl",
        }}
      >
        <DialogHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: "#2d7a52",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {influencer.name.slice(0, 1)}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <DialogTitle style={{ fontFamily: "'Tajawal','Cairo',sans-serif", fontSize: "1.05rem" }}>
                {influencer.name}
              </DialogTitle>
              <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ ...cardStyle, padding: "4px 10px", background: "#e8f5ee", borderRadius: 20, border: "none" }}>
                  {influencer.platform}
                </span>
                <span style={{ ...cardStyle, padding: "4px 10px", background: "#fef3c7", borderRadius: 20, border: "none" }}>
                  {influencer.status === "active"
                    ? "نشط"
                    : influencer.status === "pending"
                      ? "قيد التفاوض"
                      : "منتهي"}
                </span>
                <span style={{ ...cardStyle, padding: "4px 10px", background: "#f1f5f9", borderRadius: 20, border: "none" }}>
                  {influencer.niche}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: ".78rem", color: "#6b7280", marginBottom: 6 }}>نبذة</div>
              <div style={{ fontSize: ".9rem", lineHeight: 1.8, color: "#111827" }}>
                {influencer.bio || "لا توجد نبذة مضافة بعد."}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: ".78rem", color: "#6b7280", marginBottom: 10 }}>إحصائيات سريعة</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {[
                  { label: "المتابعون", value: influencer.followers.toLocaleString() },
                  { label: "التفاعل", value: `${influencer.engagement}%` },
                  { label: "الحملات", value: String(influencer.campaigns) },
                  { label: "السعر", value: `${influencer.basePrice.toLocaleString()} ر.س` },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "white",
                      border: "1px solid rgba(45,122,82,.08)",
                      borderRadius: 10,
                      padding: 10,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: "#1a5c3a" }}>
                      {item.value}
                    </div>
                    <div style={{ fontSize: ".68rem", color: "#6b7280", marginTop: 4 }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: ".78rem", color: "#6b7280", marginBottom: 8 }}>ملاحظات</div>
              <div style={{ fontSize: ".88rem", lineHeight: 1.8, color: "#374151" }}>
                {influencer.notes || "لا توجد ملاحظات."}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: ".78rem", color: "#6b7280", marginBottom: 10 }}>
                الملف الاجتماعي
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <div style={cardStyle}>
                  <div style={{ fontSize: ".7rem", color: "#6b7280" }}>المدينة</div>
                  <div style={{ fontSize: ".86rem", fontWeight: 700, marginTop: 4 }}>
                    {influencer.location || "غير محدد"}
                  </div>
                </div>
                <div style={cardStyle}>
                  <div style={{ fontSize: ".7rem", color: "#6b7280" }}>الجمهور المستهدف</div>
                  <div style={{ fontSize: ".86rem", fontWeight: 700, marginTop: 4 }}>
                    {influencer.audience || "غير محدد"}
                  </div>
                </div>
                {influencer.website && (
                  <a
                    href={influencer.website.startsWith("http") ? influencer.website : `https://${influencer.website}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ ...cardStyle, textDecoration: "none", color: "#111827" }}
                  >
                    <div style={{ fontSize: ".7rem", color: "#6b7280" }}>الموقع</div>
                    <div style={{ fontSize: ".86rem", fontWeight: 700, marginTop: 4 }}>
                      {influencer.website}
                    </div>
                  </a>
                )}
                {influencer.email && (
                  <div style={cardStyle}>
                    <div style={{ fontSize: ".7rem", color: "#6b7280" }}>البريد الإلكتروني</div>
                    <div style={{ fontSize: ".86rem", fontWeight: 700, marginTop: 4 }}>
                      {influencer.email}
                    </div>
                  </div>
                )}
                {influencer.phone && (
                  <div style={cardStyle}>
                    <div style={{ fontSize: ".7rem", color: "#6b7280" }}>الهاتف</div>
                    <div style={{ fontSize: ".86rem", fontWeight: 700, marginTop: 4 }}>
                      {influencer.phone}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: ".78rem", color: "#6b7280", marginBottom: 10 }}>
                الحسابات الاجتماعية
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {socials.length ? (
                  socials.map((social) => (
                    <SocialRow
                      key={social.label}
                      label={social.label}
                      value={social.value}
                      platform={social.platform}
                    />
                  ))
                ) : (
                  <div style={{ fontSize: ".84rem", color: "#9ca3af" }}>
                    لا توجد حسابات اجتماعية مضافة.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter style={{ justifyContent: "space-between", display: "flex", gap: 8 }}>
          <div style={{ fontSize: ".72rem", color: "#6b7280" }}>
            هذا الملف مخصص لعرض بيانات المؤثر فقط.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {onRequest && influencer.status !== "ended" && (
              <Button
                size="sm"
                onClick={() => onRequest(influencer)}
                style={{ background: "#2d7a52", color: "white" }}
              >
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
