import { Composition } from "remotion";
import { ContentVideo } from "./ContentVideo";
import { LogoVideo } from "./LogoVideo";
import { BrandedVideo } from "./BrandedVideo";
import { computeBrandedVideoDuration } from "./brandUtils";

const SAMPLE_TEXT = `نحن نؤمن بأن العطاء يغيّر الحياة
وصلنا إلى أكثر من ألف أسرة محتاجة
قدمنا خدمات صحية مجانية للجميع
معاً نبني مستقبلاً أفضل لأبنائنا
تبرّع الآن وكن شريكاً في التغيير`;

function slidesFromText(text: string) {
  return text
    .replace(/([.؟!\n])\s*/g, "$1\n")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 4);
}

export const RemotionRoot = () => {
  const slides    = slidesFromText(SAMPLE_TEXT);
  const SLIDE_DUR = 90;
  const legacyDur = Math.max(slides.length * SLIDE_DUR + 60, 120);

  const brandedSlideFrames = Array<number>(slides.length).fill(SLIDE_DUR);
  const brandedDur         = computeBrandedVideoDuration(brandedSlideFrames);

  return (
    <>
      {/* Legacy composition — kept for backward compat */}
      <Composition
        id="ContentVideo"
        component={ContentVideo}
        durationInFrames={legacyDur}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          text: SAMPLE_TEXT,
          assocName: "الجمعية الخيرية",
          assocInitial: "ج",
          showLogo: true,
        }}
      />

      {/* Logo stinger */}
      <Composition
        id="LogoVideo"
        component={LogoVideo}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          logoUrl: "https://placehold.co/400x400/1a5c3a/c9a84c?text=Logo",
          animation: "bounce" as const,
          assocName: "الجمعية الخيرية",
        }}
      />

      {/* ★ New branded composition — full motion graphics */}
      <Composition
        id="BrandedVideo"
        component={BrandedVideo}
        durationInFrames={brandedDur}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          text: SAMPLE_TEXT,
          assocName: "الجمعية الخيرية",
          assocInitial: "ج",
          assocRegion: "الرياض",
          assocPhone: "0501234567",
          assocEmail: "info@charity.sa",
          aiBrand: "#1a5c3a #c9a84c Professional warm community",
          transitionStyle: "slide" as const,
          showLogo: true,
          showOutro: true,
        }}
      />
    </>
  );
};
