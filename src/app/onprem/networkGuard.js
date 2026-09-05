/**
 * Stops the player calling anywhere it has not been told it may.
 *
 * Editing the call sites out one by one is not the same guarantee. There are
 * seven of them today, most for interactive features a one-way statement never
 * reaches - but "never reaches" is a claim about today's content, and the next
 * merge from upstream can add an eighth. A host who has been told nothing
 * leaves their network deserves something stronger than a promise that we
 * found them all.
 *
 * So it is enforced at the transport layer instead, for both fetch and
 * XMLHttpRequest, and it is a deny-list-by-default: same-origin is allowed,
 * because that is the host's own server, and everything else is refused unless
 * explicitly permitted.
 *
 * What is refused is also recorded. `window.__blockedCalls` is the audit
 * trail - open the console on a running deployment and you can see, rather
 * than take on trust, that nothing left.
 *
 * To let the page reach the host's own data API on another origin, list it:
 *   NEXT_PUBLIC_ONPREM_ALLOWED_ORIGINS=https://api.edc.example
 */

const allowList = () =>
  (process.env.NEXT_PUBLIC_ONPREM_ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Same-origin and relative URLs are the host's own files. Anything else has to
 * be named. An unparseable URL is treated as relative, which is what the
 * browser does with it too.
 */
function isPermitted(rawUrl) {
  if (!rawUrl) return true;
  const url = String(rawUrl);

  // Relative, and the data: and blob: the player uses for media it made itself.
  if (/^(data:|blob:)/i.test(url)) return true;

  // ...except a call built from an unset API base. `${undefined}/video/x`
  // is the string "undefined/video/x", which is relative, so it would sail
  // through the same-origin rule above and land on the HOST's server as a
  // 404 or 501 in their logs. It never reaches us, but "nothing leaves" is
  // not the same claim as "nothing is attempted", and a government host
  // reading their access log should not find our endpoint names in it.
  if (/(^|\/)undefined(\/|$)/.test(url)) return false;

  if (!/^https?:\/\//i.test(url)) return true;

  try {
    const target = new URL(url, window.location.href);
    if (target.origin === window.location.origin) return true;
    return allowList().some((origin) => {
      try {
        return new URL(origin).origin === target.origin;
      } catch {
        return false;
      }
    });
  } catch {
    return true;
  }
}

export function installOnPremiseNetworkGuard() {
  if (typeof window === "undefined") return;
  if (window.__onpremGuardInstalled) return;
  window.__onpremGuardInstalled = true;

  const blocked = [];
  window.__blockedCalls = blocked;

  const note = (via, method, url) => {
    blocked.push({ via, method, url, at: new Date().toISOString() });
    console.warn(`[on-prem] blocked outbound ${method} ${url}`);
  };

  // --- fetch ---
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input?.url ?? "";
    if (!isPermitted(url)) {
      note("fetch", init?.method || "GET", url);
      // Refused, not failed - and refused in a shape the caller can actually
      // swallow. Every one of these call sites does `await res.json()` without
      // catching, so an empty body (a 204, or a null one) throws
      // "Unexpected end of input" straight into the console and looks like a
      // broken page. A well-formed JSON body is parsed, found unusable, and
      // ignored, which is what "this call did not happen" should look like.
      return new Response(
        JSON.stringify({ status: false, blocked: "on-premise" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    return realFetch(input, init);
  };

  // --- XMLHttpRequest (axios uses this in the browser) ---
  const RealXHR = window.XMLHttpRequest;
  if (RealXHR) {
    const realOpen = RealXHR.prototype.open;
    const realSend = RealXHR.prototype.send;

    RealXHR.prototype.open = function (method, url, ...rest) {
      this.__onpremBlocked = !isPermitted(url);
      this.__onpremMethod = method;
      this.__onpremUrl = url;
      return realOpen.call(this, method, url, ...rest);
    };

    RealXHR.prototype.send = function (...args) {
      if (this.__onpremBlocked) {
        note("xhr", this.__onpremMethod || "GET", this.__onpremUrl || "");
        // A finished request carrying parseable JSON, for the same reason as
        // above: an empty responseText throws in anything that JSON.parses it.
        const body = JSON.stringify({ status: false, blocked: "on-premise" });
        Object.defineProperty(this, "readyState", { value: 4, configurable: true });
        Object.defineProperty(this, "status", { value: 200, configurable: true });
        Object.defineProperty(this, "responseText", { value: body, configurable: true });
        Object.defineProperty(this, "response", { value: body, configurable: true });
        setTimeout(() => {
          this.onreadystatechange?.();
          this.onload?.();
        }, 0);
        return;
      }
      return realSend.apply(this, args);
    };
  }
}
