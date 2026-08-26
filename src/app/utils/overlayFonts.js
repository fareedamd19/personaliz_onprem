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

  // Weights are requested explicitly because elements can be bold, and a
  // default request returns regular only — which would render bold text with a
  // synthesised weight instead of the real face.
  const query = families
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600;700`)
    .join("&");

  try {
    const link = window.document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`;
    // A font that fails to load must not take the overlay with it.
    link.onerror = () => families.forEach((f) => REQUESTED.delete(f));
    window.document.head.appendChild(link);
  } catch {
    families.forEach((f) => REQUESTED.delete(f));
  }
}

export default ensureOverlayFonts;
