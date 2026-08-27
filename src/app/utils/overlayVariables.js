/**
 * Fetches the recipient's variable map.
 *
 * Text arrives already substituted, so it has never needed this. Charts,
 * conditions and variable-driven images do: without a map, boundProportion
 * returns 0 and a gauge draws its ring at zero however its data reads.
 *
 * Behind NEXT_PUBLIC_OVERLAY_VARIABLES_API. With the variable unset nothing is
 * requested and the player behaves exactly as it does today, so switching this
 * on is a deliberate act and switching it off is a full retreat.
 *
 * Failure is never fatal. A refused or slow request yields an empty map, which
 * is the behaviour that already exists.
 */

import { isFixtureMode } from "./fixtureMode";

const API = process.env.NEXT_PUBLIC_OVERLAY_VARIABLES_API;

/** Requests are cached per recipient: the map cannot change mid-play. */
const cache = new Map();

/** Beyond this the video should start rather than wait on an overlay detail. */
const TIMEOUT_MS = 4000;

export function overlayVariablesEnabled() {
  return Boolean(API) && !isFixtureMode();
}

/**
 * @param {string} campaignId  the campaign uniq_id, `id` in the play URL
 * @param {string} contactId   the contact uniq_id, `uid` in the play URL
 * @returns {Promise<object>}  the variable map, or {} for any failure
 */
export async function fetchOverlayVariables(campaignId, contactId) {
  if (!overlayVariablesEnabled() || !campaignId || !contactId) return {};

  const key = `${campaignId}:${contactId}`;
  if (cache.has(key)) return cache.get(key);

  const promise = (async () => {
    // AbortController rather than Promise.race, so a slow request is actually
    // cancelled instead of left running against a page that stopped waiting.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const url =
        `${API}/variables` +
        `?campaign_id=${encodeURIComponent(campaignId)}` +
        `&contact_id=${encodeURIComponent(contactId)}`;

      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return {};

      const body = await res.json();
      const variables = body && body.variables;
      return variables && typeof variables === "object" ? variables : {};
    } catch {
      // Aborted, offline, blocked, malformed - all mean the same thing here.
      return {};
    } finally {
      clearTimeout(timer);
    }
  })();

  cache.set(key, promise);
  return promise;
}

/** Test hook: forget what was fetched. */
export function clearOverlayVariablesCache() {
  cache.clear();
}

export default fetchOverlayVariables;
