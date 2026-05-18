import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Influencer } from "../types";
import { INF_COLORS, formatFollowers } from "../data";

interface Props {
  influencer: Influencer;
  influencerIndex: number;
  onSubmit: (data: { type: string; budget: number; startDate: string; duration: string; message: string }) => void;
  onClose: () => void;
}

const PLAT_ICONS: Record<string, string> = { Instagram:"📸", X:"✦", TikTok:"🎵", YouTube:"▶", Snapchat:"👻" };
const sel: React.CSSProperties = { borderRadius: 7, border: "1.5px solid rgba(45,122,82,.12)", fontFamily: "'Tajawal','Cairo',sans-serif", fontSize: ".87rem", color: "#111827", outline: "none", padding: "8px 12px", width: "100%", background: "white" };
const lbl: React.CSSProperties = { display: "block", fontSize: ".75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 };

export default function CampaignRequestModal({ influencer, influencerIndex, onSubmit, onClose }: Props) {
  const [type,      setType]      = useState("خيرية");
  const [budget,    setBudget]    = useState(Math.max(250, influencer.basePrice));
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0,10));
  const [duration,  setDuration]  = useState("أسبوع");
  const [message,   setMessage]   = useState("");
  const [budgetErr, setBudgetErr] = useState(false);
  const [msgErr,    setMsgErr]    = useState(false);

  const color    = INF_COLORS[influencerIndex % INF_COLORS.length];
  const initials = influencer.name.split(" ").map(n => n[0]).slice(0,2).join("");
  const price    = Math.max(250, influencer.basePrice);

  function submit() {
    let ok = true;
    if (budget < 250) { setBudgetErr(true); ok = false; }
    if (!message.trim()) { setMsgErr(true); ok = false; }
    if (!ok) return;
    onSubmit({ type, budget, startDate, duration, message });
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: 500, fontFamily: "'Tajawal','Cairo',sans-serif", direction: "rtl" }}>
        <DialogHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: ".72rem", padding: "3px 10px", borderRadius: 20, fontWeight: 700, background: "#fef9c3", color: "#92400e" }}>طلب حملة جديدة</span>
            <DialogTitle style={{ fontFamily: "'Tajawal','Cairo',sans-serif" }}>{influencer.name}</DialogTitle>
          </div>
        </DialogHeader>

        {/* Influencer summary card */}
        <div style={{ background: "#f2faf6", borderRadius: 10, padding: "14px 16px", marginBottom: 4, display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(45,122,82,.12)" }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#111827" }}>{influencer.name}</div>
            <div style={{ fontSize: ".77rem", color: "#6b7280", marginTop: 2 }}>
              {PLAT_ICONS[influencer.platform]} {influencer.platform} · {formatFollowers(influencer.followers)} متابع · {influencer.engagement}% تفاعل
            </div>
          </div>
          <div style={{ marginRight: "auto", textAlign: "left" }}>
            <div style={{ fontSize: ".7rem", color: "#6b7280" }}>يبدأ من</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1a5c3a" }}>يبدأ من {price.toLocaleString()} ر.س</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>نوع الحملة</label>
              <select value={type} onChange={e => setType(e.target.value)} style={sel}>
                <option value="خيرية">📢 حملة خيرية عامة</option>
                <option value="رمضان">🌙 حملة رمضان</option>
                <option value="تبرع">💳 حملة جمع تبرعات</option>
                <option value="توعية">💡 حملة توعوية</option>
                <option value="مشروع">🏗 مشروع محدد</option>
              </select>
            </div>
            <div>
              <label style={lbl}>الميزانية المتوقعة (ر.س)</label>
              <Input type="number" dir="ltr" min={250} value={budget} onChange={e => { setBudget(Number(e.target.value)); setBudgetErr(false); }}
                style={{ ...sel, borderColor: budgetErr ? "#dc2626" : undefined }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>تاريخ البداية المقترح</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={sel} />
            </div>
            <div>
              <label style={lbl}>مدة الحملة</label>
              <select value={duration} onChange={e => setDuration(e.target.value)} style={sel}>
                {["يوم واحد","3 أيام","أسبوع","أسبوعان","شهر"].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={lbl}>رسالة الحملة / الهدف المطلوب</label>
            <Textarea value={message} onChange={e => { setMessage(e.target.value); setMsgErr(false); }} placeholder="اكتب هنا ما تريد إيصاله من الحملة..." style={{ ...sel, minHeight: 90, resize: "vertical", borderColor: msgErr ? "#dc2626" : undefined }} />
          </div>

          <div style={{ background: "#fff8f0", border: "1px solid rgba(201,168,76,.2)", borderRadius: 8, padding: "11px 14px", fontSize: ".8rem", color: "#92400e", lineHeight: 1.6 }}>
            💡 <strong>ملاحظة:</strong> السعر المبدئي تقديري ويبدأ من 250 ر.س. السعر النهائي يُحدَّد بعد مراجعة فريق ساعِد والتواصل مع المؤثر.
          </div>
        </div>

        <DialogFooter style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="outline" size="sm" onClick={onClose}>إلغاء</Button>
          <Button size="sm" onClick={submit} style={{ background: "#2d7a52", color: "white" }}>إرسال الطلب ←</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
