import { supabase } from "@/lib/supabase";
import { trackAIUsage } from "@/lib/ai-usage";
import { PROMPTS, type Tab, type StepStatus } from "./constants";

// ── AI helpers ───────────────────────────────────────────────
export async function callAI(
  assocName: string,
  context: string,
  tab: Tab,
  extra: string,
): Promise<{ text: string; visualDesc?: string }> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("VITE_OPENAI_API_KEY غير موجود");

  const system =
    `أنت خبير تسويق رقمي للمنظمات الخيرية. الجمعية: ${assocName}.\n${context}\n` +
    `القواعد: عربية فصيحة خليجية، لا تخترع أرقاماً، hook قوي في البداية.\n` +
    `التنسيق الإلزامي:\n[النص العربي]\nVisual: [English image description only, max 80 words]`;

  const userMsg = extra ? `تعليمات: ${extra}\nنوع المحتوى: ${PROMPTS[tab]}` : PROMPTS[tab];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
      temperature: 0.75,
      max_tokens: 650,
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `OpenAI error ${res.status}`);
  }
  const json = await res.json();
  trackAIUsage("content-generation", "gpt-4o-mini", json.usage?.total_tokens ?? 0);
  const full: string = json.choices[0]?.message?.content ?? "";
  const idx = full.lastIndexOf("Visual:");
  if (idx === -1) return { text: full.trim() };
  return {
    text: full.slice(0, idx).trim(),
    visualDesc: full
      .slice(idx + 7)
      .trim()
      .slice(0, 600),
  };
}

// Generate Arabic TTS via OpenAI — returns ArrayBuffer (MP3)
export async function generateTTS(text: string, apiKey: string): Promise<ArrayBuffer> {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "tts-1",
      voice: "alloy", // works well with Arabic
      input: text,
      speed: 0.95,
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `TTS error ${res.status}`);
  }
  trackAIUsage("tts", "tts-1");
  return res.arrayBuffer();
}

export async function extractBrandFromFileId(fileId: string, apiKey: string): Promise<string> {
  try {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "OpenAI-Beta": "assistants=v2",
      "Content-Type": "application/json",
    };

    const asstRes = await fetch("https://api.openai.com/v1/assistants", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "Brand Extractor",
        model: "gpt-4o",
        instructions:
          "Analyze the attached charity organization brochure. Extract concisely in English: 1) primary brand colors (hex if visible), 2) logo style/shape description, 3) overall visual style and mood. Keep it under 80 words. This will be used as DALL-E context.",
        tools: [{ type: "file_search" }],
      }),
    });
    const assistantId = (await asstRes.json()).id;

    const thRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: "Extract brand identity from this file.",
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

    let status = "queued";
    let runTokens = 0;
    while (status === "queued" || status === "in_progress") {
      await new Promise((r) => setTimeout(r, 2000));
      const chk = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers,
      });
      const run = await chk.json();
      status = run.status;
      runTokens = run.usage?.total_tokens ?? runTokens;
      if (status === "failed") throw new Error("failed");
    }
    trackAIUsage("brand-extraction", "gpt-4o", runTokens);

    const msgsRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers,
    });
    const msgs = await msgsRes.json();
    const brand = msgs.data[0]?.content[0]?.text?.value ?? "";

    fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
      method: "DELETE",
      headers,
    }).catch(() => {});
    fetch(`https://api.openai.com/v1/threads/${threadId}`, { method: "DELETE", headers }).catch(
      () => {},
    );

    return brand
      .replace(/【[^】]*】/g, "")
      .trim()
      .slice(0, 200);
  } catch (err) {
    console.warn("Brand extraction from file ID failed:", err);
    return "";
  }
}

export async function extractBrandFromPdf(pdfUrl: string, apiKey: string): Promise<string> {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    const pdfWorkerUrl = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

    const resp = await fetch(pdfUrl);
    const arrayBuffer = await resp.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d context unavailable");
    // pdfjs-dist v4+ requires the `canvas` property on render parameters.
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
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
                text: "Analyze this charity organization's brochure page. Extract concisely in English: 1) primary brand colors (hex if visible), 2) logo style/shape description, 3) overall visual style and mood. Keep it under 80 words. This will be used as DALL-E context.",
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
    if (!res.ok) throw new Error("vision failed");
    const json = await res.json();
    trackAIUsage("brand-extraction", "gpt-4o", json.usage?.total_tokens ?? 0);
    return json.choices[0]?.message?.content ?? "";
  } catch (err) {
    console.warn("Brand extraction failed:", err);
    return "";
  }
}

