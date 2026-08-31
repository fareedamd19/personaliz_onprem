/**
 * Chooses which fixture the player renders.
 *
 * NEXT_PUBLIC_FIXTURE_SET=statement     the MOHRE statement reproduction
 * NEXT_PUBLIC_FIXTURE_SET=statement-ar  the same statement in Arabic
 * anything else (or unset)              the synthetic capability fixture
 *
 * Defaulting to the synthetic one keeps existing behaviour for anyone who
 * already had fixture mode set up, so switching to a statement is a deliberate
 * act rather than something that happens on a pull.
 *
 * The Arabic set is the English one with the words changed and nothing else -
 * same elements, same positions, same times. Running it is how you find out
 * what Arabic does inside a layout measured for English, without waiting on
 * the Arabic film or on MOHRE's Arabic data.
 */

import { fixtureCaptions, fixtureVariables } from "./overlay.fixture";
import { statementCaptions, statementVariables } from "./statement.fixture";
import {
  statementArCaptions,
  statementArVariables,
  statementArRtl,
} from "./statement.ar.fixture";

const set = process.env.NEXT_PUBLIC_FIXTURE_SET;
const useStatement = set === "statement";
const useStatementAr = set === "statement-ar";

export const activeCaptions = useStatementAr
  ? statementArCaptions
  : useStatement
  ? statementCaptions
  : fixtureCaptions;

export const activeVariables = useStatementAr
  ? statementArVariables
  : useStatement
  ? statementVariables
  : fixtureVariables;

export const activeFixtureName = useStatementAr
  ? "statement-ar"
  : useStatement
  ? "statement"
  : "synthetic";

/** Only the Arabic set lays out right to left. */
export const activeFixtureRtl = useStatementAr ? statementArRtl : false;
