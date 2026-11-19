// One scene, three aspect ratios.
// <FormatScene> lays itself out from its width/height (row for landscape,
// column for square/portrait) and sizes text from the shorter side.
// Root.tsx registers it as three real compositions (16:9, 1:1, 9:16), and
// <FormatsSideBySide> shows all three, scaled down, in one 1280x720 video.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";

export const FORMATS = [
  { id: "Format-16x9", ratio: "16:9", width: 1920, height: 1080, use: "YouTube, laptops, TVs" },
  { id: "Format-1x1", ratio: "1:1", width: 1080, height: 1080, use: "Instagram / LinkedIn feed" },
  { id: "Format-9x16", ratio: "9:16", width: 1080, height: 1920, use: "TikTok, Reels, Shorts" },
];

export const FormatScene: React.FC<{ width: number; height: number; ratio: string }> = ({ width, height, ratio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const unit = Math.min(width, height) / 100; // 1 unit = 1% of the shorter side
  const landscape = width > height;

  const pop = spring({ frame, fps, config: { damping: 10 } });
  const line1 = spring({ frame: frame - 12, fps, config: { damping: 200 } });
  const line2 = spring({ frame: frame - 24, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        width,
        height,
        background: theme.bg,
        fontFamily: theme.font,
        flexDirection: landscape ? "row" : "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 7 * unit,
      }}
    >
      {/* the "logo": a ring that pops in and keeps turning */}
      <div
        style={{
          width: 30 * unit,
          height: 30 * unit,
          borderRadius: "50%",
          border: `${3.5 * unit}px solid ${theme.accent}`,
          borderRightColor: "transparent",
          scale: String(pop),
          rotate: `${frame * 3}deg`,
        }}
      />
      <div style={{ textAlign: landscape ? "left" : "center", color: theme.text }}>
        <div style={{ fontSize: 11 * unit, fontWeight: 800, opacity: line1, translate: `0px ${(1 - line1) * 4 * unit}px` }}>
          One scene.
        </div>
        <div
          style={{
            fontSize: 11 * unit,
            fontWeight: 800,
            color: theme.accent,
            opacity: line2,
            translate: `0px ${(1 - line2) * 4 * unit}px`,
          }}
        >
          Any shape.
        </div>
        <div style={{ fontSize: 5 * unit, color: theme.muted, marginTop: 2 * unit, opacity: line2 }}>
          {ratio} · {width}×{height}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Used by the three standalone compositions: size comes from the composition.
export const FormatStandalone: React.FC<{ ratio: string }> = ({ ratio }) => {
  const { width, height } = useVideoConfig();
  return <FormatScene width={width} height={height} ratio={ratio} />;
};

// All three side by side, each drawn at full size and scaled down with CSS.
export const FormatsSideBySide: React.FC = () => {
  const frame = useCurrentFrame();
  const panelHeight = 330;
  const fade = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#08101f", fontFamily: theme.font, alignItems: "center", opacity: fade }}>
      <div style={{ marginTop: 70, fontSize: 36, fontWeight: 800, color: theme.text }}>
        Same scene, three aspect ratios
      </div>
      <div style={{ display: "flex", gap: 30, alignItems: "flex-start", marginTop: 60 }}>
        {FORMATS.map((f) => {
          const scale = panelHeight / f.height;
          return (
            <div key={f.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: f.width * scale,
                  height: panelHeight,
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 8,
                  outline: "2px solid #2c4170",
                }}
              >
                <div style={{ width: f.width, height: f.height, scale: String(scale), transformOrigin: "top left" }}>
                  <FormatScene width={f.width} height={f.height} ratio={f.ratio} />
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: theme.accent }}>{f.ratio}</div>
              <div style={{ fontSize: 17, color: theme.muted, maxWidth: f.width * scale + 40, textAlign: "center" }}>
                {f.use}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
