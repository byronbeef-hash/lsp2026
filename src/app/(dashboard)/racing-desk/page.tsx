"use client";

import { useEffect, useState } from "react";
import { GlassBadge, GlassCard } from "@/components/glass";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CircleDollarSign,
  Gauge,
  Layers3,
  Radar,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { RacingDeskSnapshot } from "@/lib/racing-desk/types";

function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function RacingDeskPage() {
  const [snapshot, setSnapshot] = useState<RacingDeskSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/racing-desk?mode=demo", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as RacingDeskSnapshot;

        if (!cancelled) {
          setSnapshot(data);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load the racing desk snapshot.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Racing Desk</h1>
          <p className="text-white/50 mt-1">
            Market-adjusted probability engine for Betfair and Punting Form.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((item) => (
            <GlassCard key={item} className="animate-pulse min-h-[132px]">{" "}</GlassCard>
          ))}
        </div>
      </div>
    );
  }

  if (!snapshot || error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Racing Desk</h1>
          <p className="text-white/50 mt-1">
            Market-adjusted probability engine for Betfair and Punting Form.
          </p>
        </div>
        <GlassCard className="py-12 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-300 mx-auto mb-3" />
          <p className="text-white/70">{error ?? "No data available."}</p>
        </GlassCard>
      </div>
    );
  }

  const race = snapshot.races[0];
  const bets = race.recommendations.filter((runner) => runner.shouldBet);
  const topOverlay = race.recommendations[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <GlassBadge variant={snapshot.mode === "live" ? "success" : "warning"}>
              {snapshot.mode === "live" ? "Live-connected" : "Demo pipeline"}
            </GlassBadge>
            <GlassBadge variant="info">
              {snapshot.dataSources.betfairConfigured ? "Betfair ready" : "Betfair pending"}
            </GlassBadge>
            <GlassBadge variant="info">
              {snapshot.dataSources.puntingFormConfigured ? "Punting Form ready" : "Punting Form pending"}
            </GlassBadge>
          </div>
          <h1 className="text-3xl font-bold text-white">Racing Desk</h1>
          <p className="text-white/55 mt-1 max-w-3xl">
            A Benter-plus-Simons workflow: weak-signal factory, market-aware probability blend,
            uncertainty haircuts, and disciplined fractional-Kelly execution.
          </p>
        </div>
        <GlassCard className="lg:max-w-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Active Race
              </p>
              <p className="text-lg font-semibold text-white">
                {race.context.meetingName} R{race.context.raceNumber}
              </p>
              <p className="text-sm text-white/50">
                {race.context.className} · {race.context.distanceMeters}m · {race.context.trackCondition}
              </p>
            </div>
            <Radar className="w-8 h-8 text-cyan-300" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Top Overlay</p>
              <p className="text-2xl font-bold text-white mt-2">{topOverlay.runnerName}</p>
              <p className="text-sm text-emerald-300 mt-1">{formatPct(topOverlay.robustExpectedValue)} robust EV</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-300" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Bet Count</p>
              <p className="text-2xl font-bold text-white mt-2">{bets.length}</p>
              <p className="text-sm text-white/50 mt-1">Only robust overlays survive</p>
            </div>
            <CircleDollarSign className="w-8 h-8 text-amber-300" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Race Exposure</p>
              <p className="text-2xl font-bold text-white mt-2">{formatCurrency(race.totalRecommendedOutlay)}</p>
              <p className="text-sm text-white/50 mt-1">
                Cap {formatPct(snapshot.guardrails.maxRaceExposure)} of bankroll
              </p>
            </div>
            <ShieldCheck className="w-8 h-8 text-blue-300" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Blend Weight</p>
              <p className="text-2xl font-bold text-white mt-2">{formatPct(race.modelToMarketBlend)}</p>
              <p className="text-sm text-white/50 mt-1">
                Market prior influence
              </p>
            </div>
            <Layers3 className="w-8 h-8 text-fuchsia-300" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
        <GlassCard>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-semibold text-white">Runner Pricing Grid</h2>
              <p className="text-white/50 text-sm mt-1">
                Private model, market prior, blend, uncertainty, and stake sizing.
              </p>
            </div>
            <GlassBadge variant="info">
              Overround {formatPct(race.marketOverround - 1)}
            </GlassBadge>
          </div>
          <div className="space-y-3">
            {race.recommendations.map((runner) => (
              <div
                key={runner.runnerId}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-cyan-300">
                        #{runner.runnerNumber}
                      </span>
                      <h3 className="text-lg font-semibold text-white">
                        {runner.runnerName}
                      </h3>
                      <GlassBadge variant={runner.shouldBet ? "success" : "default"}>
                        {runner.shouldBet ? "Bet" : "Pass"}
                      </GlassBadge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3 text-xs text-white/55">
                      {runner.reasons.map((reason) => (
                        <span
                          key={reason}
                          className="rounded-full bg-white/8 px-2.5 py-1"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm min-w-full lg:min-w-[440px]">
                    <div className="rounded-xl bg-black/10 p-3">
                      <p className="text-white/40 text-xs uppercase">Market</p>
                      <p className="text-white font-semibold mt-1">{formatPct(runner.marketProbability)}</p>
                    </div>
                    <div className="rounded-xl bg-black/10 p-3">
                      <p className="text-white/40 text-xs uppercase">Blend</p>
                      <p className="text-white font-semibold mt-1">{formatPct(runner.blendedProbability)}</p>
                    </div>
                    <div className="rounded-xl bg-black/10 p-3">
                      <p className="text-white/40 text-xs uppercase">Fair Odds</p>
                      <p className="text-white font-semibold mt-1">{runner.fairOdds.toFixed(2)}</p>
                    </div>
                    <div className="rounded-xl bg-black/10 p-3">
                      <p className="text-white/40 text-xs uppercase">Best Net</p>
                      <p className="text-white font-semibold mt-1">{runner.netOdds.toFixed(2)}</p>
                    </div>
                    <div className="rounded-xl bg-black/10 p-3">
                      <p className="text-white/40 text-xs uppercase">EV</p>
                      <p className={`font-semibold mt-1 ${runner.expectedValue >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                        {formatPct(runner.expectedValue)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black/10 p-3">
                      <p className="text-white/40 text-xs uppercase">Robust EV</p>
                      <p className={`font-semibold mt-1 ${runner.robustExpectedValue >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                        {formatPct(runner.robustExpectedValue)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black/10 p-3">
                      <p className="text-white/40 text-xs uppercase">Confidence</p>
                      <p className="text-white font-semibold mt-1">{formatPct(runner.confidence)}</p>
                    </div>
                    <div className="rounded-xl bg-black/10 p-3">
                      <p className="text-white/40 text-xs uppercase">Stake</p>
                      <p className="text-white font-semibold mt-1">{formatCurrency(runner.recommendedStake)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-cyan-300" />
              Signal Factory
            </h2>
            <div className="space-y-3 mt-4">
              {race.diagnostics
                .sort((left, right) => right.weight - left.weight)
                .map((signal) => (
                  <div key={signal.key} className="rounded-xl bg-white/6 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-white capitalize font-medium">{signal.key}</p>
                      <p className="text-white/50 text-xs">w {signal.weight.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-white/55">
                      <span>avg {signal.average.toFixed(2)}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>spread {signal.spread.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-300" />
              Operating Rules
            </h2>
            <div className="space-y-3 mt-4 text-sm text-white/65">
              <div className="rounded-xl bg-white/6 p-3">
                Start in NSW/VIC metro win markets, fit probabilities, and only scale after CLV is stable.
              </div>
              <div className="rounded-xl bg-white/6 p-3">
                Blend model and market late, haircut for uncertainty, and cap correlated exposure at race level.
              </div>
              <div className="rounded-xl bg-white/6 p-3">
                Use Betfair for executable truth, Punting Form for form/ratings context, and record every decision.
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
