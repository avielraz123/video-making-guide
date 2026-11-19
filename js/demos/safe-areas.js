/* Demo: safe areas & aspect ratios. */
(function () {
  "use strict";
  var VG = window.VG;

  var RATIOS = {
    "16:9": { r: 16 / 9, where: "YouTube, class presentations, most screens", px: "1920 × 1080" },
    "1:1": { r: 1, where: "feeds (Instagram, LinkedIn, X), works everywhere", px: "1080 × 1080" },
    "4:5": { r: 4 / 5, where: "Instagram / Facebook feed posts (takes more screen than 1:1)", px: "1080 × 1350" },
    "9:16": { r: 9 / 16, where: "Shorts, Reels, TikTok, Stories", px: "1080 × 1920" }
  };
  // approximate overlay zones (percent of frame): [left, top, width, height, label]
  var UI_ZONES = {
    "16:9": [[0, 88, 100, 12, "player controls (on hover/pause)"]],
    "1:1": [],
    "4:5": [[0, 90, 100, 10, "caption / likes (varies)"]],
    "9:16": [[0, 0, 100, 10, "top bar / tabs"], [84, 42, 16, 40, "like · comment · share"], [0, 78, 100, 22, "username, caption, audio"]]
  };

  VG.demos.push({
    id: "safe-areas",
    title: "Safe areas & aspect ratios",
    tag: "Framing",
    intro: "The same video gets watched in very different frames. A layout designed for 16:9 and simply center-cropped to 9:16 loses its title and its logo, and on Shorts/Reels/TikTok the app's own buttons and captions cover the edges. Switch formats, compare “crop” with “reframe”, and turn on the overlays.",
    render: function (root) {
      var ui = VG.ui, h = ui.h, D = VG.demoUi;
      var st = { ratio: "16:9", mode: "crop", safe: true, platform: true, thirds: false };
      var wrap = h("div", { class: "sa-wrap" });
      var frame = h("div", { class: "sa-frame", role: "img" });
      wrap.appendChild(frame);
      var info = h("p", { class: "small", style: { margin: "10px 0 0" } });

      function content16x9() {
        // a layout designed for 16:9; we place it inside a 16:9 box that may be wider than the frame
        return h("div", { style: { position: "absolute", inset: "0", background: "linear-gradient(135deg, #24204a 0%, #15142b 60%, #0f1d24 100%)", "container-type": "inline-size" } },
          h("div", { style: { position: "absolute", left: "6%", top: "9%", "font-weight": "850", "font-size": "5.2cqw", "line-height": "1.05", color: "#fff", "letter-spacing": "-0.02em" }, html: "3 tips for<br>faster pages" }),
          h("div", { style: { position: "absolute", right: "3.5%", top: "6%", "font": "800 2cqw/1 system-ui", color: "#10100f", background: "#ffd166", padding: "0.6cqw 1cqw", "border-radius": "0.8cqw" }, text: "LOGO" }),
          chart({ position: "absolute", left: "57%", top: "22%", width: "36%", height: "55%" }),
          h("div", { style: { position: "absolute", left: "6%", bottom: "9%", background: "rgba(0,0,0,.65)", color: "#fff", "font-weight": "700", "font-size": "2.6cqw", padding: "0.8cqw 1.6cqw", "border-radius": "0.8cqw", "border-left": "0.6cqw solid #ff5e52" }, text: "Tip 1: cache what doesn't change" })
        );
      }
      function contentReframed(ratio) {
        var tall = RATIOS[ratio].r < 1;
        return h("div", { style: { position: "absolute", inset: "0", background: "linear-gradient(160deg, #24204a 0%, #15142b 60%, #0f1d24 100%)", "container-type": "inline-size" } },
          h("div", { style: { position: "absolute", left: "8%", right: tall ? "18%" : "8%", top: tall ? "14%" : "8%", "font-weight": "850", "font-size": tall ? "9.5cqw" : "8cqw", "line-height": "1.05", color: "#fff", "letter-spacing": "-0.02em" }, html: "3 tips for<br>faster pages" }),
          h("div", { style: { position: "absolute", right: "8%", top: tall ? "14%" : "8%", "font": "800 " + (tall ? "3.4" : "3") + "cqw/1 system-ui", color: "#10100f", background: "#ffd166", padding: "1cqw 1.6cqw", "border-radius": "1.2cqw", display: tall ? "none" : "block" }, text: "LOGO" }),
          chart({ position: "absolute", left: "10%", width: tall ? "64%" : "80%", top: tall ? "34%" : "34%", height: tall ? "26%" : "38%" }),
          h("div", { style: { position: "absolute", left: "8%", right: tall ? "18%" : "8%", top: tall ? "64%" : "auto", bottom: tall ? "auto" : "8%", background: "rgba(0,0,0,.65)", color: "#fff", "font-weight": "750", "font-size": tall ? "5.2cqw" : "4.2cqw", padding: "1.6cqw 2.4cqw", "border-radius": "1.4cqw", "border-left": "1cqw solid #ff5e52", "line-height": "1.2" }, text: "Tip 1: cache what doesn't change" })
        );
      }
      function chart(pos) {
        var c = h("div", { style: Object.assign({ display: "flex", "align-items": "flex-end", gap: "6%", "border-bottom": "2px solid rgba(255,255,255,.4)" }, pos) });
        [[100, "#5c5a7a"], [72, "#5c5a7a"], [34, "#34d1bf"]].forEach(function (b) { c.appendChild(h("div", { style: { flex: "1", height: b[0] + "%", background: b[1], "border-radius": "4px 4px 0 0" } })); });
        return c;
      }
      function zone(pct, color, text, labelBottom) {
        var inset = (100 - pct) / 2;
        var labelPos = labelBottom ? { background: color, color: "#111", top: "auto", left: "auto", bottom: "2px", right: "4px" } : { background: color, color: "#111" };
        return h("div", { class: "sa-zone", style: { left: inset + "%", top: inset + "%", right: inset + "%", bottom: inset + "%", "border-color": color } }, h("span", { style: labelPos, text: text }));
      }

      function draw() {
        var R = RATIOS[st.ratio];
        var avail = Math.max(120, wrap.clientWidth - 28);
        var maxH = Math.min(440, Math.max(260, window.innerHeight * 0.55));
        var w = Math.min(avail, maxH * R.r), hgt = w / R.r;
        frame.style.width = w + "px"; frame.style.height = hgt + "px";
        frame.replaceChildren();
        if (st.mode === "crop" || st.ratio === "16:9") {
          var cw = hgt * 16 / 9;
          if (cw < w) { cw = w; }
          var box = h("div", { class: "sa-content", style: { left: ((w - cw) / 2) + "px", width: cw + "px", right: "auto", height: (cw * 9 / 16) + "px", top: ((hgt - cw * 9 / 16) / 2) + "px" } }, content16x9());
          frame.appendChild(box);
        } else {
          frame.appendChild(h("div", { class: "sa-content" }, contentReframed(st.ratio)));
        }
        if (st.thirds) frame.appendChild(h("div", { class: "sa-thirds" }));
        if (st.safe) { frame.appendChild(zone(93, "#34d1bf", "action safe 93%", true)); frame.appendChild(zone(90, "#ffd166", "title safe 90%")); }
        if (st.platform) (UI_ZONES[st.ratio] || []).forEach(function (z) {
          frame.appendChild(h("div", { class: "sa-ui", style: { left: z[0] + "%", top: z[1] + "%", width: z[2] + "%", height: z[3] + "%" } }, h("span", { text: z[4] })));
        });
        frame.setAttribute("aria-label", "Example frame in " + st.ratio + ", " + (st.mode === "crop" ? "center-cropped from a 16:9 layout" : "re-laid out for this format") + ".");
        info.innerHTML = "<b>" + st.ratio + "</b> (" + R.px + "): " + R.where + "." + (st.ratio !== "16:9" && st.mode === "crop" ? " <span style=\"color:var(--bad)\">Cropped: the title, logo and caption are cut off.</span>" : "");
      }

      var controls = h("div", { class: "demo-controls" },
        D.seg("Aspect ratio", Object.keys(RATIOS).map(function (k) { return [k, k]; }), st.ratio, function (v) { st.ratio = v; draw(); }),
        D.seg("Layout", [["crop", "Center crop of 16:9"], ["reframe", "Reframed"]], st.mode, function (v) { st.mode = v; draw(); }),
        h("div", { class: "field" }, h("span", { class: "label", text: "Overlays" }), h("div", { style: { display: "flex", "flex-direction": "column", gap: "6px" } },
          check("sa-safe", "Title / action safe", st.safe, function (v) { st.safe = v; draw(); }),
          check("sa-ui", "Platform UI (approx.)", st.platform, function (v) { st.platform = v; draw(); }),
          check("sa-thirds", "Rule of thirds", st.thirds, function (v) { st.thirds = v; draw(); })
        )),
        D.lesson("Framing rules", [
          "Decide the format <b>before</b> you animate. Reframing later costs more than designing twice.",
          "For vertical video, keep text in the middle: away from roughly the top 10–15%, the bottom 20–30% and the right ~15%. Platforms change their UI, so check a current safe-zone template.",
          "Keep important text inside the 90% title-safe box, even for 16:9 (TVs and some players crop edges).",
          "Publishing in several formats? Build the layout from variables (Remotion props, Manim config) so Claude can render each format properly instead of cropping."
        ])
      );
      function check(id, label, val, on) {
        var c = h("input", { type: "checkbox", id: id, checked: val });
        c.addEventListener("change", function () { on(c.checked); });
        return h("label", { class: "check", for: id }, c, label);
      }
      root.appendChild(h("div", { class: "demo-body" }, h("div", null, wrap, info), controls));
      var ro = window.ResizeObserver ? new ResizeObserver(function () { draw(); }) : null;
      if (ro) ro.observe(wrap); else window.addEventListener("resize", draw);
      setTimeout(draw, 0);
      draw();
      return function () { if (ro) ro.disconnect(); else window.removeEventListener("resize", draw); };
    }
  });
})();
