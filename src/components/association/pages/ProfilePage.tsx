import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AI_ANALYSIS } from "../data";
import { assocProfileDb, contentGenerationsDb } from "@/lib/db";
import type { GeneratedContent } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Props {
  onAnalysisComplete: (name: string, contentCount: number) => void;
  onNavigate: (page: string) => void;
}

interface AnalysisResult {
  summary: string;
  ideas: string[];
  painPoints: string[];
}

export default function ProfilePage({ onAnalysisComplete, onNavigate }: Props) {
  const { user, assocName: savedName, updateAssocName } = useAuth();
  const [assocName, setAssocName] = useState("");
  const [assocDesc, setAssocDesc] = useState("");
  const [savedDesc, setSavedDesc] = useState("");
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; content?: string } | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [logs, setLogs] = useState<
    { text: string; time: string; status: "pending" | "done" | "error" }[]
  >([]);
  const [done, setDone] = useState(false);
  const [editing, setEditing] = useState(false);
  const [aiResult, setAiResult] = useState<AnalysisResult | null>(null);
  const [latestContent, setLatestContent] = useState<GeneratedContent | null>(null);
  const [contentTab, setContentTab] = useState<"post" | "story" | "donation" | "video">("post");
  const [dataLoading, setDataLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  // Track last loaded user id
  const lastLoadedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (savedName) setAssocName(savedName);

    const loadData = async () => {
      if (!user) {
        setDataLoading(false);
        return;
      }

      // If we already loaded for this user, skip
      if (user.id === lastLoadedUserIdRef.current) {
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        const data = await assocProfileDb.get(user.id);

        if (data?.description) {
          let rawDesc = data.description;
          const descMatch =
            data.description.match(/\[وصف إضافي\]:\s*([\s\S]*)$/) ||
            data.description.match(/\[الوصف\]:\s*([\s\S]*)$/);
          if (descMatch) rawDesc = descMatch[1].trim();
          setAssocDesc(rawDesc);
          setSavedDesc(rawDesc);
          if (rawDesc) setInputMode("text");
        }

        if (data?.ai_summary && data?.ai_ideas && data?.ai_pain_points) {
          setAiResult({
            summary: data.ai_summary,
            ideas: data.ai_ideas as string[],
            painPoints: data.ai_pain_points as string[],
          });
          setDone(true);
        }

        if (data?.pdf_url) setPdfUrl(data.pdf_url);

        const generations = await contentGenerationsDb.list(user.id);
        if (generations.length > 0) setLatestContent(generations[0].content);

        lastLoadedUserIdRef.current = user.id;
      } catch (err) {
        console.error("Error loading profile data:", err);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [user, savedName]);

  async function processFile(file: File) {
    const kb = file.size / 1024;
    setFileObj(file);

    let content = "";
    if (file.name.toLowerCase().endsWith(".pdf")) {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        const pdfWorkerUrl = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = "";
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          text += textContent.items.map((item: any) => item.str).join(" ") + "\n";
        }
        content = text;
      } catch (err) {
        console.error("PDF text extraction error:", err);
      }
    } else {
      content = await file.text();
    }

    setInputMode("file");
    setFileInfo({
      name: file.name,
      size: kb > 1024 ? (kb / 1024).toFixed(1) + "MB" : kb.toFixed(0) + "KB",
      content: content.slice(0, 10000),
    });
  }

  async function compressPdf(file: File): Promise<File> {
    const [pdfjsLib, { PDFDocument }] = await Promise.all([
      import("pdfjs-dist"),
      import("pdf-lib"),
    ]);
    const pdfWorkerUrl = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const outDoc = await PDFDocument.create();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const scale = 1.2; // ~86 DPI — readable but compact

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;

      const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.7);
      const jpegBlob = await fetch(jpegDataUrl).then((r) => r.blob());
      const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
      const jpegImage = await outDoc.embedJpg(jpegBytes);
      const pg = outDoc.addPage([viewport.width, viewport.height]);
      pg.drawImage(jpegImage, { x: 0, y: 0, width: viewport.width, height: viewport.height });
    }

    const compressed = await outDoc.save();
    return new File([compressed], file.name, { type: "application/pdf" });
  }

  async function extractBrandFromPdf(pdfUrl: string): Promise<string> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string;
    if (!apiKey) return "";
    try {
      const pdfjsLib = await import("pdfjs-dist");
      const pdfWorkerUrl = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      const arrayBuffer = await (await fetch(pdfUrl)).arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
      const base64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{
            role: "user",
            content: [
              { type: "text", text: "Analyze this charity brochure. Extract concisely in English: primary brand colors (hex if visible), logo style/shape, overall visual style. Under 80 words. Used as DALL-E context." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}`, detail: "low" } },
            ],
          }],
          max_tokens: 150,
        }),
      });
      if (!res.ok) return "";
      return (await res.json()).choices[0]?.message?.content ?? "";
    } catch (err) {
      console.warn("Brand extraction failed:", err);
      return "";
    }
  }

  async function runAIAnalysis(context: string, fileObj?: File | null): Promise<AnalysisResult & { _openaiFileId?: string }> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("VITE_OPENAI_API_KEY غير موجود، سيتم استخدام بيانات تجريبية");
      await new Promise((r) => setTimeout(r, 1500));
      return AI_ANALYSIS;
    }

    try {
      const systemPrompt = `أنت خليل، مساعد ذكاء اصطناعي متخصص في تحليل الجمعيات الخيرية. 
              قم بتحليل النص المقدم أو الملف واستخرج:
              1. ملخص تنفيذي للجمعية (3-4 أسطر).
              2. 4 أفكار تسويقية مبتكرة.
              3. 3 نقاط ضعف أو تحديات إعلامية قد تواجهها الجمعية.
              يجب أن يكون الرد بتنسيق JSON حصراً كالتالي:
              {
                "summary": "...",
                "ideas": ["...", "..."],
                "painPoints": ["...", "..."]
              }`;

      // --- TEXT ONLY (Fast API) ---
      if (!fileObj) {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: context },
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
          }),
        });

        if (res.status === 429) throw new Error("Quota Exceeded");
        if (!res.ok) throw new Error(`فشل الاتصال بـ OpenAI: ${res.status}`);
        const data = await res.json();
        const raw = data.choices[0].message.content;
        const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
        return JSON.parse(clean);
      }

      // --- FILE UPLOAD (Assistants API) ---
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Beta": "assistants=v2",
        "Content-Type": "application/json",
      };

      // 1. Upload File
      addLog("رفع الملف إلى OpenAI Assistants...");
      const formData = new FormData();
      formData.append("purpose", "assistants");
      formData.append("file", fileObj);
      const fileRes = await fetch("https://api.openai.com/v1/files", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      });
      if (!fileRes.ok) throw new Error("فشل رفع الملف إلى خوادم OpenAI");
      const fileId = (await fileRes.json()).id;
      markLastLog("done");

      // 2. Create Assistant
      addLog("إنشاء مساعد ذكاء اصطناعي للتحليل...");
      const asstRes = await fetch("https://api.openai.com/v1/assistants", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: "Khalil Analyst",
          model: "gpt-4o",
          instructions: systemPrompt,
          tools: [{ type: "file_search" }],
          response_format: { type: "json_object" },
        }),
      });
      const assistantId = (await asstRes.json()).id;
      markLastLog("done");

      // 3. Create Thread + Run
      addLog("جاري قراءة الملف وتحليله (قد يستغرق 30 ثانية)...");
      const thRes = await fetch("https://api.openai.com/v1/threads", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: "يرجى تحليل هذا الملف المرفق واستخراج البيانات المطلوبة بصيغة JSON.",
            attachments: [{ file_id: fileId, tools: [{ type: "file_search" }] }],
          }],
        }),
      });
      const threadId = (await thRes.json()).id;

      const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        method: "POST",
        headers,
        body: JSON.stringify({ assistant_id: assistantId }),
      });
      const runId = (await runRes.json()).id;

      // 4. Poll Run
      let runStatus = "queued";
      while (runStatus === "queued" || runStatus === "in_progress") {
        await new Promise((r) => setTimeout(r, 2000));
        const chk = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, { headers });
        runStatus = (await chk.json()).status;
        if (runStatus === "failed") throw new Error("فشل الذكاء الاصطناعي في قراءة الملف");
      }
      markLastLog("done");

      // 5. Get Messages
      const msgsRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, { headers });
      const msgs = await msgsRes.json();
      const lastMsg = msgs.data[0].content[0].text.value;

      // Delete assistant + thread but keep the file — its ID is saved in DB for reuse
      fetch(`https://api.openai.com/v1/assistants/${assistantId}`, { method: "DELETE", headers }).catch(() => {});
      fetch(`https://api.openai.com/v1/threads/${threadId}`, { method: "DELETE", headers }).catch(() => {});

      const cleanMsg = lastMsg
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/, "")
        .replace(/【[^】]*】/g, "") // strip file citation markers
        .trim();
      return { ...JSON.parse(cleanMsg), _openaiFileId: fileId };
    } catch (err) {
      console.error("AI Analysis error:", err);
      toast.error(
        err instanceof Error && err.message.includes("Quota")
          ? "تم تجاوز حد الطلبات للذكاء الاصطناعي. سيتم استخدام بيانات تجريبية."
          : "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي",
      );
      return AI_ANALYSIS;
    }
  }

  function addLog(text: string, status: "pending" | "done" | "error" = "pending") {
    const time = new Date().toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLogs((prev) => [...prev, { text, time, status }]);
  }

  function markLastLog(status: "done" | "error") {
    setLogs((prev) => prev.map((l, i) => (i === prev.length - 1 ? { ...l, status } : l)));
  }

  async function analyzeProfile() {
    if (!user) return;
    const hasInput = inputMode === "file" ? (!!fileInfo || !!pdfUrl) : assocDesc.trim().length > 0;
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
    setDone(false);
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
            console.log(`Compressed: ${(fileObj.size / 1024 / 1024).toFixed(1)}MB → ${(uploadFile.size / 1024 / 1024).toFixed(1)}MB`);
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
          const safeName = assocName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
          const ext = fileObj.name.split(".").pop() || "pdf";
          const fileName = `profiles/${safeName}_${Date.now()}.${ext}`;

          const { error: uploadError } = await supabase.storage.from("images").upload(fileName, uploadFile, {
            cacheControl: "3600",
            upsert: false,
          });

          if (uploadError) {
            console.error("Upload failed:", uploadError);
            markLastLog("error");
            toast.error("فشل رفع الملف إلى قاعدة البيانات. يرجى المحاولة مرة أخرى.");
            return;
          } else {
            const {
              data: { publicUrl },
            } = supabase.storage.from("images").getPublicUrl(fileName);
            finalDesc += `\n[رابط الملف المرفق]: ${publicUrl}`;
            setPdfUrl(publicUrl);
            await assocProfileDb.savePdfUrl(user.id, publicUrl).catch(console.error);
            markLastLog("done");

            // Extract brand identity once and save — reused by ContentPage for free
            addLog("استخراج الهوية البصرية للجمعية...");
            try {
              const brand = await extractBrandFromPdf(publicUrl);
              if (brand) await assocProfileDb.saveBrand(user.id, brand).catch(console.error);
              markLastLog("done");
            } catch {
              markLastLog("done"); // non-fatal
            }
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
        await assocProfileDb.update(user.id, finalDesc);
        setSavedDesc(inputMode === "file" ? (fileInfo?.name ?? "") : assocDesc || savedDesc);
        markLastLog("done");
      } catch (dbErr) {
        console.error("Initial DB save failed:", dbErr);
        markLastLog("error");
      }

      addLog("تحليل البيانات بالذكاء الاصطناعي...");
      const result = await runAIAnalysis(finalDesc, inputMode === "file" ? (compressedFileForAI ?? fileObj) : null);
      const { _openaiFileId, ...aiResult } = result;
      if (_openaiFileId) assocProfileDb.saveOpenAiFileId(user.id, _openaiFileId).catch(console.error);
      setAiResult(aiResult);
      markLastLog("done");

      addLog("حفظ نتائج التحليل في قاعدة البيانات...");
      try {
        await assocProfileDb.update(user.id, finalDesc, aiResult);
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
      setDone(true);
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

  const sc: React.CSSProperties = {
    background: "white",
    borderRadius: 13,
    border: "1px solid rgba(45,122,82,.12)",
    marginBottom: 18,
    overflow: "hidden",
  };
  const scH: React.CSSProperties = {
    padding: "14px 18px",
    borderBottom: "1px solid rgba(45,122,82,.12)",
    display: "flex",
    alignItems: "center",
    gap: 10,
  };
  const inp: React.CSSProperties = {
    width: "100%",
    padding: "10px 13px",
    borderRadius: 8,
    border: "1.5px solid rgba(45,122,82,.12)",
    fontFamily: "'Tajawal','Cairo',sans-serif",
    fontSize: ".93rem",
    color: "#111827",
    outline: "none",
    background: "white",
    transition: "border-color .2s",
  };

  return (
    <div>
      {dataLoading && (
        <div style={{ textAlign: "center", padding: "60px 18px", color: "#9ca3af" }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid rgba(45,122,82,.2)",
              borderTopColor: "#2d7a52",
              borderRadius: "50%",
              margin: "0 auto 14px",
              animation: "spin 1s linear infinite",
            }}
          />
          <div style={{ fontSize: ".85rem" }}>جاري تحميل بيانات الجمعية...</div>
        </div>
      )}

      {!dataLoading && (
        <>
          {/* Saved profile view — shown when AI analysis exists and not re-editing */}
          {done && !editing && (
            <>
              {/* Description card */}
              <div style={sc}>
                <div style={{ ...scH, justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 7,
                        background: "#e8f5ee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: ".95rem",
                      }}
                    >
                      📄
                    </div>
                    <div>
                      <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>
                        ملف الجمعية
                      </div>
                      <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>
                        المحتوى المحفوظ
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      fontSize: ".78rem",
                      padding: "5px 13px",
                      borderRadius: 7,
                      border: "1px solid rgba(45,122,82,.18)",
                      background: "white",
                      color: "#2d7a52",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'Tajawal',sans-serif",
                    }}
                  >
                    ✏️ تعديل
                  </button>
                </div>
                <div style={{ padding: 18 }}>
                  {savedName && (
                    <div
                      style={{
                        fontSize: ".82rem",
                        fontWeight: 700,
                        color: "#374151",
                        marginBottom: 8,
                      }}
                    >
                      🏛 {savedName}
                    </div>
                  )}
                  {savedDesc && (
                    <div
                      style={{
                        fontSize: ".85rem",
                        color: "#374151",
                        lineHeight: 1.75,
                        background: "#f9fafb",
                        borderRadius: 9,
                        padding: "12px 14px",
                        border: "1px solid rgba(45,122,82,.1)",
                      }}
                    >
                      {savedDesc}
                    </div>
                  )}
                </div>
              </div>

              {/* PDF file card */}
              {pdfUrl && (
                <div style={sc}>
                  <div style={{ ...scH, justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 7, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem" }}>
                        📎
                      </div>
                      <div>
                        <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>الملف التعريفي المحفوظ</div>
                        <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>الملف المضغوط المرفوع</div>
                      </div>
                    </div>
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: ".78rem",
                        padding: "5px 13px",
                        borderRadius: 7,
                        border: "1px solid rgba(45,122,82,.18)",
                        background: "linear-gradient(135deg,#e8f5ee,#d4eddf)",
                        color: "#1a5c3a",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'Tajawal',sans-serif",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      👁 عرض الملف
                    </a>
                  </div>
                </div>
              )}

              {/* AI Summary */}
              <div style={sc}>
                <div style={scH}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      background: "#e8f5ee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: ".95rem",
                    }}
                  >
                    ✦
                  </div>
                  <div>
                    <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>
                      ملخص الجمعية
                    </div>
                    <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>
                      تحليل AI للملف التعريفي
                    </div>
                  </div>
                </div>
                <div style={{ padding: 18 }}>
                  <div
                    style={{
                      background: "linear-gradient(135deg,#f0faf5,#e8f5ee)",
                      border: "1px solid rgba(45,122,82,.15)",
                      borderRadius: 11,
                      padding: "16px 18px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: ".7rem",
                        fontWeight: 700,
                        letterSpacing: ".08em",
                        color: "#2d7a52",
                        textTransform: "uppercase",
                        marginBottom: 7,
                      }}
                    >
                      ✦ ملخص تلقائي
                    </div>
                    <div style={{ fontSize: ".88rem", lineHeight: 1.75, color: "#374151" }}>
                      {aiResult?.summary ?? AI_ANALYSIS.summary}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ideas & Pain Points */}
              <div style={sc}>
                <div style={scH}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      background: "#e8f5ee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: ".95rem",
                    }}
                  >
                    💡
                  </div>
                  <div>
                    <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>
                      أفكار وتحديات تسويقية
                    </div>
                    <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>
                      توصيات AI لتحسين الحضور الإعلامي
                    </div>
                  </div>
                </div>
                <div style={{ padding: 18 }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div
                      style={{
                        background: "white",
                        borderRadius: 11,
                        border: "1px solid rgba(45,122,82,.12)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          padding: "11px 13px",
                          borderBottom: "1px solid rgba(45,122,82,.12)",
                          background: "linear-gradient(135deg,#f0faf5,#e8f5ee)",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span>💡</span>
                        <span style={{ fontSize: ".83rem", fontWeight: 700, color: "#111827" }}>
                          أفكار للمحتوى التسويقي
                        </span>
                      </div>
                      <div style={{ padding: "11px 13px" }}>
                        {(aiResult?.ideas ?? AI_ANALYSIS.ideas).map((idea, i, arr) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 7,
                              padding: "6px 0",
                              borderBottom:
                                i < arr.length - 1 ? "1px solid rgba(0,0,0,.04)" : "none",
                              fontSize: ".8rem",
                              color: "#374151",
                              lineHeight: 1.5,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#2d7a52",
                                flexShrink: 0,
                                marginTop: 5,
                              }}
                            />
                            {idea}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div
                      style={{
                        background: "white",
                        borderRadius: 11,
                        border: "1px solid rgba(45,122,82,.12)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          padding: "11px 13px",
                          borderBottom: "1px solid rgba(45,122,82,.12)",
                          background: "linear-gradient(135deg,#fff8f0,#fdeee0)",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span>⚠️</span>
                        <span style={{ fontSize: ".83rem", fontWeight: 700, color: "#111827" }}>
                          تحديات ونقاط ضعف إعلامية
                        </span>
                      </div>
                      <div style={{ padding: "11px 13px" }}>
                        {(aiResult?.painPoints ?? AI_ANALYSIS.painPoints).map((pt, i, arr) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 7,
                              padding: "6px 0",
                              borderBottom:
                                i < arr.length - 1 ? "1px solid rgba(0,0,0,.04)" : "none",
                              fontSize: ".8rem",
                              color: "#374151",
                              lineHeight: 1.5,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#d97706",
                                flexShrink: 0,
                                marginTop: 5,
                              }}
                            />
                            {pt}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated content preview */}
              {latestContent && (
                <div style={sc}>
                  <div style={{ ...scH, justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 7, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem" }}>✍️</div>
                      <div>
                        <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>المحتوى التسويقي المُولَّد</div>
                        <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>آخر جلسة توليد بالذكاء الاصطناعي</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate("content")}
                      style={{ fontSize: ".78rem", padding: "5px 13px", borderRadius: 7, border: "1px solid rgba(45,122,82,.18)", background: "white", color: "#2d7a52", fontWeight: 600, cursor: "pointer", fontFamily: "'Tajawal',sans-serif" }}
                    >
                      عرض الكل ←
                    </button>
                  </div>
                  <div style={{ padding: "12px 18px 18px" }}>
                    {/* Tab bar */}
                    <div style={{ display: "flex", gap: 3, marginBottom: 14, background: "#f2faf6", borderRadius: 9, padding: 3, border: "1px solid rgba(45,122,82,.1)" }}>
                      {([
                        { key: "post", label: "منشور", icon: "📱" },
                        { key: "story", label: "قصة", icon: "✨" },
                        { key: "donation", label: "تبرع", icon: "💚" },
                        { key: "video", label: "سيناريو", icon: "🎬" },
                      ] as const).map(({ key, label, icon }) => (
                        <button
                          key={key}
                          onClick={() => setContentTab(key)}
                          style={{
                            flex: 1, padding: "7px 0", borderRadius: 6, border: "none",
                            background: contentTab === key ? "white" : "transparent",
                            color: contentTab === key ? "#1a5c3a" : "#6b7280",
                            fontWeight: contentTab === key ? 700 : 500,
                            fontSize: ".78rem", cursor: "pointer",
                            fontFamily: "'Tajawal','Cairo',sans-serif",
                            boxShadow: contentTab === key ? "0 1px 4px rgba(45,122,82,.12)" : "none",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                          }}
                        >
                          <span>{icon}</span>{label}
                        </button>
                      ))}
                    </div>
                    {/* Content */}
                    {latestContent[contentTab]?.text ? (
                      <>
                        <div style={{
                          background: "#f9fafb", borderRadius: 9, padding: "12px 14px",
                          border: "1px solid rgba(45,122,82,.1)", fontSize: ".84rem",
                          lineHeight: 1.8, color: "#374151", whiteSpace: "pre-wrap",
                          maxHeight: 160, overflowY: "auto",
                        }}>
                          {latestContent[contentTab].text}
                        </div>
                        {latestContent[contentTab].imageUrl && (
                          <img
                            src={latestContent[contentTab].imageUrl}
                            alt="صورة مُولَّدة"
                            style={{ width: "100%", borderRadius: 9, marginTop: 10, maxHeight: 220, objectFit: "cover" }}
                          />
                        )}
                      </>
                    ) : (
                      <div style={{ textAlign: "center", padding: "22px 0", color: "#9ca3af", fontSize: ".82rem" }}>
                        لم يُولَّد هذا النوع بعد
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Link to content page */}
              <button
                onClick={() => onNavigate("content")}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 18px",
                  borderRadius: 13,
                  border: "1.5px solid rgba(45,122,82,.18)",
                  background: "linear-gradient(135deg,#f0faf5,#e8f5ee)",
                  cursor: "pointer",
                  fontFamily: "'Tajawal','Cairo',sans-serif",
                  transition: "all .2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      boxShadow: "0 1px 6px rgba(45,122,82,.12)",
                    }}
                  >
                    ✍️
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>
                      المحتوى التسويقي
                    </div>
                    <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 2 }}>
                      اعرض وأدر المحتوى المُولَّد بالذكاء الاصطناعي
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: "1.1rem", color: "#2d7a52", opacity: 0.7 }}>←</span>
              </button>
            </>
          )}

          {/* PDF card when no AI yet but file already saved */}
          {(!done || editing) && pdfUrl && (
            <div style={{ ...sc, marginBottom: 14 }}>
              <div style={{ ...scH, justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem" }}>
                    📎
                  </div>
                  <div>
                    <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>الملف التعريفي المحفوظ</div>
                    <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>الملف المضغوط المرفوع</div>
                  </div>
                </div>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: ".78rem",
                    padding: "5px 13px",
                    borderRadius: 7,
                    border: "1px solid rgba(45,122,82,.18)",
                    background: "linear-gradient(135deg,#e8f5ee,#d4eddf)",
                    color: "#1a5c3a",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontFamily: "'Tajawal',sans-serif",
                  }}
                >
                  👁 عرض الملف
                </a>
              </div>
            </div>
          )}

          {/* Upload / Edit section — shown when no analysis yet or re-editing */}
          {(!done || editing) && (
            <div style={sc}>
              <div style={scH}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 7,
                    background: "#e8f5ee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: ".95rem",
                    color: "#2d7a52",
                  }}
                >
                  📤
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#111827" }}>
                    ملف الجمعية التعريفي
                  </div>
                  <div style={{ fontSize: ".76rem", color: "#6b7280", marginTop: 1 }}>
                    ارفع الملف وسيقوم الذكاء الاصطناعي بتحليله وتوليد المحتوى
                  </div>
                </div>
                <span
                  style={{
                    fontSize: ".68rem",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "linear-gradient(135deg,#e8f5ee,#d4eddf)",
                    color: "#1a5c3a",
                    border: "1px solid rgba(45,122,82,.15)",
                  }}
                >
                  ✦ مدعوم بـ AI
                </span>
              </div>
              <div style={{ padding: 18 }}>
                {/* Assoc name */}
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: ".82rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 5,
                    }}
                  >
                    اسم الجمعية
                  </label>
                  <input
                    value={assocName}
                    onChange={(e) => setAssocName(e.target.value)}
                    placeholder="مثال: جمعية تكاتف الخيرية"
                    style={inp}
                  />
                </div>

                {/* Mode toggle */}
                <div
                  style={{
                    display: "flex",
                    background: "#f2faf6",
                    borderRadius: 10,
                    padding: 3,
                    marginBottom: 16,
                    border: "1px solid rgba(45,122,82,.1)",
                  }}
                >
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
                      style={{
                        flex: 1,
                        padding: "9px 0",
                        borderRadius: 7,
                        border: "none",
                        background: inputMode === mode ? "white" : "transparent",
                        color: inputMode === mode ? "#1a5c3a" : "#6b7280",
                        fontWeight: inputMode === mode ? 700 : 500,
                        fontSize: ".85rem",
                        cursor: "pointer",
                        fontFamily: "'Tajawal','Cairo',sans-serif",
                        boxShadow: inputMode === mode ? "0 1px 6px rgba(45,122,82,.12)" : "none",
                        transition: "all .15s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      {mode === "file" ? "📎 رفع ملف" : "✏️ كتابة نص"}
                    </button>
                  ))}
                </div>

                {/* File upload mode */}
                {inputMode === "file" && (
                  <>
                    {/* Show saved PDF when no new file selected */}
                    {pdfUrl && !fileInfo && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "13px 16px", background: "#e8f5ee", borderRadius: 11,
                        border: "1.5px solid rgba(45,122,82,.2)", marginBottom: 14,
                      }}>
                        <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>📎</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#1a5c3a" }}>الملف التعريفي المحفوظ</div>
                          <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: ".73rem", color: "#2d7a52", textDecoration: "underline" }}>
                            عرض الملف ↗
                          </a>
                        </div>
                        <button
                          onClick={() => { setPdfUrl(null); assocProfileDb.savePdfUrl(user!.id, "").catch(() => {}); }}
                          style={{ fontSize: ".73rem", color: "#dc2626", cursor: "pointer", background: "none", border: "none", fontFamily: "'Tajawal',sans-serif", fontWeight: 600, flexShrink: 0 }}
                        >
                          ✕ إزالة
                        </button>
                      </div>
                    )}

                    {/* Dropzone — only when no saved PDF or user wants to replace */}
                    {(!pdfUrl || fileInfo) && <>
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
                      style={{
                        border: `2px dashed ${isDragging ? "#2d7a52" : "rgba(45,122,82,.12)"}`,
                        borderRadius: 11,
                        padding: "28px 20px",
                        textAlign: "center",
                        cursor: "pointer",
                        background: isDragging ? "#e8f5ee" : "#f9fafb",
                        transition: "all .25s",
                        position: "relative",
                        marginBottom: fileInfo ? 0 : 14,
                      }}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) processFile(f);
                        }}
                      />
                      <div
                        style={{ fontSize: "2.2rem", marginBottom: 8, opacity: fileInfo ? 1 : 0.4 }}
                      >
                        {fileInfo ? "✅" : "📄"}
                      </div>
                      <div
                        style={{
                          fontSize: ".9rem",
                          fontWeight: 700,
                          color: "#374151",
                          marginBottom: 4,
                        }}
                      >
                        {fileInfo ? fileInfo.name : "اسحب الملف هنا أو اضغط للرفع"}
                      </div>
                      <div style={{ fontSize: ".78rem", color: "#6b7280" }}>
                        {fileInfo
                          ? fileInfo.size
                          : "الملف التعريفي، التقرير السنوي، أو أي وثيقة تعريفية"}
                      </div>
                      {!fileInfo && (
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            justifyContent: "center",
                            marginTop: 9,
                            flexWrap: "wrap",
                          }}
                        >
                          {["PDF", "Word", "TXT", "JPG/PNG"].map((t) => (
                            <span
                              key={t}
                              style={{
                                fontSize: ".68rem",
                                background: "rgba(45,122,82,.08)",
                                color: "#2d7a52",
                                padding: "2px 8px",
                                borderRadius: 20,
                                fontWeight: 600,
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {fileInfo && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 13px",
                          background: "#e8f5ee",
                          borderRadius: 9,
                          marginBottom: 14,
                          marginTop: 10,
                          border: "1px solid rgba(45,122,82,.12)",
                        }}
                      >
                        <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>📄</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: ".85rem",
                              fontWeight: 600,
                              color: "#111827",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fileInfo.name}
                          </div>
                          <div style={{ fontSize: ".73rem", color: "#6b7280" }}>
                            {fileInfo.size}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setFileInfo(null);
                            setFileObj(null);
                          }}
                          style={{
                            fontSize: ".73rem",
                            color: "#dc2626",
                            cursor: "pointer",
                            background: "none",
                            border: "none",
                            fontFamily: "'Tajawal',sans-serif",
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          ✕ إزالة
                        </button>
                      </div>
                    )}
                    </>}
                  </>
                )}

                {/* Text input mode */}
                {inputMode === "text" && (
                  <div style={{ marginBottom: 14 }}>
                    <textarea
                      value={assocDesc}
                      onChange={(e) => setAssocDesc(e.target.value)}
                      placeholder="أكتب هنا نبذة عن الجمعية — مجال عملها، مشاريعها، أهدافها، وجمهورها المستهدف..."
                      rows={6}
                      style={{ ...inp, resize: "vertical", minHeight: 130, lineHeight: 1.7 }}
                    />
                    <div style={{ fontSize: ".73rem", color: "#9ca3af", marginTop: 5 }}>
                      كلما أضفت تفاصيل أكثر، كان تحليل الذكاء الاصطناعي أدق وأشمل.
                    </div>
                  </div>
                )}

                <Button
                  onClick={analyzeProfile}
                  disabled={analyzing}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 9,
                    background: analyzing
                      ? "rgba(26,92,58,.5)"
                      : "linear-gradient(135deg,#1a5c3a,#2d7a52)",
                    color: "white",
                    border: "none",
                    fontFamily: "'Tajawal',sans-serif",
                    fontSize: ".92rem",
                    fontWeight: 700,
                    marginTop: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {analyzing ? (
                    <>
                      <span
                        style={{ animation: "spin .8s linear infinite", display: "inline-block" }}
                      >
                        ⟳
                      </span>
                      يجري التحليل...
                    </>
                  ) : editing ? (
                    "✦ إعادة التحليل بالذكاء الاصطناعي"
                  ) : (
                    "✦ تحليل الملف بالذكاء الاصطناعي"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Progress steps */}
          {(analyzing || logs.length > 0) && (
            <div
              style={{
                background: "white",
                borderRadius: 13,
                border: "1px solid rgba(45,122,82,.12)",
                marginBottom: 18,
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "13px 18px",
                  background: "linear-gradient(135deg,#f0faf5,#e8f5ee)",
                  borderBottom: "1px solid rgba(45,122,82,.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: ".9rem",
                    boxShadow: "0 1px 4px rgba(45,122,82,.12)",
                  }}
                >
                  {analyzing ? (
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: "2.5px solid rgba(45,122,82,.25)",
                        borderTopColor: "#2d7a52",
                        borderRadius: "50%",
                        animation: "spin .7s linear infinite",
                      }}
                    />
                  ) : logs.some((l) => l.status === "error") ? (
                    "⚠️"
                  ) : (
                    "✦"
                  )}
                </div>
                <div>
                  <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#111827" }}>
                    {analyzing
                      ? "جاري التحليل بالذكاء الاصطناعي..."
                      : logs.some((l) => l.status === "error")
                        ? "حدث خطأ أثناء التحليل"
                        : "اكتمل التحليل بنجاح"}
                  </div>
                  <div style={{ fontSize: ".72rem", color: "#6b7280", marginTop: 1 }}>
                    {logs.filter((l) => l.status === "done").length} / {logs.length} خطوات مكتملة
                  </div>
                </div>
                {/* Progress bar */}
                {logs.length > 0 && (
                  <div style={{ flex: 1, marginRight: "auto", marginLeft: 0 }}>
                    <div
                      style={{
                        height: 5,
                        background: "rgba(45,122,82,.1)",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 99,
                          background: "linear-gradient(90deg,#2d7a52,#4caf7a)",
                          transition: "width .4s ease",
                          width: `${(logs.filter((l) => l.status === "done").length / logs.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              {/* Steps */}
              <div
                style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}
              >
                {logs.map((entry, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Icon */}
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: ".85rem",
                        background:
                          entry.status === "done"
                            ? "#e8f5ee"
                            : entry.status === "error"
                              ? "#fee2e2"
                              : "#f0faf5",
                        border: `2px solid ${entry.status === "done" ? "#2d7a52" : entry.status === "error" ? "#dc2626" : "rgba(45,122,82,.25)"}`,
                        transition: "all .3s",
                      }}
                    >
                      {entry.status === "done" ? (
                        <span style={{ color: "#2d7a52", fontWeight: 700, fontSize: "1rem" }}>
                          ✓
                        </span>
                      ) : entry.status === "error" ? (
                        <span style={{ color: "#dc2626", fontWeight: 700 }}>✕</span>
                      ) : (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#2d7a52",
                            display: "inline-block",
                            animation: "blink 1s ease-in-out infinite",
                          }}
                        />
                      )}
                    </div>
                    {/* Text */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: ".85rem",
                          fontWeight: entry.status === "pending" ? 600 : 500,
                          color:
                            entry.status === "error"
                              ? "#dc2626"
                              : entry.status === "done"
                                ? "#374151"
                                : "#1a5c3a",
                        }}
                      >
                        {entry.text}
                      </div>
                      <div style={{ fontSize: ".71rem", color: "#9ca3af", marginTop: 1 }}>
                        {entry.time}
                      </div>
                    </div>
                    {/* Connector line — all except last */}
                    {i < logs.length - 1 && (
                      <div
                        style={{
                          position: "absolute",
                          right: 34,
                          width: 2,
                          height: 10,
                          background: "rgba(45,122,82,.1)",
                          marginTop: 32,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!analyzing && !done && (
            <div style={{ textAlign: "center", padding: "28px 18px", color: "#9ca3af" }}>
              <div style={{ fontSize: "2rem", marginBottom: 9, opacity: 0.3 }}>✦</div>
              <div style={{ fontSize: ".85rem" }}>
                ارفع الملف التعريفي أو اكتب وصف الجمعية لبدء التحليل
              </div>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
    </div>
  );
}
