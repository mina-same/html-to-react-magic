import { useRef, useState, useEffect, useCallback } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { BrandedVideo } from "@/remotion/BrandedVideo";
import { computeBrandedVideoDuration, parseBrandColors, type TransitionStyle } from "@/remotion/brandUtils";

// ── Remotion Studio colour tokens ────────────────────────────
const RS = {
  bg:        "#0d1117",   // outer panel
  surface:   "#161b22",   // inner surface
  surfaceHov:"#1c2128",   // hover
  border:    "#30363d",   // 1-px dividers
  borderSub: "#21262d",   // subtler dividers
  text:      "#e6edf3",   // primary text
  textSub:   "#8b949e",   // secondary text
  textMuted: "#484f58",   // placeholder / muted
  accent:    "#388bfd",   // Remotion blue (selection, active)
  accentDim: "rgba(56,139,253,.15)",
  green:     "#3fb950",
  red:       "#f85149",
  yellow:    "#d29922",
  purple:    "#bc8cff",
};

const ICON_OPTIONS = ["✨","📊","💚","🏥","❤️","🌸","💰","🎯","🌟","🤲","🏆","🌍"];
const PX_PER_FRAME = 2;

type RightTab = "sequences" | "props" | "settings";

interface Slide { line: string; icon: string; durationFrames: number }

function textToSlides(text: string): Slide[] {
  const sentences = text
    .replace(/([.؟!\n])\s*/g, "$1\n")
    .split("\n").map(s => s.trim()).filter(s => s.length > 4);
  return sentences.map(line => {
    let icon = "✨";
    if (/\d/.test(line))                    icon = "📊";
    else if (/تبرع|هب|أعط|دعم/.test(line)) icon = "💚";
    else if (/صح|طب|علاج|دواء/.test(line)) icon = "🏥";
    else if (/أسرة|عائل|أطفال/.test(line)) icon = "❤️";
    else if (/ربيع|فصل|زهر/.test(line))    icon = "🌸";
    else if (/ريال|مال/.test(line))         icon = "💰";
    return { line, icon, durationFrames: 90 };
  });
}

interface Props {
  text: string; assocName: string; assocInitial?: string;
  assocRegion?: string; assocPhone?: string; assocEmail?: string;
  imageUrl?: string; audioUrl?: string; logoUrl?: string;
  aiBrand?: string;
  initialSlideFrames?: number[]; initialShowLogo?: boolean;
  initialTransitionStyle?: TransitionStyle;
  initialShowOutro?: boolean;
  onSave: (newText: string, slideFrames: number[], showLogo: boolean) => void;
  onClose: () => void;
}

// ── Remotion-Studio-style section header ─────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      padding: "10px 12px 6px",
      fontSize: "10px", fontWeight: 600, letterSpacing: ".08em",
      color: RS.textMuted, textTransform: "uppercase",
      borderBottom: `1px solid ${RS.borderSub}`,
      userSelect: "none",
    }}>
      {label}
    </div>
  );
}

// ── Prop row (label + control side-by-side, like Studio) ─────
function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start",
      padding: "5px 12px", gap: 8, minHeight: 30,
      borderBottom: `1px solid ${RS.borderSub}`,
    }}>
      <div style={{
        width: 72, flexShrink: 0, paddingTop: 6,
        fontSize: "11px", color: RS.textSub, fontFamily: "monospace",
        textAlign: "left",
      }}>
        {label}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

// ── Track label (timeline left gutter) ───────────────────────
function TrackLabel({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      width: 72, flexShrink: 0,
      fontSize: "10px", fontWeight: 600, color,
      display: "flex", alignItems: "center",
      paddingRight: 8, justifyContent: "flex-end",
      letterSpacing: ".03em", fontFamily: "monospace",
    }}>
      {label}
    </div>
  );
}

