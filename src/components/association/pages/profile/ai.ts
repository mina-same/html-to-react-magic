import { AI_ANALYSIS } from "../../data";
import { toast } from "sonner";
import { AI_SYSTEM_PROMPT, type AnalysisResultWithFileId } from "./constants";

type AddLog = (text: string, status?: "pending" | "done" | "error") => void;
type MarkLastLog = (status: "done" | "error") => void;

/** Extract up to 10 pages of text from a PDF, or the raw text for other files. */
export async function extractFileContent(file: File): Promise<string> {
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
        text += textContent.items.map((item) => ("str" in item ? item.str : "")).join(" ") + "\n";
      }
      return text;
    } catch (err) {
      console.error("PDF text extraction error:", err);
      return "";
    }
  }
  return file.text();
}

/**
 * Rasterise each PDF page to a JPEG and re-embed it, producing a much
 * smaller PDF suitable for upload. The `canvas` property is required by
 * pdfjs-dist's `RenderParameters` (it derives the 2D context from it).
 */
export async function compressPdf(file: File): Promise<File> {
  const [pdfjsLib, { PDFDocument }] = await Promise.all([import("pdfjs-dist"), import("pdf-lib")]);
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
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.7);
    const jpegBlob = await fetch(jpegDataUrl).then((r) => r.blob());
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const jpegImage = await outDoc.embedJpg(jpegBytes);
    const pg = outDoc.addPage([viewport.width, viewport.height]);
    pg.drawImage(jpegImage, { x: 0, y: 0, width: viewport.width, height: viewport.height });
  }

  const compressed = await outDoc.save();
  return new File([compressed as unknown as BlobPart], file.name, { type: "application/pdf" });
}

/** Ask GPT-4o (vision) to describe the brochure's brand identity for later DALL-E use. */
export async function extractBrandFromPdf(pdfUrl: string): Promise<string> {
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
    await page.render({ canvas, canvasContext: canvas.getContext("2d")!, viewport }).promise;
    const base64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this charity brochure. Extract concisely in English: primary brand colors (hex if visible), logo style/shape, overall visual style. Under 80 words. Used as DALL-E context.",
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64}`, detail: "low" },
              },
            ],
          },
        ],
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

/**
 * Run the AI analysis. Text-only input uses the chat completions API; a
 * file upload uses the Assistants API (file_search) and returns the OpenAI
 * file id so it can be reused for later content generation.
 */
export async function runAIAnalysis(
  context: string,
  fileObj: File | null | undefined,
  addLog: AddLog,
  markLastLog: MarkLastLog,
): Promise<AnalysisResultWithFileId> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("VITE_OPENAI_API_KEY غير موجود، سيتم استخدام بيانات تجريبية");
    await new Promise((r) => setTimeout(r, 1500));
    return AI_ANALYSIS as AnalysisResultWithFileId;
  }

  try {
    // --- TEXT ONLY (Fast API) ---
    if (!fileObj) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: AI_SYSTEM_PROMPT },
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
      const clean = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
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
        instructions: AI_SYSTEM_PROMPT,
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
        messages: [
          {
            role: "user",
            content: "يرجى تحليل هذا الملف المرفق واستخراج البيانات المطلوبة بصيغة JSON.",
            attachments: [{ file_id: fileId, tools: [{ type: "file_search" }] }],
          },
        ],
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
      const chk = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers,
      });
      runStatus = (await chk.json()).status;
      if (runStatus === "failed") throw new Error("فشل الذكاء الاصطناعي في قراءة الملف");
    }
    markLastLog("done");

    // 5. Get Messages
    const msgsRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers,
    });
    const msgs = await msgsRes.json();
    const lastMsg = msgs.data[0].content[0].text.value;

    // Delete assistant + thread but keep the file — its ID is saved in DB for reuse
    fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
      method: "DELETE",
      headers,
    }).catch(() => {});
    fetch(`https://api.openai.com/v1/threads/${threadId}`, { method: "DELETE", headers }).catch(
      () => {},
    );

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
    return AI_ANALYSIS as AnalysisResultWithFileId;
  }
}
