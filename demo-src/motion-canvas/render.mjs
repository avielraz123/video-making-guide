// Headless render: Revideo starts a Vite server, opens the project in a
// browser (puppeteer), plays the scenes and pipes frames to ffmpeg.
//
// Run:  node render.mjs        -> out/revideo-code.mp4
import { renderVideo } from "@revideo/renderer";

process.env.DISABLE_TELEMETRY = "true"; // Revideo sends anonymous usage data otherwise

const file = await renderVideo({
  projectFile: "./src/project.ts",
  settings: {
    outFile: "revideo-code.mp4",
    outDir: "./out",
    logProgress: true,
    // encode frames with ffmpeg on the Node side (the default in-browser WebCodecs
    // exporter produced empty files with headless Chrome on Windows)
    projectSettings: { exporter: { name: "@revideo/core/ffmpeg", options: { format: "mp4" } } },
    // use the installed Chrome instead of downloading one for puppeteer
    puppeteer: { executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" },
  },
});
console.log("done:", file);