export default function VideoEditorModal({
  text, assocName, assocInitial, assocRegion, assocPhone, assocEmail,
  imageUrl, audioUrl, logoUrl, aiBrand,
  initialSlideFrames, initialShowLogo = true,
  initialTransitionStyle = "slide", initialShowOutro = true,
  onSave, onClose,
}: Props) {
  const playerRef    = useRef<PlayerRef>(null);
  const timelineRef  = useRef<HTMLDivElement>(null);

  const [slides, setSlides] = useState<Slide[]>(() =>
    textToSlides(text).map((s, i) => ({ ...s, durationFrames: initialSlideFrames?.[i] ?? 90 }))
  );
  const [tab,              setTab]             = useState<RightTab>("sequences");
  const [selectedIdx,      setSelectedIdx]     = useState(0);
  const [activeSlide,      setActiveSlide]     = useState(0);
  const [currentFrame,     setCurrentFrame]    = useState(0);
  const [showLogo,         setShowLogo]        = useState(initialShowLogo);
  const [showBg,           setShowBg]          = useState(true);
  const [showAudio,        setShowAudio]       = useState(true);
  const [transitionStyle,  setTransitionStyle] = useState<TransitionStyle>(initialTransitionStyle);
  const [showOutro,        setShowOutro]       = useState(initialShowOutro);

  // drag-reorder
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const assembledText = slides.map(s => s.line).join("\n");
  const slideFrames   = slides.map(s => s.durationFrames);
  const totalFrames   = computeBrandedVideoDuration(slideFrames);

  const slideStarts: number[] = slides.reduce<number[]>((acc, sl, i) => {
    acc.push(i === 0 ? 0 : acc[i-1] + slides[i-1].durationFrames);
    return acc;
  }, []);

  // Sync playhead from Player
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const h = (e: Event) => {
      const f = (e as CustomEvent<{frame:number}>).detail?.frame ?? 0;
      setCurrentFrame(f);
      let idx = slides.length - 1;
      for (let i = 0; i < slides.length; i++) {
        if (f < slideStarts[i] + slides[i].durationFrames) { idx = i; break; }
      }
      setActiveSlide(idx);
    };
    player.addEventListener("timeupdate", h);
    return () => player.removeEventListener("timeupdate", h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides]);

  const seekToSlide = useCallback((idx: number) => {
    setSelectedIdx(idx);
    setActiveSlide(idx);
    playerRef.current?.seekTo(slideStarts[idx] ?? 0);
    setTab("props");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides]);

  const updateText     = (i: number, v: string)  => setSlides(p => p.map((s,j) => j===i ? {...s, line: v} : s));
  const updateIcon     = (i: number, v: string)  => setSlides(p => p.map((s,j) => j===i ? {...s, icon: v} : s));
  const updateDuration = (i: number, v: number)  => setSlides(p => p.map((s,j) => j===i ? {...s, durationFrames: v} : s));

  const addSlide = () => {
    setSlides(p => [...p, { line: "نص الشريحة الجديدة", icon: "✨", durationFrames: 90 }]);
    setTimeout(() => seekToSlide(slides.length), 50);
  };
  const removeSlide = (i: number) => {
    if (slides.length <= 1) return;
    setSlides(p => p.filter((_, j) => j !== i));
    setSelectedIdx(Math.min(selectedIdx, slides.length - 2));
  };

  // drag handlers
  const onDragStart = (e: React.DragEvent, i: number) => { setDragIdx(i); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver  = (e: React.DragEvent, i: number) => { e.preventDefault(); setDropIdx(i); };
  const onDrop      = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); setDropIdx(null); return; }
    const next = [...slides]; const [rm] = next.splice(dragIdx, 1); next.splice(i, 0, rm);
    setSlides(next); setSelectedIdx(i); setDragIdx(null); setDropIdx(null);
  };
  const onDragEnd   = () => { setDragIdx(null); setDropIdx(null); };

  const handleSave = () => { onSave(assembledText, slideFrames, showLogo); onClose(); };

  const playheadX = 72 + currentFrame * PX_PER_FRAME;

  // ── Remotion-style tab button ────────────────────────────
  const TabBtn = ({ id, label }: { id: RightTab; label: string }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: "6px 10px",
        background: "transparent",
        border: "none",
        borderBottom: `2px solid ${tab === id ? RS.accent : "transparent"}`,
        color: tab === id ? RS.text : RS.textSub,
        fontSize: "11px", fontWeight: 600,
        cursor: "pointer", fontFamily: "system-ui,sans-serif",
        letterSpacing: ".02em",
        transition: "color .12s",
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );

  // ── Layer row in Settings (visibility toggle) ────────────
  const LayerRow = ({
    label, icon, color, visible, onToggle,
  }: { label: string; icon: string; color: string; visible: boolean; onToggle: () => void }) => (
    <div
      style={{
        display: "flex", alignItems: "center",
        padding: "5px 12px", gap: 8,
        borderBottom: `1px solid ${RS.borderSub}`,
        background: "transparent",
      }}
    >
      <button
        onClick={onToggle}
        title={visible ? "Hide layer" : "Show layer"}
        style={{
          width: 18, height: 18, borderRadius: 4, flexShrink: 0,
          border: `1px solid ${visible ? color : RS.border}`,
          background: visible ? color + "25" : "transparent",
          cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "9px",
          color: visible ? color : RS.textMuted,
        }}
      >
        {visible ? "👁" : "⊘"}
      </button>
      <span style={{ fontSize: "10px", color: RS.textSub, fontFamily: "monospace", flex: 1 }}>
        {icon} {label}
      </span>
      <span style={{
        fontSize: "9px", color: color, fontFamily: "monospace",
        background: color + "15", padding: "1px 5px", borderRadius: 3,
      }}>
        {visible ? "on" : "off"}
      </span>
    </div>
  );

  return (
    <div dir="rtl" style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "#000",
      display: "flex", flexDirection: "column",
      fontFamily: "system-ui,-apple-system,sans-serif",
    }}>

      {/* ══ TOP BAR — matches Remotion Studio's dark toolbar ══ */}
      <div style={{
        height: 48, background: RS.bg,
        borderBottom: `1px solid ${RS.border}`,
        display: "flex", alignItems: "center",
        padding: "0 14px", gap: 8, flexShrink: 0,
      }}>
        {/* Logo mark */}
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: "linear-gradient(135deg,#0070f3,#6366f1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: 900, color: "white", flexShrink: 0,
        }}>R</div>

        <div style={{ flex: 1, fontSize: "12px", fontWeight: 600, color: RS.text, fontFamily: "monospace" }}>
          ContentVideo.tsx
        </div>

        {/* Current frame indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          background: RS.surface, border: `1px solid ${RS.border}`,
          borderRadius: 5, padding: "3px 8px",
        }}>
          <span style={{ fontSize: "10px", color: RS.textMuted, fontFamily: "monospace" }}>frame</span>
          <span style={{ fontSize: "11px", color: RS.accent, fontFamily: "monospace", fontWeight: 700, minWidth: 30, textAlign: "right" }}>
            {currentFrame}
          </span>
        </div>

        {/* Remotion Studio link */}
        <a href="http://localhost:3000" target="_blank" rel="noreferrer" style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "4px 10px", borderRadius: 5,
          border: `1px solid ${RS.border}`,
          background: RS.surface,
          color: RS.textSub, fontSize: "11px",
          cursor: "pointer", textDecoration: "none",
          fontWeight: 500,
        }}>
          <span style={{ fontSize: "10px" }}>⚡</span> Studio
        </a>

        <div style={{ width: 1, height: 20, background: RS.border }} />

        <button onClick={onClose} style={{
          padding: "4px 10px", borderRadius: 5,
          border: `1px solid ${RS.border}`, background: "transparent",
          color: RS.textSub, fontSize: "11px", cursor: "pointer",
        }}>Close</button>

        <button onClick={handleSave} style={{
          padding: "5px 14px", borderRadius: 5, border: "none",
          background: RS.accent, color: "white",
          fontSize: "11px", fontWeight: 600, cursor: "pointer",
        }}>Save changes</button>
      </div>

      {/* ══ BODY ══ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* ── Centre: Remotion Player ── */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          background: "#000", padding: 20, minWidth: 0,
        }}>
          <div dir="ltr" style={{
            width: "100%", maxWidth: 420,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: `0 0 0 1px ${RS.border}, 0 20px 60px rgba(0,0,0,.8)`,
          }}>
            <Player
              ref={playerRef}
              component={BrandedVideo}
              inputProps={{
                text: assembledText,
                assocName: assocName ?? "الجمعية",
                assocInitial: assocInitial ?? assocName?.[0] ?? "ج",
                assocRegion,
                assocPhone,
                assocEmail,
                imageUrl: showBg ? imageUrl : undefined,
                audioUrl: showAudio ? audioUrl : undefined,
                logoUrl: showLogo ? logoUrl : undefined,
                aiBrand,
                brandColors: aiBrand
                  ? [parseBrandColors(aiBrand).primary, parseBrandColors(aiBrand).secondary, parseBrandColors(aiBrand).accent]
                  : undefined,
                transitionStyle,
                slideFrames,
                showLogo,
                showOutro,
              }}
              durationInFrames={totalFrames}
              compositionWidth={1080}
              compositionHeight={1080}
              fps={30}
              numberOfSharedAudioTags={5}
              style={{ width: "100%", aspectRatio: "1" }}
              controls
            />
          </div>
        </div>

        {/* ══ RIGHT PANEL — Remotion Studio style ══ */}
        <div style={{
          width: 280, flexShrink: 0,
          background: RS.bg,
          borderRight: `1px solid ${RS.border}`,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>

          {/* Tab bar — like Remotion's right panel tabs */}
          <div style={{
            display: "flex",
            borderBottom: `1px solid ${RS.border}`,
            background: RS.bg, flexShrink: 0,
          }}>
            <TabBtn id="sequences" label="Sequences" />
            <TabBtn id="props"     label="Props" />
            <TabBtn id="settings"  label="Settings" />
          </div>

          {/* ── TAB: SEQUENCES ── */}
          {tab === "sequences" && (
            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
              <SectionHeader label={`${slides.length} sequences · drag to reorder`} />
              {slides.map((slide, i) => {
                const isSel   = i === selectedIdx;
                const isPlay  = i === activeSlide;
                return (
                  <div
                    key={i}
                    draggable
                    onDragStart={e => onDragStart(e, i)}
                    onDragOver={e  => onDragOver(e, i)}
                    onDrop={e      => onDrop(e, i)}
                    onDragEnd={onDragEnd}
                    onClick={() => seekToSlide(i)}
                    style={{
                      display: "flex", alignItems: "center",
                      padding: "5px 10px 5px 0", gap: 6,
                      borderBottom: `1px solid ${RS.borderSub}`,
                      borderRight: `3px solid ${isSel ? RS.accent : "transparent"}`,
                      background: isSel
                        ? RS.accentDim
                        : dropIdx === i && dragIdx !== i
                          ? "rgba(99,102,241,.1)"
                          : isPlay
                            ? RS.surfaceHov
                            : "transparent",
                      cursor: "grab",
                      opacity: dragIdx === i ? 0.35 : 1,
                      transition: "background .08s",
                    }}
                  >
                    {/* Drag handle */}
                    <div style={{
                      width: 14, flexShrink: 0, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      color: RS.textMuted, fontSize: "9px",
                    }}>⠿</div>

                    {/* Sequence colour dot */}
                    <div style={{
                      width: 8, height: 8, borderRadius: 2, flexShrink: 0,
                      background: isSel ? RS.accent : isPlay ? RS.green : RS.textMuted,
                    }} />

                    {/* Icon + name */}
                    <span style={{ fontSize: "13px", flexShrink: 0 }}>{slide.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: "11px", color: isSel ? RS.text : RS.textSub,
                        fontWeight: isSel ? 600 : 400,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        direction: "rtl", fontFamily: "'Tajawal',sans-serif",
                      }}>
                        {slide.line}
                      </div>
                    </div>

                    {/* Duration badge */}
                    <span style={{
                      fontSize: "9px", color: RS.textMuted,
                      fontFamily: "monospace", flexShrink: 0,
                    }}>
                      {(slide.durationFrames / 30).toFixed(1)}s
                    </span>
                  </div>
                );
              })}

              {/* Add sequence button */}
              <button
                onClick={addSlide}
                style={{
                  width: "100%", padding: "7px 12px",
                  background: "transparent",
                  border: "none",
                  borderBottom: `1px solid ${RS.borderSub}`,
                  color: RS.textMuted, fontSize: "11px",
                  cursor: "pointer", textAlign: "right",
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: "system-ui,sans-serif",
                  transition: "background .1s, color .1s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = RS.surfaceHov;
                  (e.currentTarget as HTMLButtonElement).style.color = RS.text;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = RS.textMuted;
                }}
              >
                <span style={{ fontSize: "12px" }}>+</span> Add sequence
              </button>
            </div>
          )}

          {/* ── TAB: PROPS ── */}
          {tab === "props" && (
            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
              {/* Sequence selector */}
              <div style={{
                padding: "6px 12px",
                borderBottom: `1px solid ${RS.border}`,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <button
                  onClick={() => setSelectedIdx(i => Math.max(0, i - 1))}
                  style={{
                    width: 20, height: 20, borderRadius: 4,
                    border: `1px solid ${RS.border}`, background: RS.surface,
                    color: RS.textSub, cursor: "pointer", fontSize: "10px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >‹</button>
                <span style={{
                  flex: 1, fontSize: "11px", color: RS.textSub,
                  textAlign: "center", fontFamily: "monospace",
                }}>
                  {slides[selectedIdx]?.icon} Slide {selectedIdx + 1} / {slides.length}
                </span>
                <button
                  onClick={() => setSelectedIdx(i => Math.min(slides.length - 1, i + 1))}
                  style={{
                    width: 20, height: 20, borderRadius: 4,
                    border: `1px solid ${RS.border}`, background: RS.surface,
                    color: RS.textSub, cursor: "pointer", fontSize: "10px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >›</button>
                {slides.length > 1 && (
                  <button
                    onClick={() => removeSlide(selectedIdx)}
                    style={{
                      width: 20, height: 20, borderRadius: 4,
                      border: `1px solid rgba(248,81,73,.3)`, background: "transparent",
                      color: RS.red, cursor: "pointer", fontSize: "10px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >×</button>
                )}
              </div>

              <SectionHeader label="sequence props" />

              {/* text prop */}
              <PropRow label="text">
                <textarea
                  value={slides[selectedIdx]?.line ?? ""}
                  onChange={e => updateText(selectedIdx, e.target.value)}
                  rows={3}
                  dir="rtl"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: RS.surface,
                    border: `1px solid ${RS.border}`,
                    borderRadius: 4, color: RS.text,
                    fontSize: "12px", lineHeight: 1.6,
                    padding: "5px 8px", resize: "none", outline: "none",
                    fontFamily: "'Tajawal',Cairo,sans-serif",
                    marginTop: 3,
                    transition: "border-color .12s",
                  }}
                  onFocus={e => (e.target.style.borderColor = RS.accent)}
                  onBlur={e  => (e.target.style.borderColor = RS.border)}
                />
              </PropRow>

              {/* icon prop */}
              <PropRow label="icon">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 3 }}>
                  {ICON_OPTIONS.map(icon => {
                    const active = slides[selectedIdx]?.icon === icon;
                    return (
                      <button
                        key={icon}
                        onClick={() => updateIcon(selectedIdx, icon)}
                        style={{
                          width: 26, height: 26, borderRadius: 4,
                          border: `1px solid ${active ? RS.accent : RS.border}`,
                          background: active ? RS.accentDim : RS.surface,
                          cursor: "pointer", fontSize: "13px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "border-color .1s",
                        }}
                      >{icon}</button>
                    );
                  })}
                </div>
              </PropRow>

              {/* durationInFrames prop */}
              <PropRow label="duration">
                <div style={{ marginTop: 4 }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    marginBottom: 4,
                  }}>
                    <span style={{ fontSize: "10px", color: RS.textMuted, fontFamily: "monospace" }}>
                      {slides[selectedIdx]?.durationFrames ?? 90} frames
                    </span>
                    <span style={{ fontSize: "10px", color: RS.accent, fontFamily: "monospace" }}>
                      {((slides[selectedIdx]?.durationFrames ?? 90) / 30).toFixed(2)}s
                    </span>
                  </div>
                  <input
                    type="range" min={60} max={180} step={15}
                    value={slides[selectedIdx]?.durationFrames ?? 90}
                    onChange={e => updateDuration(selectedIdx, Number(e.target.value))}
                    style={{ width: "100%", accentColor: RS.accent }}
                  />
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: "9px", color: RS.textMuted, fontFamily: "monospace", marginTop: 1,
                  }}>
                    <span>2s</span><span>3s</span><span>4s</span><span>5s</span><span>6s</span>
                  </div>
                </div>
              </PropRow>

              <SectionHeader label="composition" />

              {/* assocName prop (read-only display) */}
              <PropRow label="assocName">
                <div style={{
                  marginTop: 4, padding: "3px 7px",
                  background: RS.surface, border: `1px solid ${RS.border}`,
                  borderRadius: 4, fontSize: "11px", color: RS.textSub,
                  fontFamily: "'Tajawal',sans-serif", direction: "rtl",
                }}>
                  {assocName}
                </div>
              </PropRow>

              {/* fps prop (read-only) */}
              <PropRow label="fps">
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: RS.purple, paddingTop: 5, display: "block" }}>
                  30
                </span>
              </PropRow>

              {/* width × height */}
              <PropRow label="size">
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: RS.purple, paddingTop: 5, display: "block" }}>
                  1080 × 1080
                </span>
              </PropRow>

              {/* total frames */}
              <PropRow label="frames">
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: RS.purple, paddingTop: 5, display: "block" }}>
                  {totalFrames} ({(totalFrames / 30).toFixed(1)}s)
                </span>
              </PropRow>
            </div>
          )}

          {/* ── TAB: SETTINGS (layer visibility) ── */}
          {tab === "settings" && (
            <div style={{ flex: 1, overflowY: "auto" }}>
              <SectionHeader label="layer visibility" />

              <LayerRow
                label="Background" icon="🌿" color={RS.green}
                visible={showBg} onToggle={() => setShowBg(v => !v)}
              />
              <LayerRow
                label="Logo / Header" icon="🏷" color={RS.purple}
                visible={showLogo} onToggle={() => setShowLogo(v => !v)}
              />
              <LayerRow
                label="Audio" icon="🔊" color={RS.accent}
                visible={showAudio} onToggle={() => setShowAudio(v => !v)}
              />
              <LayerRow
                label="Outro / Contact" icon="📋" color={RS.yellow}
                visible={showOutro} onToggle={() => setShowOutro(v => !v)}
              />

              <SectionHeader label="slide transitions" />
              <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
                {(["slide", "wipe", "fade"] as TransitionStyle[]).map(ts => (
                  <button
                    key={ts}
                    onClick={() => setTransitionStyle(ts)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "5px 8px", borderRadius: 5, border: "none",
                      background: transitionStyle === ts ? RS.accentDim : "transparent",
                      borderRight: `3px solid ${transitionStyle === ts ? RS.accent : "transparent"}`,
                      color: transitionStyle === ts ? RS.text : RS.textSub,
                      fontSize: "11px", cursor: "pointer", fontFamily: "monospace",
                      textAlign: "right",
                    }}
                  >
                    <span style={{ fontSize: "13px" }}>
                      {ts === "slide" ? "▶" : ts === "wipe" ? "◧" : "◌"}
                    </span>
                    {ts}
                  </button>
                ))}
              </div>

              <SectionHeader label="export" />

              <div style={{ padding: "10px 12px" }}>
                <div style={{
                  fontSize: "11px", color: RS.textSub, lineHeight: 1.7, marginBottom: 10,
                }}>
                  Open Remotion Studio for full render control and MP4 export.
                </div>
                <a
                  href="http://localhost:3000"
                  target="_blank" rel="noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 6, padding: "7px 0",
                    background: RS.surface,
                    border: `1px solid ${RS.border}`,
                    borderRadius: 5, color: RS.text,
                    fontSize: "11px", fontWeight: 600,
                    textDecoration: "none", cursor: "pointer",
                    transition: "border-color .12s",
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.borderColor = RS.accent)}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.borderColor = RS.border)}
                >
                  <span style={{ fontSize: "13px" }}>⚡</span> Open Remotion Studio
                </a>
              </div>

              <SectionHeader label="debug" />
              <div style={{ padding: "8px 12px" }}>
                {[
                  ["slides", `${slides.length}`],
                  ["totalFrames", `${totalFrames}`],
                  ["currentFrame", `${currentFrame}`],
                  ["activeSlide", `${activeSlide}`],
                  ["showLogo", `${showLogo}`],
                  ["hasAudio", `${!!audioUrl}`],
                ].map(([k, v]) => (
                  <div key={k} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "2px 0",
                    fontSize: "10px", fontFamily: "monospace",
                    borderBottom: `1px solid ${RS.borderSub}`,
                    color: RS.textMuted,
                  }}>
                    <span>{k}</span>
                    <span style={{ color: RS.purple }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ MULTI-TRACK TIMELINE ══ */}
      <div style={{
        flexShrink: 0, height: 168,
        background: RS.bg,
        borderTop: `1px solid ${RS.border}`,
        display: "flex", flexDirection: "column",
      }}>
        {/* Timeline toolbar */}
        <div style={{
          height: 30, display: "flex", alignItems: "center",
          padding: "0 10px", gap: 8,
          borderBottom: `1px solid ${RS.border}`, flexShrink: 0,
        }}>
          <span style={{ fontSize: "9px", color: RS.textMuted, fontFamily: "monospace", letterSpacing: ".08em", textTransform: "uppercase" }}>
            Timeline
          </span>
          <div style={{ width: 1, height: 12, background: RS.border }} />
          <span style={{ fontSize: "9px", color: RS.textMuted, fontFamily: "monospace" }}>
            {slides.length} sequences · {(totalFrames / 30).toFixed(1)}s · 30fps
          </span>
          <div style={{ flex: 1 }} />
          {/* Playhead readout */}
          <div style={{
            display: "flex", gap: 4, alignItems: "center",
            background: RS.surface, border: `1px solid ${RS.border}`,
            borderRadius: 4, padding: "2px 7px",
          }}>
            <span style={{ fontSize: "9px", color: RS.textMuted, fontFamily: "monospace" }}>▶</span>
            <span style={{ fontSize: "10px", color: RS.accent, fontFamily: "monospace" }}>
              {currentFrame.toString().padStart(4, "0")}
            </span>
            <span style={{ fontSize: "9px", color: RS.textMuted, fontFamily: "monospace" }}>
              / {totalFrames}
            </span>
          </div>
        </div>

        {/* Scrollable track area */}
        <div ref={timelineRef} style={{
          flex: 1, overflowX: "auto", overflowY: "hidden",
          position: "relative",
        }}>
          {/* Playhead */}
          <div style={{
            position: "absolute", top: 0, bottom: 0,
            left: playheadX, width: 1,
            background: RS.red,
            zIndex: 20, pointerEvents: "none",
          }}>
            {/* Playhead handle */}
            <div style={{
              position: "absolute", top: 0, left: -4,
              width: 9, height: 9,
              background: RS.red,
              clipPath: "polygon(50% 100%, 0 0, 100% 0)",
            }} />
          </div>

          <div style={{
            display: "flex", flexDirection: "column",
            minWidth: `${72 + totalFrames * PX_PER_FRAME + 40}px`,
          }}>

            {/* Time ruler */}
            <div style={{ display: "flex", height: 24, flexShrink: 0 }}>
              <div style={{
                width: 72, flexShrink: 0,
                background: RS.surface, borderBottom: `1px solid ${RS.border}`,
                borderLeft: `1px solid ${RS.border}`,
              }} />
              <div style={{
                flex: 1, position: "relative",
                background: RS.surface,
                borderBottom: `1px solid ${RS.border}`,
              }}>
                {Array.from({ length: Math.ceil(totalFrames / 30) + 1 }, (_, i) => (
                  <div key={i} style={{
                    position: "absolute",
                    left: i * 30 * PX_PER_FRAME,
                    top: 0, height: "100%",
                    display: "flex", flexDirection: "column",
                    alignItems: "flex-start",
                  }}>
                    <div style={{
                      width: 1,
                      height: i % 5 === 0 ? 12 : 6,
                      background: i % 5 === 0 ? RS.border : RS.borderSub,
                    }} />
                    {i % 5 === 0 && (
                      <span style={{
                        fontSize: "9px", color: RS.textMuted,
                        fontFamily: "monospace", paddingLeft: 3, marginTop: 1,
                      }}>
                        {i}s
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Background track */}
            <div style={{ display: "flex", height: 28, flexShrink: 0 }}>
              <TrackLabel label="BG" color={RS.green} />
              <div style={{ flex: 1, position: "relative", borderBottom: `1px solid ${RS.borderSub}` }}>
                <div style={{
                  position: "absolute", left: 0, top: 4,
                  height: 20, width: totalFrames * PX_PER_FRAME,
                  background: `${RS.green}18`,
                  border: `1px solid ${RS.green}40`,
                  borderRadius: 3,
                  display: "flex", alignItems: "center", paddingLeft: 6,
                  boxSizing: "border-box", overflow: "hidden",
                }}>
                  <span style={{ fontSize: "9px", color: RS.green, fontFamily: "monospace", opacity: .7, whiteSpace: "nowrap" }}>
                    Background · {(totalFrames / 30).toFixed(1)}s
                  </span>
                </div>
              </div>
            </div>

            {/* Logo track */}
            {showLogo && (
              <div style={{ display: "flex", height: 28, flexShrink: 0 }}>
                <TrackLabel label="Logo" color={RS.purple} />
                <div style={{ flex: 1, position: "relative", borderBottom: `1px solid ${RS.borderSub}` }}>
                  <div style={{
                    position: "absolute", left: 0, top: 4,
                    height: 20, width: totalFrames * PX_PER_FRAME,
                    background: `${RS.purple}18`,
                    border: `1px solid ${RS.purple}40`,
                    borderRadius: 3,
                    display: "flex", alignItems: "center", paddingLeft: 6,
                    boxSizing: "border-box", overflow: "hidden",
                  }}>
                    <span style={{ fontSize: "9px", color: RS.purple, fontFamily: "monospace", opacity: .7, whiteSpace: "nowrap" }}>
                      Logo · {assocName}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Slide sequences track */}
            <div style={{ display: "flex", height: 36, flexShrink: 0 }}>
              <TrackLabel label="Slides" color={RS.accent} />
              <div style={{ flex: 1, position: "relative", borderBottom: `1px solid ${RS.borderSub}` }}>
                {slides.map((slide, i) => {
                  const x   = slideStarts[i] * PX_PER_FRAME;
                  const w   = Math.max(slide.durationFrames * PX_PER_FRAME - 2, 16);
                  const sel = i === selectedIdx;
                  const act = i === activeSlide;
                  return (
                    <div
                      key={i}
                      draggable
                      onDragStart={e => onDragStart(e, i)}
                      onDragOver={e  => onDragOver(e, i)}
                      onDrop={e      => onDrop(e, i)}
                      onDragEnd={onDragEnd}
                      onClick={() => seekToSlide(i)}
                      title={slide.line}
                      style={{
                        position: "absolute",
                        left: x, top: 4, width: w, height: 28,
                        background: sel
                          ? RS.accentDim
                          : act
                            ? "rgba(56,139,253,.08)"
                            : RS.surface,
                        border: `1px solid ${sel ? RS.accent : act ? RS.accent + "60" : RS.border}`,
                        borderRadius: 4,
                        cursor: "grab",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 3,
                        overflow: "hidden", boxSizing: "border-box",
                        opacity: dragIdx === i ? 0.3 : 1,
                        outline: dropIdx === i && dragIdx !== i ? `2px solid ${RS.accent}` : "none",
                        transition: "border-color .1s",
                      }}
                    >
                      <span style={{ fontSize: "11px", flexShrink: 0 }}>{slide.icon}</span>
                      {w > 38 && (
                        <span style={{
                          fontSize: "9px", color: sel ? RS.text : RS.textMuted,
                          fontFamily: "monospace", overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap",
                          maxWidth: w - 30,
                        }}>
                          {i + 1}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audio track */}
            <div style={{ display: "flex", height: 28, flexShrink: 0 }}>
              <TrackLabel label="Audio" color="#38bdf8" />
              <div style={{ flex: 1, position: "relative", borderBottom: `1px solid ${RS.borderSub}` }}>
                {audioUrl ? (
                  <div style={{
                    position: "absolute", left: 0, top: 4,
                    height: 20, width: totalFrames * PX_PER_FRAME,
                    background: "rgba(56,189,248,.1)",
                    border: "1px solid rgba(56,189,248,.3)",
                    borderRadius: 3,
                    display: "flex", alignItems: "center",
                    paddingLeft: 6, overflow: "hidden",
                    boxSizing: "border-box",
                  }}>
                    {/* Waveform bars */}
                    <div style={{ display: "flex", gap: 1, alignItems: "center", height: "100%", overflow: "hidden" }}>
                      {Array.from({ length: Math.floor((totalFrames * PX_PER_FRAME) / 3.5) }).map((_, j) => (
                        <div key={j} style={{
                          width: 1.5, flexShrink: 0,
                          height: `${28 + Math.sin(j * .9) * 15 + Math.sin(j * 1.7) * 10}%`,
                          background: "rgba(56,189,248,.45)",
                          borderRadius: 1,
                        }} />
                      ))}
                    </div>
                    <span style={{
                      position: "absolute", right: 6, fontSize: "9px",
                      color: "rgba(56,189,248,.6)", fontFamily: "monospace", whiteSpace: "nowrap",
                    }}>Audio</span>
                  </div>
                ) : (
                  <div style={{
                    position: "absolute", left: 0, top: 4,
                    height: 20, width: totalFrames * PX_PER_FRAME,
                    border: `1px dashed ${RS.borderSub}`, borderRadius: 3,
                    display: "flex", alignItems: "center", paddingLeft: 6,
                  }}>
                    <span style={{ fontSize: "9px", color: RS.textMuted, fontFamily: "monospace" }}>no audio</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
