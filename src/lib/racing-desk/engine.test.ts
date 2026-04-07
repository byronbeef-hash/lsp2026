import { analyzeRace } from "./engine";
import { demoRaceCards } from "./mock";
import { getDefaultGuardrails } from "./service";

describe("analyzeRace", () => {
  it("returns normalized probabilities and respects race exposure caps", () => {
    const guardrails = {
      ...getDefaultGuardrails(),
      bankroll: 1000,
      maxRaceExposure: 0.03,
    };

    const analysis = analyzeRace(demoRaceCards[0], guardrails);
    const probabilitySum = analysis.recommendations.reduce(
      (sum, runner) => sum + runner.blendedProbability,
      0
    );

    expect(probabilitySum).toBeCloseTo(1, 5);
    expect(analysis.totalRecommendedOutlay).toBeLessThanOrEqual(30);
  });

  it("only recommends bets that clear the robust edge threshold", () => {
    const analysis = analyzeRace(demoRaceCards[0], getDefaultGuardrails());

    for (const runner of analysis.recommendations.filter((item) => item.shouldBet)) {
      expect(runner.robustExpectedValue).toBeGreaterThanOrEqual(
        getDefaultGuardrails().minRobustEdge
      );
    }
  });
});
