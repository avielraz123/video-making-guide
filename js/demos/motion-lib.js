/* motion-lib.js: easing functions + a tiny requestAnimationFrame tween runner
   shared by the playground demos. */
(function () {
  "use strict";
  var VG = (window.VG = window.VG || {});

  // cubic-bezier(x1, y1, x2, y2) -> f(t), same maths as CSS
  function bezier(x1, y1, x2, y2) {
    function a(p1, p2) { return 1 - 3 * p2 + 3 * p1; }
    function b(p1, p2) { return 3 * p2 - 6 * p1; }
    function c(p1) { return 3 * p1; }
    function calc(t, p1, p2) { return ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t; }
    function slope(t, p1, p2) { return 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1); }
    function tForX(x) {
      var t = x;
      for (var i = 0; i < 8; i++) {
        var s = slope(t, x1, x2);
        if (Math.abs(s) < 1e-6) break;
        var cx = calc(t, x1, x2) - x;
        t -= cx / s;
      }
      if (t < 0 || t > 1 || Math.abs(calc(t, x1, x2) - x) > 1e-4) {
        var lo = 0, hi = 1; t = x;
        for (var j = 0; j < 30; j++) {
          var v = calc(t, x1, x2);
          if (Math.abs(v - x) < 1e-5) break;
          if (x > v) lo = t; else hi = t;
          t = (lo + hi) / 2;
        }
      }
      return t;
    }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      return calc(tForX(x), y1, y2);
    };
  }

  function spring(t) {
    var z = 0.38, w = 13, wd = w * Math.sqrt(1 - z * z);
    if (t >= 1) return 1;
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
  }
  function bounce(t) {
    var n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  }

  var EASINGS = {
    "linear": { label: "Linear", fn: function (t) { return t; }, css: "linear" },
    "ease-in": { label: "Ease-in", fn: bezier(0.42, 0, 1, 1), css: "cubic-bezier(0.42, 0, 1, 1)" },
    "ease-out": { label: "Ease-out", fn: bezier(0, 0, 0.58, 1), css: "cubic-bezier(0, 0, 0.58, 1)" },
    "ease-in-out": { label: "Ease-in-out", fn: bezier(0.42, 0, 0.58, 1), css: "cubic-bezier(0.42, 0, 0.58, 1)" },
    "expo-out": { label: "Expo-out (snappy)", fn: bezier(0.16, 1, 0.3, 1), css: "cubic-bezier(0.16, 1, 0.3, 1)" },
    "back-out": { label: "Back-out (overshoot)", fn: bezier(0.34, 1.56, 0.64, 1), css: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
    "spring": { label: "Spring", fn: spring, css: null },
    "bounce": { label: "Bounce", fn: bounce, css: null }
  };

  var active = [];
  // tween(durationMs, onFrame(rawProgress 0..1), onDone) -> { cancel() }
  function tween(ms, onFrame, onDone) {
    var start = null, id = 0, done = false;
    var handle = { cancel: function () { done = true; cancelAnimationFrame(id); remove(); } };
    function remove() { var i = active.indexOf(handle); if (i >= 0) active.splice(i, 1); }
    function step(now) {
      if (done) return;
      if (start === null) start = now;
      var p = ms <= 0 ? 1 : Math.min(1, (now - start) / ms);
      onFrame(p);
      if (p < 1) id = requestAnimationFrame(step);
      else { done = true; remove(); if (onDone) onDone(); }
    }
    active.push(handle);
    id = requestAnimationFrame(step);
    return handle;
  }
  function cancelAll() { active.slice().forEach(function (a) { a.cancel(); }); }
  function wait(ms, fn) { return tween(ms, function () {}, fn); }

  // draw an easing curve into an SVG <path> d attribute, inside box (x0,y0,w,h); yRange [lo, hi]
  function curvePath(fn, x0, y0, w, hgt, lo, hi) {
    lo = lo === undefined ? -0.3 : lo; hi = hi === undefined ? 1.3 : hi;
    var d = "";
    for (var i = 0; i <= 60; i++) {
      var t = i / 60, v = fn(t);
      var x = x0 + t * w, y = y0 + (hi - v) / (hi - lo) * hgt;
      d += (i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2);
    }
    return d;
  }

  VG.motion = { bezier: bezier, spring: spring, bounce: bounce, EASINGS: EASINGS, tween: tween, wait: wait, cancelAll: cancelAll, curvePath: curvePath };

  // small helpers for demo UIs
  VG.demoUi = {
    range: function (id, label, min, max, step, value, fmt, onInput) {
      var h = VG.ui.h;
      var out = h("output", { for: id, text: fmt(value) });
      var inp = h("input", { type: "range", id: id, min: min, max: max, step: step, value: value });
      inp.addEventListener("input", function () { out.textContent = fmt(Number(inp.value)); onInput(Number(inp.value)); });
      return h("div", { class: "field" }, h("label", { for: id, text: label }), h("div", { class: "range-row" }, inp, out));
    },
    select: function (id, label, options, value, onChange) {
      var h = VG.ui.h;
      var s = h("select", { id: id });
      options.forEach(function (o) { s.appendChild(h("option", { value: o[0], text: o[1], selected: o[0] === value })); });
      s.addEventListener("change", function () { onChange(s.value); });
      return h("div", { class: "field" }, h("label", { for: id, text: label }), s);
    },
    seg: function (label, options, value, onChange) {
      var h = VG.ui.h;
      var wrap = h("div", { class: "seg", role: "group", "aria-label": label });
      options.forEach(function (o) {
        var b = h("button", { type: "button", "aria-pressed": String(o[0] === value), "data-value": o[0], text: o[1] });
        b.addEventListener("click", function () {
          VG.ui.$$("button", wrap).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
          onChange(o[0]);
        });
        wrap.appendChild(b);
      });
      return h("div", { class: "field" }, h("span", { class: "label", text: label }), wrap);
    },
    lesson: function (title, items, extra) {
      var h = VG.ui.h;
      var body = Array.isArray(items)
        ? h("ul", null, items.map(function (t) { return h("li", { html: t }); }))
        : h("p", { html: items });
      return h("div", { class: "lesson" }, h("h4", { text: title }), body, extra || null);
    }
  };
})();
