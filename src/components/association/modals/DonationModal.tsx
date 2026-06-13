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

const PAYMENT_METHODS = ["نقد", "شيك", "تحويل بنكي", "STC Pay", "بطاقة رقمية", "Apple Pay"];

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
  const [donationNumber, setDonationNumber] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [projectName, setProjectName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("نقد");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [status, setStatus] = useState<Donation["status"]>("pending");
  const [source, setSource] = useState("");
  const [date, setDate] = useState(todayIsoDate());

  const resetAndClose = () => {
    setDonationNumber("");
    setName("");
    setPhone("");
    setProjectName("");
    setAmount(0);
    setPaymentMethod("نقد");
    setBank("");
    setAccountNumber("");
    setStatus("pending");
    setSource("");
    setDate(todayIsoDate());
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
        style={{
          maxWidth: 700,
          width: "95vw",
          fontFamily: "'Tajawal','Cairo',sans-serif",
          direction: "rtl",
          maxHeight: "90vh",
          overflowY: "auto",
          overflowX: "auto",
        }}
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>رقم التبرع</label>
              <Input
                value={donationNumber}
                onChange={(e) => setDonationNumber(e.target.value)}
                placeholder="اختياري"
                style={sel}
              />
            </div>
            <div>
              <label style={lbl}>اسم المتبرع</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أحمد الفيصل"
                style={sel}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>الجوال</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0501234567"
                style={sel}
              />
            </div>
            <div>
              <label style={lbl}>اسم المشروع</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="مثال: أجهزة طبية"
                style={sel}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>قيمة التبرع</label>
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
              <label style={lbl}>طريقة الدفع</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={sel}
              >
                {PAYMENT_METHODS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>البنك</label>
              <Input
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="اختياري"
                style={sel}
              />
            </div>
            <div>
              <label style={lbl}>رقم الحساب</label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="اختياري"
                style={sel}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>مصدر التبرع</label>
              <Input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="مثال: المتجر"
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

          <div>
            <label style={lbl}>الحالة</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Donation["status"])}
              style={sel}
            >
              <option value="pending">معلق</option>
              <option value="completed">مكتمل</option>
            </select>
          </div>
        </div>

        <DialogFooter
          style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}
        >
          <Button variant="outline" size="sm" onClick={resetAndClose}>
            إلغاء
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (!name.trim() || amount <= 0) return;
              onSave({
                donationNumber,
                name: name.trim(),
                phone,
                projectName,
                amount,
                paymentMethod,
                bank,
                accountNumber,
                status,
                source,
                date,
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
