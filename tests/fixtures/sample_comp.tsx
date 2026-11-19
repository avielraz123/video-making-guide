import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

// Fixture source file used by the smoke test.
export const Captions: React.FC<{ words: string[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], { easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ justifyContent: "center", opacity }}>
      <h1 className="caption">{words.join(" ")}</h1>
    </AbsoluteFill>
  );
};
