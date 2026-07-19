import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useContentGenerations, useAssocProfile } from "@/api/queries";
import { keys } from "@/api/keys";
import { associationsDb, contentGenerationsDb, assocProfileDb } from "@/lib/db";
import type { GeneratedContent, ContentGeneration, GeneratedContentItem } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import VideoEditorModal from "@/components/association/modals/VideoEditorModal";
import LogoTab from "@/components/association/pages/LogoTab";
import type { LogoAnimation, LogoPosition } from "@/remotion/logoAnimations";
import type { TransitionStyle } from "@/remotion/brandUtils";

import {
  TABS,
  IMAGE_TABS,
  EMPTY,
  LS_KEY,
  TEMP_ID,
  Spin,
  StepTracker,
  Skeleton,
  fmtDate,
  getDisplayableImage,
  textToSlides,
  wrapText,
  generateAmbientMusic,
  type Tab,
  type ContentKey,
  type Step,
  type StepStatus,
} from "./constants";
import {
  callAI,
  generateTTS,
  extractBrandFromFileId,
  extractBrandFromPdf,
  callDalle,
  CONTENT_PAGE_STYLES,
} from "./ai";
import ContentHistory from "./ContentHistory";
import ImageTabContent from "./ImageTabContent";
import VideoTab from "./VideoTab";

// ── Types ────────────────────────────────────────────────────
interface Props {
  assocName?: string;
}

/** Local query for association contact fields (phone / email / region). */
function useAssociationContact(assocId: string | undefined) {
  return useQuery({
    queryKey: ["assoc", assocId ?? "", "contact"],
    queryFn: () => associationsDb.get(assocId as string),
    enabled: !!assocId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 3,
    refetchOnWindowFocus: true,
  });
}

/** Race a promise against a timeout — used so DB writes never block completion. */
function raceTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

