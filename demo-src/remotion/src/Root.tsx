// Every video Remotion can render is a <Composition>: a component + size + fps + length.
import React from "react";
import { Composition, Folder } from "remotion";
import { FORMATS, FormatStandalone, FormatsSideBySide } from "./Formats";
import { KineticChart } from "./KineticChart";
import { NarratedExplainer } from "./NarratedExplainer";
import { FPS } from "./theme";

const hd = { fps: FPS, width: 1280, height: 720 };

export const Root: React.FC = () => (
  <>
    <Composition id="KineticChart" component={KineticChart} durationInFrames={8 * FPS} {...hd} />
    {/* 8.6 s of narration + 0.5 s lead-in + ~1 s to breathe */}
    <Composition id="NarratedExplainer" component={NarratedExplainer} durationInFrames={10 * FPS} {...hd} />
    <Composition id="FormatsSideBySide" component={FormatsSideBySide} durationInFrames={6 * FPS} {...hd} />

    {/* The same scene at real social-media sizes: render any one of these on its own */}
    <Folder name="Formats">
      {FORMATS.map((f) => (
        <Composition
          key={f.id}
          id={f.id}
          component={FormatStandalone}
          defaultProps={{ ratio: f.ratio }}
          durationInFrames={6 * FPS}
          fps={FPS}
          width={f.width}
          height={f.height}
        />
      ))}
    </Folder>
  </>
);
