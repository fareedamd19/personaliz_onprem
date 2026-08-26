const fs = require("fs"), vm = require("vm");
const src = fs.readFileSync("src/app/utils/overlayFonts.js", "utf8")
  .replace(/^\s*export\s+default\s+.*$/gm, "")
  .replace(/^\s*export\s+(?=(const|function)\s)/gm, "");

const injected = [];
const fakeDoc = { createElement: () => ({ set href(v) { injected.push(v); }, get href() { return injected[injected.length-1]; } }), head: { appendChild() {} } };
const ctx = { module: { exports: {} }, console, Array, Set, String, RegExp, encodeURIComponent,
              window: { document: fakeDoc } };
vm.runInNewContext(src + ";module.exports={ensureOverlayFonts};", ctx);
const { ensureOverlayFonts } = ctx.module.exports;

let pass = 0; const fail = [];
const check = (n, c, d) => c ? pass++ : fail.push(n + (d ? "  (" + d + ")" : ""));

ensureOverlayFonts([{ fontname: "Montserrat" }, { fontname: "Montserrat" }, { fontname: "Roboto" }]);
check("one request for several families", injected.length === 1, injected.length + " links");
check("both families in it", /Montserrat/.test(injected[0]) && /Roboto/.test(injected[0]), injected[0]);
check("weights requested", /wght@400;500;600;700/.test(injected[0]));

const before = injected.length;
ensureOverlayFonts([{ fontname: "Montserrat" }]);
check("an already-loaded family is not requested twice", injected.length === before);

ensureOverlayFonts([{ fontname: "Open Sans" }]);
check("a space becomes a plus", /Open\+Sans/.test(injected[injected.length-1]), injected[injected.length-1]);

const n = injected.length;
ensureOverlayFonts([{ fontname: "\" onload=alert(1) x=\"" }, { fontname: "../../evil" }, { fontname: "" }, { fontname: 42 }, {}]);
check("unsafe or empty names are refused", injected.length === n, "injected " + (injected.length - n));

ensureOverlayFonts(null);
ensureOverlayFonts("nope");
check("bad input does not throw", true);

console.log("\n" + (fail.length ? "FAIL:\n  " + fail.join("\n  ") : `PASS — ${pass} checks`));
console.log("\nrequests made:");
injected.forEach(u => console.log("  " + u));
process.exit(fail.length ? 1 : 0);
