// Narrated explainer: Kokoro voice + Whisper word timestamps + Remotion visuals.
// Everything on screen is timed from captions.json, so if the narration is
// regenerated (new text, new voice) the visuals and captions follow on their own.
import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import words from "./captions.json"; // [{ text, startMs, endMs }] from narration/timestamps.py
import { theme } from "./theme";

export const AUDIO_DELAY_MS = 500; // a short breath of silence before the voice starts

type Word = { text: string; startMs: number; endMs: number };

// Find when a keyword is spoken (ms into the audio).
const spokenAt = (keyword: string) =>
  (words as Word[]).find((w) => w.text.toLowerCase().startsWith(keyword.toLowerCase()))?.startMs ?? 0;

// The four pipeline steps light up when their name is spoken.
const STEPS = [
  { name: "Claude", role: "writes the code", icon: "</>", at: spokenAt("Claude") },
  { name: "Kokoro", role: "speaks the script", icon: "♪", at: spokenAt("Kokoro") },
  { name: "Whisper", role: "times every word", icon: "⏱", at: spokenAt("Whisper") },
  { name: "Remotion", role: "renders the video", icon: "▶", at: spokenAt("Remotion") },
];

// Group words into caption "pages": a new page starts after a comma or period.
const PAGES: Word[][] = [];
for (const w of words as Word[]) {
  if (PAGES.length === 0 || /[,.]$/.test(PAGES[PAGES.length - 1].at(-1)!.text)) PAGES.push([]);
  PAGES[PAGES.length - 1].push(w);
}

const StepCard: React.FC<{ step: (typeof STEPS)[number]; nowMs: number }> = ({ step, nowMs }) => {
  const { fps } = useVideoConfig();
  const sinceMs = nowMs - step.at;
  const on = spring({ frame: (sinceMs / 1000) * fps, fps, config: { damping: 14 } }); // 0 -> 1 when spoken
  return (
    <div
      style={{
        width: 230,
        height: 230,
        borderRadius: 24,
        background: theme.panel,
        border: `3px solid ${on > 0.5 ? theme.accent : "#2c4170"}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        scale: String(interpolate(on, [0, 1], [0.9, 1.05])),
        opacity: interpolate(on, [0, 1], [0.35, 1]),
      }}
    >
      <div style={{ fontSize: 64, color: theme.accent, fontFamily: theme.mono, fontWeight: 700 }}>{step.icon}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: theme.text }}>{step.name}</div>
      <div style={{ fontSize: 20, color: theme.muted }}>{step.role}</div>
    </div>
  );
};

const Captions: React.FC<{ nowMs: number }> = ({ nowMs }) => {
  // Show the page whose first word has started most recently.
  const page = [...PAGES].reverse().find((p) => nowMs >= p[0].startMs - 150);
  if (!page) return null;
  return (
    <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", maxWidth: 1100 }}>
      {page.map((w) => {
        const active = nowMs >= w.startMs && nowMs < w.endMs + 80;
        const spoken = nowMs >= w.startMs;
        return (
          <span
            key={w.startMs}
            style={{
              fontSize: 46,
              fontWeight: 800,
              color: active ? theme.accent : theme.text,
              opacity: spoken ? 1 : 0.3, // upcoming words are dimmed
              scale: active ? "1.08" : "1",
              display: "inline-block",
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

export const NarratedExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const nowMs = (frame / fps) * 1000 - AUDIO_DELAY_MS; // time on the audio's clock

  // Progress line under the cards fills up as the narration plays.
  const lastMs = (words as Word[]).at(-1)!.endMs;
  const progress = interpolate(nowMs, [0, lastMs], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.font, opacity: fadeOut }}>
      <Sequence from={Math.round((AUDIO_DELAY_MS / 1000) * fps)}>
        <Audio src={staticFile("narration.mp3")} />
      </Sequence>

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 26, letterSpacing: 4, color: theme.muted, fontWeight: 600 }}>
          THE VIDEO PIPELINE
        </div>
        <div style={{ display: "flex", gap: 40, marginTop: 50 }}>
          {STEPS.map((s) => (
            <StepCard key={s.name} step={s} nowMs={nowMs} />
          ))}
        </div>
        <div style={{ width: 1040, height: 6, borderRadius: 3, background: theme.panel, marginTop: 40 }}>
          <div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 3, background: theme.accent }} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 110 }}>
        <Captions nowMs={nowMs} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