export default function ContentPage({ assocName = "الجمعية" }: Props) {
  const { user } = useAuth();
  const assocId = user?.id;

  const qc = useQueryClient();
  const contentKey = keys.content(assocId ?? "");

  // ── React Query data layer ────────────────────────────────
  const profileQ = useAssocProfile(assocId);
  const contentQ = useContentGenerations(assocId);
  const contactQ = useAssociationContact(assocId);

  const profile = profileQ.data;
  const history: ContentGeneration[] = contentQ.data ?? [];
  const contact = contactQ.data;

  // Derived (read-only) profile fields — no hand-rolled loading state.
  const context = profile?.description ?? "";
  const pdfUrl = profile?.pdf_url ?? null;
  const openaiFileId = profile?.openai_file_id ?? null;
  const assocRegion = contact?.region ?? "";
  const assocPhone = contact?.phone ?? "";
  const assocEmail = contact?.email ?? "";

  // ── Mutations: content generations create / update / prompt ──
  const createGen = useMutation({
    mutationFn: (v: { assocId: string; prompt: string; content: GeneratedContent }) =>
      contentGenerationsDb.create(v.assocId, v.prompt, v.content),
    onSuccess: () => qc.invalidateQueries({ queryKey: contentKey }),
  });
  const updateGen = useMutation({
    mutationFn: (v: { id: number; content: GeneratedContent }) =>
      contentGenerationsDb.update(v.id, v.content),
    onSuccess: () => qc.invalidateQueries({ queryKey: contentKey }),
  });
  const updatePromptGen = useMutation({
    mutationFn: (v: { id: number; prompt: string }) =>
      contentGenerationsDb.updatePrompt(v.id, v.prompt),
    onSuccess: () => qc.invalidateQueries({ queryKey: contentKey }),
  });

  // ── Local UI / draft state ────────────────────────────────
  const [tab, setTab] = useState<Tab>("post");
  const [content, setContent] = useState<GeneratedContent>(EMPTY);
  const [loading, setLoading] = useState<Tab | "all" | null>(null);
  const [prompt, setPrompt] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [imgLoading, setImgLoading] = useState<Tab | null>(null);
  const [images, setImages] = useState<Partial<Record<Tab, string>>>({});
  const [sidebar, setSidebar] = useState(true);
  const [steps, setSteps] = useState<Step[]>([]);
  const [brandContext, setBrandContext] = useState<string>("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0); // 0-100
  const [audioDurationSec, setAudioDurationSec] = useState(0);
  const [videoEditorOpen, setVideoEditorOpen] = useState(false);
  // logo overlay state (persisted in localStorage via LogoTab)
  const [logoOverlayUrl, setLogoOverlayUrl] = useState<string>(
    () => localStorage.getItem("saaid_logo_overlay_url") ?? "",
  );
  const [logoAnimation, setLogoAnimation] = useState<LogoAnimation>(
    () => (localStorage.getItem("saaid_logo_animation") as LogoAnimation | null) ?? "bounce",
  );
  const [logoPosition, setLogoPosition] = useState<LogoPosition>(
    () => (localStorage.getItem("saaid_logo_position") as LogoPosition | null) ?? "topRight",
  );
  // optimistic placeholder row shown in the sidebar while a create is in-flight
  const [optimisticTemp, setOptimisticTemp] = useState<ContentGeneration | null>(null);

  // ── Step helpers ──────────────────────────────────────────
  const initSteps = useCallback((labels: string[]) => {
    setSteps(
      labels.map((label, i) => ({
        label,
        status: (i === 0 ? "loading" : "waiting") as StepStatus,
      })),
    );
  }, []);

  const markStep = useCallback((index: number, status: StepStatus, detail?: string) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, status, detail } : s)));
  }, []);

  // Mark step[i] ok and step[i+1] loading in one update
  const advanceStep = useCallback((index: number, detail?: string) => {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i === index) return { ...s, status: "ok", detail };
        if (i === index + 1) return { ...s, status: "loading" };
        return s;
      }),
    );
  }, []);

  // ── Sync mutable brand context from the (cached) profile ──
  useEffect(() => {
    if (profile?.ai_brand) setBrandContext(profile.ai_brand);
  }, [profile?.ai_brand]);

  // ── Reset audio duration when the audio URL changes ────────
  useEffect(() => {
    setAudioDurationSec(0);
  }, [content.video.audioUrl]);

  // ── Restore draft from localStorage (UI sync, not data fetch) ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const {
        content: c,
        prompt: p,
        id,
      } = JSON.parse(raw) as {
        content?: GeneratedContent;
        prompt?: string;
        id?: number;
      };
      if (c) {
        setContent(c);
        const imgs: Partial<Record<Tab, string>> = {};
        (["post", "story", "donation", "video"] as ContentKey[]).forEach((k) => {
          const img = getDisplayableImage(c[k]);
          if (img) imgs[k] = img;
        });
        setImages(imgs);
      }
      if (p) setPrompt(p);
      if (id && id > 0) setActiveId(id);
    } catch {
      /* corrupt cache */
    }
  }, []);

  // ── Load the most recent generation when the list arrives ──
  // (mirrors the original "first item if no LS cache" behaviour)
  useEffect(() => {
    if (!contentQ.data || contentQ.data.length === 0) return;
    if (localStorage.getItem(LS_KEY)) return; // LS draft takes priority
    setActiveId((current) => {
      if (current !== null) return current; // already editing something
      const item = contentQ.data![0];
      setPrompt(item.prompt);
      setContent(item.content);
      const imgs: Partial<Record<Tab, string>> = {};
      (["post", "story", "donation", "video"] as ContentKey[]).forEach((k) => {
        const img = getDisplayableImage(item.content[k]);
        if (img) imgs[k] = img;
      });
      setImages(imgs);
      return item.id;
    });
  }, [contentQ.data]);

  const persist = useCallback((c: GeneratedContent, p: string, id: number | null) => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ content: c, prompt: p, id: id && id > 0 ? id : null }),
    );
  }, []);

  const startNew = () => {
    setContent(EMPTY);
    setPrompt("");
    setActiveId(null);
    setImages({});
    setSteps([]);
    localStorage.removeItem(LS_KEY);
  };

  const loadItem = (item: ContentGeneration) => {
    setActiveId(item.id);
    setPrompt(item.prompt);
    setContent(item.content);
    setSteps([]);
    const imgs: Partial<Record<Tab, string>> = {};
    (["post", "story", "donation", "video"] as ContentKey[]).forEach((k) => {
      const img = getDisplayableImage(item.content[k]);
      if (img) imgs[k] = img;
    });
    setImages(imgs);
    persist(item.content, item.prompt, item.id);
  };

  // ── Generate ──────────────────────────────────────────────
  async function generate(which: Tab | "all", regen = false) {
    if (which === "logo") return; // logo tab has no AI generation
    if (!assocId) return;
    if (!context) {
      toast.error("أكمل ملف الجمعية أولاً");
      return;
    }

    const startingId = activeId;
    const isNew = startingId === null || startingId === TEMP_ID;
    const tabLabel = which === "all" ? "4 أنواع" : (TABS.find((t) => t.key === which)?.label ?? "");

    initSteps([
      isNew && !regen ? "إنشاء سجل فارغ" : "حفظ البرومت",
      `توليد ${tabLabel} بالذكاء الاصطناعي`,
      "حفظ المحتوى في قاعدة البيانات",
      "اكتمل التوليد",
    ]);
    setLoading(which);

    let currentId = startingId;

    try {
      // Step 0: Create DB record first (if new)
      if (isNew && !regen) {
        setOptimisticTemp({
          id: TEMP_ID,
          prompt: prompt.trim() || "توليد عام",
          content: EMPTY,
          createdAt: new Date().toISOString(),
          tokensUsed: 0,
        });
        let saved: ContentGeneration | null = null;
        let createErr: string | null = null;
        try {
          saved = await createGen.mutateAsync({
            assocId,
            prompt: prompt.trim() || "توليد عام",
            content: EMPTY,
          });
        } catch (dbErr) {
          createErr = dbErr instanceof Error ? dbErr.message : String(dbErr);
          console.error("[generate] DB create failed:", createErr);
        }

        setOptimisticTemp(null);

        if (saved) {
          currentId = saved.id;
          setActiveId(saved.id);
          persist(EMPTY, prompt, saved.id);
          advanceStep(0, `سجل #${saved.id}`);
        } else {
          markStep(0, "error", createErr ?? "فشل إنشاء السجل");
          toast.error(`فشل حفظ الجلسة في قاعدة البيانات: ${createErr ?? "خطأ غير معروف"}`);
          return;
        }
      } else {
        // Existing record: only update prompt in DB if it actually changed
        const promptToSave = prompt.trim() || "توليد عام";
        const savedPrompt = history.find((h) => h.id === currentId)?.prompt ?? "";
        if (promptToSave !== savedPrompt) {
          try {
            const mutP = updatePromptGen.mutateAsync({
              id: currentId as number,
              prompt: promptToSave,
            });
            mutP.catch(() => {}); // swallow if timeout wins
            await raceTimeout(mutP, 5000);
            advanceStep(0, "تم حفظ البرومت");
          } catch {
            // Don't block generation on prompt-save failure
            advanceStep(0, "البرومت محلي فقط");
          }
        } else {
          advanceStep(0, "البرومت لم يتغير");
        }
      }

      // Step 1: AI call
      let next: GeneratedContent;
      if (which === "all") {
        const keysList: ContentKey[] = ["post", "story", "donation", "video"];
        const results = await Promise.all(
          keysList.map((k) => callAI(assocName, context, k, prompt)),
        );
        next = { ...EMPTY };
        keysList.forEach((k, i) => {
          next[k] = {
            ...results[i],
            imageUrl: content[k]?.imageUrl,
            imageBase64: content[k]?.imageBase64,
          };
        });
        setImages({});
      } else {
        // `which` is narrowed to ContentKey here (logo guarded, "all" handled above)
        const result = await callAI(assocName, context, which, prompt);
        const prevItem = content[which];
        next = {
          ...content,
          [which]: {
            ...result,
            imageUrl: prevItem?.imageUrl,
            imageBase64: prevItem?.imageBase64,
          },
        };
        setImages((prev) => {
          const n = { ...prev };
          delete n[which];
          return n;
        });
      }
      setContent(next);
      advanceStep(1, "تم التوليد");

      // Step 2: DB Update (8s timeout — never blocks completion)
      if (currentId && currentId > 0) {
        try {
          const mutP = updateGen.mutateAsync({ id: currentId as number, content: next });
          mutP.catch(() => {}); // swallow if timeout wins
          await raceTimeout(mutP, 8000);
          persist(next, prompt, currentId);
          advanceStep(2, "تم الحفظ");
        } catch (dbErr) {
          console.error(
            "[generate] DB update failed:",
            dbErr instanceof Error ? dbErr.message : dbErr,
          );
          persist(next, prompt, currentId);
          markStep(2, "warn", `فشل الحفظ - ${dbErr instanceof Error ? dbErr.message : "خطأ"}`);
        }
      } else {
        persist(next, prompt, null);
        markStep(2, "warn", "محفوظ محلياً فقط");
      }

      // Step 3: complete
      markStep(3, "ok");
      toast.success(which === "all" ? "تم توليد المحتوى الكامل!" : `تم توليد ${tabLabel}!`);

      // Auto-generate TTS in background for video tab
      const videoNeedsAudio =
        (which === "video" || which === "all") &&
        next.video?.text &&
        !next.video?.audioUrl &&
        currentId &&
        currentId > 0;
      if (videoNeedsAudio) {
        generateTTSAndSave(next.video.text, currentId as number, next).catch(console.error);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطأ غير معروف";
      setSteps((prev) =>
        prev.map((s) => (s.status === "loading" ? { ...s, status: "error", detail: msg } : s)),
      );
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  }

  // ── Generate image ─────────────────────────────────────────
  async function genImage() {
    if (tab === "logo") return;
    const tabKey: ContentKey = tab; // narrowed: tab is not "logo" here
    const item = content[tabKey];
    const desc = item.visualDesc;
    if (!desc) {
      toast.error("لا يوجد وصف بصري — ولّد المحتوى النصي أولاً");
      return;
    }

    const stepLabels =
      (openaiFileId || pdfUrl) && !brandContext
        ? ["إعداد الوصف", "استخراج الهوية البصرية من الملف", "توليد الصورة", "حفظ في السجل"]
        : ["إعداد الوصف", "توليد الصورة", "حفظ في السجل"];

    initSteps(stepLabels);
    setImgLoading(tab);

    try {
      // Wake up Supabase before long AI call
      // Wake up Supabase before long AI call (PromiseLike — use two-arg then, no .catch)
      void supabase
        .from("content_generations")
        .select("id")
        .limit(1)
        .then(
          () => {},
          () => {},
        );
      advanceStep(0, "الوصف جاهز");

      let activeBrand = brandContext;
      if (!activeBrand && (openaiFileId || pdfUrl)) {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string;
        if (apiKey) {
          // Prefer saved OpenAI file ID (no re-upload) over re-downloading from Supabase
          activeBrand = openaiFileId
            ? await extractBrandFromFileId(openaiFileId, apiKey)
            : await extractBrandFromPdf(pdfUrl!, apiKey);
          if (activeBrand) {
            setBrandContext(activeBrand);
            if (assocId) assocProfileDb.saveBrand(assocId, activeBrand).catch(console.error);
          }
        }
        advanceStep(
          1,
          activeBrand ? "تم استخراج الهوية البصرية" : "تعذّر الاستخراج، سيتم التوليد بدونه",
        );
      }

      const imgStepIdx = stepLabels.length - 2;
      const { url, base64 } = await callDalle(
        desc,
        assocName,
        (status, detail) => {
          setSteps((prev) => prev.map((s, i) => (i === imgStepIdx ? { ...s, status, detail } : s)));
        },
        activeBrand,
        activeId && activeId > 0
          ? async (b64) => {
              const interim: GeneratedContent = {
                ...content,
                [tabKey]: { ...content[tabKey], imageUrl: "", imageBase64: b64 },
              };
              await updateGen.mutateAsync({ id: activeId as number, content: interim });
              setContent(interim);
            }
          : undefined,
      );

      const uploadedToCloud = !!url;
      console.log("✅ image generated — cloud:", uploadedToCloud, "url:", url?.slice(0, 60));

      // If storage upload failed, display from base64 but don't store data URL in DB
      const displaySrc = url || (base64 ? `data:image/png;base64,${base64}` : "");
      const next: GeneratedContent = {
        ...content,
        [tabKey]: {
          ...content[tabKey],
          imageUrl: uploadedToCloud ? url : "",
          imageBase64: uploadedToCloud ? "" : base64 || "", // clear b64 once cloud URL exists
        },
      };
      setContent(next);
      if (displaySrc) setImages((prev) => ({ ...prev, [tab]: displaySrc }));
      advanceStep(imgStepIdx, uploadedToCloud ? "تم الرفع" : "محلي فقط — التحميل فشل");

      const dbStepIdx = imgStepIdx + 1;
      if (activeId && activeId > 0) {
        try {
          await updateGen.mutateAsync({ id: activeId as number, content: next });
          persist(next, prompt, activeId);
          markStep(
            dbStepIdx,
            uploadedToCloud ? "ok" : "warn",
            uploadedToCloud ? `السجل #${activeId}` : "الصورة b64 محلياً — أعد التوليد لرفعها",
          );
        } catch (dbErr) {
          console.warn("DB Update failed/timeout on genImage", dbErr);
          persist(next, prompt, activeId);
          markStep(dbStepIdx, "warn", "فشل الحفظ في DB — محفوظ محلياً");
        }
      } else {
        persist(next, prompt, null);
        markStep(dbStepIdx, "warn", "محفوظة محلياً فقط");
      }

      toast.success(
        uploadedToCloud ? "تم توليد الصورة وحفظها!" : "تم التوليد — الصورة مؤقتة (فشل الرفع)",
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطأ في الصورة";
      setSteps((prev) =>
        prev.map((s) => (s.status === "loading" ? { ...s, status: "error", detail: msg } : s)),
      );
      toast.error(msg);
    } finally {
      setImgLoading(null);
    }
  }

  // ── TTS: generate audio + upload to Supabase + save to DB ───
  async function generateTTSAndSave(
    text: string,
    recordId: number,
    currentContent: GeneratedContent,
  ) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string;
    console.log(
      "[TTS] starting, apiKey present:",
      !!apiKey,
      "text length:",
      text.length,
      "recordId:",
      recordId,
    );
    if (!apiKey) {
      console.error("[TTS] no API key");
      return;
    }
    try {
      toast.info("جاري توليد الصوت...", { duration: 3000 });
      console.log("[TTS] calling OpenAI TTS...");
      const buffer = await generateTTS(text, apiKey);
      console.log("[TTS] got buffer size:", buffer.byteLength);
      const blob = new Blob([buffer], { type: "audio/mpeg" });
      const safeAssoc = (assocName ?? "assoc").replace(/\s+/g, "_").slice(0, 20);
      const fileName = `audio/${safeAssoc}_${recordId}_${Date.now()}.mp3`;
      const { error: upErr } = await supabase.storage
        .from("images")
        .upload(fileName, blob, { contentType: "audio/mpeg", upsert: true });
      if (upErr) {
        console.error("TTS upload failed:", upErr.message);
        return;
      }
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
      const audioUrl = urlData?.publicUrl ?? "";
      if (!audioUrl) return;
      const next: GeneratedContent = {
        ...currentContent,
        video: { ...currentContent.video, audioUrl },
      };
      console.log("[TTS] saving to DB, recordId:", recordId);
      try {
        const mutP = updateGen.mutateAsync({ id: recordId, content: next });
        mutP.catch(() => {});
        await raceTimeout(mutP, 8000);
        console.log("[TTS] DB save ok");
      } catch (dbErr) {
        console.error("[TTS] DB save failed:", dbErr);
      }
      setContent(next);
      persist(next, prompt, recordId);
      toast.success("تم توليد الصوت وحفظه! 🔊");
    } catch (e) {
      console.error("[TTS] failed:", e instanceof Error ? e.message : e);
      toast.error("فشل توليد الصوت — تحقق من الـ console");
    }
  }

  // ── Save edited video text from VideoEditorModal ──────────
  async function handleVideoEditorSave(newText: string, slideFrames: number[], showLogo: boolean) {
    const textChanged = newText !== content.video.text;
    const next: GeneratedContent = {
      ...content,
      video: {
        ...content.video,
        text: newText,
        slideFrames,
        showLogo,
        // clear audio only if text changed (needs re-TTS)
        audioUrl: textChanged ? undefined : content.video.audioUrl,
      },
    };
    setContent(next);
    persist(next, prompt, activeId);
    if (activeId && activeId > 0) {
      updateGen.mutate({ id: activeId, content: next });
      if (textChanged) {
        generateTTSAndSave(newText, activeId, next).catch(console.error);
      }
    }
    toast.success("تم حفظ التعديلات!");
  }

  // ── Download image ────────────────────────────────────────
  async function downloadImage(url: string, name = "generated-image.png") {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const obj = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = obj;
      a.download = name;
      a.click();
      URL.revokeObjectURL(obj);
    } catch {
      toast.error("فشل تنزيل الصورة");
    }
  }

  // ── Render video (canvas + MediaRecorder) ─────────────────
  async function renderVideo() {
    if (!content.video.text) {
      toast.error("يجب توليد نص الفيديو أولاً");
      return;
    }
    if (!activeId || activeId <= 0) {
      toast.error("يجب حفظ المحتوى في قاعدة البيانات أولاً");
      return;
    }

    setVideoLoading(true);
    setVideoProgress(0);

    initSteps([
      "إنشاء الفيديو في المتصفح...",
      "رفع الفيديو للسحابة...",
      "حفظ في قاعدة البيانات...",
      "اكتمل",
    ]);

    try {
      const W = 1080,
        H = 1080,
        FPS = 30;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // Pre-load background image
      let bgImg: HTMLImageElement | null = null;
      const bgUrl = images["video"] || images["post"] || images["story"] || images["donation"];
      if (bgUrl && !bgUrl.startsWith("data:")) {
        try {
          bgImg = new Image();
          bgImg.crossOrigin = "anonymous";
          await new Promise<void>((res) => {
            bgImg!.onload = () => res();
            bgImg!.onerror = () => {
              bgImg = null;
              res();
            };
            bgImg!.src = bgUrl;
          });
        } catch {
          bgImg = null;
        }
      }

      // Load Arabic font
      const font = new FontFace(
        "Tajawal",
        "url(https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1l7A.woff2)",
      );
      try {
        await font.load();
        document.fonts.add(font);
      } catch {
        /* fallback */
      }

      // ── Load + setup audio (TTS + ambient music) ─────────────
      let audioCtx: AudioContext | null = null;
      let audioDuration = 0;
      let audioSource: AudioBufferSourceNode | null = null;
      let musicSource: AudioBufferSourceNode | null = null;
      let combinedStream: MediaStream | undefined;
      const audioUrl = content.video.audioUrl;

      const slides0 = textToSlides(content.video.text);
      const estimatedDuration = (slides0.length * 90 + 60) / FPS;

      try {
        audioCtx = new AudioContext();
        const dest = audioCtx.createMediaStreamDestination();

        // TTS
        if (audioUrl) {
          try {
            const ab = await fetch(audioUrl).then((r) => r.arrayBuffer());
            const tsBuf = await audioCtx.decodeAudioData(ab);
            audioDuration = tsBuf.duration;
            audioSource = audioCtx.createBufferSource();
            audioSource.buffer = tsBuf;
            const ttsGain = audioCtx.createGain();
            ttsGain.gain.value = 1.0;
            audioSource.connect(ttsGain);
            ttsGain.connect(dest);
            ttsGain.connect(audioCtx.destination);
          } catch (e) {
            console.warn("TTS load failed:", e);
          }
        }

        // Ambient music
        const musicDuration = audioDuration > 0 ? audioDuration + 2 : estimatedDuration + 2;
        const musicBuf = generateAmbientMusic(audioCtx, musicDuration);
        musicSource = audioCtx.createBufferSource();
        musicSource.buffer = musicBuf;
        const musicGain = audioCtx.createGain();
        musicGain.gain.value = audioUrl ? 0.32 : 0.62;
        musicSource.connect(musicGain);
        musicGain.connect(dest);

        const videoTrack = canvas.captureStream(FPS).getVideoTracks()[0];
        const audioTrack = dest.stream.getAudioTracks()[0];
        combinedStream = new MediaStream([videoTrack, audioTrack]);
      } catch (e) {
        console.warn("Audio setup failed, recording without audio:", e);
        audioCtx = null;
        musicSource = null;
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recordStream = combinedStream ?? canvas.captureStream(FPS);
      const recorder = new MediaRecorder(recordStream, { mimeType, videoBitsPerSecond: 5_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const done = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
      });

      recorder.start(100);
      if (audioSource && audioCtx) audioSource.start(0);
      if (musicSource && audioCtx) musicSource.start(0);
      advanceStep(0);

      const name = assocName ?? "الجمعية";
      const initial = name[0] || "ج";
      const slides = textToSlides(content.video.text);
      const SLIDE_F = 90;
      const OUTRO_F = 60;
      const slidesTotal = slides.length * SLIDE_F;
      const dynamicTotal =
        audioCtx && audioDuration > 0 ? Math.ceil(audioDuration * FPS) + 30 : slidesTotal + OUTRO_F;
      const TOTAL = Math.max(dynamicTotal, 120);

      function easeInOut(t: number) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      }
      function clamp01(v: number) {
        return Math.max(0, Math.min(1, v));
      }

      await new Promise<void>((resolve) => {
        let frame = 0;
        function drawFrame() {
          // ── Global alpha ──────────────────────────────────────
          const exitOp = frame > TOTAL - 20 ? clamp01((TOTAL - frame) / 20) : 1;
          const headerOp = clamp01(frame / 20);

          // ── Which slide ───────────────────────────────────────
          const rawSlideIdx = Math.floor(frame / SLIDE_F);
          const slideIdx = Math.min(rawSlideIdx, slides.length - 1);
          const slideFrame = frame - slideIdx * SLIDE_F;
          const fadeIn = clamp01(slideFrame / 18);
          const fadeOut = slideFrame > 72 ? clamp01((90 - slideFrame) / 18) : 1;
          const slideOp = Math.min(fadeIn, fadeOut);
          const slideY = (1 - easeInOut(clamp01(slideFrame / 18))) * 28;
          const slide = slides[slideIdx] ?? { line: content.video.text, icon: "✨" };

          // ── Background ────────────────────────────────────────
          ctx.globalAlpha = exitOp;
          const grad = ctx.createLinearGradient(0, 0, W, H);
          grad.addColorStop(0, "#0f3d26");
          grad.addColorStop(0.55, "#1a5c3a");
          grad.addColorStop(1, "#0d3322");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
          if (bgImg) {
            ctx.globalAlpha = exitOp * 0.18;
            ctx.drawImage(bgImg, 0, 0, W, H);
          }

          // ── Gold top bar ──────────────────────────────────────
          ctx.globalAlpha = headerOp * exitOp;
          const barG = ctx.createLinearGradient(0, 0, W, 0);
          barG.addColorStop(0, "#c9a84c");
          barG.addColorStop(0.5, "#e8c96e");
          barG.addColorStop(1, "#c9a84c");
          ctx.fillStyle = barG;
          ctx.fillRect(0, 0, W, 10);

          // ── Header: avatar + name ─────────────────────────────
          ctx.globalAlpha = headerOp * exitOp;
          // Avatar
          const avG = ctx.createLinearGradient(60, 36, 124, 100);
          avG.addColorStop(0, "#c9a84c");
          avG.addColorStop(1, "#e8c96e");
          ctx.fillStyle = avG;
          ctx.beginPath();
          ctx.roundRect(60, 36, 64, 64, 15);
          ctx.fill();
          ctx.fillStyle = "#1a5c3a";
          ctx.font = "bold 30px Tajawal, Cairo, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(initial, 92, 68);
          // Name
          ctx.fillStyle = "white";
          ctx.font = "bold 36px Tajawal, Cairo, sans-serif";
          ctx.textAlign = "right";
          ctx.textBaseline = "alphabetic";
          ctx.fillText(name, W - 60, 82);
          ctx.fillStyle = "rgba(201,168,76,0.65)";
          ctx.font = "500 20px Tajawal, Cairo, sans-serif";
          ctx.fillText("ساعِد · SAAID PLATFORM", W - 60, 108);
          // Divider
          ctx.fillStyle = "#c9a84c";
          ctx.fillRect(W - 60 - 70, 148, 70, 3);

          // ── Slide content ─────────────────────────────────────
          ctx.globalAlpha = slideOp * exitOp;
          const cy = H / 2 + slideY;

          // Icon circle
          ctx.fillStyle = "rgba(201,168,76,0.15)";
          ctx.beginPath();
          ctx.arc(W / 2, cy - 120, 80, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(201,168,76,0.35)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(W / 2, cy - 120, 80, 0, Math.PI * 2);
          ctx.stroke();
          ctx.font = "68px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "white";
          ctx.fillText(slide.icon, W / 2, cy - 120);

          // Sentence text (wrapped)
          ctx.font = "700 44px Tajawal, Cairo, sans-serif";
          ctx.fillStyle = "rgba(255,255,255,0.93)";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          const wrapped = wrapText(ctx, slide.line, W - 160, "700 44px Tajawal, Cairo, sans-serif");
          const lineH = 64;
          const textTop = cy - 30;
          wrapped.forEach((ln, i) => ctx.fillText(ln, W / 2, textTop + i * lineH));

          // ── Slide dots ────────────────────────────────────────
          ctx.globalAlpha = headerOp * exitOp;
          const dotY = H - 55;
          const dotTotal = slides.length * 12 + (slides.length - 1) * 10;
          let dotX = (W - dotTotal) / 2;
          slides.forEach((_, i) => {
            const active = i === slideIdx;
            ctx.fillStyle = active ? "#c9a84c" : "rgba(255,255,255,0.3)";
            ctx.beginPath();
            ctx.roundRect(dotX, dotY, active ? 24 : 10, 10, 5);
            ctx.fill();
            dotX += (active ? 24 : 10) + 10;
          });

          // Counter
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          ctx.font = "500 22px Tajawal, Cairo, sans-serif";
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          ctx.fillText(`${slideIdx + 1} / ${slides.length}`, W - 60, H - 30);

          ctx.globalAlpha = 1;
          frame++;
          setVideoProgress(Math.round((frame / TOTAL) * 70));
          if (frame < TOTAL) {
            setTimeout(drawFrame, 1000 / FPS);
          } else {
            resolve();
          }
        }
        drawFrame();
      });

      recorder.stop();
      markStep(0, "ok", "تم إنشاء الفيديو");
      advanceStep(1);

      const blob = await done;

      // Upload to Supabase Storage
      const safeAssoc = (assocName ?? "assoc").replace(/\s+/g, "_").slice(0, 20);
      const fileName = `videos/${safeAssoc}_${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage
        .from("images")
        .upload(fileName, blob, { contentType: mimeType, upsert: false });

      let videoUrl = "";
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
        videoUrl = urlData?.publicUrl ?? "";
        markStep(1, "ok", "تم الرفع");
      } else {
        markStep(1, "warn", "فشل الرفع — تنزيل محلي فقط");
        // Still let user download locally
        const obj = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = obj;
        a.download = `video_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(obj);
      }

      advanceStep(2);

      // Save videoUrl to DB
      if (videoUrl && activeId && activeId > 0) {
        const next: GeneratedContent = {
          ...content,
          video: { ...content.video, videoUrl },
        };
        try {
          await updateGen.mutateAsync({ id: activeId, content: next });
          setContent(next);
          persist(next, prompt, activeId);
          markStep(2, "ok", `#${activeId}`);
        } catch {
          markStep(2, "warn", "فشل الحفظ في DB");
        }
      } else {
        markStep(2, "warn", "لا رابط للحفظ");
      }

      markStep(3, "ok", "اكتمل");
      setVideoProgress(100);
      toast.success(videoUrl ? "تم إنشاء الفيديو وحفظه!" : "تم إنشاء الفيديو (محلي فقط)");

      // Trigger download if we have a cloud URL
      if (videoUrl) {
        await downloadImage(videoUrl, `video_${Date.now()}.webm`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطأ في توليد الفيديو";
      toast.error(msg);
      setSteps((prev) =>
        prev.map((s) => (s.status === "loading" ? { ...s, status: "error", detail: msg } : s)),
      );
    } finally {
      setVideoLoading(false);
    }
  }

  // ── Derived render flags ──────────────────────────────────
  const anyTabHasContent = Object.values(content).some((v) => !!v.text);
  const showTabsPanel = anyTabHasContent || loading !== null || tab === "logo";
  const isLogoTab = tab === "logo";
  const tabContent: GeneratedContentItem | undefined = tab === "logo" ? undefined : content[tab];
  const tabLoading = loading === tab || loading === "all";
  const anyLoading = loading !== null;
  const isImgTab = IMAGE_TABS.includes(tab);
  const currentLabel = TABS.find((t) => t.key === tab)?.label ?? "";
  const savedHistoryCount = history.filter((h) => h.id !== TEMP_ID).length;

  return (
    <>
      <style>{CONTENT_PAGE_STYLES}</style>

      <div
        style={{
          display: "flex",
          height: "calc(100vh - 110px)",
          minHeight: 560,
          background: "#f8fafc",
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 12px 40px rgba(15,23,42,.06)",
          fontFamily: "'Tajawal','Cairo',sans-serif",
        }}
      >
        {/* ══ SIDEBAR ══ */}
        {sidebar && (
          <ContentHistory
            assocId={assocId}
            activeId={activeId}
            anyLoading={anyLoading}
            optimisticTemp={optimisticTemp}
            onSelect={loadItem}
            onNew={startNew}
          />
        )}

        {/* ══ MAIN ══ */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Top bar */}
          <div
            style={{
              padding: "14px 24px",
              background: "#fff",
              borderBottom: "1px solid #eef2f6",
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setSidebar((s) => !s)}
              title={sidebar ? "إخفاء السجل" : "إظهار السجل"}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                background: "white",
                color: "#64748b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: ".9rem",
                transition: "all .15s",
              }}
            >
              ☰
            </button>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "linear-gradient(135deg,#059669,#10b981)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.05rem",
                flexShrink: 0,
                boxShadow: "0 3px 10px rgba(5,150,105,.25)",
              }}
            >
              ✨
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: ".92rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>
                استوديو المحتوى الذكي
              </div>
              <div
                style={{
                  fontSize: ".7rem",
                  color: "#94a3b8",
                  marginTop: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>{assocName}</span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    color: context ? "#059669" : "#dc2626",
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: context ? "#10b981" : "#ef4444",
                      display: "inline-block",
                    }}
                  />
                  {context ? "السياق متصل" : "أكمل ملف الجمعية"}
                </span>
              </div>
            </div>
            {activeId !== null && activeId > 0 && (
              <div
                style={{
                  padding: "5px 13px",
                  borderRadius: 999,
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#10b981",
                    display: "inline-block",
                  }}
                />
                <span style={{ fontSize: ".68rem", color: "#166534", fontWeight: 700 }}>
                  جلسة #{activeId}
                </span>
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {/* ── Prompt composer + step tracker ── */}
            <div
              style={{
                padding: "18px 24px 16px",
                background: "#fff",
                borderBottom: "1px solid #eef2f6",
              }}
            >
              <div style={{ maxWidth: 720 }}>
                {/* Chat-style composer card */}
                <div
                  className="cg-composer"
                  style={{
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 16,
                    background: "#fff",
                    overflow: "hidden",
                    transition: "border-color .2s, box-shadow .2s",
                  }}
                >
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="اكتب تعليماتك… مثال: ركّز على حملة الشتاء، أو اجعل الأسلوب عاطفياً"
                    rows={2}
                    style={{
                      width: "100%",
                      padding: "14px 16px 8px",
                      border: "none",
                      fontFamily: "'Tajawal',Cairo,sans-serif",
                      fontSize: ".88rem",
                      resize: "none",
                      outline: "none",
                      color: "#1e293b",
                      background: "transparent",
                      lineHeight: 1.7,
                      boxSizing: "border-box",
                    }}
                  />
                  {/* Action row inside the composer */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px 10px",
                    }}
                  >
                    <button
                      onClick={() => generate(tab)}
                      disabled={anyLoading || !context}
                      className="cg-send"
                      style={{
                        padding: "9px 22px",
                        borderRadius: 11,
                        border: "none",
                        background:
                          anyLoading || !context
                            ? "#cbd5e1"
                            : "linear-gradient(135deg,#059669,#10b981)",
                        color: "white",
                        fontSize: ".84rem",
                        fontWeight: 800,
                        fontFamily: "'Tajawal',Cairo,sans-serif",
                        cursor: anyLoading || !context ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        boxShadow:
                          anyLoading || !context ? "none" : "0 3px 12px rgba(5,150,105,.3)",
                        transition: "all .18s",
                      }}
                    >
                      {loading === tab ? (
                        <>
                          <Spin /> جاري التوليد...
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: ".95rem" }}>✦</span> توليد {currentLabel}
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => generate("all")}
                      disabled={anyLoading || !context}
                      className="cg-outline"
                      style={{
                        padding: "9px 16px",
                        borderRadius: 11,
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        color: "#475569",
                        fontSize: ".8rem",
                        fontWeight: 700,
                        fontFamily: "'Tajawal',Cairo,sans-serif",
                        cursor: anyLoading || !context ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        opacity: anyLoading ? 0.5 : 1,
                        transition: "all .18s",
                      }}
                    >
                      {loading === "all" ? (
                        <>
                          <Spin size={13} light={false} /> جاري...
                        </>
                      ) : (
                        "✨ توليد الكل"
                      )}
                    </button>

                    <div style={{ flex: 1 }} />

                    {anyTabHasContent && (
                      <button
                        onClick={startNew}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 10,
                          border: "none",
                          background: "transparent",
                          color: "#94a3b8",
                          fontSize: ".76rem",
                          fontWeight: 600,
                          fontFamily: "'Tajawal',sans-serif",
                          cursor: "pointer",
                        }}
                      >
                        مسح ↺
                      </button>
                    )}
                  </div>
                </div>

                {!context && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "9px 14px",
                      borderRadius: 11,
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      fontSize: ".74rem",
                      color: "#b91c1c",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    ⚠️ أكمل ملف الجمعية أولاً لتوفير سياق التوليد
                  </div>
                )}

                {/* Step tracker replaces old log panel */}
                <StepTracker steps={steps} />
              </div>
            </div>

            {/* ── Content area ── */}
            <div style={{ padding: "20px 22px" }}>
              {!showTabsPanel ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: 36,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 22,
                      background: "linear-gradient(135deg,#059669,#34d399)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      marginBottom: 18,
                      boxShadow: "0 10px 30px rgba(5,150,105,.3)",
                    }}
                  >
                    ✨
                  </div>
                  <div
                    style={{
                      fontSize: ".96rem",
                      fontWeight: 700,
                      color: "#1e293b",
                      marginBottom: 5,
                    }}
                  >
                    ابدأ بتوليد محتواك
                  </div>
                  <div
                    style={{
                      fontSize: ".8rem",
                      color: "#94a3b8",
                      lineHeight: 1.75,
                      maxWidth: 280,
                      marginBottom: savedHistoryCount > 0 ? 30 : 0,
                    }}
                  >
                    اكتب تعليمات اختيارية واضغط توليد
                  </div>
                  {savedHistoryCount > 0 && !contentQ.isLoading && (
                    <div style={{ width: "100%", maxWidth: 460 }}>
                      <div
                        style={{
                          fontSize: ".7rem",
                          fontWeight: 700,
                          color: "#cbd5e1",
                          textTransform: "uppercase",
                          letterSpacing: ".07em",
                          marginBottom: 12,
                        }}
                      >
                        جلسات سابقة
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {history
                          .filter((h) => h.id !== TEMP_ID)
                          .slice(0, 4)
                          .map((item) => (
                            <button
                              key={item.id}
                              className="cg-ghost"
                              onClick={() => loadItem(item)}
                              style={{
                                width: "100%",
                                textAlign: "right",
                                padding: "12px 15px",
                                borderRadius: 11,
                                border: "1.5px solid #e8ecef",
                                background: "white",
                                cursor: "pointer",
                                fontFamily: "'Tajawal',sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                transition: "all .15s",
                                boxShadow: "0 1px 3px rgba(0,0,0,.04)",
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 9,
                                  background: "#f0fdf4",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: ".85rem",
                                  color: "#16a34a",
                                  flexShrink: 0,
                                }}
                              >
                                ✦
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: ".81rem",
                                    fontWeight: 600,
                                    color: "#334155",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.prompt || "توليد عام"}
                                </div>
                                <div style={{ fontSize: ".67rem", color: "#94a3b8", marginTop: 2 }}>
                                  {fmtDate(item.createdAt)}
                                </div>
                              </div>
                              <span style={{ color: "#cbd5e1", flexShrink: 0 }}>←</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ maxWidth: 740 }}>
                  {/* Tab bar */}
                  <div
                    style={{
                      display: "flex",
                      gap: 3,
                      marginBottom: 20,
                      padding: 4,
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 14,
                      width: "fit-content",
                      boxShadow: "0 1px 3px rgba(0,0,0,.03)",
                    }}
                  >
                    {TABS.map(({ key, label, icon }) => {
                      const isActive = tab === key;
                      const hasTabContent = key !== "logo" && !!content[key].text;
                      const isThisLoading = loading === key || loading === "all";
                      return (
                        <button
                          key={key}
                          className="cg-tab"
                          data-active={isActive}
                          onClick={() => setTab(key)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 10,
                            border: "none",
                            background: isActive
                              ? "linear-gradient(135deg,#059669,#10b981)"
                              : "transparent",
                            color: isActive ? "#fff" : "#64748b",
                            fontWeight: isActive ? 700 : 500,
                            fontSize: ".8rem",
                            cursor: "pointer",
                            fontFamily: "'Tajawal',Cairo,sans-serif",
                            boxShadow: isActive ? "0 2px 8px rgba(5,150,105,.3)" : "none",
                            transition: "all .16s",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {isThisLoading ? (
                            <Spin size={11} light={isActive} />
                          ) : (
                            <span>{icon}</span>
                          )}
                          {label}
                          {hasTabContent && !isThisLoading && (
                            <span
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: isActive ? "rgba(255,255,255,.8)" : "#10b981",
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* ── Logo tab: full-width standalone UI ── */}
                  {isLogoTab && (
                    <LogoTab
                      assocId={String(activeId ?? "guest")}
                      assocName={assocName ?? "الجمعية"}
                      onLogoChange={(url, anim, pos) => {
                        setLogoOverlayUrl(url);
                        setLogoAnimation(anim);
                        setLogoPosition(pos);
                      }}
                    />
                  )}

                  {!isLogoTab && tabLoading && !tabContent?.text && <Skeleton />}

                  {!isLogoTab && tabLoading && !!tabContent?.text && (
                    <div
                      style={{
                        padding: "9px 14px",
                        borderRadius: 10,
                        marginBottom: 14,
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Spin size={13} light={false} />
                      <span style={{ fontSize: ".77rem", color: "#166534", fontWeight: 600 }}>
                        جاري توليد {currentLabel} جديد...
                      </span>
                    </div>
                  )}

                  {!isLogoTab && !tabLoading && !tabContent?.text && (
                    <div
                      style={{
                        padding: "32px 0",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "1.6rem", marginBottom: 10, opacity: 0.3 }}>
                        {TABS.find((t) => t.key === tab)?.icon}
                      </div>
                      <div
                        style={{
                          fontSize: ".84rem",
                          fontWeight: 700,
                          color: "#475569",
                          marginBottom: 5,
                        }}
                      >
                        لم يُولَّد {currentLabel} بعد
                      </div>
                      <div style={{ fontSize: ".75rem", color: "#94a3b8", marginBottom: 18 }}>
                        اضغط لإضافته لهذه الجلسة
                      </div>
                      <button
                        onClick={() => generate(tab, true)}
                        disabled={anyLoading}
                        style={{
                          padding: "9px 24px",
                          borderRadius: 10,
                          border: "none",
                          background: anyLoading
                            ? "#cbd5e1"
                            : "linear-gradient(135deg,#166534,#16a34a)",
                          color: "white",
                          fontSize: ".84rem",
                          fontWeight: 700,
                          fontFamily: "'Tajawal',Cairo,sans-serif",
                          cursor: anyLoading ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          boxShadow: anyLoading ? "none" : "0 3px 14px rgba(22,163,74,.28)",
                        }}
                      >
                        {tabLoading ? (
                          <>
                            <Spin /> جاري...
                          </>
                        ) : (
                          `✦ توليد ${currentLabel}`
                        )}
                      </button>
                    </div>
                  )}

                  {!isLogoTab &&
                    tabContent?.text &&
                    (isImgTab ? (
                      <ImageTabContent
                        tab={tab}
                        tabContent={tabContent}
                        imageSrc={images[tab]}
                        activeId={activeId}
                        imgLoading={imgLoading}
                        anyLoading={anyLoading}
                        isThisTabLoading={tabLoading}
                        currentLabel={currentLabel}
                        onGenImage={genImage}
                        onDownloadImage={downloadImage}
                        onRegen={() => generate(tab, true)}
                      />
                    ) : (
                      <VideoTab
                        tabContent={tabContent}
                        video={content.video}
                        images={images}
                        brandContext={brandContext}
                        assocName={assocName ?? "الجمعية"}
                        assocRegion={assocRegion}
                        assocPhone={assocPhone}
                        assocEmail={assocEmail}
                        logoOverlayUrl={logoOverlayUrl}
                        videoLoading={videoLoading}
                        videoProgress={videoProgress}
                        activeId={activeId}
                        anyLoading={anyLoading}
                        isThisTabLoading={tabLoading}
                        currentLabel={currentLabel}
                        onOpenEditor={() => setVideoEditorOpen(true)}
                        onRenderVideo={renderVideo}
                        onRegen={() => generate(tab, true)}
                        onAudioMetadata={setAudioDurationSec}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Video Editor Modal ── */}
      {videoEditorOpen && content.video.text && (
        <VideoEditorModal
          text={content.video.text}
          assocName={assocName ?? "الجمعية"}
          assocInitial={assocName ? assocName[0] : "ج"}
          assocRegion={assocRegion}
          assocPhone={assocPhone}
          assocEmail={assocEmail}
          imageUrl={images["video"] || images["post"] || images["story"] || images["donation"]}
          audioUrl={content.video.audioUrl}
          logoUrl={logoOverlayUrl || undefined}
          aiBrand={brandContext || undefined}
          initialSlideFrames={content.video.slideFrames}
          initialShowLogo={content.video.showLogo ?? true}
          initialTransitionStyle={
            (content.video.transitionStyle as TransitionStyle | undefined) ?? "slide"
          }
          initialShowOutro={content.video.showOutro ?? true}
          onSave={handleVideoEditorSave}
          onClose={() => setVideoEditorOpen(false)}
        />
      )}
    </>
  );
}
