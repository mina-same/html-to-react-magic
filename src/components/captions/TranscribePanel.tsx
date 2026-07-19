import { useState, useEffect, useRef } from "react";
import { Loader2, Mic, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { VideoProject } from "@/types/captions";
import { LANGUAGE_OPTIONS } from "@/types/captions";
import { startTranscription, getProject } from "@/lib/caption-api";

type Props = {
  project: VideoProject;
  onReady: (project: VideoProject) => void;
};

const STATUS_LABELS: Record<string, string> = {
  uploaded: "تم الرفع",
  "extracting-audio": "جاري استخراج الصوت…",
  transcribing: "جاري تفريغ الكلام…",
  ready: "جاهز",
  failed: "فشل",
};

export function TranscribePanel({ project: initialProject, onReady }: Props) {
  const [project, setProject] = useState(initialProject);
  const [language, setLanguage] = useState("");
  const [prompt, setPrompt] = useState("");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isProcessing =
    project.status === "extracting-audio" || project.status === "transcribing";

  // Poll for status changes during processing
  useEffect(() => {
    if (!isProcessing) {
      if (pollRef.current) clearInterval(pollRef.current);
      if (project.status === "ready") onReady(project);
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const updated = await getProject(project.id);
        setProject(updated);
        if (updated.status === "ready") onReady(updated);
      } catch {
        // Ignore poll errors
      }
    }, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isProcessing, project.id, project.status]);

  async function handleStart() {
    setStarting(true);
    setError(null);
    try {
      // "_auto_" is the SelectItem sentinel for "Auto-detect" (empty string not allowed by Radix Select)
      const lang = language === "_auto_" || !language ? undefined : language;
      await startTranscription(project.id, { language: lang, prompt: prompt || undefined });
      // Optimistically set status
      setProject((p) => ({ ...p, status: "extracting-audio" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل بدء التفريغ النصي");
    } finally {
      setStarting(false);
    }
  }

  if (project.status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center" dir="rtl">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">فشل التفريغ النصي</h2>
        <p className="text-muted-foreground text-sm max-w-sm">{project.error ?? "خطأ غير معروف"}</p>
        <Button className="mt-6" variant="outline" onClick={() => setProject({ ...project, status: "uploaded" })}>
          حاول مرة أخرى
        </Button>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center" dir="rtl">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold mb-2">{STATUS_LABELS[project.status]}</h2>
        <p className="text-muted-foreground text-sm">قد يستغرق هذا دقيقة للفيديوهات الطويلة.</p>
        <div className="mt-4 flex gap-3 items-center text-sm">
          {["extracting-audio", "transcribing"].map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              {project.status === s ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              ) : project.status === "ready" ||
                (s === "extracting-audio" && project.status === "transcribing") ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <div className="h-3.5 w-3.5 rounded-full border border-border" />
              )}
              <span className="text-muted-foreground">{STATUS_LABELS[s]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8" dir="rtl">
      <div className="w-full max-w-md">
        <Mic className="h-10 w-10 text-primary mb-4" />
        <h2 className="text-xl font-semibold mb-1">إعداد التفريغ النصي</h2>
        <p className="text-muted-foreground text-sm mb-6">
          تم رفع الفيديو بنجاح. اضبط إعدادات التعرف على الكلام قبل المعالجة.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="language">اللغة</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="mt-1.5">
                <SelectValue placeholder="اكتشاف تلقائي" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value || "_auto_"}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="prompt">سياق / مصطلحات (اختياري)</Label>
            <Textarea
              id="prompt"
              className="mt-1.5 text-sm"
              placeholder="مثال: القاهرة، توت عنخ آمون، المتحف المصري الكبير"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              يساعد Whisper على التعرف على الأسماء والمصطلحات المتخصصة.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button className="mt-6 w-full" onClick={handleStart} disabled={starting}>
          {starting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري البدء…
            </>
          ) : (
            "بدء التفريغ النصي"
          )}
        </Button>
      </div>
    </div>
  );
}
