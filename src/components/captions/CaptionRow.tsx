import { memo, useState } from "react";
import { Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CaptionWord } from "@/types/captions";

type Props = {
  word: CaptionWord;
  isActive: boolean;
  onChange: (updated: CaptionWord) => void;
  onDelete: (id: string) => void;
  onSeek: (ms: number) => void;
};

function msToDisplay(ms: number): string {
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(3).padStart(6, "0")}`;
}

function displayToMs(value: string): number | null {
  const match = value.match(/^(\d+):(\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const m = parseInt(match[1], 10);
  const s = parseFloat(match[2]);
  return Math.round((m * 60 + s) * 1000);
}

export const CaptionRow = memo(function CaptionRow({
  word,
  isActive,
  onChange,
  onDelete,
  onSeek,
}: Props) {
  const [editingStart, setEditingStart] = useState(false);
  const [editingEnd, setEditingEnd] = useState(false);
  const [startVal, setStartVal] = useState(msToDisplay(word.startMs));
  const [endVal, setEndVal] = useState(msToDisplay(word.endMs));

  function commitStart() {
    const ms = displayToMs(startVal);
    if (ms !== null && ms >= 0 && ms < word.endMs) {
      onChange({ ...word, startMs: ms, timestampMs: ms });
    } else {
      setStartVal(msToDisplay(word.startMs));
    }
    setEditingStart(false);
  }

  function commitEnd() {
    const ms = displayToMs(endVal);
    if (ms !== null && ms > word.startMs) {
      onChange({ ...word, endMs: ms });
    } else {
      setEndVal(msToDisplay(word.endMs));
    }
    setEditingEnd(false);
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
        isActive ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
      }`}
      onClick={() => onSeek(word.startMs)}
    >
      {/* Seek button */}
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 shrink-0"
        onClick={(e) => { e.stopPropagation(); onSeek(word.startMs); }}
        title="الانتقال إلى هذه الكلمة"
      >
        <Play className="h-3 w-3" />
      </Button>

      {/* Editable text */}
      <input
        className="flex-1 min-w-0 bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5 font-medium"
        value={word.text}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onChange({ ...word, text: e.target.value })}
      />

      {/* Start time */}
      {editingStart ? (
        <input
          autoFocus
          className="w-24 text-xs bg-background border border-primary rounded px-1 py-0.5 font-mono text-center"
          value={startVal}
          onChange={(e) => setStartVal(e.target.value)}
          onBlur={commitStart}
          onKeyDown={(e) => { if (e.key === "Enter") commitStart(); if (e.key === "Escape") { setStartVal(msToDisplay(word.startMs)); setEditingStart(false); } }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <button
          className="w-24 text-xs font-mono text-muted-foreground hover:text-foreground text-center px-1 py-0.5"
          onClick={(e) => { e.stopPropagation(); setStartVal(msToDisplay(word.startMs)); setEditingStart(true); }}
          title="تعديل وقت البداية"
        >
          {msToDisplay(word.startMs)}
        </button>
      )}

      <span className="text-muted-foreground text-xs">→</span>

      {/* End time */}
      {editingEnd ? (
        <input
          autoFocus
          className="w-24 text-xs bg-background border border-primary rounded px-1 py-0.5 font-mono text-center"
          value={endVal}
          onChange={(e) => setEndVal(e.target.value)}
          onBlur={commitEnd}
          onKeyDown={(e) => { if (e.key === "Enter") commitEnd(); if (e.key === "Escape") { setEndVal(msToDisplay(word.endMs)); setEditingEnd(false); } }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <button
          className="w-24 text-xs font-mono text-muted-foreground hover:text-foreground text-center px-1 py-0.5"
          onClick={(e) => { e.stopPropagation(); setEndVal(msToDisplay(word.endMs)); setEditingEnd(true); }}
          title="تعديل وقت النهاية"
        >
          {msToDisplay(word.endMs)}
        </button>
      )}

      {/* Delete */}
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={(e) => { e.stopPropagation(); onDelete(word.id); }}
        title="حذف الكلمة"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
});
