"use client";

import { useState, useMemo } from "react";
import { GlassCard, GlassBadge } from "@/components/glass";
import {
  getAnalyticsStats,
  formatDuration,
  type MockClick,
} from "@/lib/analytics-mock-data";
import {
  Users,
  Eye,
  MousePointerClick,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Activity,
  ArrowRight,
  BarChart3,
  Layers,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Heatmap color helper — blue (cold) to red (hot)
// ---------------------------------------------------------------------------
function heatColor(intensity: number): string {
  // intensity 0..1
  const clamped = Math.min(1, Math.max(0, intensity));
  // HSL: 240 (blue) -> 0 (red)
  const hue = 240 - clamped * 240;
  const sat = 80 + clamped * 20;
  const light = 40 + clamped * 15;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

// ---------------------------------------------------------------------------
// Browser icon helper
// ---------------------------------------------------------------------------
function BrowserIcon({ browser }: { browser: string }) {
  const label = browser === "Chrome" ? "Chrome" : browser === "Safari" ? "Safari" : browser === "Firefox" ? "Firefox" : browser;
  return (
    <span className="text-xs text-white/50" title={label}>
      {browser === "Chrome" && <Globe className="w-3.5 h-3.5 inline text-blue-300" />}
      {browser === "Safari" && <Globe className="w-3.5 h-3.5 inline text-cyan-300" />}
      {browser === "Firefox" && <Globe className="w-3.5 h-3.5 inline text-orange-300" />}
      {!["Chrome", "Safari", "Firefox"].includes(browser) && <Globe className="w-3.5 h-3.5 inline text-white/50" />}
    </span>
  );
}

function DeviceIcon({ device }: { device: string }) {
  if (device === "Mobile") return <Smartphone className="w-3.5 h-3.5 text-white/40" />;
  if (device === "Tablet") return <Tablet className="w-3.5 h-3.5 text-white/40" />;
  return <Monitor className="w-3.5 h-3.5 text-white/40" />;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AnalyticsPage() {
  const stats = useMemo(() => getAnalyticsStats(), []);
  const [heatmapPage, setHeatmapPage] = useState("/");

  // Pages that have click data
  const pagesWithClicks = useMemo(
    () => Object.keys(stats.clicksByPage).sort(),
    [stats.clicksByPage]
  );

  // Heatmap grid 20x20
  const heatmapGrid = useMemo(() => {
    const clicks: MockClick[] = stats.clicksByPage[heatmapPage] || [];
    const grid: number[][] = Array.from({ length: 20 }, () => Array(20).fill(0));

    for (const c of clicks) {
      const col = Math.min(19, Math.floor((c.x / 100) * 20));
      const row = Math.min(19, Math.floor((c.y / 100) * 20));
      grid[row][col]++;
    }

    const maxVal = Math.max(1, ...grid.flat());
    return { grid, maxVal, totalClicks: clicks.length };
  }, [heatmapPage, stats.clicksByPage]);

  // Page flow — top 8 transitions
  const flowData = useMemo(() => {
    const transitions: { from: string; to: string; count: number }[] = [];
    for (const [from, tos] of Object.entries(stats.flowTransitions)) {
      for (const [to, count] of Object.entries(tos)) {
        transitions.push({ from, to, count });
      }
    }
    transitions.sort((a, b) => b.count - a.count);
    return transitions.slice(0, 8);
  }, [stats.flowTransitions]);

  const flowMax = Math.max(1, ...flowData.map((f) => f.count));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-blue-400" />
          Analytics Dashboard
        </h1>
        <p className="text-white/50 mt-1">
          Visitor insights, heatmaps, and session tracking
        </p>
      </div>

      {/* ================================================================= */}
      {/* Stat Cards */}
      {/* ================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Unique Visitors",
            value: stats.totalVisitors,
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/20",
          },
          {
            label: "Total Sessions",
            value: stats.totalSessions,
            icon: Activity,
            color: "text-emerald-400",
            bg: "bg-emerald-500/20",
          },
          {
            label: "Page Views",
            value: stats.totalPageViews,
            icon: Eye,
            color: "text-purple-400",
            bg: "bg-purple-500/20",
          },
          {
            label: "Avg. Session",
            value: formatDuration(stats.avgSessionDuration),
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-500/20",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <GlassCard
              key={stat.label}
              className={`animate-fade-in-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* Top Pages + Recent Visitors */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "320ms" }}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            Most Visited Pages
          </h2>
          <div className="space-y-2">
            {stats.topPages.map(([page, count], i) => {
              const maxCount = stats.topPages[0][1];
              const pct = (count / maxCount) * 100;
              return (
                <div key={page} className="group">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/80 font-mono text-xs">
                      <span className="text-white/30 mr-2">{i + 1}.</span>
                      {page}
                    </span>
                    <span className="text-white/50 text-xs">{count} views</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, hsl(${240 - i * 24}, 70%, 55%), hsl(${220 - i * 24}, 80%, 65%))`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Recent Visitors */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Recent Visitors
          </h2>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
            {stats.recentVisitors.map((v) => {
              const totalPages = v.sessions.reduce(
                (s, se) => s + se.pageViews.length,
                0
              );
              const totalTime = v.sessions.reduce(
                (s, se) => s + se.duration,
                0
              );
              return (
                <div
                  key={v.visitorId}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono text-white/60 shrink-0">
                    {v.visitorId.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-white/70 truncate">
                        {v.visitorId.slice(0, 8)}
                      </span>
                      <span className="text-xs text-white/40">
                        {v.flag} {v.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <BrowserIcon browser={v.browser} />
                      <span className="text-[10px] text-white/30">{v.os}</span>
                      <span className="text-[10px] text-white/30">
                        {totalPages} pages
                      </span>
                      <span className="text-[10px] text-white/30">
                        {formatDuration(totalTime)}
                      </span>
                    </div>
                  </div>
                  <DeviceIcon device={v.device} />
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* ================================================================= */}
      {/* Click Heatmap */}
      {/* ================================================================= */}
      <GlassCard className="animate-fade-in-up" style={{ animationDelay: "480ms" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MousePointerClick className="w-5 h-5 text-red-400" />
            Click Heatmap
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40">
              {heatmapGrid.totalClicks} clicks
            </span>
            <select
              value={heatmapPage}
              onChange={(e) => setHeatmapPage(e.target.value)}
              className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-400/50"
            >
              {pagesWithClicks.map((p) => (
                <option key={p} value={p} className="bg-slate-900 text-white">
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Heatmap grid */}
        <div className="relative rounded-xl overflow-hidden bg-[#0a0a2e] border border-white/5">
          {/* Page mockup labels */}
          <div className="absolute top-1 left-2 text-[10px] text-white/20 font-mono z-10">
            {heatmapPage}
          </div>
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(20, 1fr)",
              gridTemplateRows: "repeat(20, 1fr)",
              aspectRatio: "16 / 10",
            }}
          >
            {heatmapGrid.grid.flatMap((row, ri) =>
              row.map((val, ci) => {
                const intensity = val / heatmapGrid.maxVal;
                return (
                  <div
                    key={`${ri}-${ci}`}
                    className="relative transition-colors duration-300"
                    style={{
                      backgroundColor:
                        val > 0
                          ? heatColor(intensity)
                          : "transparent",
                      opacity: val > 0 ? 0.25 + intensity * 0.75 : 0,
                    }}
                    title={`Row ${ri + 1}, Col ${ci + 1}: ${val} clicks`}
                  >
                    {val > 0 && (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          background: `radial-gradient(circle, ${heatColor(intensity)}88 0%, transparent 70%)`,
                        }}
                      >
                        {val >= 3 && (
                          <span className="text-[8px] font-bold text-white/60">
                            {val}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Legend */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 z-10">
            <span className="text-[9px] text-white/30">Low</span>
            <div className="flex h-2 rounded-full overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-full"
                  style={{ backgroundColor: heatColor(i / 9) }}
                />
              ))}
            </div>
            <span className="text-[9px] text-white/30">High</span>
          </div>
        </div>
      </GlassCard>

      {/* ================================================================= */}
      {/* Session Timeline */}
      {/* ================================================================= */}
      <GlassCard className="animate-fade-in-up" style={{ animationDelay: "560ms" }}>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          Recent Sessions
        </h2>
        <div className="space-y-3">
          {stats.recentSessions.map((session) => {
            const pages = session.pageViews.map((pv) => pv.path);
            const uniquePages = [...new Set(pages)];
            const timeAgo = Date.now() - session.startTime;
            const daysAgo = Math.floor(timeAgo / (1000 * 60 * 60 * 24));
            const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
            const timeLabel =
              daysAgo > 0
                ? `${daysAgo}d ago`
                : hoursAgo > 0
                ? `${hoursAgo}h ago`
                : "Just now";

            return (
              <div
                key={session.sessionId}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] transition-colors"
              >
                {/* Visitor + Location */}
                <div className="flex items-center gap-2 sm:w-44 shrink-0">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-mono text-white/60">
                    {session.visitorId.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-mono text-white/60 block">
                      {session.visitorId.slice(0, 8)}
                    </span>
                    <span className="text-[10px] text-white/35">
                      {session.flag} {session.city}
                    </span>
                  </div>
                </div>

                {/* Pages visited */}
                <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                  {uniquePages.map((p, i) => (
                    <span key={i}>
                      <GlassBadge
                        variant={p === "/" ? "info" : "default"}
                        className="text-[10px] !px-1.5 !py-0"
                      >
                        {p}
                      </GlassBadge>
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 sm:w-40 shrink-0 justify-end">
                  <span className="text-[10px] text-white/40">
                    {formatDuration(session.duration)}
                  </span>
                  <BrowserIcon browser={session.browser} />
                  <DeviceIcon device={session.device} />
                  <span className="text-[10px] text-white/30 w-12 text-right">
                    {timeLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* ================================================================= */}
      {/* Page Flow (Sankey-like) */}
      {/* ================================================================= */}
      <GlassCard className="animate-fade-in-up" style={{ animationDelay: "640ms" }}>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Page Flow
        </h2>
        <p className="text-xs text-white/40 mb-4">
          Most common navigation paths between pages
        </p>

        {/* Entry pages */}
        <div className="mb-6">
          <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
            Entry Pages
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.entryPages)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([page, count]) => {
                const maxEntry = Math.max(
                  ...Object.values(stats.entryPages)
                );
                const pct = (count / maxEntry) * 100;
                return (
                  <div
                    key={page}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <span className="text-xs text-emerald-300 font-mono">
                      {page}
                    </span>
                    <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-white/40">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Flow transitions */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
            Top Transitions
          </h3>
          {flowData.map((f, i) => {
            const pct = (f.count / flowMax) * 100;
            const hue = 200 + i * 15;
            return (
              <div
                key={`${f.from}-${f.to}-${i}`}
                className="flex items-center gap-3"
              >
                <span className="text-xs font-mono text-white/60 w-24 text-right truncate shrink-0">
                  {f.from}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                <div className="flex-1 h-6 rounded-md overflow-hidden bg-white/[0.03] relative">
                  <div
                    className="absolute inset-y-0 left-0 rounded-md transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, hsl(${hue}, 60%, 40%), hsl(${hue}, 70%, 55%))`,
                    }}
                  />
                  <span className="relative z-10 flex items-center h-full px-2 text-[10px] text-white/70 font-medium">
                    {f.count}
                  </span>
                </div>
                <span className="text-xs font-mono text-white/60 w-24 truncate shrink-0">
                  {f.to}
                </span>
              </div>
            );
          })}
        </div>

        {/* Exit pages */}
        <div className="mt-6">
          <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
            Exit Pages
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.exitPages)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([page, count]) => {
                const maxExit = Math.max(
                  ...Object.values(stats.exitPages)
                );
                const pct = (count / maxExit) * 100;
                return (
                  <div
                    key={page}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <span className="text-xs text-red-300 font-mono">
                      {page}
                    </span>
                    <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-red-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-white/40">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
