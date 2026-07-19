import { useRef, useEffect } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { CaptionedVideo } from "@/remotion/compositions/CaptionedVideo";
import type { VideoProject } from "@/types/captions";
import { getVideoStreamUrl } from "@/lib/caption-api";

type Props = {
  project: VideoProject;
  onTimeUpdate?: (ms: number) => void;
  playerRef?: React.RefObject<PlayerRef | null>;
};

export function VideoPreview({ project, onTimeUpdate, playerRef }: Props) {
  const internalRef = useRef<PlayerRef>(null);
  const ref = (playerRef ?? internalRef) as React.RefObject<PlayerRef>;

  const durationInFrames = Math.max(1, Math.ceil((project.durationMs / 1000) * project.fps));
  const videoSrc = getVideoStreamUrl(project.id);

  // Subscribe to Remotion Player frame updates via its event emitter
  useEffect(() => {
    const player = ref.current;
    if (!player || !onTimeUpdate) return;

    const handler = ({ detail }: { detail: { frame: number } }) => {
      onTimeUpdate((detail.frame / project.fps) * 1000);
    };

    player.addEventListener("frameupdate", handler as Parameters<typeof player.addEventListener>[1]);
    return () => {
      player.removeEventListener("frameupdate", handler as Parameters<typeof player.removeEventListener>[1]);
    };
  }, [ref, onTimeUpdate, project.fps]);

  // Scale preview to fit container while preserving aspect ratio
  const aspectRatio = project.width / project.height;
  const previewHeight = 480;
  const previewWidth = Math.round(previewHeight * aspectRatio);

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: Math.min(previewWidth, 360), maxWidth: "100%" }}>
        <Player
          ref={ref}
          component={CaptionedVideo}
          inputProps={{
            videoSrc,
            captions: project.captions,
            captionStyle: project.captionStyle,
            captionGrouping: project.captionGrouping,
            width: project.width,
            height: project.height,
            durationInFrames,
            fps: project.fps,
          }}
          durationInFrames={durationInFrames}
          fps={project.fps}
          compositionWidth={project.width}
          compositionHeight={project.height}
          style={{ width: "100%", borderRadius: 8, overflow: "hidden" }}
          controls
          spaceKeyToPlayOrPause
          acknowledgeRemotionLicense
        />
      </div>
      <p className="text-xs text-muted-foreground" dir="ltr">
        {project.width}×{project.height} · {project.fps}fps ·{" "}
        {Math.round(project.durationMs / 1000)}s
      </p>
    </div>
  );
}
