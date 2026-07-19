import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user, completeOnboarding } = useAuth();
  const [assocName, setAssocName] = useState("");
  const [license, setLicense] = useState("");
  const [region, setRegion] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!assocName.trim()) {
      setError("يرجى إدخال اسم الجمعية");
      return;
    }
    if (!license.trim()) {
      setError("يرجى إدخال رقم ترخيص الجمعية");
      return;
    }
    if (!region.trim()) {
      setError("يرجى إدخال المكان");
      return;
    }
    if (!phone.trim()) {
      setError("يرجى إدخال رقم التلفون");
      return;
    }

    setSubmitting(true);
    try {
      await completeOnboarding({
        assocName: assocName.trim(),
        license: license.trim(),
        region: region.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#071a0f] via-[--green-dark] to-[#0a2518] p-5">
      <Card className="animate-slide-up w-full max-w-md rounded-3xl border-none p-9 shadow-2xl">
        <div className="mb-7 text-center">
          <div className="mb-2 text-2xl font-extrabold text-primary">أهلاً بك!</div>
          <div className="text-sm text-muted-foreground">أكمل إعداد حساب جمعيتك</div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-foreground/80">اسم الجمعية</Label>
            <Input
              value={assocName}
              onChange={(e) => setAssocName(e.target.value)}
              placeholder="جمعية تكاتف الخيرية"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-foreground/80">رقم ترخيص الجمعية</Label>
            <Input
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              placeholder="رقم الترخيص"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-foreground/80">المكان</Label>
            <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="الرياض" />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-foreground/80">رقم التلفون</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0501234567" />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-foreground/80">البريد الإلكتروني</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@assoc.org"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="mt-2 h-12 w-full bg-gradient-to-br from-[--green-dark] to-[--green-mid] text-base font-bold"
          >
            {submitting ? "جاري الحفظ..." : "إكمال الإعداد"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
