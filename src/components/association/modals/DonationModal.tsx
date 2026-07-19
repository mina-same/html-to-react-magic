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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Donation } from "../types";

interface Props {
  open: boolean;
  onSave: (donation: Omit<Donation, "id">) => void;
  onClose: () => void;
}

const PAYMENT_METHODS = ["نقد", "شيك", "تحويل بنكي", "STC Pay", "بطاقة رقمية", "Apple Pay"];

const FIELD_LABEL = "block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5";

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
      <DialogContent className="max-w-[700px] w-[95vw] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <Badge className="bg-secondary text-primary hover:bg-secondary">تبرع جديد</Badge>
            <DialogTitle>إضافة تبرع</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>رقم التبرع</Label>
              <Input value={donationNumber} onChange={(e) => setDonationNumber(e.target.value)} placeholder="اختياري" />
            </div>
            <div>
              <Label className={FIELD_LABEL}>اسم المتبرع</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: أحمد الفيصل" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>الجوال</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0501234567" />
            </div>
            <div>
              <Label className={FIELD_LABEL}>اسم المشروع</Label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="مثال: أجهزة طبية" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>قيمة التبرع</Label>
              <Input
                type="number"
                dir="ltr"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="5000"
              />
            </div>
            <div>
              <Label className={FIELD_LABEL}>طريقة الدفع</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>البنك</Label>
              <Input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="اختياري" />
            </div>
            <div>
              <Label className={FIELD_LABEL}>رقم الحساب</Label>
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="اختياري" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={FIELD_LABEL}>مصدر التبرع</Label>
              <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="مثال: المتجر" />
            </div>
            <div>
              <Label className={FIELD_LABEL}>التاريخ</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div>
            <Label className={FIELD_LABEL}>الحالة</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Donation["status"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-2.5 flex justify-end gap-2">
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
          >
            حفظ التبرع
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
