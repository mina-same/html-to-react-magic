import { FileText, Paperclip, Sparkles, Lightbulb, Pencil, Eye, TriangleAlert } from "lucide-react";
import { AI_ANALYSIS } from "../../data";
import { analysisOrFallback, type AnalysisResult } from "./constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnalysisPanelProps {
  savedName: string;
  savedDesc: string;
  pdfUrl: string | null;
  aiResult: AnalysisResult | null;
  onEdit: () => void;
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: typeof FileText;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <CardHeader className="flex-row items-center justify-between space-y-0 border-b py-3.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <CardTitle className="text-sm">{title}</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {action}
    </CardHeader>
  );
}

/**
 * The "saved profile" view — shown once an AI analysis exists and the user
 * is not re-editing. Renders the description card, saved PDF card, AI summary,
 * and the marketing ideas / pain-points cards.
 */
export default function AnalysisPanel({
  savedName,
  savedDesc,
  pdfUrl,
  aiResult,
  onEdit,
}: AnalysisPanelProps) {
  const result = analysisOrFallback(aiResult);

  return (
    <>
      {/* Description card */}
      <Card className="mb-4">
        <SectionHeader
          icon={FileText}
          title="ملف الجمعية"
          subtitle="المحتوى المحفوظ"
          action={
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 text-xs">
              <Pencil className="h-3 w-3" />
              تعديل
            </Button>
          }
        />
        <CardContent className="pt-4">
          {savedName && (
            <div className="mb-2 text-sm font-bold text-foreground/80">🏛 {savedName}</div>
          )}
          {savedDesc && (
            <div className="rounded-lg border bg-muted/40 px-3.5 py-3 text-sm leading-7 text-foreground/80">
              {savedDesc}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF file card */}
      {pdfUrl && (
        <Card className="mb-4">
          <SectionHeader
            icon={Paperclip}
            title="الملف التعريفي المحفوظ"
            subtitle="الملف المضغوط المرفوع"
            action={
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-3 w-3" />
                  عرض الملف
                </a>
              </Button>
            }
          />
        </Card>
      )}

      {/* AI Summary */}
      <Card className="mb-4">
        <SectionHeader icon={Sparkles} title="ملخص الجمعية" subtitle="تحليل AI للملف التعريفي" />
        <CardContent className="pt-4">
          <div className="rounded-xl border bg-gradient-to-br from-secondary to-secondary/60 px-4 py-4">
            <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              ✦ ملخص تلقائي
            </div>
            <div className="text-sm leading-7 text-foreground/80">{result.summary}</div>
          </div>
        </CardContent>
      </Card>

      {/* Ideas & Pain Points */}
      <Card>
        <SectionHeader icon={Lightbulb} title="أفكار وتحديات تسويقية" subtitle="توصيات AI لتحسين الحضور الإعلامي" />
        <CardContent className="grid grid-cols-1 gap-3 pt-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl border">
            <div className="flex items-center gap-2 border-b bg-gradient-to-br from-secondary to-secondary/60 px-3.5 py-2.5">
              <Lightbulb className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-bold text-foreground">أفكار للمحتوى التسويقي</span>
            </div>
            <div className="px-3.5 py-2.5">
              {(aiResult?.ideas ?? AI_ANALYSIS.ideas).map((idea, i, arr) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2 py-1.5 text-sm leading-6 text-foreground/80",
                    i < arr.length - 1 && "border-b",
                  )}
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {idea}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border">
            <div className="flex items-center gap-2 border-b bg-gradient-to-br from-amber-50 to-orange-50 px-3.5 py-2.5">
              <TriangleAlert className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-sm font-bold text-foreground">تحديات ونقاط ضعف إعلامية</span>
            </div>
            <div className="px-3.5 py-2.5">
              {(aiResult?.painPoints ?? AI_ANALYSIS.painPoints).map((pt, i, arr) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2 py-1.5 text-sm leading-6 text-foreground/80",
                    i < arr.length - 1 && "border-b",
                  )}
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                  {pt}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
