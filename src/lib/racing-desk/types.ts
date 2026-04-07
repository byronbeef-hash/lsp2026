export type QuoteSource = "betfair" | "corporate" | "tote";

export interface RunnerSignalSet {
  speed: number;
  pace: number;
  finish: number;
  class: number;
  trackDistance: number;
  jockeyTrainer: number;
  formCycle: number;
  stableIntent: number;
  barrierTempo: number;
  marketSupport: number;
}

export interface RunnerQuote {
  source: QuoteSource;
  decimalOdds: number;
  availableStake?: number;
  commissionRate?: number;
  capturedAt?: string;
}

export interface RaceRunner {
  id: string;
  number: number;
  name: string;
  barrier: number;
  weightKg: number;
  jockey: string;
  trainer: string;
  scratching?: boolean;
  runStyle?: "leader" | "on-pace" | "midfield" | "backmarker";
  lastStartFinish?: number;
  daysSinceRun?: number;
  firstUp?: boolean;
  secondUp?: boolean;
  signals: RunnerSignalSet;
  quotes: RunnerQuote[];
  modelNotes?: string[];
}

export interface RaceContext {
  meetingId: string;
  meetingName: string;
  venue: string;
  raceNumber: number;
  startTime: string;
  distanceMeters: number;
  className: string;
  trackCondition: string;
  railPosition: string;
  weather?: string;
  runners: RaceRunner[];
}

export interface SignalDiagnostic {
  key: keyof RunnerSignalSet;
  weight: number;
  average: number;
  spread: number;
}

export interface RunnerAnalysis {
  runnerId: string;
  runnerNumber: number;
  runnerName: string;
  bestQuote?: RunnerQuote;
  marketProbability: number;
  privateProbability: number;
  blendedProbability: number;
  uncertaintyPenalty: number;
  expectedValue: number;
  robustExpectedValue: number;
  overlay: number;
  fairOdds: number;
  netOdds: number;
  kellyFraction: number;
  recommendedStake: number;
  shouldBet: boolean;
  confidence: number;
  reasons: string[];
}

export interface PortfolioGuardrails {
  bankroll: number;
  baseFractionalKelly: number;
  maxRaceExposure: number;
  maxRunnerExposure: number;
  minRobustEdge: number;
  minConfidence: number;
}

export interface RaceAnalysis {
  context: RaceContext;
  diagnostics: SignalDiagnostic[];
  marketOverround: number;
  modelToMarketBlend: number;
  recommendations: RunnerAnalysis[];
  totalRecommendedOutlay: number;
  generatedAt: string;
}

export interface RacingDeskSnapshot {
  mode: "demo" | "live";
  dataSources: {
    puntingFormConfigured: boolean;
    betfairConfigured: boolean;
  };
  guardrails: PortfolioGuardrails;
  races: RaceAnalysis[];
}
