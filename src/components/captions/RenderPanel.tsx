import { useState, useEffect, useRef } from "react";
import { Loader2, Download, Film, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { VideoProject, RenderJob } from "@/types/captions";
import {
  startRender,
  getRenderJob,
  getVideoDownloadUrl,
  getSRTDownloadUrl,
} from "@/lib/caption-api";

type Props = {
  project: VideoProject;
};

export function RenderPanel({ project }: Props) {
  const [job, setJob] = useState<RenderJob | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isActive = job?.status === "queued" || job?.status === "rendering";
  const isComplete = job?.status === "completed";

  // Poll render job
  useEffect(() => {
    if (!job?.id || !isActive) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const updated = await getRenderJob(job.id);
        setJob(updated);
        if (updated.status !== "queued" && updated.status !== "rendering") {
          clearInterval(pollRef.current!);
        }
      } catch {
        // ignore transient poll errors
      }
    }, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [job?.id, isActive]);

  async function handleStartRender() {
    setStarting(true);
    setError(null);
    try {
      const newJob = await startRender(project.id);
      setJob(newJob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل بدء التصدير");
    } finally {
      setStarting(false);
    }
  }

  function downloadFile(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.click();
  }

  return (
    <div className="p-4 space-y-4" dir="rtl">
      <h3 className="font-semibold text-sm">التصدير والتنزيل</h3>

      {/* Status */}
      {job && (
        <div className="space-y-2">
          {isActive && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {job.status === "queued" ? "في قائمة الانتظار…" : `جاري التصدير ${Math.round(job.progress * 100)}%`}
              </div>
              <Progress value={job.progress * 100} />
            </>
          )}
          {isComplete && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              اكتمل التصدير
            </div>
          )}
          {job.status === "failed" && (
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{job.error ?? "فشل التصدير"}</span>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {!isActive && (
          <Button
            onClick={handleStartRender}
            disabled={starting}
            className="w-full"
          >
            {starting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري البدء…</>
            ) : (
              <><Film className="mr-2 h-4 w-4" /> تصدير MP4</>
            )}
          </Button>
        )}

        {isComplete && (
          <Button
            onClick={() => downloadFile(getVideoDownloadUrl(project.id))}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            تنزيل MP4
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => downloadFile(getSRTDownloadUrl(project.id))}
          className="w-full"
          disabled={project.captions.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          تصدير SRT
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        يستخدم التصدير أداة Remotion CLI. قد تستغرق أول عملية تصدير بضع دقائق.
        تصدير SRT فوري.
      </p>
    </div>
  );
}
