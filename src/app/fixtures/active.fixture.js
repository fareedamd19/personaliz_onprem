/**
 * Chooses which fixture the player renders.
 *
 * NEXT_PUBLIC_FIXTURE_SET=statement  the MOHRE statement reproduction
 * anything else (or unset)           the synthetic capability fixture
 *
 * Defaulting to the synthetic one keeps existing behaviour for anyone who
 * already had fixture mode set up, so switching to the statement is a
 * deliberate act rather than something that happens on a pull.
 */

import { fixtureCaptions, fixtureVariables } from "./overlay.fixture";
import { statementCaptions, statementVariables } from "./statement.fixture";

const useStatement = process.env.NEXT_PUBLIC_FIXTURE_SET === "statement";

export const activeCaptions = useStatement ? statementCaptions : fixtureCaptions;
export const activeVariables = useStatement ? statementVariables : fixtureVariables;
export const activeFixtureName = useStatement ? "statement" : "synthetic";
