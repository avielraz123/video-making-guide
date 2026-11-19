// Kinetic typography + a growing bar chart.
// Teaches: spring() for bouncy entrances, interpolate() for mapping frames to
// values, and <Sequence> for putting parts on a timeline.
import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";

const WORDS = ["Make", "every", "frame", "count."];

const DATA = [
  { label: "Hook", value: 92 },
  { label: "Story", value: 64 },
  { label: "Visuals", value: 78 },
  { label: "Pace", value: 55 },
  { label: "Ending", value: 85 },
];

// Part 1: words pop in one after another, then the whole line moves up.
const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // After 2 s the title slides up and shrinks to make room for the chart.
  const lift = spring({ frame: frame - 2 * fps, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        translate: `0px ${interpolate(lift, [0, 1], [0, -190])}px`,
        scale: String(interpolate(lift, [0, 1], [1, 0.7])),
      }}
    >
      <div style={{ display: "flex", gap: 20 }}>
        {WORDS.map((word, i) => {
          // Each word starts 6 frames after the previous one (a "stagger").
          const s = spring({ frame: frame - i * 6, fps, config: { damping: 12, stiffness: 120 } });
          return (
            <span
              key={word}
              style={{
                fontSize: 84,
                fontWeight: 800,
                color: i === 2 ? theme.accent : theme.text, // accent on the key word
                opacity: s,
                translate: `0px ${interpolate(s, [0, 1], [60, 0])}px`,
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Part 2: bars grow from zero, each a little later, and the numbers count up.
const Chart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxHeight = 320;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 50 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 34 }}>
        {DATA.map((d, i) => {
          const grow = spring({ frame: frame - i * 5, fps, config: { damping: 18, mass: 0.8 } });
          const height = (d.value / 100) * maxHeight * grow;
          return (
            <div key={d.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 26, fontWeight: 600, color: theme.text }}>{Math.round(d.value * grow)}</span>
              <div
                style={{
                  width: 100,
                  height,
                  borderRadius: "10px 10px 3px 3px",
                  background: i === 0 ? theme.accent : theme.panel, // highlight the winner
                  border: `2px solid ${i === 0 ? theme.accent : "#2c4170"}`,
                }}
              />
              <span style={{ fontSize: 20, color: theme.muted }}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const KineticChart: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.font }}>
      <Title />
      {/* The chart starts 2.4 s in; inside the Sequence, useCurrentFrame() restarts at 0 */}
      <Sequence from={Math.round(2.4 * fps)}>
        <Chart />
      </Sequence>
    </AbsoluteFill>
  );
};
