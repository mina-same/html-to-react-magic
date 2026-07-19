import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { CaptionStyle, CaptionGrouping } from "@/types/captions";
import {
  FONT_OPTIONS,
  STYLE_PRESETS,
  GROUPING_PRESETS,
} from "@/types/captions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type Props = {
  style: CaptionStyle;
  grouping: CaptionGrouping;
  onStyleChange: (style: CaptionStyle) => void;
  onGroupingChange: (grouping: CaptionGrouping) => void;
};

const GROUPING_LABELS: Record<"fast" | "balanced" | "readable", string> = {
  fast: "سريع",
  balanced: "متوازن",
  readable: "سهل القراءة",
};

export function CaptionStylePanel({ style, grouping, onStyleChange, onGroupingChange }: Props) {
  function updateStyle(patch: Partial<CaptionStyle>) {
    onStyleChange({ ...style, ...patch });
  }

  function applyPreset(preset: (typeof STYLE_PRESETS)[number]) {
    onStyleChange({ ...style, ...preset.style });
  }

  function applyGroupingPreset(preset: keyof typeof GROUPING_PRESETS) {
    onGroupingChange({ ...GROUPING_PRESETS[preset], preset });
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-5 text-sm">
        {/* ─── Visual presets ─────────────────────────────────────── */}
        <section>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">أنماط جاهزة</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {STYLE_PRESETS.map((p) => (
              <Button
                key={p.name}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => applyPreset(p)}
              >
                {p.name}
              </Button>
            ))}
          </div>
        </section>

        <Separator />

        {/* ─── Font ───────────────────────────────────────────────── */}
        <section className="space-y-3">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">الخط</Label>
          <div>
            <Label className="text-xs text-muted-foreground">نوع الخط</Label>
            <Select value={style.fontFamily} onValueChange={(v) => updateStyle({ fontFamily: v })}>
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((f) => (
                  <SelectItem key={f} value={f} className="text-xs">
                    {f.split(",")[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">الحجم: {style.fontSize}px</Label>
            <Slider
              className="mt-1"
              min={24}
              max={120}
              step={2}
              value={[style.fontSize]}
              onValueChange={([v]) => updateStyle({ fontSize: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">أحرف كبيرة</Label>
            <Switch
              checked={style.textTransform === "uppercase"}
              onCheckedChange={(v) => updateStyle({ textTransform: v ? "uppercase" : "none" })}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              تباعد الأحرف: {style.letterSpacing}px
            </Label>
            <Slider
              className="mt-1"
              min={-2}
              max={20}
              step={0.5}
              value={[style.letterSpacing]}
              onValueChange={([v]) => updateStyle({ letterSpacing: v })}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              تباعد الكلمات: {style.wordSpacing}px
            </Label>
            <Slider
              className="mt-1"
              min={0}
              max={60}
              step={2}
              value={[style.wordSpacing]}
              onValueChange={([v]) => updateStyle({ wordSpacing: v })}
            />
          </div>
        </section>

        <Separator />

        {/* ─── Colors ─────────────────────────────────────────────── */}
        <section className="space-y-3">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">الألوان</Label>
          <ColorRow
            label="لون النص"
            value={style.textColor}
            onChange={(v) => updateStyle({ textColor: v })}
          />
          <ColorRow
            label="الكلمة النشطة"
            value={style.activeWordColor}
            onChange={(v) => updateStyle({ activeWordColor: v })}
          />
          <ColorRow
            label="الخلفية"
            value={style.backgroundColor}
            onChange={(v) => updateStyle({ backgroundColor: v })}
          />
          <div>
            <Label className="text-xs text-muted-foreground">
              شفافية الخلفية: {Math.round(style.backgroundOpacity * 100)}%
            </Label>
            <Slider
              className="mt-1"
              min={0}
              max={1}
              step={0.05}
              value={[style.backgroundOpacity]}
              onValueChange={([v]) => updateStyle({ backgroundOpacity: v })}
            />
          </div>
        </section>

        <Separator />

        {/* ─── Stroke & shadow ────────────────────────────────────── */}
        <section className="space-y-3">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            الحدود والظل
          </Label>
          <ColorRow
            label="لون الحدود"
            value={style.strokeColor}
            onChange={(v) => updateStyle({ strokeColor: v })}
          />
          <div>
            <Label className="text-xs text-muted-foreground">
              سمك الحدود: {style.strokeWidth}px
            </Label>
            <Slider
              className="mt-1"
              min={0}
              max={8}
              step={0.5}
              value={[style.strokeWidth]}
              onValueChange={([v]) => updateStyle({ strokeWidth: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">ظل النص</Label>
            <Switch
              checked={style.shadowEnabled}
              onCheckedChange={(v) => updateStyle({ shadowEnabled: v })}
            />
          </div>
        </section>

        <Separator />

        {/* ─── Position & alignment ────────────────────────────────── */}
        <section className="space-y-3">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            الموضع
          </Label>
          <div>
            <Label className="text-xs text-muted-foreground">
              الموضع الرأسي: {style.verticalPosition}%
            </Label>
            <Slider
              className="mt-1"
              min={10}
              max={95}
              step={1}
              value={[style.verticalPosition]}
              onValueChange={([v]) => updateStyle({ verticalPosition: v })}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              أقصى عرض: {style.maxWidth}%
            </Label>
            <Slider
              className="mt-1"
              min={40}
              max={100}
              step={5}
              value={[style.maxWidth]}
              onValueChange={([v]) => updateStyle({ maxWidth: v })}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">محاذاة النص</Label>
            <Select
              value={style.textAlign}
              onValueChange={(v) =>
                updateStyle({ textAlign: v as CaptionStyle["textAlign"] })
              }
            >
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">يسار</SelectItem>
                <SelectItem value="center">وسط</SelectItem>
                <SelectItem value="right">يمين</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <Separator />

        {/* ─── Animation & direction ──────────────────────────────── */}
        <section className="space-y-3">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            الحركة
          </Label>
          <div>
            <Label className="text-xs text-muted-foreground">حركة الكلمات</Label>
            <Select
              value={style.animation}
              onValueChange={(v) => updateStyle({ animation: v as CaptionStyle["animation"] })}
            >
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">بدون</SelectItem>
                <SelectItem value="pop">تكبير</SelectItem>
                <SelectItem value="fade">تلاشٍ</SelectItem>
                <SelectItem value="slide">انزلاق</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">اتجاه النص</Label>
            <Select
              value={style.direction}
              onValueChange={(v) => updateStyle({ direction: v as CaptionStyle["direction"] })}
            >
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">اكتشاف تلقائي</SelectItem>
                <SelectItem value="ltr">من اليسار لليمين (LTR)</SelectItem>
                <SelectItem value="rtl">من اليمين لليسار (RTL)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">ملاءمة الفيديو</Label>
            <Select
              value={style.videoFit}
              onValueChange={(v) => updateStyle({ videoFit: v as CaptionStyle["videoFit"] })}
            >
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contain">احتواء كامل</SelectItem>
                <SelectItem value="cover">تغطية كاملة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <Separator />

        {/* ─── Grouping preset ────────────────────────────────────── */}
        <section>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            تجميع الترجمة
          </Label>
          <div className="mt-2 flex gap-2">
            {(["fast", "balanced", "readable"] as const).map((p) => (
              <Button
                key={p}
                variant={grouping.preset === p ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => applyGroupingPreset(p)}
              >
                {GROUPING_LABELS[p]}
              </Button>
            ))}
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-6 cursor-pointer rounded border-0 p-0 bg-transparent"
          style={{ appearance: "none" }}
        />
      </div>
    </div>
  );
}
