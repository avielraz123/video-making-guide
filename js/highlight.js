/* highlight.js: a small hand-written syntax highlighter.
   Supports python, js/ts/jsx/tsx, bash/shell, powershell, json, css, html.
   It scans left to right with a list of sticky regexes per language. */
(function () {
  "use strict";
  var VG = (window.VG = window.VG || {});

  function words(s) { var o = {}; s.split(/\s+/).forEach(function (w) { if (w) o[w] = 1; }); return o; }

  var KW = {
    python: words("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case self"),
    js: words("abstract any as async await boolean break case catch class const constructor continue debugger declare default delete do else enum export extends false finally for from function get if implements import in instanceof interface let new null number of private protected public readonly return set static string super switch this throw true try type typeof undefined var void while with yield"),
    bash: words("if then else elif fi for while until do done case esac in function return export local readonly set unset echo cd source sudo exit"),
    powershell: words("if else elseif foreach for while do function param return try catch finally switch begin process end")
  };
  var TYPES = {
    python: words("int float str list dict tuple set bool bytes object range len print super"),
    js: words("Array Object String Number Boolean Promise Map Set Math JSON console window document React")
  };

  var ALIASES = {
    py: "python", python: "python", python3: "python",
    js: "js", javascript: "js", mjs: "js", cjs: "js", ts: "js", typescript: "js", tsx: "js", jsx: "js",
    sh: "bash", bash: "bash", shell: "bash", zsh: "bash", console: "bash",
    ps: "powershell", ps1: "powershell", powershell: "powershell", pwsh: "powershell",
    json: "json", css: "css", html: "html", xml: "html", svg: "html", srt: "srt", vtt: "srt"
  };

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function span(cls, s) { return '<span class="tok-' + cls + '">' + esc(s) + "</span>"; }

  // rule: [regex(sticky), class | function(match) -> html]
  function rulesFor(lang) {
    switch (lang) {
      case "python": return [
        [/#[^\n]*/y, "com"],
        [/(?:[rRbBuUfF]{0,2})("""[\s\S]*?"""|'''[\s\S]*?''')/y, "str"],
        [/(?:[rRbBuUfF]{0,2})("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/y, "str"],
        [/@[A-Za-z_][\w.]*/y, "deco"],
        [/\b(?:0[xX][\da-fA-F_]+|\d[\d_]*\.?\d*(?:[eE][+-]?\d+)?j?|\.\d+)\b/y, "num"],
        [/[A-Za-z_]\w*/y, ident("python")],
        [/[+\-*/%=<>!&|^~:]+/y, "op"]
      ];
      case "js": return [
        [/\/\/[^\n]*/y, "com"],
        [/\/\*[\s\S]*?\*\//y, "com"],
        [/`(?:\\[\s\S]|[^`\\])*`/y, "str"],
        [/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y, "str"],
        [/<\/?[A-Z][\w.]*|<\/?[a-z][\w-]*(?=[\s>\/])/y, function (m) { return '<span class="tok-tag">' + esc(m) + "</span>"; }],
        [/@[A-Za-z_][\w.]*/y, "deco"],
        [/\b(?:0[xX][\da-fA-F_]+|\d[\d_]*\.?\d*(?:[eE][+-]?\d+)?n?|\.\d+)\b/y, "num"],
        [/[A-Za-z_$][\w$]*/y, ident("js")],
        [/=>|[+\-*/%=<>!&|^~?:]+/y, "op"]
      ];
      case "bash": return [
        [/#[^\n]*/y, "com"],
        [/"(?:\\.|[^"\\])*"|'[^']*'/y, "str"],
        [/\$\{[^}]*\}|\$[A-Za-z_]\w*|\$\d/y, "type"],
        [/(^|(?<=\s))--?[A-Za-z][\w-]*/y, "attr"],
        [/\b\d+(?:\.\d+)?\b/y, "num"],
        [/[A-Za-z_][\w.-]*/y, function (m, ctx) {
          if (KW.bash[m]) return span("kw", m);
          if (ctx.lineStart) return span("fn", m);
          return esc(m);
        }],
        [/[|&;<>]+/y, "op"]
      ];
      case "powershell": return [
        [/#[^\n]*/y, "com"],
        [/"(?:`.|[^"`])*"|'[^']*'/y, "str"],
        [/\$[A-Za-z_][\w:]*/y, "type"],
        [/-[A-Za-z][\w]*/y, "attr"],
        [/\b\d+(?:\.\d+)?\b/y, "num"],
        [/[A-Za-z_][\w.-]*/y, function (m, ctx) {
          if (KW.powershell[m.toLowerCase()]) return span("kw", m);
          if (ctx.lineStart || /^[A-Z][a-z]+-[A-Z]/.test(m)) return span("fn", m);
          return esc(m);
        }],
        [/[|&;<>]+/y, "op"]
      ];
      case "json": return [
        [/"(?:\\.|[^"\\])*"(?=\s*:)/y, "attr"],
        [/"(?:\\.|[^"\\])*"/y, "str"],
        [/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y, "num"],
        [/\b(?:true|false|null)\b/y, "kw"]
      ];
      case "css": return [
        [/\/\*[\s\S]*?\*\//y, "com"],
        [/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y, "str"],
        [/[a-z-]+(?=\s*:)/y, "attr"],
        [/#[\da-fA-F]{3,8}\b/y, "num"],
        [/-?\d*\.?\d+(?:px|rem|em|%|s|ms|vh|vw|deg)?/y, "num"],
        [/@[a-z-]+/y, "kw"]
      ];
      case "srt": return [
        [/\d\d:\d\d:\d\d[,.]\d{3}/y, "num"],
        [/-->/y, "op"],
        [/^\d+$/my, "kw"]
      ];
      case "html": return [
        [/<!--[\s\S]*?-->/y, "com"],
        [/<\/?[A-Za-z][\w-]*/y, "tag"],
        [/\s[A-Za-z-:]+(?==)/y, "attr"],
        [/"[^"]*"|'[^']*'/y, "str"],
        [/\/?>/y, "tag"]
      ];
      default: return [];
    }
  }

  function ident(lang) {
    return function (m, ctx, src, end) {
      if (KW[lang][m]) return span("kw", m);
      if (TYPES[lang] && TYPES[lang][m]) return span("type", m);
      // function call or definition: identifier followed by "("
      var rest = src.slice(end, end + 2);
      if (/^\s?\(/.test(rest)) return span("fn", m);
      if (/^[A-Z]/.test(m)) return span("type", m);
      return esc(m);
    };
  }

  function highlight(code, lang) {
    code = String(code == null ? "" : code).replace(/\r\n?/g, "\n");
    var key = ALIASES[String(lang || "").toLowerCase()];
    if (!key) return esc(code);
    if (key === "html") {
      // highlight embedded <script> and <style> blocks with the right language
      var re = /(<script\b[^>]*>)([\s\S]*?)(<\/script>)|(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, last = 0, res = "", m;
      while ((m = re.exec(code))) {
        res += scan(code.slice(last, m.index), "html");
        if (m[1] !== undefined) res += scan(m[1], "html") + scan(m[2], "js") + scan(m[3], "html");
        else res += scan(m[4], "html") + scan(m[5], "css") + scan(m[6], "html");
        last = re.lastIndex;
      }
      return res + scan(code.slice(last), "html");
    }
    return scan(code, key);
  }

  function scan(code, key) {
    var rules = rulesFor(key);
    var out = "", i = 0, n = code.length, plain = "";
    var lineStart = true;
    while (i < n) {
      var matched = false;
      for (var r = 0; r < rules.length; r++) {
        var re = rules[r][0];
        re.lastIndex = i;
        var m = re.exec(code);
        if (m && m.index === i && m[0].length) {
          if (plain) { out += esc(plain); plain = ""; }
          var kind = rules[r][1];
          var text = m[0];
          out += typeof kind === "function" ? kind(text, { lineStart: lineStart }, code, i + text.length) : span(kind, text);
          i += text.length;
          lineStart = false;
          matched = true;
          break;
        }
      }
      if (!matched) {
        var ch = code[i];
        plain += ch;
        if (ch === "\n") lineStart = true;
        else if (!/\s/.test(ch)) lineStart = false;
        i++;
      }
    }
    if (plain) out += esc(plain);
    return out;
  }

  VG.highlight = highlight;
})();
