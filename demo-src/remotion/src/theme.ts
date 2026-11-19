// One shared look for every demo in the gallery.
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "800"], subsets: ["latin"] });

export const theme = {
  bg: "#0f1b33", // dark navy
  panel: "#1a2a4a", // cards, empty bars
  text: "#e8eef8",
  muted: "#8aa0c0",
  accent: "#ffb547", // amber: the one accent color
  font: fontFamily,
  mono: "Consolas, 'Courier New', monospace",
};

export const FPS = 30;
