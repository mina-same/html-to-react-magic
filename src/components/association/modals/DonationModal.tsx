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
import type { Donation } from "../types";

interface Props {
  open: boolean;
  onSave: (donation: Omit<Donation, "id">) => void;
  onClose: () => void;
}

const CHANNELS: Donation["channel"][] = ["نقد", "شيك", "تحويل", "STC Pay", "بطاقة", "Apple Pay"];

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

function todayIsoDate() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default function DonationModal({ open, onSave, onClose }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [channel, setChannel] = useState<Donation["channel"]>("نقد");
  const [date, setDate] = useState(todayIsoDate());
  const [status, setStatus] = useState<Donation["status"]>("pending");
  const [org, setOrg] = useState("");

  const resetAndClose = () => {
    setName("");
    setAmount(0);
    setChannel("نقد");
    setDate(todayIsoDate());
    setStatus("pending");
    setOrg("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetAndClose();
      }}
    >
      <DialogContent
        style={{ maxWidth: 460, fontFamily: "'Tajawal','Cairo',sans-serif", direction: "rtl" }}
      >
        <DialogHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: ".72rem",
                padding: "3px 10px",
                borderRadius: 20,
                fontWeight: 700,
                background: "#e8f5ee",
                color: "#2d7a52",
              }}
            >
              تبرع جديد
            </span>
            <DialogTitle style={{ fontFamily: "'Tajawal','Cairo',sans-serif" }}>
              إضافة تبرع
            </DialogTitle>
          </div>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={lbl}>اسم المتبرع</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أحمد الفيصل"
              style={sel}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>المبلغ</label>
              <Input
                type="number"
                dir="ltr"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="5000"
                style={sel}
              />
            </div>
            <div>
              <label style={lbl}>التاريخ</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={sel}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>القناة</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as Donation["channel"])}
                style={sel}
              >
                {CHANNELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>الحالة</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Donation["status"])}
                style={sel}
              >
                <option value="completed">مكتمل</option>
                <option value="pending">معلق</option>
              </select>
            </div>
          </div>

          <div>
            <label style={lbl}>الجهة / الشركة</label>
            <Input
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="اختياري"
              style={sel}
            />
          </div>
        </div>

        <DialogFooter style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="outline" size="sm" onClick={resetAndClose}>
            إلغاء
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (!name.trim() || amount <= 0) return;
              onSave({
                name: name.trim(),
                amount,
                channel,
                date,
                status,
                org: org.trim(),
              });
              resetAndClose();
            }}
            style={{ background: "#2d7a52", color: "white" }}
          >
            حفظ التبرع
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
