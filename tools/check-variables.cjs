/**
 * Checks the recipient variable fetch.
 *
 * The property that matters most: with the API unset, nothing is requested and
 * the player behaves exactly as it did before.
 *
 *   node tools/check-variables.cjs
 */
const fs = require("fs"), vm = require("vm");

function load(env, fetchImpl) {
  const src = fs.readFileSync("src/app/utils/overlayVariables.js", "utf8")
    .replace(/^\s*export\s+default\s+.*$/gm, "")
    .replace(/^\s*import[\s\S]*?from\s+"[^"]+";\s*$/gm, "")
    .replace(/^\s*export\s+(?=(async\s+)?(const|function)\s)/gm, "");
  const calls = [];
  const ctx = {
    module: { exports: {} }, console, Map, Boolean, Object, JSON,
    process: { env },
    isFixtureMode: () => false,
    AbortController: function () { this.signal = {}; this.abort = () => {}; },
    setTimeout: (fn, ms) => 0, clearTimeout: () => {},
    encodeURIComponent,
    fetch: (url, opts) => { calls.push(url); return fetchImpl(url, opts); },
  };
  vm.runInNewContext(
    src + ";module.exports={fetchOverlayVariables,overlayVariablesEnabled,clearOverlayVariablesCache};",
    ctx);
  return { api: ctx.module.exports, calls };
}

let pass = 0; const fail = [];
const check = (n, c, d) => c ? pass++ : fail.push(n + (d ? "  (" + d + ")" : ""));
const ok = (body) => async () => ({ ok: true, json: async () => body });

(async () => {
  // the safety property
  let { api, calls } = load({}, ok({ variables: { a: 1 } }));
  check("with no API set, the feature is off", api.overlayVariablesEnabled() === false);
  let v = await api.fetchOverlayVariables("camp", "cont");
  check("with no API set, nothing is requested", calls.length === 0, calls.join(","));
  check("with no API set, the map is empty — today's behaviour",
    JSON.stringify(v) === "{}", JSON.stringify(v));

  const ENV = { NEXT_PUBLIC_OVERLAY_VARIABLES_API: "https://api.example/overlay" };

  ({ api, calls } = load(ENV, ok({ status: true, variables: { percentage: 62.5, first_name: "A" } })));
  v = await api.fetchOverlayVariables("camp1", "cont1");
  check("with the API set, variables come back", v.percentage === 62.5, JSON.stringify(v));
  check("both ids are sent",
    /campaign_id=camp1/.test(calls[0]) && /contact_id=cont1/.test(calls[0]), calls[0]);

  await api.fetchOverlayVariables("camp1", "cont1");
  check("a second read is served from cache", calls.length === 1, calls.length + " requests");

  ({ api, calls } = load(ENV, async () => ({ ok: false, status: 500 })));
  v = await api.fetchOverlayVariables("c", "d");
  check("a server error yields an empty map, not a crash", JSON.stringify(v) === "{}");

  ({ api, calls } = load(ENV, async () => { throw new Error("offline"); }));
  v = await api.fetchOverlayVariables("c", "d");
  check("a network failure yields an empty map", JSON.stringify(v) === "{}");

  ({ api, calls } = load(ENV, ok({ status: true })));
  v = await api.fetchOverlayVariables("c", "d");
  check("a response with no variables yields an empty map", JSON.stringify(v) === "{}");

  ({ api, calls } = load(ENV, ok({ variables: "not an object" })));
  v = await api.fetchOverlayVariables("c", "d");
  check("a malformed map is refused", JSON.stringify(v) === "{}");

  ({ api, calls } = load(ENV, ok({ variables: { a: 1 } })));
  v = await api.fetchOverlayVariables("", "");
  check("missing ids request nothing", calls.length === 0 && JSON.stringify(v) === "{}");

  ({ api, calls } = load(ENV, ok({ variables: { a: 1 } })));
  await api.fetchOverlayVariables("a b/c", "d&e");
  check("ids are encoded", /a%20b%2Fc/.test(calls[0]) && /d%26e/.test(calls[0]), calls[0]);

  console.log(fail.length ? "FAIL:\n  " + fail.join("\n  ") : `PASS — ${pass} checks`);
  process.exit(fail.length ? 1 : 0);
})();