export async function callDalle(
  visualDesc: string,
  assocName: string,
  setImgStep: (s: StepStatus, detail: string) => void,
  brandContext?: string,
  onB64Ready?: (base64: string) => Promise<void>,
): Promise<{ url: string; base64?: string }> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("VITE_OPENAI_API_KEY غير موجود");

  const clean = visualDesc
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);
  const brandNote = brandContext ? ` Brand identity: ${brandContext}.` : "";
  const prompt = clean
    ? `Charity organization marketing photo: ${clean}.${brandNote} Professional, warm Gulf atmosphere, no text.`
    : `Charity organization professional marketing photo.${brandNote} Community, warmth, Gulf region, no text.`;

  console.log("[callDalle] prompt length:", prompt.length, "| prompt:", prompt.slice(0, 120));

  for (const model of ["gpt-image-1", "dall-e-3", "dall-e-2"] as const) {
    console.log(`[callDalle] trying model: ${model}`);
    setImgStep("loading", `إرسال الطلب إلى ${model}...`);
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, prompt, n: 1, size: "1024x1024" }),
    });
    console.log(`[callDalle] ${model} → status ${res.status}`);

    if (res.ok) {
      const json = (await res.json()) as {
        data: { url?: string; b64_json?: string }[];
        usage?: { total_tokens?: number };
      };
      trackAIUsage("image-generation", model, json.usage?.total_tokens ?? 0);
      const item = json.data[0];
      console.log(
        `[callDalle] ${model} success — has b64_json: ${!!item.b64_json}, has url: ${!!item.url}`,
      );

      let finalUrl = item.url || "";
      const finalBase64 = item.b64_json || "";

      if (item.b64_json) {
        // Save b64 to DB immediately before upload attempt
        if (onB64Ready) {
          setImgStep("loading", "حفظ الصورة مؤقتاً في قاعدة البيانات...");
          await onB64Ready(item.b64_json).catch((e) =>
            console.warn("[callDalle] onB64Ready failed:", e),
          );
        }
        setImgStep("loading", "جاري رفع الصورة إلى التخزين الدائم...");
        const blob = await fetch(`data:image/png;base64,${item.b64_json}`).then((r) => r.blob());
        const safeName = assocName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
        const fileName = `generated/${safeName}_${Date.now()}.png`;

        // Retry upload up to 3 times with backoff (Supabase may be cold)
        let uploaded = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            if (attempt > 1) {
              setImgStep("loading", `إعادة رفع الصورة... (محاولة ${attempt}/3)`);
              await new Promise((r) => setTimeout(r, attempt * 1500));
            }
            const { error } = await supabase.storage
              .from("images")
              .upload(fileName, blob, { contentType: "image/png" });
            if (!error) {
              const {
                data: { publicUrl },
              } = supabase.storage.from("images").getPublicUrl(fileName);
              finalUrl = publicUrl;
              uploaded = true;
              console.log("[callDalle] Supabase upload OK →", publicUrl);
              break;
            }
            console.warn(`[callDalle] upload attempt ${attempt} failed:`, error.message);
          } catch (uploadErr) {
            console.warn(`[callDalle] upload attempt ${attempt} threw:`, uploadErr);
          }
        }

        if (!uploaded) {
          // Keep finalUrl empty — caller will display from base64 and show warning
          console.warn("[callDalle] all upload attempts failed — b64 fallback only");
          finalUrl = "";
        }
      }

      console.log(
        "[callDalle] returning finalUrl type:",
        finalUrl.startsWith("data:") ? "data URL" : "public URL",
      );
      setImgStep("ok", model);
      return { url: finalUrl, base64: finalBase64 };
    }

    const err = (await res.json().catch(() => ({}))) as {
      error?: { message?: string; code?: string };
    };
    const msg = err.error?.message ?? "";
    console.error(
      `[callDalle] ${model} error ${res.status} — code: ${err.error?.code} — msg: ${msg}`,
    );

    if (
      msg.includes("does not exist") ||
      res.status === 404 ||
      (res.status === 400 && (model === "dall-e-3" || model === "gpt-image-1"))
    ) {
      setImgStep("loading", `${model} غير متاح، جاري المحاولة بنموذج آخر...`);
      continue;
    }

    if (msg.toLowerCase().includes("billing") || err.error?.code === "insufficient_quota") {
      throw new Error("رصيد OpenAI غير كافٍ. يرجى إضافة رصيد (Credits) لحسابك.");
    }

    throw new Error(msg || `خطأ في الصورة (${res.status})`);
  }
  throw new Error("توليد الصور غير متاح في حسابك (تأكد من إضافة رصيد لمفتاح OpenAI)");
}

/** Shared keyframes + hover styles injected once by the orchestrator. */
export const CONTENT_PAGE_STYLES = `
  @keyframes cgSpin    { to { transform: rotate(360deg); } }
  @keyframes cgShimmer { to { background-position: -200% 0; } }
  @keyframes cgFadeUp  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
  .cg-si:hover:not([data-sel=true]):not([data-tmp=true]) { background:#f8fafc !important; }
  .cg-tab:hover:not([data-active=true]) { color:#0f172a !important; }
  .cg-ghost:hover:not(:disabled) { background:#f0fdf4 !important; border-color:#bbf7d0 !important; color:#166534 !important; }
  .cg-outline:hover:not(:disabled) { background:#f8fafc !important; border-color:#cbd5e1 !important; }
  .cg-imgbtn:hover:not(:disabled) { background:#e7f5ec !important; border-color:#86efac !important; }
  .cg-send:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(5,150,105,.35) !important; }
  .cg-send:active:not(:disabled) { transform:translateY(0); }
  .cg-newbtn:hover { background:#059669 !important; color:#fff !important; }
  .cg-composer:focus-within { border-color:#10b981 !important; box-shadow:0 0 0 4px rgba(16,185,129,.1) !important; }
`;
