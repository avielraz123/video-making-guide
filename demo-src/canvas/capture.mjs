// Record any canvas animation to MP4: open the page in a headless browser,
// draw each frame on demand, and pipe the PNGs straight into ffmpeg.
//
// Run:  node capture.mjs        -> out/canvas-particles.mp4
// Uses the Edge/Chrome already installed (playwright-core, no browser download).
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
mkdirSync(here + "out", { recursive: true });

const browser = await chromium.launch({ channel: "msedge" }); // or "chrome"
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(pathToFileURL(here + "particles.html").href + "?capture");
const frames = await page.evaluate(() => window.FRAMES);

// ffmpeg reads a stream of PNG images from stdin and encodes H.264.
const ffmpeg = spawn("ffmpeg", [
  "-y", "-v", "error",
  "-f", "image2pipe", "-framerate", "30", "-i", "-",
  "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-tune", "animation", "-pix_fmt", "yuv420p",
  "-movflags", "+faststart",
  here + "out/canvas-particles.mp4",
], { stdio: ["pipe", "inherit", "inherit"] });

for (let n = 0; n < frames; n++) {
  // Draw frame n inside the page, then export the canvas as PNG bytes.
  const dataUrl = await page.evaluate((i) => {
    window.drawFrame(i);
    return document.getElementById("c").toDataURL("image/png");
  }, n);
  const png = Buffer.from(dataUrl.split(",")[1], "base64");
  if (!ffmpeg.stdin.write(png)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
}

ffmpeg.stdin.end();
await new Promise((r) => ffmpeg.on("close", r));
await browser.close();
console.log(`done: out/canvas-particles.mp4 (${frames} frames)`);
