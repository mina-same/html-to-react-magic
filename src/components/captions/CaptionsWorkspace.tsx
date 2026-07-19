import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { AlertCircle, Download, Film, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VideoProject } from "@/types/captions";
import { VideoUploader } from "@/components/captions/VideoUploader";
import { TranscribePanel } from "@/components/captions/TranscribePanel";
import { CaptionEditor } from "@/components/captions/CaptionEditor";
import {
  checkServerHealth,
  listProjects,
  deleteProject,
  getVideoDownloadUrl,
} from "@/lib/caption-api";

type Step = "upload" | "transcribe" | "edit";

interface Props {
  /** True when rendered inside the association dashboard (bounded height, card frame). */
  embedded?: boolean;
}

export default function CaptionsWorkspace({ embedded = false }: Props) {
  const [step, setStep] = useState<Step>("upload");
  const [project, setProject] = useState<VideoProject | null>(null);
  const [serverOk, setServerOk] = useState<boolean | null>(null);
  const [projects, setProjects] = useState<VideoProject[]>([]);

  // Check caption server on mount
  useEffect(() => {
    checkServerHealth().then((h) => setServerOk(h.ok));
  }, []);

  const refreshProjects = useCallback(() => {
    listProjects()
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  // Load existing projects whenever we're back on the upload step
  useEffect(() => {
    if (serverOk && step === "upload") refreshProjects();
  }, [serverOk, step, refreshProjects]);

  function openProject(p: VideoProject) {
    setProject(p);
    // Projects with captions go straight to the editor; fresh uploads to transcription
    setStep(p.captions.length > 0 ? "edit" : "transcribe");
  }

  async function handleDelete(id: string) {
    await deleteProject(id).catch(() => {});
    refreshProjects();
  }

  function frame(children: ReactNode) {
    return (
      <div
        dir="rtl"
        className={
          embedded
            ? "rounded-xl border bg-background overflow-hidden"
            : "min-h-screen bg-background"
        }
      >
        {children}
      </div>
    );
  }

  if (serverOk === false) {
    return frame(
      <div className="flex min-h-[55vh] items-center justify-center p-8">
        <div className="max-w-sm text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">خادم الترجمة النصية غير مُشغَّل</h2>
          <p className="text-sm text-muted-foreground">
            يجب تشغيل خادم الترجمة النصية على{" "}
            <code dir="ltr" className="bg-muted px-1 rounded">localhost:3001</code>.
          </p>
          <div dir="ltr" className="bg-muted rounded-lg p-4 text-left text-xs font-mono">
            <p className="text-muted-foreground mb-1"># في مجلد المشروع:</p>
            <p>OPENAI_API_KEY=sk-... npm run caption-server</p>
          </div>
        </div>
      </div>,
    );
  }

  if (serverOk === null) {
    return frame(
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>,
    );
  }

  if (step === "edit" && project) {
    return (
      <div
        dir="ltr"
        className={
          embedded
            ? "h-[calc(100dvh-98px)] rounded-xl border bg-background overflow-hidden"
            : "h-dvh bg-background"
        }
      >
        <CaptionEditor
          initialProject={project}
          onBack={() => {
            setStep("upload");
            setProject(null);
          }}
        />
      </div>
    );
  }

  return frame(
    <>
      {step === "upload" && (
        <>
          <VideoUploader
            onUploaded={(p) => {
              setProject(p);
              setStep("transcribe");
            }}
          />

          {projects.length > 0 && (
            <div className="mx-auto max-w-2xl px-6 pb-12">
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                فيديوهاتك
              </h2>
              <div className="space-y-2">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                  >
                    <Film className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {new Date(p.createdAt).toLocaleString("ar-SA")} ·{" "}
                        {Math.round(p.durationMs / 1000)} ث
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.captions.length} كلمة
                        {p.hasRender ? " · تم التصدير ✓" : ""}
                        {p.status === "failed" ? " · فشل" : ""}
                      </p>
                    </div>
                    {p.hasRender && (
                      <Button asChild size="sm" variant="default">
                        <a href={getVideoDownloadUrl(p.id)} download>
                          <Download className="mr-1.5 h-3.5 w-3.5" />
                          MP4
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openProject(p)}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      فتح
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(p.id)}
                      title="حذف المشروع"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {step === "transcribe" && project && (
        <TranscribePanel
          project={project}
          onReady={(p) => {
            setProject(p);
            setStep("edit");
          }}
        />
      )}
    </>,
  );
}
