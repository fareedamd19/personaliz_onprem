/**
 * Chooses which fixture the player renders.
 *
 * NEXT_PUBLIC_FIXTURE_SET=statement     the MOHRE "Simplified" statement reproduction (English)
 * NEXT_PUBLIC_FIXTURE_SET=statement-ar  the same statement in Arabic, English geometry unchanged
 * NEXT_PUBLIC_FIXTURE_SET=mohre-ar      the real "Commitment POS AR" film + measured Arabic overlay
 * anything else (or unset)              the synthetic capability fixture
 *
 * Defaulting to the synthetic one keeps existing behaviour for anyone who
 * already had fixture mode set up, so switching to a statement is a deliberate
 * act rather than something that happens on a pull.
 *
 * The "statement-ar" set is the English one with the words changed and nothing
 * else - same elements, same positions, same times. Running it is how you find
 * out what Arabic does inside a layout measured for English, without waiting
 * on the Arabic film or on MOHRE's Arabic data.
 *
 * The "mohre-ar" set is different: real Arabic film, positions measured off
 * that film directly. See mohre.ar.fixture.js for coverage and caveats.
 */

import { fixtureCaptions, fixtureVariables } from "./overlay.fixture";
import { statementCaptions, statementVariables } from "./statement.fixture";
import {
  statementArCaptions,
  statementArVariables,
  statementArRtl,
} from "./statement.ar.fixture";
import {
  mohreArCaptions,
  mohreArVariables,
  mohreArRtl,
} from "./mohre.ar.fixture";

const set = process.env.NEXT_PUBLIC_FIXTURE_SET;
const useStatement = set === "statement";
const useStatementAr = set === "statement-ar";
const useMohreAr = set === "mohre-ar";

export const activeCaptions = useMohreAr
  ? mohreArCaptions
  : useStatementAr
  ? statementArCaptions
  : useStatement
  ? statementCaptions
  : fixtureCaptions;

export const activeVariables = useMohreAr
  ? mohreArVariables
  : useStatementAr
  ? statementArVariables
  : useStatement
  ? statementVariables
  : fixtureVariables;

export const activeFixtureName = useMohreAr
  ? "mohre-ar"
  : useStatementAr
  ? "statement-ar"
  : useStatement
  ? "statement"
  : "synthetic";

/** The two Arabic sets lay out right to left. */
export const activeFixtureRtl = useMohreAr ? mohreArRtl : useStatementAr ? statementArRtl : false;
