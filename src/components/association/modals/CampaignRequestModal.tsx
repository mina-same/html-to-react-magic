import { useState } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Influencer } from "../types";
import { INF_COLORS, formatFollowers } from "../data";

interface Props {
  influencer: Influencer;
  influencerIndex: number;
  onSubmit: (data: {
    type: string;
    budget: number;
    startDate: string;
    duration: string;
    message: string;
  }) => void;
  onClose: () => void;
}

const PLAT_ICONS: Record<string, string> = {
  Instagram: "📸",
  X: "✦",
  TikTok: "🎵",
  YouTube: "▶",
  Snapchat: "👻",
};

const FIELD_LABEL = "block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5";

export default function CampaignRequestModal({
  influencer,
  influencerIndex,
  onSubmit,
  onClose,
}: Props) {
  const [type, setType] = useState("خيرية");
  const [budget, setBudget] = useState(Math.max(250, influencer.basePrice));
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState("أسبوع");
  const [message, setMessage] = useState("");
  const [budgetErr, setBudgetErr] = useState(false);
  const [msgErr, setMsgErr] = useState(false);

  const color = INF_COLORS[influencerIndex % INF_COLORS.length];
  const initials = influencer.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  const price = Math.max(250, influencer.basePrice);

  function submit() {
    let ok = true;
    if (budget < 250) {
      setBudgetErr(true);
      ok = false;
    }
    if (!message.trim()) {
      setMsgErr(true);
      ok = false;
    }
    if (!ok) return;
    onSubmit({ type, budget, startDate, duration, message });
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[500px]" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">طلب حملة جديدة</Badge>
            <DialogTitle>{influencer.name}</DialogTitle>
          </div>
        </DialogHeader>

        {/* Influencer summary card */}
        <div className="mb-1 flex items-center gap-3 rounded-lg border bg-secondary/40 p-3.5">
          <Avatar className="h-[42px] w-[42px] shrink-0">
            <AvatarFallback style={{ background: color }} className="text-sm font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-bold text-foreground">{influencer.name}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {PLAT_ICONS[influencer.platform]} {influencer.platform} ·{" "}
              {formatFollowers(influencer.followers)} متابع · {influencer.engagement}% تفاعل
            </div>
          </div>
          <div className="mr-auto text-left">
            <div className="text-xs text-muted-foreground">يبدأ من</div>
            <div className="text-lg font-extrabold text-primary">{price.toLocaleString()} ر.س</div>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>نوع الحملة</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="خيرية">📢 حملة خيرية عامة</SelectItem>
                  <SelectItem value="رمضان">🌙 حملة رمضان</SelectItem>
                  <SelectItem value="تبرع">💳 حملة جمع تبرعات</SelectItem>
                  <SelectItem value="توعية">💡 حملة توعوية</SelectItem>
                  <SelectItem value="مشروع">🏗 مشروع محدد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={FIELD_LABEL}>الميزانية المتوقعة (ر.س)</Label>
              <Input
                type="number"
                dir="ltr"
                min={250}
                value={budget}
                onChange={(e) => {
                  setBudget(Number(e.target.value));
                  setBudgetErr(false);
                }}
                className={cn(budgetErr && "border-destructive")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>تاريخ البداية المقترح</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label className={FIELD_LABEL}>مدة الحملة</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["يوم واحد", "3 أيام", "أسبوع", "أسبوعان", "شهر"].map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className={FIELD_LABEL}>رسالة الحملة / الهدف المطلوب</Label>
            <Textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setMsgErr(false);
              }}
              placeholder="اكتب هنا ما تريد إيصاله من الحملة..."
              className={cn("min-h-[90px] resize-y", msgErr && "border-destructive")}
            />
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-gold/25 bg-gold/10 px-3.5 py-2.5 text-sm leading-6 text-amber-800">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>ملاحظة:</strong> السعر المبدئي تقديري ويبدأ من 250 ر.س. السعر النهائي يُحدَّد بعد
              مراجعة فريق ساعِد والتواصل مع المؤثر.
            </span>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            إلغاء
          </Button>
          <Button size="sm" onClick={submit}>
            إرسال الطلب ←
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
