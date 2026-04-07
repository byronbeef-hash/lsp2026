import { analyzeRace } from "./engine";
import { demoRaceCards } from "./mock";
import { BetfairClient } from "./providers/betfair";
import { PuntingFormClient } from "./providers/punting-form";
import type { PortfolioGuardrails, RacingDeskSnapshot } from "./types";

const DEFAULT_GUARDRAILS: PortfolioGuardrails = {
  bankroll: 5000,
  baseFractionalKelly: 0.2,
  maxRaceExposure: 0.06,
  maxRunnerExposure: 0.02,
  minRobustEdge: 0.035,
  minConfidence: 0.58,
};

export function getDefaultGuardrails(): PortfolioGuardrails {
  return { ...DEFAULT_GUARDRAILS };
}

export async function buildRacingDeskSnapshot(options?: {
  bankroll?: number;
  mode?: "demo" | "live";
}): Promise<RacingDeskSnapshot> {
  const betfair = new BetfairClient();
  const puntingForm = new PuntingFormClient();

  const guardrails: PortfolioGuardrails = {
    ...DEFAULT_GUARDRAILS,
    bankroll: options?.bankroll ?? DEFAULT_GUARDRAILS.bankroll,
  };

  const liveRequested = options?.mode === "live";
  const liveAvailable = betfair.isConfigured() || puntingForm.isConfigured();
  const mode = liveRequested && liveAvailable ? "live" : "demo";

  // The live mode intentionally falls back to demo cards until venue/race mapping,
  // historical feature backfills, and broker-specific execution rules are completed.
  const races = demoRaceCards.map((race) => analyzeRace(race, guardrails));

  return {
    mode,
    dataSources: {
      puntingFormConfigured: puntingForm.isConfigured(),
      betfairConfigured: betfair.isConfigured(),
    },
    guardrails,
    races,
  };
}
