"use client";

import { useEffect, useState, useCallback } from "react";
import { GlassCard, GlassBadge } from "@/components/glass";
import { MlaTicker } from "@/components/MlaTicker";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  BarChart3,
  Activity,
  Award,
  Users,
  Beef,
} from "lucide-react";

interface DashboardIndicator {
  id: string;
  name: string;
  price: number;
  unit: string;
  perHead: number;
  headWeight: number;
  volume: number;
  date: string;
  changes: {
    oneMonth: { value: number; percentage: number };
    oneYear: { value: number; percentage: number };
  };
}

const INDICATOR_NAMES: Record<string, string> = {
  nyci: "National Young Cattle",
  oyci: "Online Young Cattle",
  weaner_steer: "Weaner Steer",
  processor_cow: "Processor Cow",
  online_weaner_steer: "Online Weaner Steer",
};

const INDICATOR_IDS: Record<string, string> = {
  nyci: "NYCI",
  oyci: "OYCI",
  weaner_steer: "NYCI_Weaner_Steer",
  processor_cow: "Processor_Cow",
  online_weaner_steer: "Online_Weaner_Steer",
};

const INDICATOR_ICONS: Record<string, React.ElementType> = {
  NYCI: Activity,
  OYCI: BarChart3,
  NYCI_Weaner_Steer: Beef,
  Processor_Cow: Beef,
  Online_Weaner_Steer: BarChart3,
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function MarketsPage() {
  const [indicators, setIndicators] = useState<DashboardIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("https://amlaupdater.vercel.app/api/check-prices");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data?.indicators) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsed: DashboardIndicator[] = Object.entries(data.indicators).map(
          ([key, val]: [string, any]) => {
            const weight = key === "processor_cow" ? 600 : 280;
            const perHead = key === "processor_cow"
              ? (val.per_head_600kg as number) || Math.round((val.current as number) * weight / 100)
              : (val.per_head_280kg as number) || Math.round((val.current as number) * weight / 100);
            return {
              id: INDICATOR_IDS[key] || key,
              name: INDICATOR_NAMES[key] || key,
              price: val.current as number,
              unit: "c/kg",
              perHead,
              headWeight: weight,
              volume: val.volume as number,
              date: (val.date as string) || data.fetched_at?.split("T")[0] || "",
              changes: {
                oneMonth: { value: val.m1_change as number, percentage: val.m1_pct as number },
                oneYear: { value: val.y1_change as number, percentage: val.y1_pct as number },
              },
            };
          }
        );
        setIndicators(parsed);
        setLastRefresh(new Date());
      }
    } catch {
      setError("Unable to load market data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Derived summary stats
  const totalVolume = indicators.reduce((sum, ind) => sum + ind.volume, 0);
  const avgMonthChange =
    indicators.length > 0
      ? indicators.reduce((sum, ind) => sum + ind.changes.oneMonth.percentage, 0) / indicators.length
      : 0;
  const bestPerformer =
    indicators.length > 0
      ? indicators.reduce((best, ind) =>
          ind.changes.oneMonth.percentage > best.changes.oneMonth.percentage ? ind : best
        )
      : null;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-white">MLA Market Prices</h1>
          <p className="text-white/50 mt-1">Live NLRS saleyard and online cattle indicators</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <GlassCard key={i} className="animate-pulse">
              <div className="h-4 bg-white/10 rounded w-2/3 mb-4" />
              <div className="h-8 bg-white/10 rounded w-1/2 mb-3" />
              <div className="h-3 bg-white/10 rounded w-1/3" />
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  if (error && indicators.length === 0) {
    return (
      <div className="space-y-5">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-white">MLA Market Prices</h1>
          <p className="text-white/50 mt-1">Live NLRS saleyard and online cattle indicators</p>
        </div>
        <GlassCard className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-white/30 mx-auto mb-3" />
          <p className="text-white/60 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors"
          >
            Retry
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Live MLA Ticker */}
      <div className="-mx-4 md:-mx-6 -mt-6 mb-2">
        <MlaTicker />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">MLA Market Prices</h1>
          <p className="text-white/50 mt-1">Live NLRS saleyard and online cattle indicators</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <RefreshCw className="w-3.5 h-3.5" />
          {lastRefresh
            ? `Updated ${lastRefresh.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}`
            : "Loading..."}
        </div>
      </div>

      {/* Price Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicators.map((ind, i) => {
          const Icon = INDICATOR_ICONS[ind.id] || Beef;
          const m1Up = ind.changes.oneMonth.value >= 0;
          const y1Up = ind.changes.oneYear.value >= 0;
          const perHead = Math.round((ind.price * ind.headWeight) / 100);

          return (
            <GlassCard
              key={ind.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white/60" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{ind.name}</p>
                    <p className="text-[10px] text-white/40">{ind.id}</p>
                  </div>
                </div>
                <GlassBadge variant={m1Up ? "success" : "danger"}>
                  {m1Up ? "+" : ""}{ind.changes.oneMonth.percentage.toFixed(1)}%
                </GlassBadge>
              </div>

              {/* Price */}
              <div className="flex items-end gap-2 mb-1">
                <p className="text-3xl font-bold text-white tabular-nums">
                  {ind.price.toFixed(2)}
                </p>
                <p className="text-sm text-white/50 pb-0.5">{ind.unit}</p>
              </div>

              {/* Per-head price */}
              <p className="text-xs text-white/40 mb-4">
                ~${perHead.toLocaleString()} per head ({ind.headWeight}kg)
              </p>

              {/* Changes */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">1 Month</p>
                  <div className={`flex items-center gap-1 text-sm font-medium ${m1Up ? "text-emerald-400" : "text-red-400"}`}>
                    {m1Up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    <span className="tabular-nums">
                      {m1Up ? "+" : ""}{ind.changes.oneMonth.value.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">1 Year</p>
                  <div className={`flex items-center gap-1 text-sm font-medium ${y1Up ? "text-emerald-400" : "text-red-400"}`}>
                    {y1Up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    <span className="tabular-nums">
                      {y1Up ? "+" : ""}{ind.changes.oneYear.value.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-white/40">
                <span>{ind.volume.toLocaleString()} head</span>
                <span>{formatDate(ind.date)}</span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Market Summary */}
      <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
          Market Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Volume */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <Users className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <p className="text-xs text-white/40 uppercase tracking-wider">Weekly Volume</p>
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">
              {totalVolume.toLocaleString()}
            </p>
            <p className="text-xs text-white/40 mt-1">head across all indicators</p>
          </GlassCard>

          {/* Average Movement */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${avgMonthChange >= 0 ? "bg-emerald-500/15" : "bg-red-500/15"}`}>
                {avgMonthChange >= 0 ? (
                  <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4.5 h-4.5 text-red-400" />
                )}
              </div>
              <p className="text-xs text-white/40 uppercase tracking-wider">Avg Movement (1M)</p>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${avgMonthChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {avgMonthChange >= 0 ? "+" : ""}{avgMonthChange.toFixed(1)}%
            </p>
            <p className="text-xs text-white/40 mt-1">average monthly change</p>
          </GlassCard>

          {/* Best Performer */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Award className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <p className="text-xs text-white/40 uppercase tracking-wider">Best Performer</p>
            </div>
            {bestPerformer && (
              <>
                <p className="text-2xl font-bold text-white">{bestPerformer.name}</p>
                <p className="text-xs text-emerald-400 mt-1 tabular-nums">
                  +{bestPerformer.changes.oneMonth.percentage.toFixed(1)}% this month
                </p>
              </>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
