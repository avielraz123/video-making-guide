/* core.js: tiny DOM helpers, storage, copy, icons, shared media manager. */
(function () {
  "use strict";
  var VG = (window.VG = window.VG || {});
  VG.pages = VG.pages || {};
  VG.demos = VG.demos || [];

  /* ---------- DOM builder ---------- */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === "class") el.className = v;
        else if (k === "text") el.textContent = v;
        else if (k === "html") el.innerHTML = v;
        else if (k === "style" && typeof v === "object") { for (var s in v) el.style.setProperty(s, v[s]); }
        else if (k === "dataset") { for (var d in v) el.dataset[d] = v[d]; }
        else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
        else if (v === true) el.setAttribute(k, "");
        else el.setAttribute(k, v);
      }
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    if (typeof c === "string" || typeof c === "number") el.appendChild(document.createTextNode(String(c)));
    else el.appendChild(c);
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- storage (never throws) ---------- */
  var storage = {
    get: function (k, fallback) {
      try { var v = window.localStorage.getItem("vg:" + k); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set: function (k, v) {
      try { window.localStorage.setItem("vg:" + k, JSON.stringify(v)); } catch (e) { /* ignore */ }
    }
  };

  /* ---------- icons ---------- */
  var ICONS = {
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
    pause: '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 15V5a1 1 0 0 1 1-1h9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    sun: '<circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    close: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    ext: '<path d="M14 5h5v5M19 5l-8 8M17 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    replay: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="currentColor"/>'
  };
  function icon(name, cls) {
    var span = document.createElement("span");
    span.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"' + (cls ? ' class="' + cls + '"' : "") + ">" + (ICONS[name] || "") + "</svg>";
    return span.firstChild;
  }

  /* ---------- copy to clipboard ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  function copyButton(getText, label) {
    label = label || "Copy";
    var btn = h("button", { type: "button", class: "btn btn-sm copy-btn", "aria-label": label + " to clipboard" }, icon("copy"), h("span", { text: label }));
    btn.addEventListener("click", function () {
      var txt = typeof getText === "function" ? getText() : getText;
      Promise.resolve(copyText(txt)).then(function () {
        btn.replaceChildren(icon("check"), h("span", { text: "Copied" }));
        announce("Copied to clipboard");
        setTimeout(function () { btn.replaceChildren(icon("copy"), h("span", { text: label })); }, 1600);
      });
    });
    return btn;
  }

  /* ---------- live region ---------- */
  function announce(msg) {
    var r = document.getElementById("vg-live");
    if (!r) { r = h("div", { id: "vg-live", class: "sr-only", "aria-live": "polite" }); document.body.appendChild(r); }
    r.textContent = "";
    setTimeout(function () { r.textContent = msg; }, 30);
  }

  /* ---------- code block ---------- */
  function codeBlock(code, lang, opts) {
    opts = opts || {};
    var pre = h("pre", { tabindex: "0" });
    var codeEl = h("code", { class: lang ? "lang-" + lang : null });
    codeEl.innerHTML = VG.highlight ? VG.highlight(code, lang) : esc(code);
    pre.appendChild(codeEl);
    var wrap = h("div", { class: "codeblock" + (opts.copy !== false ? " has-copy" : "") + (opts.wrap ? " wrap" : "") + (opts.tall ? " tall" : "") });
    if (opts.label) {
      wrap.classList.remove("has-copy");
      var lab = h("div", { class: "code-label" }, h("span", { text: opts.label }));
      if (opts.copy !== false) lab.appendChild(copyButton(code));
      wrap.appendChild(lab);
      wrap.appendChild(pre);
      return wrap;
    }
    wrap.appendChild(pre);
    if (opts.copy !== false) wrap.appendChild(copyButton(code));
    return wrap;
  }

  /* ---------- small widgets ---------- */
  function dots(n, max, label, cls) {
    max = max || 5;
    n = Math.max(0, Math.min(max, Math.round(Number(n) || 0)));
    var el = h("span", { class: "dots" + (cls ? " " + cls : ""), role: "img", "aria-label": (label || "Rating") + ": " + n + " of " + max });
    for (var i = 1; i <= max; i++) el.appendChild(h("i", { class: i <= n ? "on" : "" }));
    return el;
  }
  function list(items, cls) {
    var ul = h("ul", { class: cls || null });
    (items || []).forEach(function (t) { ul.appendChild(h("li", { text: t })); });
    return ul;
  }
  function prosCons(pros, cons) {
    if ((!pros || !pros.length) && (!cons || !cons.length)) return null;
    return h("div", { class: "proscons" },
      pros && pros.length ? h("div", { class: "pros" }, h("h4", { text: "Pros" }), list(pros)) : null,
      cons && cons.length ? h("div", { class: "cons" }, h("h4", { text: "Cons" }), list(cons)) : null
    );
  }
  function extLink(href, text, cls) {
    return h("a", { href: href, target: "_blank", rel: "noopener noreferrer", class: cls || null }, text, " ", h("span", { "aria-hidden": "true", text: "↗" }), h("span", { class: "sr-only", text: " (opens in a new tab)" }));
  }
  function notice(title, body, emoji) {
    return h("div", { class: "notice", role: "status" },
      h("span", { class: "notice-icon", "aria-hidden": "true", text: emoji || "🎬" }),
      h("div", null, h("strong", { text: title }), body ? h("p", null, body) : null)
    );
  }
  function pageHead(code, title, lede) {
    return h("header", { class: "page-head" },
      h("div", { class: "timecode", text: code }),
      h("h1", { tabindex: "-1", text: title }),
      lede ? h("p", { class: "lede" }, lede) : null
    );
  }
  function fmtTime(sec) {
    sec = Math.max(0, Math.round(Number(sec) || 0));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  // plain text with `backtick` spans turned into <code> (data files use markdown-style code)
  function rich(str) {
    var parts = String(str == null ? "" : str).split("`");
    var out = [];
    parts.forEach(function (p, i) { if (!p) return; out.push(i % 2 ? h("code", { text: p }) : p); });
    if (parts.length % 2 === 0) return [String(str)]; // unbalanced backticks: leave as is
    return out;
  }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  /* ---------- languages ---------- */
  var LANGS = {
    en: "English", he: "Hebrew", es: "Spanish", ja: "Japanese", ar: "Arabic", fa: "Persian",
    fr: "French", de: "German", it: "Italian", pt: "Portuguese", "pt-br": "Portuguese (BR)", zh: "Chinese",
    hi: "Hindi", ko: "Korean", ru: "Russian", nl: "Dutch", pl: "Polish", tr: "Turkish", sv: "Swedish",
    uk: "Ukrainian", cs: "Czech", el: "Greek", vi: "Vietnamese", th: "Thai", id: "Indonesian",
    custom: "Custom text", multi: "Multilingual", many: "Many languages"
  };
  var RTL = { he: 1, ar: 1, fa: 1, ur: 1 };
  function isLangCode(code) { return /^[a-z]{2,3}([-_][a-z0-9]{2,4})?$/i.test(String(code || "")); }
  function langName(code) {
    if (!code) return "";
    if (!isLangCode(code) && !LANGS[String(code).toLowerCase()]) return String(code); // free text, e.g. "+ ~100 more locales"
    var c = String(code).toLowerCase();
    if (LANGS[c]) return LANGS[c];
    try {
      if (window.Intl && Intl.DisplayNames) {
        var dn = (langName._dn = langName._dn || new Intl.DisplayNames(["en"], { type: "language" }));
        var n = dn.of(c.replace("_", "-"));
        if (n && n.toLowerCase() !== c) return n;
      }
    } catch (e) { /* fall through */ }
    return LANGS[c.split(/[-_]/)[0]] || String(code).toUpperCase();
  }
  function isRtl(code) { return !!RTL[String(code || "").toLowerCase().split(/[-_]/)[0]]; }

  /* ---------- media manager: only one thing plays at a time ---------- */
  var media = {
    audio: null,
    current: null,       // { id, onState }
    listeners: [],
    getAudio: function () {
      if (!this.audio) {
        var a = new Audio();
        a.preload = "none";
        this.audio = a;
        var self = this;
        ["play", "pause", "ended", "timeupdate", "error", "loadedmetadata"].forEach(function (ev) {
          a.addEventListener(ev, function () { self._emit(ev); });
        });
      }
      return this.audio;
    },
    /* play(file, id, onState): onState(eventName, audioEl) */
    play: function (file, id, onState) {
      var a = this.getAudio();
      if (this.current && this.current.id === id && !a.paused) { a.pause(); return; }
      if (this.current && this.current.id === id && a.paused && a.src && !a.ended && a.currentTime > 0) {
        pauseOtherMedia(a); a.play().catch(function () {}); return;
      }
      var prev = this.current;
      this.current = { id: id, onState: onState };
      if (prev && prev.onState) prev.onState("stopped", a);
      a.src = file;
      pauseOtherMedia(a);
      var p = a.play();
      if (p && p.catch) p.catch(function (err) {
        if (err && err.name === "AbortError") return;
        if (onState) onState("error", a);
      });
    },
    stop: function () {
      var a = this.audio;
      if (a) { a.pause(); }
      var prev = this.current;
      this.current = null;
      if (prev && prev.onState) prev.onState("stopped", a);
    },
    _emit: function (ev) {
      if (this.current && this.current.onState) this.current.onState(ev, this.audio);
    }
  };
  function pauseOtherMedia(except) {
    $$("audio, video").forEach(function (m) { if (m !== except && !m.paused) m.pause(); });
    if (media.audio && media.audio !== except && !media.audio.paused) media.audio.pause();
  }
  // any <video>/<audio> element that starts playing pauses everything else
  document.addEventListener("play", function (e) {
    var t = e.target;
    if (t && (t.tagName === "VIDEO" || t.tagName === "AUDIO")) pauseOtherMedia(t);
  }, true);

  var reducedMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  VG.ui = {
    h: h, esc: esc, $: $, $$: $$, icon: icon, copyText: copyText, copyButton: copyButton,
    codeBlock: codeBlock, dots: dots, list: list, prosCons: prosCons, extLink: extLink, notice: notice,
    pageHead: pageHead, fmtTime: fmtTime, slug: slug, langName: langName, isLangCode: isLangCode, rich: rich, isRtl: isRtl, announce: announce,
    reducedMotion: function () { return !!reducedMotion.matches; }
  };
  VG.storage = storage;
  VG.media = media;
  VG.GITHUB_BLOB = "https://github.com/avielraz123/video-making-guide/blob/main/";
})();
