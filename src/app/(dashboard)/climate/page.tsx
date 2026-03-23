"use client";

import { GlassCard, GlassBadge } from "@/components/glass";
import {
  Leaf,
  Droplets,
  TrendingUp,
  BarChart3,
  Beef,
  Calendar,
  TreePine,
  Sprout,
  Brain,
  CloudRain,
  Target,
  Zap,
} from "lucide-react";

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------

const phiComponents = [
  { label: "Rainfall Index", weight: 30, score: 82, color: "bg-blue-400" },
  { label: "Biomass Index", weight: 25, score: 68, color: "bg-emerald-400" },
  { label: "Trend Index", weight: 15, score: 75, color: "bg-purple-400" },
  { label: "Forecast Index", weight: 15, score: 80, color: "bg-cyan-400" },
  { label: "Stocking Pressure", weight: 15, score: 65, color: "bg-amber-400" },
];

const phiScore = Math.round(
  phiComponents.reduce((sum, c) => sum + c.score * (c.weight / 100), 0)
);

const statCards = [
  { label: "Current Biomass", value: "2,450", unit: "kg/ha", badge: "Good", badgeVariant: "success" as const, icon: Leaf, color: "text-emerald-400", bgColor: "bg-emerald-500/15" },
  { label: "12-Month Avg", value: "1,520", unit: "kg/ha", badge: null, badgeVariant: "default" as const, icon: BarChart3, color: "text-blue-400", bgColor: "bg-blue-500/15" },
  { label: "Annual Rainfall", value: "892", unit: "mm", badge: "108% of avg", badgeVariant: "info" as const, icon: CloudRain, color: "text-sky-400", bgColor: "bg-sky-500/15" },
  { label: "Carrying Capacity", value: "874", unit: "DSE", badge: "58 cow/calf", badgeVariant: "default" as const, icon: Beef, color: "text-orange-400", bgColor: "bg-orange-500/15" },
  { label: "Grazing Days", value: "85", unit: "days", badge: null, badgeVariant: "info" as const, icon: Calendar, color: "text-blue-300", bgColor: "bg-blue-400/15" },
  { label: "Carbon Credits", value: "12", unit: "ACCUs", badge: "$360/yr", badgeVariant: "success" as const, icon: TreePine, color: "text-green-400", bgColor: "bg-green-500/15" },
];

const biomassHistory = [
  { month: "Oct", value: 1200 },
  { month: "Nov", value: 1450 },
  { month: "Dec", value: 1800 },
  { month: "Jan", value: 2100 },
  { month: "Feb", value: 2450 },
  { month: "Mar", value: 2200 },
  { month: "Apr", value: 1800 },
  { month: "May", value: 1400 },
  { month: "Jun", value: 900 },
  { month: "Jul", value: 650 },
  { month: "Aug", value: 800 },
  { month: "Sep", value: 1100 },
];

const rainfallHistory = [
  { month: "Oct", value: 42 },
  { month: "Nov", value: 68 },
  { month: "Dec", value: 95 },
  { month: "Jan", value: 120 },
  { month: "Feb", value: 85 },
  { month: "Mar", value: 75 },
  { month: "Apr", value: 55 },
  { month: "May", value: 35 },
  { month: "Jun", value: 28 },
  { month: "Jul", value: 22 },
  { month: "Aug", value: 30 },
  { month: "Sep", value: 45 },
];

const forecasts = [
  { month: "Apr", biomass: 1950, confidence: 92, rain: 48 },
  { month: "May", biomass: 1500, confidence: 85, rain: 32 },
  { month: "Jun", biomass: 950, confidence: 78, rain: 25 },
  { month: "Jul", biomass: 700, confidence: 70, rain: 20 },
  { month: "Aug", biomass: 850, confidence: 62, rain: 28 },
  { month: "Sep", biomass: 1150, confidence: 55, rain: 40 },
];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function getBiomassTier(val: number) {
  if (val >= 3500) return { label: "Excellent", color: "bg-emerald-500" };
  if (val >= 2200) return { label: "Good", color: "bg-green-500" };
  if (val >= 1200) return { label: "Moderate", color: "bg-lime-500" };
  if (val >= 600) return { label: "Low", color: "bg-orange-500" };
  return { label: "Critical", color: "bg-red-500" };
}

function getBiomassBarColor(val: number) {
  if (val >= 3500) return "bg-emerald-400";
  if (val >= 2200) return "bg-green-400";
  if (val >= 1200) return "bg-lime-400";
  if (val >= 600) return "bg-orange-400";
  return "bg-red-400";
}

// ---------------------------------------------------------------------------
// COMPONENT: PHI Circular Gauge
// ---------------------------------------------------------------------------

