"use client";

import { useState } from "react";
import { GlassCard, GlassBadge } from "@/components/glass";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Beef,
  Wheat,
  Droplets,
  Fuel,
  RefreshCw,
} from "lucide-react";

interface MarketPrice {
  id: string;
  name: string;
  category: "livestock" | "grain" | "input";
  price: number;
  unit: string;
  change: number;
  changePct: number;
  high52: number;
  low52: number;
  updated: string;
}

interface SaleyardReport {
  location: string;
  date: string;
  yarding: number;
  avgPrice: number;
  topPrice: number;
  change: number;
  category: string;
}

const marketPrices: MarketPrice[] = [
  { id: "eyci", name: "EYCI", category: "livestock", price: 862, unit: "c/kg cwt", change: 12, changePct: 1.4, high52: 920, low52: 680, updated: "2h ago" },
  { id: "feeder-steer", name: "Feeder Steers", category: "livestock", price: 485, unit: "c/kg lwt", change: -5, changePct: -1.0, high52: 520, low52: 380, updated: "2h ago" },
  { id: "heavy-steer", name: "Heavy Steers", category: "livestock", price: 520, unit: "c/kg lwt", change: 8, changePct: 1.6, high52: 560, low52: 420, updated: "2h ago" },
  { id: "cows", name: "Cows", category: "livestock", price: 310, unit: "c/kg lwt", change: -3, changePct: -1.0, high52: 380, low52: 250, updated: "2h ago" },
  { id: "bulls", name: "Bulls", category: "livestock", price: 340, unit: "c/kg lwt", change: 5, changePct: 1.5, high52: 400, low52: 280, updated: "2h ago" },
  { id: "wheat", name: "Wheat", category: "grain", price: 342, unit: "$/t", change: -8, changePct: -2.3, high52: 420, low52: 310, updated: "1h ago" },
  { id: "barley", name: "Barley", category: "grain", price: 295, unit: "$/t", change: 3, changePct: 1.0, high52: 350, low52: 265, updated: "1h ago" },
  { id: "hay", name: "Hay (Lucerne)", category: "grain", price: 380, unit: "$/t", change: 0, changePct: 0, high52: 450, low52: 320, updated: "1d ago" },
  { id: "diesel", name: "Diesel", category: "input", price: 1.82, unit: "$/L", change: -0.03, changePct: -1.6, high52: 2.15, low52: 1.65, updated: "4h ago" },
  { id: "urea", name: "Urea", category: "input", price: 580, unit: "$/t", change: -15, changePct: -2.5, high52: 720, low52: 520, updated: "1d ago" },
];

const saleyardReports: SaleyardReport[] = [
  { location: "Wagga Wagga", date: "Mar 21", yarding: 4200, avgPrice: 490, topPrice: 620, change: 2.1, category: "Steers 400-500kg" },
  { location: "Dubbo", date: "Mar 20", yarding: 3800, avgPrice: 475, topPrice: 580, change: -1.5, category: "Steers 300-400kg" },
  { location: "Roma", date: "Mar 19", yarding: 6500, avgPrice: 510, topPrice: 650, change: 3.2, category: "Steers 400-500kg" },
  { location: "Dalby", date: "Mar 19", yarding: 4800, avgPrice: 465, topPrice: 590, change: -0.8, category: "Mixed cattle" },
  { location: "Casino", date: "Mar 20", yarding: 2200, avgPrice: 495, topPrice: 610, change: 1.8, category: "Steers 300-400kg" },
];

const weeklyEYCI = [
  { week: "W1", value: 835 }, { week: "W2", value: 842 }, { week: "W3", value: 838 },
  { week: "W4", value: 850 }, { week: "W5", value: 855 }, { week: "W6", value: 848 },
  { week: "W7", value: 852 }, { week: "W8", value: 862 },
];

type CategoryFilter = "all" | "livestock" | "grain" | "input";

const categoryIcons: Record<string, React.ElementType> = {
  livestock: Beef,
  grain: Wheat,
  input: Fuel,
};

