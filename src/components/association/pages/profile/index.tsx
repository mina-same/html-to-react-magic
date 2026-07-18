import { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useAssocProfile, useContentGenerations } from "@/api/queries";
import { LoadingState, ErrorState } from "@/components/common/StateViews";

import {
  sc,
  scH,
  iconBadge,
  cardTitle,
  cardSubtitle,
  viewFileLink,
  SPIN_KEYFRAMES,
  parseDescription,
  deriveAiResult,
  humanFileSize,
  sanitizeAssocName,
  nowTime,
  type AnalysisResult,
  type ContentTab,
  type InputMode,
  type FileInfo,
  type LogEntry,
  type GeneratedContent,
} from "./constants";
import {
  useUpdateAssocProfile,
  useSavePdfUrl,
  useSaveBrand,
  useSaveOpenAiFileId,
} from "./mutations";
import { extractFileContent, compressPdf, extractBrandFromPdf, runAIAnalysis } from "./ai";
import AnalysisPanel from "./AnalysisPanel";
import SavedContent from "./SavedContent";
import FileUpload from "./FileUpload";
import ProgressSteps from "./ProgressSteps";

interface Props {
  onAnalysisComplete: (name: string, contentCount: number) => void;
  onNavigate: (page: string) => void;
}

export default function ProfilePage({ onAnalysisComplete, onNavigate }: Props) {
  const { user, assocName: savedName, updateAssocName } = useAuth();
  const assocId = user?.id;

  // ── React Query data layer ───────────────────────────────────────
  const profileQuery = useAssocProfile(assocId);
  const contentQuery = useContentGenerations(assocId);

  const profile = profileQuery.data;
  const derivedAi = useMemo(() => deriveAiResult(profile), [profile]);
  const derivedSavedDesc = useMemo(() => parseDescription(profile?.description), [profile]);
  const savedPdfUrl = profile?.pdf_url ?? null;
  const latestContent: GeneratedContent | null = contentQuery.data?.[0]?.content ?? null;

  // ── Mutations (invalidate the profile cache on success) ──────────
  const updateProfileMut = useUpdateAssocProfile(assocId);
  const savePdfUrlMut = useSavePdfUrl(assocId);
  const saveBrandMut = useSaveBrand(assocId);
  const saveOpenAiFileIdMut = useSaveOpenAiFileId(assocId);

  // ── UI state ─────────────────────────────────────────────────────
  const [assocName, setAssocName] = useState("");
  const [assocDesc, setAssocDesc] = useState("");
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [editing, setEditing] = useState(false);
  const [contentTab, setContentTab] = useState<ContentTab>("post");

  // Overrides set during/after analysis so the UI updates instantly while
  // the invalidated profile query refetches in the background.
  const [aiResultOverride, setAiResultOverride] = useState<AnalysisResult | null | undefined>(
    undefined,
  );
  const [pdfUrlOverride, setPdfUrlOverride] = useState<string | null | undefined>(undefined);
  const [savedDescOverride, setSavedDescOverride] = useState<string | undefined>(undefined);

  // Seed the assoc-name input once the auth profile resolves.
  useEffect(() => {
    if (savedName) setAssocName(savedName);
  }, [savedName]);

  // Seed the description / input mode once per assocId when the profile
  // query resolves (a sync from cache → local editing buffer, not a fetch).
  const seedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!assocId || profileQuery.isLoading) return;
    if (seedRef.current === assocId) return;
    seedRef.current = assocId;
    if (derivedSavedDesc) {
      setAssocDesc(derivedSavedDesc);
      setInputMode("text");
    }
  }, [assocId, profileQuery.isLoading, derivedSavedDesc]);

  // ── Derived display values ───────────────────────────────────────
  const aiResult: AnalysisResult | null = aiResultOverride ?? derivedAi ?? null;
  const pdfUrl: string | null = pdfUrlOverride !== undefined ? pdfUrlOverride : savedPdfUrl;
  const savedDesc: string = savedDescOverride !== undefined ? savedDescOverride : derivedSavedDesc;
  const hasAnalysis = !!aiResult;

  // ── Logging helpers for the progress card ────────────────────────
  function addLog(text: string, status: "pending" | "done" | "error" = "pending") {
    setLogs((prev) => [...prev, { text, time: nowTime(), status }]);
  }
  function markLastLog(status: "done" | "error") {
    setLogs((prev) => prev.map((l, i) => (i === prev.length - 1 ? { ...l, status } : l)));
  }

  // ── File handling ────────────────────────────────────────────────
  async function processFile(file: File) {
    setFileObj(file);
    const content = await extractFileContent(file);
    setInputMode("file");
    setFileInfo({
      name: file.name,
      size: humanFileSize(file.size),
      content: content.slice(0, 10000),
    });
  }

  function handleRemoveSavedPdf() {
    setPdfUrlOverride(null);
    if (assocId) savePdfUrlMut.mutate({ id: assocId, pdfUrl: "" });
  }

  // ── Main analysis pipeline ───────────────────────────────────────
  async function analyzeProfile() {
    if (!user) return;
    const hasInput = inputMode === "file" ? !!fileInfo || !!pdfUrl : assocDesc.trim().length > 0;
    if (!hasInput) {
      toast.error(
        inputMode === "file"
          ? "يرجى رفع الملف التعريفي للجمعية أولاً"
          : "يرجى كتابة نبذة عن الجمعية أولاً",
      );
      return;
    }
    if (!assocName.trim()) {
      toast.error("يرجى إدخال اسم الجمعية أولاً");
      return;
    }

    setAnalyzing(true);
    setEditing(false);
    setLogs([]);

    try {
      addLog("قراءة ومعالجة البيانات...");
      let finalDesc =
        inputMode === "file" && fileInfo
          ? `[اسم الجمعية: ${assocName}]\n[الملف المرفق: ${fileInfo.name}]${fileInfo.content ? `\n${fileInfo.content}` : ""}${pdfUrl ? `\n[رابط الملف]: ${pdfUrl}` : ""}`
          : inputMode === "file" && pdfUrl
            ? `[اسم الجمعية: ${assocName}]\n[رابط الملف المحفوظ]: ${pdfUrl}`
            : `[اسم الجمعية: ${assocName}]\n[الوصف]: ${assocDesc || savedDesc}`;
      markLastLog("done");

      // Only compress/upload if a NEW file was selected
      let compressedFileForAI: File | null = null;
      if (inputMode === "file" && fileObj) {
        addLog("ضغط الملف قبل الرفع...");
        let uploadFile = fileObj;
        try {
          if (fileObj.name.toLowerCase().endsWith(".pdf")) {
            uploadFile = await compressPdf(fileObj);
            console.log(
              `Compressed: ${(fileObj.size / 1024 / 1024).toFixed(1)}MB → ${(uploadFile.size / 1024 / 1024).toFixed(1)}MB`,
            );
          }
          compressedFileForAI = uploadFile;
          markLastLog("done");
        } catch (e) {
          console.warn("Compression failed, uploading original:", e);
          markLastLog("done");
          uploadFile = fileObj;
          compressedFileForAI = fileObj;
        }

        addLog("رفع الملف لقاعدة البيانات...");
        try {
          const safeName = sanitizeAssocName(assocName);
          const ext = fileObj.name.split(".").pop() || "pdf";
          const fileName = `profiles/${safeName}_${Date.now()}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("images")
            .upload(fileName, uploadFile, { cacheControl: "3600", upsert: false });

          if (uploadError) {
            console.error("Upload failed:", uploadError);
            markLastLog("error");
            toast.error("فشل رفع الملف إلى قاعدة البيانات. يرجى المحاولة مرة أخرى.");
            return;
          }
          const {
            data: { publicUrl },
          } = supabase.storage.from("images").getPublicUrl(fileName);
          finalDesc += `\n[رابط الملف المرفق]: ${publicUrl}`;
          setPdfUrlOverride(publicUrl);
          await savePdfUrlMut.mutateAsync({ id: user.id, pdfUrl: publicUrl }).catch(console.error);
          markLastLog("done");

          // Extract brand identity once and save — reused by ContentPage for free
          addLog("استخراج الهوية البصرية للجمعية...");
          try {
            const brand = await extractBrandFromPdf(publicUrl);
            if (brand) await saveBrandMut.mutateAsync({ id: user.id, brand }).catch(console.error);
            markLastLog("done");
          } catch {
            markLastLog("done"); // non-fatal
          }
        } catch (e) {
          console.error("Upload error:", e);
          markLastLog("error");
          toast.error("فشل رفع الملف إلى قاعدة البيانات. يرجى المحاولة مرة أخرى.");
          return;
        }
      }

      addLog("حفظ الملف/النص مبدئياً في قاعدة البيانات...");
      try {
        await updateProfileMut.mutateAsync({ id: user.id, description: finalDesc });
        setSavedDescOverride(
          inputMode === "file" ? (fileInfo?.name ?? "") : assocDesc || savedDesc,
        );
        markLastLog("done");
      } catch (dbErr) {
        console.error("Initial DB save failed:", dbErr);
        markLastLog("error");
      }

      addLog("تحليل البيانات بالذكاء الاصطناعي...");
      const result = await runAIAnalysis(
        finalDesc,
        inputMode === "file" ? (compressedFileForAI ?? fileObj) : null,
        addLog,
        markLastLog,
      );
      const { _openaiFileId, ...aiResultClean } = result;
      if (_openaiFileId)
        saveOpenAiFileIdMut
          .mutateAsync({ id: user.id, fileId: _openaiFileId })
          .catch(console.error);
      setAiResultOverride(aiResultClean);
      markLastLog("done");

      addLog("حفظ نتائج التحليل في قاعدة البيانات...");
      try {
        await updateProfileMut.mutateAsync({
          id: user.id,
          description: finalDesc,
          aiResult: aiResultClean,
        });
        markLastLog("done");
      } catch (dbErr) {
        const msg = dbErr instanceof Error ? dbErr.message : "";
        if (msg.includes("migration 009")) {
          markLastLog("done");
          toast.warning("تم إتمام التحليل — لحفظه برمجياً شغّل migration 009 في Supabase");
        } else {
          console.error("AI results DB save failed:", dbErr);
          markLastLog("error");
        }
      }

      if (assocName.trim() && assocName.trim() !== savedName) {
        addLog("تحديث اسم الجمعية...");
        try {
          await updateAssocName(assocName.trim());
          markLastLog("done");
        } catch {
          markLastLog("error");
        }
      }

      addLog("اكتمل التحليل بنجاح", "done");
      setEditing(false);
      onAnalysisComplete(assocName.trim() || "جمعيتكم", 3);
      toast.success("تم تحليل بيانات الجمعية بنجاح");
    } catch (err) {
      console.error(err);
      markLastLog("error");
      toast.error(err instanceof Error ? err.message : "حدث خطأ أثناء التحليل");
    } finally {
      setAnalyzing(false);
    }
  }

  // ── Loading / error states (no more "stuck loading forever") ─────
  if (profileQuery.isLoading || (assocId && profileQuery.isLoading)) {
    return (
      <div>
        <LoadingState label="جاري تحميل بيانات الجمعية..." />
        <style>{SPIN_KEYFRAMES}</style>
      </div>
    );
  }
  if (profileQuery.isError) {
    return (
      <div>
        <ErrorState message="تعذّر تحميل بيانات الجمعية" onRetry={() => profileQuery.refetch()} />
        <style>{SPIN_KEYFRAMES}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Saved profile view — shown when AI analysis exists and not re-editing */}
      {hasAnalysis && !editing && (
        <>
          <AnalysisPanel
            savedName={savedName}
            savedDesc={savedDesc}
            pdfUrl={pdfUrl}
            aiResult={aiResult}
            onEdit={() => setEditing(true)}
          />
          <SavedContent
            latestContent={latestContent}
            contentTab={contentTab}
            setContentTab={setContentTab}
            onNavigate={onNavigate}
          />
        </>
      )}

      {/* PDF card when no AI yet but file already saved */}
      {(!hasAnalysis || editing) && pdfUrl && (
        <div style={{ ...sc, marginBottom: 14 }}>
          <div style={{ ...scH, justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={iconBadge}>📎</div>
              <div>
                <div style={cardTitle}>الملف التعريفي المحفوظ</div>
                <div style={cardSubtitle}>الملف المضغوط المرفوع</div>
              </div>
            </div>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={viewFileLink}>
              👁 عرض الملف
            </a>
          </div>
        </div>
      )}

      {/* Upload / Edit section — shown when no analysis yet or re-editing */}
      {(!hasAnalysis || editing) && (
        <FileUpload
          assocName={assocName}
          setAssocName={setAssocName}
          inputMode={inputMode}
          setInputMode={setInputMode}
          assocDesc={assocDesc}
          setAssocDesc={setAssocDesc}
          fileInfo={fileInfo}
          setFileInfo={setFileInfo}
          setFileObj={setFileObj}
          pdfUrl={pdfUrl}
          onRemoveSavedPdf={handleRemoveSavedPdf}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          processFile={processFile}
          analyzing={analyzing}
          editing={editing}
          onAnalyze={analyzeProfile}
        />
      )}

      {/* Progress steps */}
      <ProgressSteps analyzing={analyzing} logs={logs} />

      {/* Empty hint */}
      {!analyzing && !hasAnalysis && (
        <div style={{ textAlign: "center", padding: "28px 18px", color: "#9ca3af" }}>
          <div style={{ fontSize: "2rem", marginBottom: 9, opacity: 0.3 }}>✦</div>
          <div style={{ fontSize: ".85rem" }}>
            ارفع الملف التعريفي أو اكتب وصف الجمعية لبدء التحليل
          </div>
        </div>
      )}

      <style>{SPIN_KEYFRAMES}</style>
    </div>
  );
}
