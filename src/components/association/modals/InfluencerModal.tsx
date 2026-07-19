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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Influencer } from "../types";

interface Props {
  influencer: Partial<Influencer> | null;
  onSave: (inf: Omit<Influencer, "id"> & { id?: number }) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

const FIELD_LABEL = "block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5";

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
      <DialogContent className="max-w-[480px] max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
              {isNew ? "مؤثر جديد" : "تعديل"}
            </Badge>
            <DialogTitle>{isNew ? "إضافة مؤثر" : name}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>الاسم / الحساب</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم المؤثر" />
            </div>
            <div>
              <Label className={FIELD_LABEL}>المنصة الرئيسية</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as Influencer["platform"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["Instagram", "X", "TikTok", "YouTube", "Snapchat"] as const).map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>عدد المتابعين</Label>
              <Input
                type="number"
                dir="ltr"
                value={followers || ""}
                onChange={(e) => setFollowers(Number(e.target.value))}
                placeholder="150000"
              />
            </div>
            <div>
              <Label className={FIELD_LABEL}>نسبة التفاعل %</Label>
              <Input
                type="number"
                dir="ltr"
                step="0.1"
                value={engagement || ""}
                onChange={(e) => setEngagement(Number(e.target.value))}
                placeholder="4.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>حالة العقد</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Influencer["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="pending">قيد التفاوض</SelectItem>
                  <SelectItem value="ended">انتهى العقد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={FIELD_LABEL}>عدد الحملات المُنفَّذة</Label>
              <Input
                type="number"
                dir="ltr"
                value={campaigns || ""}
                onChange={(e) => setCampaigns(Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label className={FIELD_LABEL}>تخصص المحتوى</Label>
            <Input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="مثال: محتوى خيري، ديني، عائلي..."
            />
          </div>

          <div>
            <Label className={FIELD_LABEL}>ملاحظات</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات إضافية..."
              className="min-h-[72px] resize-y"
            />
          </div>

          <div className="border-t pt-2.5">
            <div className="mb-2 text-sm font-bold text-primary">الملف الاجتماعي</div>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <Label className={FIELD_LABEL}>نبذة قصيرة</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="سطر أو سطرين عن المؤثر..."
                  className="min-h-[72px] resize-y"
                />
              </div>
              <div>
                <Label className={FIELD_LABEL}>المنطقة / المدينة</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="الرياض" />
                <div className="h-2.5" />
                <Label className={FIELD_LABEL}>الجمهور المستهدف</Label>
                <Input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="شباب، عائلات..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={FIELD_LABEL}>Instagram</Label>
                <Input
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="@username"
                />
              </div>
              <div>
                <Label className={FIELD_LABEL}>X</Label>
                <Input value={xHandle} onChange={(e) => setXHandle(e.target.value)} placeholder="@username" />
              </div>
              <div>
                <Label className={FIELD_LABEL}>TikTok</Label>
                <Input
                  value={tiktokHandle}
                  onChange={(e) => setTiktokHandle(e.target.value)}
                  placeholder="@username"
                />
              </div>
              <div>
                <Label className={FIELD_LABEL}>YouTube</Label>
                <Input
                  value={youtubeHandle}
                  onChange={(e) => setYoutubeHandle(e.target.value)}
                  placeholder="youtube.com/@username"
                />
              </div>
              <div>
                <Label className={FIELD_LABEL}>Snapchat</Label>
                <Input
                  value={snapchatHandle}
                  onChange={(e) => setSnapchatHandle(e.target.value)}
                  placeholder="@username"
                />
              </div>
              <div>
                <Label className={FIELD_LABEL}>الموقع</Label>
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label className={FIELD_LABEL}>البريد الإلكتروني</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@example.com" />
              </div>
              <div>
                <Label className={FIELD_LABEL}>الهاتف</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+9665..." />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-between gap-2">
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
          <div className="mr-auto flex gap-2">
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
            >
              حفظ
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