export default function MarketsPage() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const filtered = categoryFilter === "all"
    ? marketPrices
    : marketPrices.filter((p) => p.category === categoryFilter);

  const eyci = marketPrices.find((p) => p.id === "eyci")!;
  const maxEYCI = Math.max(...weeklyEYCI.map((w) => w.value));
  const minEYCI = Math.min(...weeklyEYCI.map((w) => w.value));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Markets</h1>
          <p className="text-white/50 mt-1">Livestock & commodity prices</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <RefreshCw className="w-3.5 h-3.5" />
          Updated 2h ago
        </div>
      </div>

      {/* EYCI Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: "40ms" }}>
        <GlassCard className="lg:col-span-1 flex flex-col justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider">Eastern Young Cattle Indicator</p>
            <div className="flex items-end gap-3 mt-2">
              <p className="text-4xl font-bold text-white">{eyci.price}</p>
              <p className="text-sm text-white/50 pb-1">{eyci.unit}</p>
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${eyci.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {eyci.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {eyci.change >= 0 ? "+" : ""}{eyci.change} ({eyci.changePct >= 0 ? "+" : ""}{eyci.changePct}%)
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/10 text-xs text-white/40">
            <span>52w Low: {eyci.low52}</span>
            <span>52w High: {eyci.high52}</span>
          </div>
        </GlassCard>

        {/* EYCI Chart */}
        <GlassCard className="lg:col-span-2">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">EYCI — 8 Week Trend</p>
          <div className="flex items-end gap-3 h-32">
            {weeklyEYCI.map((w, i) => {
              const range = maxEYCI - minEYCI || 1;
              const pct = ((w.value - minEYCI) / range) * 80 + 20;
              const isLast = i === weeklyEYCI.length - 1;
              return (
                <div key={w.week} className="flex-1 text-center">
                  <p className={`text-[10px] mb-1 ${isLast ? "text-white font-semibold" : "text-white/40"}`}>
                    {w.value}
                  </p>
                  <div
                    className={`w-full rounded-t-md transition-all ${isLast ? "bg-emerald-500" : "bg-white/15"}`}
                    style={{ height: `${pct}%` }}
                  />
                  <p className="text-[10px] text-white/30 mt-1">{w.week}</p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 animate-fade-in-up" style={{ animationDelay: "70ms" }}>
        {(["all", "livestock", "grain", "input"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              categoryFilter === cat
                ? "bg-white/15 text-white"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            {cat === "all" ? "All" : cat === "input" ? "Farm Inputs" : cat}
          </button>
        ))}
      </div>

      {/* Market Prices Table */}
      <GlassCard padding="none" className="overflow-hidden animate-fade-in-up" style={{ animationDelay: "90ms" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-white/50 font-semibold">Product</th>
              <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-white/50 font-semibold">Price</th>
              <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-white/50 font-semibold hidden sm:table-cell">Change</th>
              <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-white/50 font-semibold hidden md:table-cell">52w Range</th>
              <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-white/50 font-semibold hidden lg:table-cell">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const CatIcon = categoryIcons[item.category] || Beef;
              const range52 = item.high52 - item.low52;
              const position = range52 > 0 ? ((item.price - item.low52) / range52) * 100 : 50;
              return (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <CatIcon className="w-4 h-4 text-white/60" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-[10px] text-white/40 capitalize">{item.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <p className="text-sm font-bold text-white">{typeof item.price === "number" && item.price < 10 ? item.price.toFixed(2) : item.price}</p>
                    <p className="text-[10px] text-white/40">{item.unit}</p>
                  </td>
                  <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                      item.change > 0 ? "text-emerald-400" : item.change < 0 ? "text-red-400" : "text-white/40"
                    }`}>
                      {item.change > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : item.change < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
                      {item.change > 0 ? "+" : ""}{typeof item.change === "number" && Math.abs(item.change) < 1 ? item.change.toFixed(2) : item.change}
                    </span>
                    <p className="text-[10px] text-white/30">
                      {item.changePct > 0 ? "+" : ""}{item.changePct}%
                    </p>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30 w-8 text-right">{item.low52}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 relative">
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-400 border-2 border-[#000040]"
                          style={{ left: `${Math.min(Math.max(position, 5), 95)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-white/30 w-8">{item.high52}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-white/30 hidden lg:table-cell">
                    {item.updated}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlassCard>

      {/* Saleyard Reports */}
      <GlassCard className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
          Recent Saleyard Reports
        </h2>
        <div className="space-y-2">
          {saleyardReports.map((report, i) => (
            <div key={i} className="flex items-center gap-4 py-3 px-3 rounded-lg hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{report.location}</p>
                  <span className="text-[10px] text-white/30">{report.date}</span>
                </div>
                <p className="text-xs text-white/50">{report.category} &middot; {report.yarding.toLocaleString()} head yarded</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-white">{report.avgPrice} c/kg</p>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-[10px] text-white/30">Top: {report.topPrice}</span>
                  <span className={`text-xs font-medium ${report.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {report.change >= 0 ? "+" : ""}{report.change}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
