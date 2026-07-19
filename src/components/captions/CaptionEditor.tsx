import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { type PlayerRef } from "@remotion/player";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { VideoProject, CaptionWord, CaptionStyle, CaptionGrouping } from "@/types/captions";
import {
  updateCaptions,
  updateStyle,
  updateGrouping,
} from "@/lib/caption-api";
import { VideoPreview } from "./VideoPreview";
import { CaptionList } from "./CaptionList";
import { CaptionStylePanel } from "./CaptionStylePanel";
import { RenderPanel } from "./RenderPanel";

type Props = {
  initialProject: VideoProject;
  onBack: () => void;
};

const AUTOSAVE_DELAY = 1500;

export function CaptionEditor({ initialProject, onBack }: Props) {
  const [project, setProject] = useState(initialProject);
  const [activeCaptionId, setActiveCaptionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const playerRef = useRef<PlayerRef>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCaptionsRef = useRef<CaptionWord[] | null>(null);
  const pendingStyleRef = useRef<CaptionStyle | null>(null);
  const pendingGroupingRef = useRef<CaptionGrouping | null>(null);

  // Ref keeps handleTimeUpdate stable — re-rendering on every player frame
  // starves the main thread and makes the Player re-seek (audio repeats).
  const captionsRef = useRef(project.captions);
  captionsRef.current = project.captions;

  const handleTimeUpdate = useCallback((ms: number) => {
    let id: string | null = null;
    for (const w of captionsRef.current) {
      if (w.startMs > ms) break;
      if (ms >= w.startMs && ms <= w.endMs) {
        id = w.id;
        break;
      }
    }
    // Only re-render when the active word actually changes
    setActiveCaptionId((prev) => (prev === id ? prev : id));
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (pendingCaptionsRef.current || pendingStyleRef.current || pendingGroupingRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  function scheduleAutosave() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => void flushSave(), AUTOSAVE_DELAY);
  }

  async function flushSave() {
    if (!pendingCaptionsRef.current && !pendingStyleRef.current && !pendingGroupingRef.current) return;
    setSaving(true);
    try {
      const saves: Promise<VideoProject>[] = [];
      if (pendingCaptionsRef.current) {
        saves.push(updateCaptions(project.id, pendingCaptionsRef.current));
        pendingCaptionsRef.current = null;
      }
      if (pendingStyleRef.current) {
        saves.push(updateStyle(project.id, pendingStyleRef.current));
        pendingStyleRef.current = null;
      }
      if (pendingGroupingRef.current) {
        saves.push(updateGrouping(project.id, pendingGroupingRef.current));
        pendingGroupingRef.current = null;
      }
      const results = await Promise.all(saves);
      if (results.length > 0) setProject(results[results.length - 1]);
    } catch {
      toast.error("فشل الحفظ التلقائي");
    } finally {
      setSaving(false);
    }
  }

  const handleCaptionsChange = useCallback(
    (captions: CaptionWord[]) => {
      setProject((p) => ({ ...p, captions }));
      pendingCaptionsRef.current = captions;
      scheduleAutosave();
    },
    [project.id],
  );

  const handleStyleChange = useCallback(
    (style: CaptionStyle) => {
      setProject((p) => ({ ...p, captionStyle: style }));
      pendingStyleRef.current = style;
      scheduleAutosave();
    },
    [project.id],
  );

  const handleGroupingChange = useCallback(
    (grouping: CaptionGrouping) => {
      setProject((p) => ({ ...p, captionGrouping: grouping }));
      pendingGroupingRef.current = grouping;
      scheduleAutosave();
    },
    [project.id],
  );

  const handleSeek = useCallback(
    (ms: number) => {
      const player = playerRef.current;
      if (!player) return;
      const frame = Math.floor((ms / 1000) * project.fps);
      player.seekTo(frame);
    },
    [project.fps],
  );

  async function handleManualSave() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await flushSave();
    toast.success("تم الحفظ");
  }

  return (
    <div className="flex flex-col h-full bg-background" dir="ltr">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-sm">محرر الترجمة</h1>
          {saving && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              جارٍ الحفظ…
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleManualSave} disabled={saving}>
          <Save className="mr-1.5 h-3.5 w-3.5" />
          حفظ
        </Button>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Preview */}
        <div className="flex flex-col gap-4 p-4 border-r shrink-0 overflow-y-auto">
          <VideoPreview
            project={project}
            onTimeUpdate={handleTimeUpdate}
            playerRef={playerRef}
          />
          <RenderPanel project={project} />
        </div>

        {/* Right: Captions + Style */}
        <div className="flex flex-1 min-w-0 flex-col min-h-0">
          <Tabs defaultValue="captions" className="flex flex-col flex-1 min-h-0">
            <TabsList className="shrink-0 mx-4 mt-3 w-auto self-start">
              <TabsTrigger value="captions">
                الترجمات ({project.captions.length})
              </TabsTrigger>
              <TabsTrigger value="style">التنسيق</TabsTrigger>
            </TabsList>

            <TabsContent value="captions" className="flex-1 min-h-0 mt-2 overflow-hidden">
              <CaptionList
                captions={project.captions}
                activeCaptionId={activeCaptionId}
                onChange={handleCaptionsChange}
                onSeek={handleSeek}
              />
            </TabsContent>

            <TabsContent value="style" className="flex-1 min-h-0 mt-2 overflow-hidden">
              <CaptionStylePanel
                style={project.captionStyle}
                grouping={project.captionGrouping}
                onStyleChange={handleStyleChange}
                onGroupingChange={handleGroupingChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
