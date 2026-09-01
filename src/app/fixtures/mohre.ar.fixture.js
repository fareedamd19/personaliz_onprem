/**
 * The REAL MOHRE "Commitment POS AR" statement, in Arabic — development only.
 *
 * Unlike statement.ar.fixture.js (which puts Arabic words into boxes measured
 * for the English "Simplified" film), this fixture uses:
 *   - the actual blank template video the campaign plays (mohre-ar-base.mp4,
 *     206.1s, 1920x1080, copied from the production template file)
 *   - element positions/timings measured directly off the reference render at
 *     https://mohreestatement.reports.ae/MVS/Watch/index?id=a7a42daf98224bbe9d1acbdcb420163b
 *     (background video + label graphics only; every number is drawn by a
 *     separate runtime layer with no DOM presence there)
 *
 * Coverage is intentionally partial: only the four sections of the reference
 * render that showed per-company data (intro card, 8 KPI boxes, workforce/
 * alerts panel, 12-month WPS chart) got overlay elements. Everything after
 * ~98s rendered identically generic in every sampled frame, so it is assumed
 * to already be baked into the template video with no overlay needed —
 * unconfirmed, flagged in the source JSON's _gaps_and_open_questions.
 *
 * Several sub-positions (the two-segment donut legend numbers, the alert
 * panel's embedded digits) are visual estimates, not pixel-measured — see
 * each element's _notes field.
 */

import elements from "./statement/elements.mohre-ar.json";
import meta from "./statement/variables.mohre-ar.json";

export const mohreArCaptions = elements;

export const mohreArVariables = meta.variables || {};

export const mohreArChapters = meta.chapters || [];

export const mohreArElementCount = elements.length;

/** Right to left, same as the other Arabic fixture. */
export const mohreArRtl = true;