function PHIGauge({ score }: { score: number }) {
  const radius = 70;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const pct = score / 100;
  const dashOffset = circumference * (1 - pct * 0.75); // 270 deg arc
  const rotation = 135; // start from bottom-left

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 160 160" className="w-full h-full">
        {/* Background track */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeLinecap="round"
          transform={`rotate(${rotation} 80 80)`}
        />
        {/* Score arc */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="url(#phiGradient)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(${rotation} 80 80)`}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="phiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-white">{score}</span>
        <span className="text-xs text-white/40 uppercase tracking-widest mt-1">PHI Score</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function ClimatePasturePage() {
  const maxBiomass = Math.max(...biomassHistory.map((b) => b.value));
  const maxRainfall = Math.max(...rainfallHistory.map((r) => r.value));

  // Stocking
  const currentDSE = 720;
  const capacityDSE = 874;
  const stockingPct = Math.round((currentDSE / capacityDSE) * 100);
  const stockingColor =
    stockingPct > 100 ? "bg-red-500" : stockingPct >= 85 ? "bg-amber-500" : "bg-emerald-500";
  const stockingBadge =
    stockingPct > 100 ? "danger" : stockingPct >= 85 ? "warning" : "success";

  // Carbon
  const treeCarbon = 125;
  const soilCarbon = 645;
  const totalCarbonPerHa = treeCarbon + soilCarbon;
  const totalTonnes = 62;
  const accuCount = 12;
  const accuPrice = 30;
  const treePct = Math.round((treeCarbon / totalCarbonPerHa) * 100);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">Climate &amp; Pasture AI</h1>
        <p className="text-white/50 mt-1">
          Pasture intelligence, biomass analytics &amp; carbon tracking
        </p>
      </div>

      {/* ================================================================= */}
      {/* 1. PASTURE HEALTH INDEX */}
      {/* ================================================================= */}
      <GlassCard
        className="animate-fade-in-up"
        style={{ animationDelay: "30ms" }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Brain className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            Pasture Health Index
          </h2>
          <GlassBadge variant="success" className="ml-auto">
            Good
          </GlassBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gauge */}
          <PHIGauge score={phiScore} />

          {/* Sub-components */}
          <div className="space-y-3 flex flex-col justify-center">
            {phiComponents.map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/60">{c.label}</span>
                  <span className="text-xs text-white/80 font-semibold">
                    {c.score}/100{" "}
                    <span className="text-white/30 font-normal">({c.weight}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.color} transition-all duration-700 ease-out`}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-start gap-3">
          <Sprout className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-sm text-white/70">
            Pasture in good condition. Hold stock and monitor seasonal trends.
          </p>
        </div>
      </GlassCard>

      {/* ================================================================= */}
      {/* 2. STAT CARDS */}
      {/* ================================================================= */}
      <div
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 animate-fade-in-up"
        style={{ animationDelay: "60ms" }}
      >
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <GlassCard key={s.label}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${s.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">
                {s.value}
                <span className="text-sm font-normal text-white/40 ml-1">{s.unit}</span>
              </p>
              <p className="text-[11px] text-white/40 mt-1">{s.label}</p>
              {s.badge && (
                <GlassBadge variant={s.badgeVariant} className="mt-2">
                  {s.badge}
                </GlassBadge>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* 3. BIOMASS HISTORY CHART */}
      {/* ================================================================= */}
      <GlassCard
        className="animate-fade-in-up"
        style={{ animationDelay: "90ms" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            Biomass History (12 Months)
          </h2>
        </div>

        {/* Chart area */}
        <div className="relative">
          {/* Reference lines */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Good threshold - 1500 */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-emerald-500/30"
              style={{ bottom: `${(1500 / maxBiomass) * 100}%` }}
            >
              <span className="absolute -top-3 right-0 text-[9px] text-emerald-400/60">
                1,500 Good
              </span>
            </div>
            {/* Critical floor - 500 */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-red-500/30"
              style={{ bottom: `${(500 / maxBiomass) * 100}%` }}
            >
              <span className="absolute -top-3 right-0 text-[9px] text-red-400/60">
                500 Critical
              </span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-end h-48">
            {biomassHistory.map((b) => {
              const pct = (b.value / maxBiomass) * 100;
              const barColor = getBiomassBarColor(b.value);
              return (
                <div key={b.month} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-white/60 font-medium">
                    {b.value.toLocaleString()}
                  </span>
                  <div className="w-full flex items-end justify-center" style={{ height: "160px" }}>
                    <div
                      className={`w-full max-w-[32px] rounded-t ${barColor} transition-all duration-500 ease-out`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white/40">{b.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-white/5">
          {[
            { label: "Critical (<600)", color: "bg-red-400" },
            { label: "Low (600-1200)", color: "bg-orange-400" },
            { label: "Moderate (1200-2200)", color: "bg-lime-400" },
            { label: "Good (2200-3500)", color: "bg-green-400" },
            { label: "Excellent (3500+)", color: "bg-emerald-400" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-white/50">
              <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
              {l.label}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ================================================================= */}
      {/* 4. RAINFALL HISTORY CHART */}
      {/* ================================================================= */}
      <GlassCard
        className="animate-fade-in-up"
        style={{ animationDelay: "120ms" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <CloudRain className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            Rainfall History (12 Months)
          </h2>
          <GlassBadge variant="info" className="ml-auto">
            892mm total
          </GlassBadge>
        </div>

        <div className="grid grid-cols-12 gap-2 items-end h-40">
          {rainfallHistory.map((r) => {
            const pct = (r.value / maxRainfall) * 100;
            return (
              <div key={r.month} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-blue-300/80 font-medium">
                  {r.value}mm
                </span>
                <div className="w-full flex items-end justify-center" style={{ height: "120px" }}>
                  <div
                    className="w-full max-w-[32px] rounded-t bg-blue-500/70 transition-all duration-500 ease-out"
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-white/40">{r.month}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* ================================================================= */}
      {/* 5. AI FORECAST PANEL */}
      {/* ================================================================= */}
      <GlassCard
        className="animate-fade-in-up"
        style={{ animationDelay: "150ms" }}
      >
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            AI Forecast &mdash; Next 6 Months
          </h2>
          <GlassBadge variant="info" className="ml-auto">
            Pasture AI v2
          </GlassBadge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {forecasts.map((f) => {
            const tier = getBiomassTier(f.biomass);
            return (
              <div
                key={f.month}
                className="bg-white/5 rounded-xl p-3 border border-white/5"
              >
                <p className="text-sm font-bold text-white mb-2">{f.month}</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase">Biomass</p>
                    <p className="text-lg font-bold text-white">
                      {f.biomass.toLocaleString()}
                      <span className="text-[10px] text-white/30 ml-0.5">kg/ha</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase">Rainfall</p>
                    <p className="text-sm font-semibold text-blue-300">{f.rain}mm</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase mb-1">Confidence</p>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                        style={{ width: `${f.confidence}%`, opacity: f.confidence / 100 }}
                      />
                    </div>
                    <p className="text-[10px] text-cyan-300/70 mt-0.5">{f.confidence}%</p>
                  </div>
                  <GlassBadge
                    variant={
                      tier.label === "Good" || tier.label === "Excellent"
                        ? "success"
                        : tier.label === "Moderate"
                        ? "info"
                        : tier.label === "Low"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {tier.label}
                  </GlassBadge>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* ================================================================= */}
      {/* 6 & 7. STOCKING RATE + CARBON — side by side */}
      {/* ================================================================= */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up"
        style={{ animationDelay: "180ms" }}
      >
        {/* 6. Stocking Rate */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-orange-400" />
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
              Stocking Rate
            </h2>
            <GlassBadge
              variant={stockingBadge as "success" | "warning" | "danger"}
              className="ml-auto"
            >
              {stockingPct}% capacity
            </GlassBadge>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${stockingColor} transition-all duration-700 ease-out`}
                style={{ width: `${Math.min(stockingPct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-white/40">0 DSE</span>
              <span className="text-xs text-white/60 font-semibold">
                {currentDSE} / {capacityDSE} DSE
              </span>
              <span className="text-xs text-white/40">{capacityDSE} DSE</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white/5 rounded-lg p-3 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Cow/calf pairs</span>
              <span className="text-white font-semibold">48</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">DSE per pair</span>
              <span className="text-white font-semibold">15</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-white/10 pt-1">
              <span className="text-white/60">Total DSE</span>
              <span className="text-white font-bold">720</span>
            </div>
          </div>
        </GlassCard>

        {/* 7. Carbon Sequestration */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-green-400" />
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
              Carbon Sequestration
            </h2>
          </div>

          {/* Totals row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{totalTonnes}</p>
              <p className="text-[10px] text-white/40 uppercase mt-0.5">
                tonnes CO&#8322;/yr
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-300">
                ${(accuCount * accuPrice).toLocaleString()}
              </p>
              <p className="text-[10px] text-white/40 uppercase mt-0.5">
                {accuCount} ACCUs @ ${accuPrice}/yr
              </p>
            </div>
          </div>

          {/* Split bar */}
          <div className="mb-3">
            <div className="h-5 rounded-full overflow-hidden flex">
              <div
                className="bg-green-600 flex items-center justify-center transition-all duration-700"
                style={{ width: `${treePct}%` }}
              >
                <span className="text-[9px] text-white font-semibold">Tree</span>
              </div>
              <div
                className="bg-amber-700 flex items-center justify-center transition-all duration-700"
                style={{ width: `${100 - treePct}%` }}
              >
                <span className="text-[9px] text-white font-semibold">Soil</span>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-green-600" />
                <span className="text-white/60">Tree Carbon</span>
              </div>
              <span className="text-white font-semibold">
                {treeCarbon} kg CO&#8322;/ha/yr
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-amber-700" />
                <span className="text-white/60">Soil Carbon</span>
              </div>
              <span className="text-white font-semibold">
                {soilCarbon} kg CO&#8322;/ha/yr
              </span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-white/10 pt-2">
              <span className="text-white/60">Total per hectare</span>
              <span className="text-white font-bold">
                {totalCarbonPerHa} kg CO&#8322;/ha/yr
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
