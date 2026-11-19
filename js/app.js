/* app.js: hash router, theme toggle, mobile menu. Loaded last. */
(function () {
  "use strict";
  var VG = (window.VG = window.VG || {});
  var ui = VG.ui, h = ui.h;

  var leaveHooks = [];
  var started = false;

  var ROUTES = [
    { re: /^$/, page: "home", nav: "" },
    { re: /^guide$/, page: "guide", nav: "guide" },
    { re: /^guide\/([\w-]+)$/, page: "guide", nav: "guide" },
    { re: /^voices$/, page: "voices", nav: "voices" },
    { re: /^animations$/, page: "animations", nav: "animations" },
    { re: /^animations\/([\w-]+)$/, page: "animations", nav: "animations" },
    { re: /^playground$/, page: "playground", nav: "playground" },
    { re: /^playground\/([\w-]+)$/, page: "playground", nav: "playground" },
    { re: /^best-voices$/, page: "bestVoices", nav: "best-voices" },
    { re: /^claude$/, page: "claude", nav: "claude" }
  ];

  function parse(hash) {
    var path = String(hash || "").replace(/^#\/?/, "").replace(/\/+$/, "");
    var q = path.indexOf("?"), query = {};
    if (q >= 0) {
      path.slice(q + 1).split("&").forEach(function (kv) {
        var p = kv.split("="); if (p[0]) query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || "");
      });
      path = path.slice(0, q).replace(/\/+$/, "");
    }
    for (var i = 0; i < ROUTES.length; i++) {
      var m = ROUTES[i].re.exec(path);
      if (m) return { page: ROUTES[i].page, nav: ROUTES[i].nav, param: m[1] || null, path: path, query: query };
    }
    return { page: "notfound", nav: null, param: null, path: path, query: query };
  }

  function onLeave(fn) { leaveHooks.push(fn); }
  function runLeave() {
    var hooks = leaveHooks; leaveHooks = [];
    hooks.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } });
    if (VG.media) VG.media.stop();
    ui.$$("video").forEach(function (v) { try { v.pause(); } catch (e) {} });
  }

  var lastPage = null;
  function render(hash) {
    var root = document.getElementById("app");
    if (!root) return;
    var r = parse(hash === undefined ? location.hash : hash);
    // moving between demos on the playground: just scroll, keep demo state
    if (lastPage === "playground" && r.page === "playground" && root.querySelector(".demo")) {
      var tgt = r.param ? document.getElementById("demo-" + r.param) : null;
      if (tgt) tgt.scrollIntoView({ block: "start", behavior: ui.reducedMotion() ? "auto" : "smooth" });
      else window.scrollTo(0, 0);
      VG.app.route = r;
      return r;
    }
    runLeave();
    var fn = VG.pages[r.page] || VG.pages.notfound;
    var node;
    try {
      node = fn(r.param, r);
    } catch (err) {
      console.error(err);
      node = h("div", { class: "page" }, ui.notice("Something went wrong rendering this page.", String(err && err.message || err), "⚠️"));
      VG.app.lastError = err;
    }
    root.replaceChildren(node);
    // nav state
    ui.$$(".main-nav a").forEach(function (a) {
      if (a.getAttribute("data-nav") === r.nav) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    closeMenu();
    // title
    var h1 = root.querySelector("h1");
    var t = h1 ? h1.textContent : "";
    document.title = r.page === "home" ? "Video Making Guide" : (t ? t + " | Video Making Guide" : "Video Making Guide");
    // scroll + focus (skip focus on first load so we don't jump)
    var samePageSection = lastPage === r.page && (r.page === "playground");
    if (r.page === "playground" && r.param) {
      var target = document.getElementById("demo-" + r.param);
      if (target) setTimeout(function () { target.scrollIntoView({ block: "start" }); }, 0);
    } else if (!samePageSection) {
      window.scrollTo(0, 0);
    }
    if (lastPage !== null && h1 && !(r.page === "playground" && r.param)) {
      try { h1.focus({ preventScroll: true }); } catch (e) { h1.focus(); }
    }
    lastPage = r.page;
    VG.app.route = r;
    return r;
  }

  /* ---------- theme ---------- */
  function currentTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    VG.storage.set("theme", t);
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }
  function initTheme() {
    var saved = VG.storage.get("theme", null);
    if (saved === "dark" || saved === "light") document.documentElement.setAttribute("data-theme", saved);
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-label", currentTheme() === "dark" ? "Switch to light theme" : "Switch to dark theme");
      btn.addEventListener("click", function () { setTheme(currentTheme() === "dark" ? "light" : "dark"); });
    }
  }

  /* ---------- mobile menu ---------- */
  function closeMenu() {
    var nav = document.getElementById("main-nav"), btn = document.getElementById("menu-toggle");
    if (nav) nav.classList.remove("open");
    if (btn) { btn.setAttribute("aria-expanded", "false"); btn.replaceChildren(ui.icon("menu")); }
  }
  function initMenu() {
    var nav = document.getElementById("main-nav"), btn = document.getElementById("menu-toggle");
    if (!nav || !btn) return;
    btn.addEventListener("click", function () {
      var open = !nav.classList.contains("open");
      nav.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.replaceChildren(ui.icon(open ? "close" : "menu"));
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  function start() {
    if (started) return;
    started = true;
    initTheme();
    initMenu();
    window.addEventListener("hashchange", function () { render(); });
    render();
  }

  VG.pages.notfound = function () {
    return h("div", { class: "page notfound" },
      h("div", { class: "big", "aria-hidden": "true", text: "404" }),
      h("h1", { tabindex: "-1", text: "That scene got cut" }),
      h("p", { class: "muted", text: "This page doesn't exist. Maybe it was left on the editing-room floor." }),
      h("a", { class: "btn btn-primary", href: "#/" }, "Back to the start")
    );
  };

  VG.app = { start: start, render: render, parse: parse, onLeave: onLeave, setTheme: setTheme, currentTheme: currentTheme };

  if (!window.VG_NO_AUTOSTART) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  }
})();
