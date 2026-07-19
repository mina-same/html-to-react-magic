import { Loader2, Sparkles, TriangleAlert, Check, X } from "lucide-react";
import { type LogEntry } from "./constants";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressStepsProps {
  analyzing: boolean;
  logs: LogEntry[];
}

/**
 * The live "analysis in progress" card — header with a spinner / status icon
 * and a progress bar, plus the step list with per-step status icons.
 */
export default function ProgressSteps({ analyzing, logs }: ProgressStepsProps) {
  if (!analyzing && logs.length === 0) return null;

  const doneCount = logs.filter((l) => l.status === "done").length;
  const hasError = logs.some((l) => l.status === "error");

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b bg-gradient-to-br from-secondary to-secondary/60 px-4 py-3.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-card shadow-sm">
          {analyzing ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : hasError ? (
            <TriangleAlert className="h-4 w-4 text-destructive" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary" />
          )}
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">
            {analyzing
              ? "جاري التحليل بالذكاء الاصطناعي..."
              : hasError
                ? "حدث خطأ أثناء التحليل"
                : "اكتمل التحليل بنجاح"}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {doneCount} / {logs.length} خطوات مكتملة
          </div>
        </div>
        {logs.length > 0 && (
          <div className="mr-auto w-32">
            <Progress value={(doneCount / logs.length) * 100} className="h-[5px]" />
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-2.5 px-4 py-3.5">
        {logs.map((entry, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                entry.status === "done"
                  ? "border-primary bg-secondary"
                  : entry.status === "error"
                    ? "border-destructive bg-destructive/10"
                    : "border-primary/25 bg-secondary/40",
              )}
            >
              {entry.status === "done" ? (
                <Check className="h-4 w-4 text-primary" strokeWidth={3} />
              ) : entry.status === "error" ? (
                <X className="h-4 w-4 text-destructive" strokeWidth={3} />
              ) : (
                <span className="h-2 w-2 animate-blink rounded-full bg-primary" />
              )}
            </div>
            <div className="flex-1">
              <div
                className={cn(
                  "text-sm",
                  entry.status === "pending" ? "font-semibold" : "font-medium",
                  entry.status === "error"
                    ? "text-destructive"
                    : entry.status === "done"
                      ? "text-foreground/80"
                      : "text-primary",
                )}
              >
                {entry.text}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{entry.time}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
