/* Demo: visual hierarchy before/after with a draggable divider and squint test. */
(function () {
  "use strict";
  var VG = window.VG;

  VG.demos.push({
    id: "hierarchy",
    title: "Visual hierarchy: before & after",
    tag: "Design",
    intro: "A video frame is on screen for a few seconds, so the viewer must know where to look instantly. Same information, two frames: drag the divider to compare. Then try the squint test: blur both and see what still stands out.",
    render: function (root) {
      var ui = VG.ui, h = ui.h, D = VG.demoUi;

      var before = h("div", { class: "hier-slide hier-before", "aria-hidden": "true" },
        h("div", { style: { "font-size": "3.2cqw", "font-weight": "700", color: "#1a3cc4", "text-decoration": "underline" }, text: "Results of the Caching Experiment (Week 3)" }),
        h("ul", { style: { "font-size": "2.4cqw", margin: "1.5cqw 0 0", "padding-left": "3cqw", "line-height": "1.35" } },
          h("li", { style: { color: "#c0392b" }, text: "We tested a cache layer on the product pages" }),
          h("li", { style: { color: "#16a085" }, text: "Average load time before: 1.2 seconds (n = 400)" }),
          h("li", { style: { color: "#8e44ad" }, text: "Average load time after: 0.4 seconds (n = 410)" }),
          h("li", { style: { color: "#d35400" }, text: "Improvement is about 3x which is significant" }),
          h("li", { style: { color: "#2c3e50" }, text: "Memory usage went up slightly (+40 MB)" }),
          h("li", { style: { color: "#27ae60" }, text: "Next steps: test on checkout, monitor memory" })
        ),
        h("div", { style: { position: "absolute", right: "5%", bottom: "6%", width: "22%", height: "26%", border: "1px solid #999", display: "flex", "align-items": "flex-end", gap: "8%", padding: "2%" } },
          h("div", { style: { flex: "1", height: "90%", background: "#3498db" } }),
          h("div", { style: { flex: "1", height: "30%", background: "#e67e22" } })
        ),
        h("div", { style: { position: "absolute", left: "6%", bottom: "6%", "font-size": "1.6cqw", color: "#777" }, text: "Source: our lab notebook, see appendix B for methodology details" })
      );

      var after = h("div", { class: "hier-slide hier-after", "aria-hidden": "true" },
        h("div", { style: { "font-size": "1.7cqw", "font-weight": "700", "letter-spacing": ".12em", "text-transform": "uppercase", color: "#9b99a8" }, text: "Caching experiment" }),
        h("div", { style: { "font-size": "6.4cqw", "font-weight": "850", "line-height": "1.02", "letter-spacing": "-0.03em", "margin-top": "1cqw", "max-width": "52%" }, html: "Pages load <span style=\"color:#34d1bf\">3× faster</span>" }),
        h("div", { style: { position: "absolute", right: "7%", top: "16%", bottom: "16%", width: "34%", display: "flex", "align-items": "flex-end", gap: "12%", "border-bottom": "2px solid #3a3a46" } },
          bar("1.2 s", "before", 100, "#4a4a58"),
          bar("0.4 s", "with cache", 33, "#34d1bf")
        ),
        h("div", { style: { position: "absolute", left: "6%", bottom: "8%", "font-size": "1.6cqw", color: "#8d8b97" }, text: "Product pages, avg. of ~400 loads each" })
      );
      function bar(val, label, pct, color) {
        return h("div", { style: { flex: "1", height: pct + "%", background: color, "border-radius": "0.8cqw 0.8cqw 0 0", position: "relative" } },
          h("div", { style: { position: "absolute", top: "-4.4cqw", left: "0", right: "0", "text-align": "center", "font-weight": "800", "font-size": "2.6cqw", color: "#f2f1ec" }, text: val }),
          h("div", { style: { position: "absolute", bottom: "-3.6cqw", left: "-20%", right: "-20%", "text-align": "center", "font-size": "1.5cqw", color: "#9b99a8" }, text: label })
        );
      }

      var afterClip = h("div", { style: { position: "absolute", inset: "0" } }, after);
      var divider = h("div", { class: "hier-divider", "aria-hidden": "true" });
      var cmp = h("div", { class: "hier-compare stage-16x9", role: "img", "aria-label": "Before: a slide with six colored bullet points of equal weight, an underlined title and a tiny chart. After: one big headline, 'Pages load 3 times faster', with a two-bar chart where the improved bar is highlighted in teal." },
        before, afterClip, divider,
        h("span", { class: "hier-tag", style: { left: "8px" }, text: "BEFORE" }),
        h("span", { class: "hier-tag", style: { right: "8px" }, text: "AFTER" })
      );
      var slider = h("input", { type: "range", min: 0, max: 100, value: 50, id: "hier-pos", "aria-label": "Divider position: left shows more of before, right shows more of after" });
      function setPos(v) {
        afterClip.style.clipPath = "inset(0 0 0 " + v + "%)";
        divider.style.left = v + "%";
      }
      slider.addEventListener("input", function () { setPos(Number(slider.value)); });
      // drag directly on the image too
      cmp.addEventListener("pointerdown", function (e) {
        cmp.setPointerCapture(e.pointerId);
        function mv(ev) {
          var r = cmp.getBoundingClientRect();
          var v = Math.round(Math.min(100, Math.max(0, (ev.clientX - r.left) / r.width * 100)));
          slider.value = v; setPos(v);
        }
        mv(e);
        function up() { cmp.removeEventListener("pointermove", mv); cmp.removeEventListener("pointerup", up); cmp.removeEventListener("pointercancel", up); }
        cmp.addEventListener("pointermove", mv); cmp.addEventListener("pointerup", up); cmp.addEventListener("pointercancel", up);
      });
      cmp.style.touchAction = "pan-y";
      cmp.style.cursor = "ew-resize";

      var squint = h("input", { type: "checkbox", id: "hier-squint" });
      squint.addEventListener("change", function () { cmp.classList.toggle("squint", squint.checked); });

      root.appendChild(h("div", { class: "demo-body" },
        h("div", null, cmp, h("div", { class: "field", style: { "margin-top": "10px" } }, h("label", { for: "hier-pos", text: "Compare" }), slider)),
        h("div", { class: "demo-controls" },
          h("label", { class: "check", for: "hier-squint" }, squint, "Squint test (blur both)"),
          h("div", { class: "row" },
            h("button", { type: "button", class: "chip", onclick: function () { slider.value = 100; setPos(100); } }, "Show before"),
            h("button", { type: "button", class: "chip", onclick: function () { slider.value = 0; setPos(0); } }, "Show after")
          ),
          D.lesson("What changed", [
            "<b>One idea per frame:</b> the headline <em>is</em> the conclusion. Details move to the narration.",
            "<b>Size</b> sets the reading order: headline → chart → small print.",
            "<b>One accent color</b>, used only on the thing that matters (the faster bar).",
            "<b>Fewer words:</b> six bullets became one sentence. The voice can say the rest.",
            "<b>Space</b> around elements groups them and makes the frame calm.",
            "Squint test: blurred, only the headline and the teal bar should still pop."
          ])
        )
      ));
      setPos(50);
    }
  });
})();
