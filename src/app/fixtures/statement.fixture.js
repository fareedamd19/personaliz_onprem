/**
 * The MOHRE establishment statement, as a fixture — development only.
 *
 * Built by measuring the public MOHRE statement video frame by frame and
 * rebuilding it from the five element types the editor already has. It carries
 * no client data: every owner name, ID, phone and email below is invented, and
 * the addresses are all .invalid.
 *
 * Kept separate from overlay.fixture.js on purpose. That one is a synthetic
 * exercise of every capability and is what the checker tools measure against;
 * this one is a faithful reproduction of one real layout. Confusing the two
 * would make a failing check ambiguous.
 */

import elements from "./statement/elements.json";
import meta from "./statement/variables.json";

/**
 * The reference cut these times were measured against. A blank master of a
 * different length needs statement-config/rescale.cjs run over it first -
 * nothing here can detect the mismatch, it just drifts.
 */
export const STATEMENT_REFERENCE_DURATION = 176;

export const statementCaptions = elements;

export const statementVariables = meta.variables || {};

export const statementChapters = meta.chapters || [];

export const statementElementCount = elements.length;
