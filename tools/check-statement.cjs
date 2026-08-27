/**
 * Renders the statement fixture through the player's own reader.
 *
 * The checkers already prove editor and player agree on a synthetic config.
 * This asks the narrower question the demo depends on: does THIS config,
 * with THESE variables, actually produce visible elements at the moments it
 * claims to - or does it silently draw nothing, which is the failure mode the
 * whole overlay chain is prone to.
 */
const fs = require("fs"), vm = require("vm");

const src = fs.readFileSync("src/app/utils/overlayElement.js", "utf8")
  .replace(/^\s*import[\s\S]*?from\s+"[^"]+";\s*$/gm, "")
  .replace(/^\s*export\s+default\s+.*$/gm, "")
  .replace(/^\s*export\s+/gm, "");
const ctx = { module: { exports: {} }, console, Math, JSON, Object, Array,
  Number, String, Boolean, isNaN, parseFloat, parseInt, Date, encodeURIComponent };
vm.runInNewContext(src + ";module.exports=this;", ctx);
const api = ctx.module.exports;
const sample = api.sampleElement, render = api.shouldRender;

const els = JSON.parse(fs.readFileSync("src/app/fixtures/statement/elements.json", "utf8"));
const vars = JSON.parse(fs.readFileSync("src/app/fixtures/statement/variables.json", "utf8")).variables;

let pass = 0; const fail = [];
const check = (n, c, d) => c ? pass++ : fail.push(n + (d ? "  (" + d + ")" : ""));

check("reader exposes sampleElement", typeof sample === "function");
check("reader exposes shouldRender", typeof render === "function");
if (fail.length) { console.log("FAIL:\n  " + fail.join("\n  ")); process.exit(1); }

// Walk the timeline the way playback does and count what is on screen.
const END = Math.max.apply(null, els.map(e => e.end_time || 0));
let everVisible = new Set(), peak = 0, peakAt = 0;
for (let t = 0; t <= END; t += 0.5) {
  let on = 0;
  els.forEach(e => {
    if (t < e.start_time || t > e.end_time) return;
    if (render && render(e, vars) === false) return;
    const s = sample(e, t);
    const op = s && s.opacity !== undefined ? s.opacity : 1;
    if (op > 0.01) { on++; everVisible.add(e.uniq_id); }
  });
  if (on > peak) { peak = on; peakAt = t; }
}

check("every element becomes visible at some point",
  everVisible.size === els.length,
  everVisible.size + "/" + els.length + " ever drawn");

if (everVisible.size !== els.length) {
  els.filter(e => !everVisible.has(e.uniq_id))
     .forEach(e => console.log("   never drawn: " + e.uniq_id + "  t " + e.start_time + "-" + e.end_time));
}

check("the screen is never empty mid-video", peak > 0, "peak " + peak);

// Bound elements must resolve to a real number, or a chart fills to zero.
const bound = els.filter(e => e.bind && e.bind.value);
bound.forEach(e => {
  const v = vars[e.bind.value];
  check("bind resolves: " + e.uniq_id + " -> " + e.bind.value,
    v !== undefined && v !== null && v !== "", "value=" + JSON.stringify(v));
});

// Every {placeholder} in text must exist in the variable map.
const missing = [];
els.forEach(e => {
  const m = String(e.text || "").match(/\{([^}]+)\}/g) || [];
  m.forEach(tok => {
    const name = tok.slice(1, -1);
    if (!(name in vars)) missing.push(e.uniq_id + " -> " + name);
  });
});
check("every {placeholder} has a variable", missing.length === 0, missing.join(", "));

console.log("");
console.log("elements       : " + els.length);
console.log("variables      : " + Object.keys(vars).length);
console.log("timeline       : 0 - " + END + "s");
console.log("peak on screen : " + peak + " at " + peakAt + "s");
console.log("bound elements : " + bound.length);
console.log("");
console.log(fail.length ? "FAIL:\n  " + fail.join("\n  ") : "PASS - " + pass + " checks");
process.exit(fail.length ? 1 : 0);
