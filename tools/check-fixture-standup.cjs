/**
 * Checks that fixture mode STANDS THE PLAYER UP, not merely that it blocks.
 *
 * The two are easy to confuse and the difference is invisible until the page
 * renders nothing: blocking /video keeps client data safe, but leaves
 * firstLoadData null, and the overlay is gated on
 * firstLoadData.dynamic_text_display.type === "web".
 *
 *   node tools/check-fixture-standup.cjs
 */
const fs = require("fs"), path = require("path");

let pass = 0; const fail = [];
const check = (n, c, d) => c ? pass++ : fail.push(n + (d ? "  (" + d + ")" : ""));

// --- every new module must at least parse ---
const MODULES = [
  "src/app/utils/fixtureMode.js",
  "src/app/fixtures/firstLoad.fixture.js",
  "src/app/fixtures/active.fixture.js",
  "src/app/fixtures/statement.fixture.js",
];
const { execFileSync } = require("child_process");
const os = require("os");
MODULES.forEach((m) => {
  // Node's own parser, via a temporary .mjs copy. A hand-rolled ESM stripper
  // reports syntax errors that are its own, not the file's.
  const tmp = path.join(os.tmpdir(), path.basename(m, ".js") + ".check.mjs");
  fs.copyFileSync(m, tmp);
  let ok = true, err = "";
  try { execFileSync(process.execPath, ["--check", tmp], { stdio: "pipe" }); }
  catch (e) { ok = false; err = String(e.stderr || e.message).trim().slice(0, 120); }
  finally { try { fs.unlinkSync(tmp); } catch {} }
  check("parses: " + path.basename(m), ok, err);
});

// --- the guard must answer, not just block ---
const guard = fs.readFileSync("src/app/utils/fixtureMode.js", "utf8");
check("guard answers /video", guard.includes("fixtureFirstLoadResponse"));
check("guard answers get_contact_id", guard.includes("fixtureContactResponse"));
check("get_contact_id is matched BEFORE /video",
  guard.indexOf("get_contact_id") < guard.indexOf('endsWith("/video")'),
  "otherwise /video swallows it");
check("query strings are stripped before matching", guard.includes('split("?")'));

// --- the referenced video must exist on disk ---
const fl = fs.readFileSync("src/app/fixtures/firstLoad.fixture.js", "utf8");
const vids = (fl.match(/"\/[a-z-]+\.mp4"/g) || []).map((v) => v.slice(1, -1));
check("a video is named", vids.length > 0);
vids.forEach((v) => {
  const onDisk = fs.existsSync(path.join("public", v.replace(/^\//, "")));
  check("video exists: " + v, onDisk, "put the file in public/");
});

// --- the gate the overlay depends on ---
check("stub opens the overlay gate", /type:\s*"web"/.test(fl),
  'dynamic_text_display.type must be "web"');
check("stub supplies a question with a video_url", /video_url/.test(fl));

// --- the statement config must match the master it is timed to ---
const els = JSON.parse(fs.readFileSync("src/app/fixtures/statement/elements.json", "utf8"));
const end = Math.max.apply(null, els.map((e) => e.end_time || 0));
const REAL = 176; // "Simplified EN.mp4", measured with ffmpeg
check("config timeline fits the master", end <= REAL + 0.5,
  "config ends at " + end + "s, master is " + REAL + "s");

console.log("");
console.log(fail.length ? "FAIL:\n  " + fail.join("\n  ") : "PASS - " + pass + " checks");
process.exit(fail.length ? 1 : 0);
