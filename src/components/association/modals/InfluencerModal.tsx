import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Influencer } from "../types";

interface Props {
  influencer: Partial<Influencer> | null;
  onSave: (inf: Omit<Influencer, "id"> & { id?: number }) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

const sel: React.CSSProperties = {
  borderRadius: 7,
  border: "1.5px solid rgba(45,122,82,.12)",
  fontFamily: "'Tajawal','Cairo',sans-serif",
  fontSize: ".87rem",
  color: "#111827",
  outline: "none",
  padding: "8px 12px",
  width: "100%",
  background: "white",
};
const lbl: React.CSSProperties = {
  display: "block",
  fontSize: ".75rem",
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: ".06em",
  marginBottom: 6,
};

export default function InfluencerModal({ influencer, onSave, onDelete, onClose }: Props) {
  const isNew = !influencer?.id;
  const [name, setName] = useState(influencer?.name ?? "");
  const [platform, setPlatform] = useState<Influencer["platform"]>(
    influencer?.platform ?? "Instagram",
  );
  const [followers, setFollowers] = useState(influencer?.followers ?? 0);
  const [engagement, setEngagement] = useState(influencer?.engagement ?? 0);
  const [status, setStatus] = useState<Influencer["status"]>(influencer?.status ?? "active");
  const [campaigns, setCampaigns] = useState(influencer?.campaigns ?? 0);
  const [niche, setNiche] = useState(influencer?.niche ?? "");
  const [notes, setNotes] = useState(influencer?.notes ?? "");
  const [bio, setBio] = useState(influencer?.bio ?? "");
  const [location, setLocation] = useState(influencer?.location ?? "");
  const [audience, setAudience] = useState(influencer?.audience ?? "");
  const [instagramHandle, setInstagramHandle] = useState(influencer?.instagramHandle ?? "");
  const [xHandle, setXHandle] = useState(influencer?.xHandle ?? "");
  const [tiktokHandle, setTiktokHandle] = useState(influencer?.tiktokHandle ?? "");
  const [youtubeHandle, setYoutubeHandle] = useState(influencer?.youtubeHandle ?? "");
  const [snapchatHandle, setSnapchatHandle] = useState(influencer?.snapchatHandle ?? "");
  const [website, setWebsite] = useState(influencer?.website ?? "");
  const [email, setEmail] = useState(influencer?.email ?? "");
  const [phone, setPhone] = useState(influencer?.phone ?? "");

  useEffect(() => {
    setName(influencer?.name ?? "");
    setPlatform(influencer?.platform ?? "Instagram");
    setFollowers(influencer?.followers ?? 0);
    setEngagement(influencer?.engagement ?? 0);
    setStatus(influencer?.status ?? "active");
    setCampaigns(influencer?.campaigns ?? 0);
    setNiche(influencer?.niche ?? "");
    setNotes(influencer?.notes ?? "");
    setBio(influencer?.bio ?? "");
    setLocation(influencer?.location ?? "");
    setAudience(influencer?.audience ?? "");
    setInstagramHandle(influencer?.instagramHandle ?? "");
    setXHandle(influencer?.xHandle ?? "");
    setTiktokHandle(influencer?.tiktokHandle ?? "");
    setYoutubeHandle(influencer?.youtubeHandle ?? "");
    setSnapchatHandle(influencer?.snapchatHandle ?? "");
    setWebsite(influencer?.website ?? "");
    setEmail(influencer?.email ?? "");
    setPhone(influencer?.phone ?? "");
  }, [influencer]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        style={{ maxWidth: 480, fontFamily: "'Tajawal','Cairo',sans-serif", direction: "rtl" }}
      >
        <DialogHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: ".72rem",
                padding: "3px 10px",
                borderRadius: 20,
                fontWeight: 700,
                background: "#fef9c3",
                color: "#92400e",
              }}
            >
              {isNew ? "مؤثر جديد" : "تعديل"}
            </span>
            <DialogTitle style={{ fontFamily: "'Tajawal','Cairo',sans-serif" }}>
              {isNew ? "إضافة مؤثر" : name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>الاسم / الحساب</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسم المؤثر"
                style={sel}
              />
            </div>
            <div>
              <label style={lbl}>المنصة الرئيسية</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Influencer["platform"])}
                style={sel}
              >
                {(["Instagram", "X", "TikTok", "YouTube", "Snapchat"] as const).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>عدد المتابعين</label>
              <Input
                type="number"
                dir="ltr"
                value={followers || ""}
                onChange={(e) => setFollowers(Number(e.target.value))}
                placeholder="150000"
                style={sel}
              />
            </div>
            <div>
              <label style={lbl}>نسبة التفاعل %</label>
              <Input
                type="number"
                dir="ltr"
                step="0.1"
                value={engagement || ""}
                onChange={(e) => setEngagement(Number(e.target.value))}
                placeholder="4.5"
                style={sel}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>حالة العقد</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Influencer["status"])}
                style={sel}
              >
                <option value="active">نشط</option>
                <option value="pending">قيد التفاوض</option>
                <option value="ended">انتهى العقد</option>
              </select>
            </div>
            <div>
              <label style={lbl}>عدد الحملات المُنفَّذة</label>
              <Input
                type="number"
                dir="ltr"
                value={campaigns || ""}
                onChange={(e) => setCampaigns(Number(e.target.value))}
                placeholder="0"
                style={sel}
              />
            </div>
          </div>

          <div>
            <label style={lbl}>تخصص المحتوى</label>
            <Input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="مثال: محتوى خيري، ديني، عائلي..."
              style={sel}
            />
          </div>

          <div>
            <label style={lbl}>ملاحظات</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات إضافية..."
              style={{ ...sel, minHeight: 72, resize: "vertical" }}
            />
          </div>

          <div style={{ borderTop: "1px solid rgba(45,122,82,.08)", paddingTop: 10 }}>
            <div style={{ fontSize: ".76rem", fontWeight: 700, color: "#2d7a52", marginBottom: 8 }}>
              الملف الاجتماعي
            </div>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}
            >
              <div>
                <label style={lbl}>نبذة قصيرة</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="سطر أو سطرين عن المؤثر..."
                  style={{ ...sel, minHeight: 72, resize: "vertical" }}
                />
              </div>
              <div>
                <label style={lbl}>المنطقة / المدينة</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="الرياض"
                  style={sel}
                />
                <div style={{ height: 10 }} />
                <label style={lbl}>الجمهور المستهدف</label>
                <Input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="شباب، عائلات..."
                  style={sel}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Instagram</label>
                <Input
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="@username"
                  style={sel}
                />
              </div>
              <div>
                <label style={lbl}>X</label>
                <Input
                  value={xHandle}
                  onChange={(e) => setXHandle(e.target.value)}
                  placeholder="@username"
                  style={sel}
                />
              </div>
              <div>
                <label style={lbl}>TikTok</label>
                <Input
                  value={tiktokHandle}
                  onChange={(e) => setTiktokHandle(e.target.value)}
                  placeholder="@username"
                  style={sel}
                />
              </div>
              <div>
                <label style={lbl}>YouTube</label>
                <Input
                  value={youtubeHandle}
                  onChange={(e) => setYoutubeHandle(e.target.value)}
                  placeholder="youtube.com/@username"
                  style={sel}
                />
              </div>
              <div>
                <label style={lbl}>Snapchat</label>
                <Input
                  value={snapchatHandle}
                  onChange={(e) => setSnapchatHandle(e.target.value)}
                  placeholder="@username"
                  style={sel}
                />
              </div>
              <div>
                <label style={lbl}>الموقع</label>
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  style={sel}
                />
              </div>
              <div>
                <label style={lbl}>البريد الإلكتروني</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  style={sel}
                />
              </div>
              <div>
                <label style={lbl}>الهاتف</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+9665..."
                  style={sel}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter
          style={{ justifyContent: "space-between", display: "flex", gap: 8, flexDirection: "row" }}
        >
          {!isNew && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete(influencer!.id!);
                onClose();
              }}
            >
              حذف
            </Button>
          )}
          <div style={{ display: "flex", gap: 8, marginRight: "auto" }}>
            <Button variant="outline" size="sm" onClick={onClose}>
              إلغاء
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!name.trim()) return;
                onSave({
                  id: influencer?.id,
                  name,
                  platform,
                  followers,
                  engagement,
                  status,
                  campaigns,
                  niche,
                  notes,
                  basePrice: influencer?.basePrice ?? 250,
                  bio,
                  location,
                  audience,
                  instagramHandle,
                  xHandle,
                  tiktokHandle,
                  youtubeHandle,
                  snapchatHandle,
                  website,
                  email,
                  phone,
                });
                onClose();
              }}
              style={{ background: "#2d7a52", color: "white" }}
            >
              حفظ
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
