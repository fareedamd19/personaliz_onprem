/**
 * Loads the web fonts an overlay config asks for.
 *
 * The editor picks from Google Fonts and stores the family name on each
 * element. Naming a family in CSS does nothing unless the font is actually
 * fetched, so without this the player silently falls back to a system face and
 * the recipient sees different typography from the one that was designed.
 *
 * One <link> for every family in the config, requested once. Families already
 * present on the page — the widget's own font, or a previous config — are not
 * requested again.
 */

/**
 * On-premise: the families ship with the bundle.
 *
 * The stock player asks Google for whatever family the config names. That is a
 * third-party request on every view - and on a government page, a request that
 * tells Google who is reading a statutory report. Here the faces are in
 * public/onprem/fonts, declared by fonts.css, which layout.js links once.
 *
 * The consequence to know about: a config naming a family that was not bundled
 * falls back to a system face rather than fetching it. Bundling is done by
 * localise_fonts.cjs, and adding a family to a design means re-running it.
 */
const LOCAL_STYLESHEET = "/onprem/fonts/fonts.css";

const REQUESTED = new Set();

/** Only families that look like a real name; never inject arbitrary strings. */
function safeFamily(name) {
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  // Letters, digits and spaces. Anything else is not a Google family and has no
  // business being interpolated into a URL.
  return /^[A-Za-z0-9][A-Za-z0-9 ]{0,48}$/.test(trimmed) ? trimmed : null;
}

/**
 * @param {Array} elements  overlay elements, each optionally carrying `fontname`
 */
export function ensureOverlayFonts(elements) {
  if (typeof window === "undefined" || !Array.isArray(elements)) return;

  const families = [];
  for (const el of elements) {
    const family = safeFamily(el && el.fontname);
    if (family && !REQUESTED.has(family) && !families.includes(family)) {
      families.push(family);
    }
  }
  if (families.length === 0) return;

  families.forEach((f) => REQUESTED.add(f));

  // One local stylesheet covers every bundled family, so it is linked once
  // rather than per family. Requesting it again is harmless but pointless.
  try {
    const already = window.document.querySelector(
      `link[href="${LOCAL_STYLESHEET}"]`
    );
    if (already) return;

    const link = window.document.createElement("link");
    link.rel = "stylesheet";
    link.href = LOCAL_STYLESHEET;
    // A font that fails to load must not take the overlay with it.
    link.onerror = () => families.forEach((f) => REQUESTED.delete(f));
    window.document.head.appendChild(link);
  } catch {
    families.forEach((f) => REQUESTED.delete(f));
  }
}

export default ensureOverlayFonts;
