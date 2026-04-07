import type {
  PortfolioGuardrails,
  RaceAnalysis,
  RaceContext,
  RaceRunner,
  RunnerAnalysis,
  RunnerQuote,
  RunnerSignalSet,
  SignalDiagnostic,
} from "./types";

const SIGNAL_WEIGHTS: Record<keyof RunnerSignalSet, number> = {
  speed: 0.24,
  pace: 0.08,
  finish: 0.1,
  class: 0.09,
  trackDistance: 0.1,
  jockeyTrainer: 0.06,
  formCycle: 0.1,
  stableIntent: 0.07,
  barrierTempo: 0.06,
  marketSupport: 0.1,
};

function softmax(values: number[]): number[] {
  const max = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - max));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return exps.map((value) => value / total);
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : sum(values) / values.length;
}

function stdev(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getBestQuote(quotes: RunnerQuote[]): RunnerQuote | undefined {
  return [...quotes].sort((a, b) => adjustedOdds(b) - adjustedOdds(a))[0];
}

function adjustedOdds(quote: RunnerQuote): number {
  const commission = quote.commissionRate ?? 0;
  return 1 + (quote.decimalOdds - 1) * (1 - commission);
}

function impliedProbabilityFromQuote(quote: RunnerQuote): number {
  return 1 / adjustedOdds(quote);
}

function modelScore(runner: RaceRunner): number {
  return (
    Object.entries(SIGNAL_WEIGHTS) as [keyof RunnerSignalSet, number][]
  ).reduce((score, [key, weight]) => score + runner.signals[key] * weight, 0);
}

function uncertaintyPenalty(runner: RaceRunner): number {
  const missingQuotesPenalty = runner.quotes.length === 0 ? 0.03 : 0;
  const freshnessPenalty = runner.daysSinceRun && runner.daysSinceRun > 42 ? 0.018 : 0;
  const firstUpPenalty = runner.firstUp ? 0.025 : 0;
  const wideBarrierPenalty = runner.barrier >= 10 ? 0.012 : 0;
  const lowSignalConsensus = clamp(
    0.04 - Math.abs(modelScore(runner)) * 0.012,
    0.008,
    0.04
  );

  return clamp(
    missingQuotesPenalty +
      freshnessPenalty +
      firstUpPenalty +
      wideBarrierPenalty +
      lowSignalConsensus,
    0.008,
    0.11
  );
}

function blendProbability(
  privateProbability: number,
  marketProbability: number,
  blendWeight: number
): number {
  const clippedPrivate = clamp(privateProbability, 0.0001, 0.9999);
  const clippedMarket = clamp(marketProbability, 0.0001, 0.9999);

  const logBlend =
    (1 - blendWeight) * Math.log(clippedPrivate) +
    blendWeight * Math.log(clippedMarket);

  return Math.exp(logBlend);
}

function normalizeProbabilities(values: number[]): number[] {
  const total = sum(values);
  return total === 0 ? values : values.map((value) => value / total);
}

function buildReasons(
  runner: RaceRunner,
  overlay: number,
  robustExpectedValue: number,
  confidence: number
): string[] {
  const reasons: string[] = [];

  if (runner.signals.speed > 0.9) reasons.push("top-tier speed signal");
  if (runner.signals.trackDistance > 0.8) reasons.push("track-distance fit");
  if (runner.signals.barrierTempo > 0.5) reasons.push("positive barrier-tempo map");
  if (runner.signals.marketSupport > 0.35) reasons.push("market support confirmation");
  if (runner.firstUp) reasons.push("first-up uncertainty");
  if (runner.barrier >= 10) reasons.push("wide draw penalty");
  if (overlay > 0.025) reasons.push("material overlay vs market");
  if (robustExpectedValue > 0.06) reasons.push("passes robust EV filter");
  if (confidence > 0.65) reasons.push("high-confidence blend");

  return reasons.slice(0, 4);
}

function buildDiagnostics(race: RaceContext): SignalDiagnostic[] {
  return (Object.keys(SIGNAL_WEIGHTS) as (keyof RunnerSignalSet)[]).map((key) => {
    const values = race.runners.map((runner) => runner.signals[key]);
    return {
      key,
      weight: SIGNAL_WEIGHTS[key],
      average: average(values),
      spread: stdev(values),
    };
  });
}

export function analyzeRace(
  race: RaceContext,
  guardrails: PortfolioGuardrails
): RaceAnalysis {
  const activeRunners = race.runners.filter((runner) => !runner.scratching);
  const bestQuotes = activeRunners.map((runner) => getBestQuote(runner.quotes));
  const marketImplied = bestQuotes.map((quote) =>
    quote ? impliedProbabilityFromQuote(quote) : 1 / activeRunners.length
  );
  const rawOverround = sum(marketImplied);
  const marketProbabilities = normalizeProbabilities(marketImplied);

  const privateScores = activeRunners.map((runner) => modelScore(runner));
  const privateProbabilities = softmax(privateScores);

  const averageSignalSpread = average(
    buildDiagnostics(race).map((diagnostic) => diagnostic.spread)
  );
  const modelToMarketBlend = clamp(0.42 + averageSignalSpread * 0.12, 0.35, 0.68);

  const preliminary = activeRunners.map((runner, index) => {
    const blendedUnnormalized = blendProbability(
      privateProbabilities[index],
      marketProbabilities[index],
      modelToMarketBlend
    );

    return {
      runner,
      bestQuote: bestQuotes[index],
      marketProbability: marketProbabilities[index],
      privateProbability: privateProbabilities[index],
      blendedUnnormalized,
      uncertaintyPenalty: uncertaintyPenalty(runner),
    };
  });

  const normalizedBlended = normalizeProbabilities(
    preliminary.map((entry) => entry.blendedUnnormalized)
  );

  const recommendations: RunnerAnalysis[] = preliminary
    .map((entry, index) => {
      const quote = entry.bestQuote;
      const netOdds = quote ? adjustedOdds(quote) : 0;
      const blendedProbability = normalizedBlended[index];
      const expectedValue = quote ? blendedProbability * netOdds - 1 : -1;
      const robustExpectedValue = expectedValue - entry.uncertaintyPenalty;
      const overlay = blendedProbability - entry.marketProbability;
      const b = Math.max(netOdds - 1, 0);
      const q = 1 - blendedProbability;
      const rawKelly = b > 0 ? (b * blendedProbability - q) / b : 0;
      const confidence = clamp(
        1 - entry.uncertaintyPenalty * 6 + Math.abs(overlay) * 3,
        0.05,
        0.95
      );
      const kellyFraction = Math.max(
        0,
        rawKelly * guardrails.baseFractionalKelly * confidence
      );
      const cappedFraction = Math.min(
        kellyFraction,
        guardrails.maxRunnerExposure
      );
      const recommendedStake = Number(
        (guardrails.bankroll * cappedFraction).toFixed(2)
      );
      const shouldBet =
        robustExpectedValue >= guardrails.minRobustEdge &&
        confidence >= guardrails.minConfidence &&
        recommendedStake > 0;

      return {
        runnerId: entry.runner.id,
        runnerNumber: entry.runner.number,
        runnerName: entry.runner.name,
        bestQuote: quote,
        marketProbability: entry.marketProbability,
        privateProbability: entry.privateProbability,
        blendedProbability,
        uncertaintyPenalty: entry.uncertaintyPenalty,
        expectedValue,
        robustExpectedValue,
        overlay,
        fairOdds: Number((1 / blendedProbability).toFixed(2)),
        netOdds: Number(netOdds.toFixed(2)),
        kellyFraction: cappedFraction,
        recommendedStake,
        shouldBet,
        confidence,
        reasons: buildReasons(entry.runner, overlay, robustExpectedValue, confidence),
      };
    })
    .sort((left, right) => right.robustExpectedValue - left.robustExpectedValue);

  let totalRecommendedOutlay = sum(
    recommendations
      .filter((item) => item.shouldBet)
      .map((item) => item.recommendedStake)
  );

  if (totalRecommendedOutlay > guardrails.bankroll * guardrails.maxRaceExposure) {
    const scale =
      (guardrails.bankroll * guardrails.maxRaceExposure) / totalRecommendedOutlay;

    for (const item of recommendations) {
      item.recommendedStake = Number((item.recommendedStake * scale).toFixed(2));
    }

    totalRecommendedOutlay = sum(
      recommendations
        .filter((item) => item.shouldBet)
        .map((item) => item.recommendedStake)
    );
  }

  return {
    context: race,
    diagnostics: buildDiagnostics(race),
    marketOverround: rawOverround,
    modelToMarketBlend,
    recommendations,
    totalRecommendedOutlay: Number(totalRecommendedOutlay.toFixed(2)),
    generatedAt: new Date().toISOString(),
  };
}
