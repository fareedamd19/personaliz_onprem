/**
 * Golden fixture check for the overlay model.
 *
 * The editor and the player each hold their own copy of the maths that decides
 * where an element sits at a given moment. Nothing in the build keeps those two
 * copies equal, and the backend stores the config without validating a single
 * field — so a rename on one side saves with HTTP 200 and renders nothing.
 *
 * This runs both copies over one shared config and compares every sample. If
 * they disagree, it fails here instead of in front of a client.
 *
 *   node tools/check-overlay.cjs
 *
 * Both repositories carry the same config file and the same script. Keep them
 * byte-identical: `overlay-golden.config.json` is the contract.
 *
 * Loading note: the two repositories disagree on module system —
 * personaliz-app-frontend sets "type": "module", personaliz-play-frontend-new
 * does not — so neither `require` nor `import` can load both samplers. Rather
 * than add a build step or a dependency to repos that have neither, the source
 * is read, its `export` keywords stripped, and the result evaluated in a fresh
 * VM context. That works precisely because both modules are pure and import
 * nothing. If either ever grows an import, this loader must change.
 *
 * The .cjs extension is deliberate: it makes this script CommonJS regardless of
 * which repo it sits in.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const WANTED = [
  "sampleElement",
  "normalizeKeyframes",
  "shouldRender",
  "boundProportion",
  "resolveRef",
  "safeHref",
  "elementType",
];

function loadPureEsm(file) {
  const source = fs.readFileSync(file, "utf8");
  const stripped = source.replace(/^\s*export\s+(?=(const|function|let|var)\s)/gm, "");
  // The VM context starts empty. Anything the module reaches for at runtime has
  // to be handed in explicitly — safeHref uses URL, formatValue uses Intl and
  // Date. A missing global does not crash: it throws inside the module's own
  // try/catch and silently returns a fallback, so both copies "agree" on a
  // wrong answer. That is what the invariant checks below exist to catch.
  const context = {
    module: { exports: {} },
    console,
    URL,
    Intl,
    Date,
    Number,
    Math,
    Array,
    Object,
    String,
    Boolean,
    JSON,
    isFinite,
  };
  const collect = `;module.exports = {${WANTED.map(
    (n) => `${n}: typeof ${n} === "function" ? ${n} : undefined`
  ).join(",")}};`;
  vm.runInNewContext(stripped + collect, context, { filename: file });
  return context.module.exports;
}

// Floating point: the two copies run the same arithmetic, so they should agree
// exactly. A tolerance is kept only so a harmless reordering of a lerp does not
// trip the check.
const EPS = 1e-9;
const close = (a, b) =>
  typeof a === "number" && typeof b === "number"
    ? Math.abs(a - b) < EPS
    : a === b;

function sampleAll(api, config) {
  const rows = [];
  for (const el of config.elements) {
    for (const t of config.sampleTimes) {
      const f = api.sampleElement(el, t);
      rows.push({
        id: el.uniq_id,
        t,
        x: f.x, y: f.y, w: f.w, h: f.h,
        opacity: f.opacity,
        progress: f.progress,
        render: api.shouldRender(el, config.variables),
        type: api.elementType(el),
        bound: el.bind ? api.boundProportion(el, config.variables) : null,
        src: el.src ? api.resolveRef(el.src, config.variables) : null,
      });
    }
  }
  for (const c of config.hrefCases) {
    rows.push({ id: "href", t: c.input, href: api.safeHref(c.input) });
  }
  return rows;
}

function compare(aRows, bRows, aName, bName) {
  const failures = [];
  if (aRows.length !== bRows.length) {
    failures.push(`row count differs: ${aName} ${aRows.length}, ${bName} ${bRows.length}`);
    return failures;
  }
  for (let i = 0; i < aRows.length; i++) {
    const a = aRows[i];
    const b = bRows[i];
    for (const key of Object.keys(a)) {
      if (!close(a[key], b[key])) {
        failures.push(
          `${a.id} @ t=${a.t}  ${key}:  ${aName}=${JSON.stringify(a[key])}  ${bName}=${JSON.stringify(b[key])}`
        );
      }
    }
  }
  return failures;
}

/** Assertions that hold regardless of what the other repo does. */
function invariants(api, config) {
  const failures = [];
  const byId = Object.fromEntries(config.elements.map((e) => [e.uniq_id, e]));

  const check = (name, ok) => { if (!ok) failures.push(name); };

  check(
    "a legacy element with no v2 fields keeps opacity 1 inside its window",
    api.sampleElement(byId["g-legacy"], 3).opacity === 1
  );
  check(
    "a legacy element is invisible outside its window",
    api.sampleElement(byId["g-legacy"], 7).opacity === 0
  );
  check(
    "an unknown condition operator fails OPEN",
    api.shouldRender(byId["g-badcond"], config.variables) === true
  );
  check(
    "a false condition hides the element",
    api.shouldRender(byId["g-hidden"], config.variables) === false
  );
  check(
    "bind respects a non-default max (184/300)",
    Math.abs(api.boundProportion(byId["g-arc"], config.variables) - 184 / 300) < EPS
  );
  check(
    "keyframe time is read from `t`",
    api.normalizeKeyframes(byId["g-keyframes"])[0].t === 2
  );
  check(
    "keyframes are sorted by time even when authored out of order",
    api.normalizeKeyframes(byId["g-messy"]).every((k, i, arr) => i === 0 || arr[i - 1].t <= k.t)
  );
  for (const c of config.hrefCases) {
    const got = api.safeHref(c.input);
    const allowed = got !== null;
    check(
      `safeHref ${JSON.stringify(c.input)} is ${c._expect}`,
      allowed === (c._expect === "allowed")
    );
  }
  return failures;
}

