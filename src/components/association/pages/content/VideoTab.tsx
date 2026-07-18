import { Player } from "@remotion/player";
import { BrandedVideo } from "@/remotion/BrandedVideo";
import {
  computeBrandedVideoDuration,
  parseBrandColors,
  moodToTransition,
  parseBrandMood,
} from "@/remotion/brandUtils";
import type { TransitionStyle } from "@/remotion/brandUtils";
import type { GeneratedContent, GeneratedContentItem } from "@/lib/db";
import { Spin, textToSlides, type Tab } from "./constants";
import { TabTextSection } from "./ImageTabContent";

interface Props {
  tabContent: GeneratedContentItem;
  video: GeneratedContent["video"];
  images: Partial<Record<Tab, string>>;
  brandContext: string;
  assocName: string;
  assocRegion: string;
  assocPhone: string;
  assocEmail: string;
  logoOverlayUrl: string;
  videoLoading: boolean;
  videoProgress: number;
  activeId: number | null;
  anyLoading: boolean;
  isThisTabLoading: boolean;
  currentLabel: string;
  onOpenEditor: () => void;
  onRenderVideo: () => void;
  onRegen: () => void;
  onAudioMetadata: (duration: number) => void;
}

/** video tab: text + Remotion preview + audio status + render button. */
export default function VideoTab({
  tabContent,
  video,
  images,
  brandContext,
  assocName,
  assocRegion,
  assocPhone,
  assocEmail,
  logoOverlayUrl,
  videoLoading,
  videoProgress,
  activeId,
  anyLoading,
  isThisTabLoading,
  currentLabel,
  onOpenEditor,
  onRenderVideo,
  onRegen,
  onAudioMetadata,
}: Props) {
  const sf =
    video.slideFrames ?? (Array(textToSlides(tabContent.text).length).fill(90) as number[]);
  const dur = computeBrandedVideoDuration(sf);
  const mood = parseBrandMood(brandContext);
  const resolvedTransition: TransitionStyle =
    (video.transitionStyle as TransitionStyle | undefined) ?? moodToTransition(mood);
  const brandCols = parseBrandColors(brandContext);
  const bgImage = images["video"] || images["post"] || images["story"] || images["donation"];

  return (
    <div>
      <TabTextSection
        tabContent={tabContent}
        currentLabel={currentLabel}
        anyLoading={anyLoading}
        isThisTabLoading={isThisTabLoading}
        onRegen={onRegen}
      />

      <div style={{ marginTop: 8, marginBottom: 16 }}>
        {/* Remotion Player preview */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: ".7rem",
              fontWeight: 700,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: ".05em",
            }}
          >
            معاينة الفيديو (Remotion)
          </div>
          <button
            onClick={onOpenEditor}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 9,
              border: "1.5px solid #c9a84c",
              background: "linear-gradient(135deg,#78350f,#92400e)",
              color: "#fde68a",
              fontSize: ".78rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Tajawal',Cairo,sans-serif",
              boxShadow: "0 2px 10px rgba(201,168,76,.2)",
              transition: "all .15s",
            }}
          >
            <span>✏️</span> تعديل الفيديو
          </button>
        </div>
        <div
          style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }}
        >
          <div dir="ltr" style={{ borderRadius: 14, overflow: "hidden" }}>
            <Player
              component={BrandedVideo}
              inputProps={{
                text: tabContent.text,
                assocName,
                assocInitial: assocName ? assocName[0] : "ج",
                assocRegion,
                assocPhone,
                assocEmail,
                imageUrl: bgImage,
                audioUrl: video.audioUrl,
                logoUrl: logoOverlayUrl || undefined,
                aiBrand: brandContext || undefined,
                brandColors: [brandCols.primary, brandCols.secondary, brandCols.accent],
                transitionStyle: resolvedTransition,
                slideFrames: sf,
                showLogo: video.showLogo ?? true,
                showOutro: video.showOutro ?? true,
              }}
              durationInFrames={dur}
              compositionWidth={1080}
              compositionHeight={1080}
              fps={30}
              numberOfSharedAudioTags={5}
              style={{ width: "100%", aspectRatio: "1" }}
              controls
            />
          </div>
        </div>

        {/* Audio status */}
        <div
          style={{
            marginTop: 10,
            padding: "10px 14px",
            borderRadius: 10,
            background: video.audioUrl ? "#f0fdf4" : "#fafafa",
            border: `1.5px solid ${video.audioUrl ? "#bbf7d0" : "#e2e8f0"}`,
            fontSize: ".76rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: video.audioUrl ? "#15803d" : "#94a3b8",
          }}
        >
          <span>{video.audioUrl ? "🔊" : "⏳"}</span>
          {video.audioUrl ? (
            <>
              <span>صوت عربي جاهز · </span>
              <audio
                controls
                src={video.audioUrl}
                style={{ height: 24, flex: 1 }}
                onLoadedMetadata={(e) => onAudioMetadata((e.target as HTMLAudioElement).duration)}
              />
            </>
          ) : (
            <span>جاري توليد الصوت تلقائياً بعد توليد النص...</span>
          )}
        </div>

        {/* Saved video link */}
        {video.videoUrl && (
          <div
            style={{
              marginTop: 6,
              padding: "10px 14px",
              borderRadius: 10,
              background: "#f0fdf4",
              border: "1.5px solid #bbf7d0",
              fontSize: ".76rem",
              color: "#15803d",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>✅</span>
            <span>فيديو محفوظ · </span>
            <a
              href={video.videoUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#16a34a", fontWeight: 700, textDecoration: "underline" }}
            >
              عرض / تنزيل
            </a>
          </div>
        )}

        {/* Progress bar */}
        {videoLoading && (
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                fontSize: ".72rem",
                color: "#64748b",
                marginBottom: 6,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>جاري إنشاء الفيديو...</span>
              <span>{videoProgress}%</span>
            </div>
            <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${videoProgress}%`,
                  background: "linear-gradient(90deg,#16a34a,#22c55e)",
                  borderRadius: 3,
                  transition: "width .3s",
                }}
              />
            </div>
          </div>
        )}

        {/* Render button */}
        <button
          onClick={onRenderVideo}
          disabled={videoLoading || !activeId || activeId <= 0}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "14px 0",
            borderRadius: 12,
            border: "2px dashed #bbf7d0",
            background: "#f0fdf4",
            color: "#16a34a",
            fontSize: ".84rem",
            fontWeight: 700,
            cursor: videoLoading || !activeId || activeId <= 0 ? "not-allowed" : "pointer",
            fontFamily: "'Tajawal',Cairo,sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            opacity: videoLoading || !activeId || activeId <= 0 ? 0.5 : 1,
            transition: "all .2s",
          }}
        >
          {videoLoading ? (
            <>
              <Spin size={14} light={false} /> جاري إنشاء الفيديو...
            </>
          ) : (
            <>
              <span>🎬</span> {video.videoUrl ? "إعادة توليد الفيديو" : "توليد الفيديو وتنزيله"}
            </>
          )}
        </button>
        {(!activeId || activeId <= 0) && (
          <div
            style={{
              marginTop: 8,
              padding: "7px 12px",
              borderRadius: 8,
              background: "#fffbeb",
              border: "1px solid #fde68a",
              fontSize: ".71rem",
              color: "#92400e",
            }}
          >
            ⚠️ يجب حفظ المحتوى في قاعدة البيانات أولاً قبل توليد الفيديو
          </div>
        )}
      </div>
    </div>
  );
}
