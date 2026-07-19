import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, Sparkles, FileText, CheckCircle2, Loader2, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_FILE_TYPES,
  FILE_TYPE_BADGES,
  type FileInfo,
  type InputMode,
} from "./constants";

interface FileUploadProps {
  assocName: string;
  setAssocName: (v: string) => void;
  inputMode: InputMode;
  setInputMode: (m: InputMode) => void;
  assocDesc: string;
  setAssocDesc: (v: string) => void;
  fileInfo: FileInfo | null;
  setFileInfo: (v: FileInfo | null) => void;
  setFileObj: (v: File | null) => void;
  pdfUrl: string | null;
  onRemoveSavedPdf: () => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  processFile: (file: File) => void;
  analyzing: boolean;
  editing: boolean;
  onAnalyze: () => void;
}

/**
 * The upload / edit section — association name input, file-vs-text mode
 * toggle, drag-and-drop dropzone (with the saved-PDF affordance), the text
 * textarea, and the "analyze with AI" button.
 */
export default function FileUpload({
  assocName,
  setAssocName,
  inputMode,
  setInputMode,
  assocDesc,
  setAssocDesc,
  fileInfo,
  setFileInfo,
  setFileObj,
  pdfUrl,
  onRemoveSavedPdf,
  isDragging,
  setIsDragging,
  processFile,
  analyzing,
  editing,
  onAnalyze,
}: FileUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader className="flex-row items-center space-y-0 border-b py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
          <UploadCloud className="h-4 w-4" />
        </div>
        <div className="mr-2.5 flex-1">
          <CardTitle className="text-sm">ملف الجمعية التعريفي</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            ارفع الملف وسيقوم الذكاء الاصطناعي بتحليله وتوليد المحتوى
          </p>
        </div>
        <Badge className="gap-1 border-primary/15 bg-gradient-to-br from-secondary to-secondary/60 text-primary hover:bg-secondary">
          <Sparkles className="h-3 w-3" />
          مدعوم بـ AI
        </Badge>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Assoc name */}
        <div className="mb-3.5">
          <Label className="mb-1.5 block text-sm font-semibold text-foreground/80">اسم الجمعية</Label>
          <Input
            value={assocName}
            onChange={(e) => setAssocName(e.target.value)}
            placeholder="مثال: جمعية تكاتف الخيرية"
          />
        </div>

        {/* Mode toggle */}
        <div className="mb-4 flex gap-1 rounded-lg border bg-secondary/40 p-1">
          {(["file", "text"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setInputMode(mode);
                if (mode === "file") setAssocDesc("");
                else {
                  setFileInfo(null);
                  setFileObj(null);
                }
              }}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors",
                inputMode === mode ? "bg-card font-bold text-primary shadow-sm" : "text-muted-foreground",
              )}
            >
              {mode === "file" ? "📎 رفع ملف" : "✏️ كتابة نص"}
            </button>
          ))}
        </div>

        {/* File upload mode */}
        {inputMode === "file" && (
          <>
            {pdfUrl && !fileInfo && (
              <div className="mb-3.5 flex items-center gap-3 rounded-xl border-[1.5px] border-primary/20 bg-secondary px-4 py-3.5">
                <Paperclip className="h-6 w-6 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-primary">الملف التعريفي المحفوظ</div>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline"
                  >
                    عرض الملف ↗
                  </a>
                </div>
                <button
                  onClick={onRemoveSavedPdf}
                  className="shrink-0 text-xs font-semibold text-destructive"
                >
                  ✕ إزالة
                </button>
              </div>
            )}

            {(!pdfUrl || fileInfo) && (
              <>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const f = e.dataTransfer.files[0];
                    if (f) processFile(f);
                  }}
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "relative cursor-pointer rounded-xl border-2 border-dashed px-5 py-7 text-center transition-all",
                    isDragging ? "border-primary bg-secondary" : "border-primary/15 bg-muted/40",
                    !fileInfo && "mb-3.5",
                  )}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPTED_FILE_TYPES}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) processFile(f);
                    }}
                  />
                  {fileInfo ? (
                    <CheckCircle2 className="mx-auto mb-2 h-9 w-9 text-primary" />
                  ) : (
                    <FileText className="mx-auto mb-2 h-9 w-9 text-muted-foreground/40" />
                  )}
                  <div className="mb-1 text-sm font-bold text-foreground/80">
                    {fileInfo ? fileInfo.name : "اسحب الملف هنا أو اضغط للرفع"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fileInfo ? fileInfo.size : "الملف التعريفي، التقرير السنوي، أو أي وثيقة تعريفية"}
                  </div>
                  {!fileInfo && (
                    <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                      {FILE_TYPE_BADGES.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-primary/[0.08] px-2 py-0.5 text-xs font-semibold text-primary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {fileInfo && (
                  <div className="mb-3.5 mt-2.5 flex items-center gap-3 rounded-lg border bg-secondary px-3.5 py-2.5">
                    <FileText className="h-6 w-6 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground">{fileInfo.name}</div>
                      <div className="text-xs text-muted-foreground">{fileInfo.size}</div>
                    </div>
                    <button
                      onClick={() => {
                        setFileInfo(null);
                        setFileObj(null);
                      }}
                      className="shrink-0 text-xs font-semibold text-destructive"
                    >
                      ✕ إزالة
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Text input mode */}
        {inputMode === "text" && (
          <div className="mb-3.5">
            <Textarea
              value={assocDesc}
              onChange={(e) => setAssocDesc(e.target.value)}
              placeholder="أكتب هنا نبذة عن الجمعية — مجال عملها، مشاريعها، أهدافها، وجمهورها المستهدف..."
              rows={6}
              className="min-h-[130px] resize-y leading-7"
            />
            <div className="mt-1.5 text-xs text-muted-foreground">
              كلما أضفت تفاصيل أكثر، كان تحليل الذكاء الاصطناعي أدق وأشمل.
            </div>
          </div>
        )}

        <Button
          onClick={onAnalyze}
          disabled={analyzing}
          className="mt-3 h-12 w-full gap-2 bg-gradient-to-br from-green-dark to-green-mid text-sm font-bold"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              يجري التحليل...
            </>
          ) : editing ? (
            <>
              <Sparkles className="h-4 w-4" />
              إعادة التحليل بالذكاء الاصطناعي
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              تحليل الملف بالذكاء الاصطناعي
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
