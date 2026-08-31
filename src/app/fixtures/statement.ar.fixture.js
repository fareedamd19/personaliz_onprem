/**
 * The MOHRE establishment statement in Arabic, as a fixture — development only.
 *
 * The same 61 elements as the English statement, at the same positions, sizes
 * and times. Only the words change, and the five fields holding English prose
 * are rebound to their Arabic counterparts - companyNameAR for companyNameEN,
 * and so on. Counts, codes, handles and email addresses keep the names and the
 * values they have, because they are language-neutral.
 *
 * The geometry is deliberately NOT adjusted. This fixture exists to show what
 * Arabic wording does inside boxes that were measured for English: where it
 * overflows, where a right-to-left run reads wrong against a left-aligned box,
 * where a longer word pushes past its background. Redrawing the layout here
 * would hide exactly what it is meant to expose. A layout properly designed
 * for Arabic is a separate job, informed by what this shows.
 *
 * The Arabic wording is a working placeholder produced for layout testing. It
 * has not been reviewed by a native speaker and must not be treated as approved
 * copy - MOHRE's own Arabic is the source of truth for anything shipped.
 */

import elements from "./statement/elements.ar.json";
import meta from "./statement/variables.ar.json";

export const statementArCaptions = elements;

export const statementArVariables = meta.variables || {};

export const statementArChapters = meta.chapters || [];

export const statementArElementCount = elements.length;

/** Right to left, which is what the player reads to set the caption layer. */
export const statementArRtl = true;
