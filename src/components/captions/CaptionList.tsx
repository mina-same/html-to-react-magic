import { useCallback, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CaptionWord } from "@/types/captions";
import { CaptionRow } from "./CaptionRow";

type Props = {
  captions: CaptionWord[];
  activeCaptionId: string | null;
  onChange: (updated: CaptionWord[]) => void;
  onSeek: (ms: number) => void;
};

export function CaptionList({ captions, activeCaptionId, onChange, onSeek }: Props) {
  const activeIdx = activeCaptionId
    ? captions.findIndex((c) => c.id === activeCaptionId)
    : -1;
  const activeRef = useRef<HTMLDivElement>(null);

  // Refs keep the row callbacks referentially stable so memo'd rows skip
  // re-rendering — critical for playback smoothness with hundreds of rows.
  const captionsRef = useRef(captions);
  captionsRef.current = captions;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onSeekRef = useRef(onSeek);
  onSeekRef.current = onSeek;

  // Auto-scroll to active caption
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIdx]);

  const handleRowChange = useCallback((updated: CaptionWord) => {
    onChangeRef.current(
      captionsRef.current.map((c) => (c.id === updated.id ? updated : c)),
    );
  }, []);

  const handleRowDelete = useCallback((id: string) => {
    onChangeRef.current(captionsRef.current.filter((c) => c.id !== id));
  }, []);

  const handleRowSeek = useCallback((ms: number) => {
    onSeekRef.current(ms);
  }, []);

  if (captions.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground text-sm">
        لا توجد ترجمات بعد.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-0.5">
        {captions.map((word, idx) => (
          <div key={word.id} ref={idx === activeIdx ? activeRef : undefined}>
            <CaptionRow
              word={word}
              isActive={idx === activeIdx}
              onChange={handleRowChange}
              onDelete={handleRowDelete}
              onSeek={handleRowSeek}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
