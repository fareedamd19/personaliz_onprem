/**
 * Fixture mode — development only.
 *
 * When NEXT_PUBLIC_FIXTURE_MODE=1 the player renders from a local fixture and is
 * physically prevented from reaching the Personaliz API. This exists so overlay
 * work can be tested without writing engagement/session rows against real client
 * contacts (AFNIC, Qatar, GoVideoPX all share the production database).
 *
 * Defaults to OFF. Production behaviour is unchanged when the flag is unset.
 */

export const isFixtureMode = () => process.env.NEXT_PUBLIC_FIXTURE_MODE === "1";

const apiBase = () => process.env.NEXT_PUBLIC_API || "";

const isApiCall = (url) => {
  const base = apiBase();
  if (!base || !url) return false;
  return String(url).startsWith(base);
};

/**
 * Blocks every request to the Personaliz API at the transport layer — both fetch
 * and XMLHttpRequest (axios uses XHR in the browser). Guarding individual call
 * sites is not enough: a missed one writes to client data.
 */
export function installFixtureNetworkGuard() {
  if (!isFixtureMode() || typeof window === "undefined") return;
  if (window.__personalizFixtureGuard) return;
  window.__personalizFixtureGuard = true;

  const blocked = [];
  window.__personalizBlockedCalls = blocked;

  // --- fetch ---
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input?.url ?? "";
    if (isApiCall(url)) {
      blocked.push({ via: "fetch", method: init?.method || "GET", url });
      console.warn("[fixture] blocked API call:", init?.method || "GET", url);
      return new Response(JSON.stringify({ fixtureMode: true, blocked: url }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return realFetch(input, init);
  };

  // --- XMLHttpRequest (axios) ---
  const RealXHR = window.XMLHttpRequest;
  function GuardedXHR() {
    const xhr = new RealXHR();
    const realOpen = xhr.open;
    xhr.open = function (method, url, ...rest) {
      this.__blockedByFixture = isApiCall(url);
      if (this.__blockedByFixture) {
        blocked.push({ via: "xhr", method, url });
        console.warn("[fixture] blocked API call:", method, url);
      }
      return realOpen.call(this, method, url, ...rest);
    };
    const realSend = xhr.send;
    xhr.send = function (...args) {
      if (this.__blockedByFixture) return; // never leaves the machine
      return realSend.apply(this, args);
    };
    return xhr;
  }
  GuardedXHR.prototype = RealXHR.prototype;
  window.XMLHttpRequest = GuardedXHR;

  console.warn(
    "%c[FIXTURE MODE] Personaliz API is blocked. No client data can be read or written.",
    "background:#B2832C;color:#fff;padding:2px 6px;border-radius:3px"
  );
}