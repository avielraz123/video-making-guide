// A Revideo project = a list of scenes + settings (size, background).
import { makeProject } from "@revideo/core";
import codeScene from "./scenes/code";

export default makeProject({
  scenes: [codeScene],
  settings: {
    shared: { size: { x: 1280, y: 720 }, background: "#0f1b33" },
    rendering: { fps: 30 },
  },
});
