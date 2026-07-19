import { useRef, useState, useCallback } from "react";
import { Upload, Film, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { VideoProject } from "@/types/captions";
import { uploadVideo } from "@/lib/caption-api";

const ACCEPTED = ".mp4,.mov,.webm,.m4v,.avi,.mkv";
const MAX_MB = 500;

type Props = {
  onUploaded: (project: VideoProject) => void;
};

export function VideoUploader({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function validateFile(file: File): string | null {
    if (file.size === 0) return "الملف فارغ";
    if (file.size > MAX_MB * 1024 * 1024) return `حجم الملف يتجاوز الحد الأقصى ${MAX_MB} ميجابايت`;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["mp4", "mov", "webm", "m4v", "avi", "mkv"].includes(ext)) {
      return `صيغة غير مدعومة: .${ext}. استخدم MP4 أو MOV أو WebM أو M4V.`;
    }
    return null;
  }

  const handleFiles = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSelectedFile(file);
  }, []);

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const project = await uploadVideo(selectedFile, (pct) => setProgress(pct * 100));
      onUploaded(project);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setUploading(false);
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} كيلوبايت`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8" dir="rtl">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-1">محرر ترجمة الفيديو</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          ارفع فيديو لتوليد ترجمة نصية بالذكاء الاصطناعي مع توقيت دقيق لكل كلمة.
        </p>

        {/* Drop zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => !selectedFile && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {selectedFile ? (
            <div className="space-y-3">
              <Film className="mx-auto h-10 w-10 text-primary" />
              <div>
                <p className="font-semibold truncate max-w-xs mx-auto">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setError(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                <X className="h-3 w-3" /> إزالة
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">اسحب الفيديو وأفلته هنا</p>
                <p className="text-sm text-muted-foreground mt-1">أو اضغط للاختيار من جهازك</p>
              </div>
              <p className="text-xs text-muted-foreground">
                MP4, MOV, WebM, M4V — بحد أقصى {MAX_MB} ميجابايت
              </p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Progress */}
        {uploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>جاري الرفع…</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Upload button */}
        {selectedFile && !uploading && (
          <Button className="mt-4 w-full" onClick={handleUpload} disabled={!!error}>
            رفع ومتابعة
          </Button>
        )}
      </div>
    </div>
  );
}