function main() {
  const here = __dirname;
  const config = JSON.parse(
    fs.readFileSync(path.join(here, "overlay-golden.config.json"), "utf8")
  );

  // The same script ships in both repositories, so it works out which side it is
  // on rather than being configured. Whichever sampler exists here is "local";
  // the other repo's, if it is checked out beside this one, is "peer".
  const EDITOR = "personaliz-app-frontend/src/components/OverlayEditorV2/overlaySample.js";
  const PLAYER = "personaliz-play-frontend-new/src/app/utils/overlayElement.js";
  const workspace = path.resolve(here, "../..");

  const inThisRepo = (rel) => path.resolve(here, "..", rel.split("/").slice(1).join("/"));
  const inWorkspace = (rel) => path.resolve(workspace, rel);

  let local = process.env.OVERLAY_LOCAL;
  let peer = process.env.OVERLAY_PEER;

  if (!local) {
    local = [inThisRepo(EDITOR), inThisRepo(PLAYER)].find((f) => fs.existsSync(f));
  }
  if (!peer) {
    peer = [inWorkspace(EDITOR), inWorkspace(PLAYER)].find(
      (f) => fs.existsSync(f) && path.resolve(f) !== path.resolve(local || "")
    );
  }
  local = local || inThisRepo(EDITOR);
  peer = peer || inWorkspace(PLAYER);

  if (!fs.existsSync(local)) {
    console.error(`Local sampler not found: ${local}`);
    process.exit(2);
  }

  const localApi = loadPureEsm(local);
  const missing = WANTED.filter((n) => typeof localApi[n] !== "function");
  if (missing.length) {
    console.error(`Local sampler is missing: ${missing.join(", ")}`);
    process.exit(2);
  }

  let failures = invariants(localApi, config).map((f) => `invariant: ${f}`);
  const localRows = sampleAll(localApi, config);
  let compared = 0;

  if (fs.existsSync(peer)) {
    const peerApi = loadPureEsm(peer);
    const peerMissing = WANTED.filter((n) => typeof peerApi[n] !== "function");
    if (peerMissing.length) {
      failures.push(`peer sampler is missing: ${peerMissing.join(", ")}`);
    } else {
      const peerRows = sampleAll(peerApi, config);
      failures = failures.concat(compare(localRows, peerRows, "editor", "player"));
      compared = peerRows.length;
    }
  } else {
    console.log(`note: player not on disk, comparison skipped\n      looked in ${peer}`);
  }

  console.log(`samples: ${localRows.length}   compared against player: ${compared || "skipped"}`);

  if (failures.length) {
    console.error(`\nFAIL — ${failures.length} problem(s):\n`);
    failures.slice(0, 40).forEach((f) => console.error("  " + f));
    if (failures.length > 40) console.error(`  ...and ${failures.length - 40} more`);
    process.exit(1);
  }

  console.log("PASS — editor and player agree on every sample");
}

main();
