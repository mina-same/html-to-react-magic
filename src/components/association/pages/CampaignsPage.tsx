import { useState } from "react";
import { Megaphone, Plus, X } from "lucide-react";
import type { Campaign } from "../types";
import { campaignsDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<Campaign["status"], { label: string; className: string }> = {
  active: { label: "نشطة", className: "bg-emerald-100 text-emerald-800" },
  draft: { label: "مسودة", className: "bg-slate-100 text-slate-600" },
  paused: { label: "متوقفة", className: "bg-amber-100 text-amber-800" },
  ended: { label: "منتهية", className: "bg-red-100 text-red-800" },
};

interface Props {
  campaigns: Campaign[];
  userId?: string;
  onRefresh?: () => void;
}

export default function CampaignsPage({ campaigns, userId, onRefresh }: Props) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", budget: "", reach: "" });
  const [busy, setBusy] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !form.title.trim()) return;
    setBusy(true);
    await campaignsDb.create(userId, {
      title: form.title.trim(),
      status: "draft",
      budget: Number(form.budget) || 0,
      reach: form.reach.trim() || "—",
    });
    setForm({ title: "", budget: "", reach: "" });
    setAdding(false);
    setBusy(false);
    onRefresh?.();
  }

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center gap-2.5 space-y-0 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
          <Megaphone className="h-4 w-4" />
        </div>
        <div>
          <CardTitle className="text-sm">الحملات</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">{campaigns.length} حملة</p>
        </div>
        <Button size="sm" className="mr-auto" onClick={() => setAdding((v) => !v)}>
          {adding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {adding ? "إلغاء" : "حملة جديدة"}
        </Button>
      </CardHeader>

      {adding && (
        <form
          onSubmit={handleAdd}
          className="flex flex-wrap items-end gap-3 border-b bg-muted/40 p-4"
        >
          <div className="min-w-[200px] flex-1">
            <Label className="mb-1.5 block text-xs text-muted-foreground">اسم الحملة *</Label>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="حملة كسوة الشتاء 2026"
            />
          </div>
          <div className="w-[130px]">
            <Label className="mb-1.5 block text-xs text-muted-foreground">الميزانية (ر.س)</Label>
            <Input
              type="number"
              min="0"
              value={form.budget}
              onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
              placeholder="10000"
            />
          </div>
          <div className="w-[120px]">
            <Label className="mb-1.5 block text-xs text-muted-foreground">الوصول المتوقع</Label>
            <Input
              value={form.reach}
              onChange={(e) => setForm((f) => ({ ...f, reach: e.target.value }))}
              placeholder="50K"
            />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? "..." : "إضافة"}
          </Button>
        </form>
      )}

      <CardContent className="flex flex-col gap-2.5 p-4">
        {campaigns.length === 0 ? (
          <EmptyState icon={Megaphone} title="لا توجد حملات بعد" description="أضف أول حملة للبدء" />
        ) : (
          campaigns.map((c) => {
            const s = STATUS_MAP[c.status] ?? STATUS_MAP.draft;
            return (
              <div
                key={c.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border bg-secondary/40 p-3.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-foreground">{c.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">الوصول: {c.reach}</div>
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    s.className,
                  )}
                >
                  {s.label}
                </span>
                <div className="whitespace-nowrap text-sm font-bold text-primary">
                  {c.budget.toLocaleString()} ر.س
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
