"use client";

import { useState, useEffect } from "react";
import { GlassCard, GlassBadge } from "@/components/glass";
import {
  DashboardWidgets,
  WidgetDefinition,
} from "@/components/dashboard/DashboardWidgets";
import {
  mockDashboardStats,
  mockPaddocks,
  mockWeightHistory,
  mockBreedDistribution,
  mockActivity,
  mockCalendarEvents,
} from "@/lib/mock-data";
import {
  Beef,
  TrendingUp,
  Weight,
  Stethoscope,
  Plus,
  Syringe,
  Scale,
  AlertTriangle,
  ArrowRightLeft,
  DollarSign,
  Cloud,
  Thermometer,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Activity,
  BarChart3,
  FileText,
  Map,
  Sun,
  LayoutGrid,
  ListChecks,
  MapPinned,
  Fence,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { ActivityItem, CalendarEvent, Paddock } from "@/types";
import { mockMapMarkers, mockFenceLines } from "@/lib/mock-data";

const MapView = dynamic(() => import("@/components/maps/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#000030] rounded-xl">
      <div className="text-center">
        <Map className="w-8 h-8 text-white/30 mx-auto mb-2 animate-pulse" />
        <p className="text-xs text-white/40">Loading map...</p>
      </div>
    </div>
  ),
});

const statusColors: Record<Paddock["status"], { fill: string; border: string; label: string }> = {
  active: { fill: "rgba(16, 185, 129, 0.25)", border: "#10b981", label: "Active" },
  resting: { fill: "rgba(245, 158, 11, 0.25)", border: "#f59e0b", label: "Resting" },
  maintenance: { fill: "rgba(239, 68, 68, 0.25)", border: "#ef4444", label: "Maintenance" },
};

const fenceConditionColors: Record<string, string> = {
  good: "#10b981", fair: "#f59e0b", poor: "#f97316", needs_repair: "#ef4444",
};

const markerIcons: Record<string, string> = {
  water: "💧", gate: "🚪", shed: "🏠", trough: "🪣", yard: "🔲", silo: "🏗️", dam: "🌊",
};

// ─── Helpers ────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function relativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return then.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

function formatEventDate(dateStr: string): { day: string; month: string; weekday: string } {
  const date = new Date(dateStr + "T00:00:00");
  return {
    day: date.toLocaleDateString("en-AU", { day: "numeric" }),
    month: date.toLocaleDateString("en-AU", { month: "short" }).toUpperCase(),
    weekday: date.toLocaleDateString("en-AU", { weekday: "short" }),
  };
}

function formatTime(time: string | null): string {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

// ─── Activity Icon Map ──────────────────────────────────────

function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
  const iconMap: Record<ActivityItem["type"], { icon: React.ElementType; color: string }> = {
    record_added: { icon: Plus, color: "text-emerald-400" },
    medical: { icon: Syringe, color: "text-blue-400" },
    weight_update: { icon: Scale, color: "text-purple-400" },
    alert: { icon: AlertTriangle, color: "text-amber-400" },
    paddock_move: { icon: ArrowRightLeft, color: "text-cyan-400" },
    sale: { icon: DollarSign, color: "text-yellow-400" },
  };

  const config = iconMap[type] || { icon: Activity, color: "text-white/60" };
  const Icon = config.icon;

  return (
    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
      <Icon className={`w-4 h-4 ${config.color}`} />
    </div>
  );
}

// ─── Event Type Badge ───────────────────────────────────────

function eventBadgeColor(type: CalendarEvent["type"]): string {
  const map: Record<string, string> = {
    medical: "bg-blue-500/20 text-blue-300 border-blue-400/20",
    sale: "bg-yellow-500/20 text-yellow-300 border-yellow-400/20",
    inspection: "bg-purple-500/20 text-purple-300 border-purple-400/20",
    maintenance: "bg-orange-500/20 text-orange-300 border-orange-400/20",
    other: "bg-white/15 text-white/80 border-white/10",
  };
  return map[type] || map.other;
}

// ─── Paddock Capacity Color ─────────────────────────────────

function capacityColor(current: number, max: number): string {
  if (max === 0) return "bg-white/20";
  const pct = (current / max) * 100;
  if (pct > 85) return "bg-red-500";
  if (pct >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

function capacityTextColor(current: number, max: number): string {
  if (max === 0) return "text-white/50";
  const pct = (current / max) * 100;
  if (pct > 85) return "text-red-400";
  if (pct >= 70) return "text-amber-400";
  return "text-emerald-400";
}

// ─── Breed Colors ───────────────────────────────────────────

const breedColors: Record<string, string> = {
  Angus: "bg-blue-500",
  Hereford: "bg-emerald-500",
  Brahman: "bg-amber-500",
  Charolais: "bg-purple-500",
  Mixed: "bg-pink-500",
};

const breedDotColors: Record<string, string> = {
  Angus: "bg-blue-400",
  Hereford: "bg-emerald-400",
  Brahman: "bg-amber-400",
  Charolais: "bg-purple-400",
  Mixed: "bg-pink-400",
};

// ─── Stat Card ──────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  delay,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  delay: number;
}) {
  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` } as React.CSSProperties}
    >
      <GlassCard>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white/50 mb-1">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {trend && (
              <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {trend}
              </p>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 ml-3">
            <Icon className="w-5 h-5 text-white/70" />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// ─── Weight Chart ───────────────────────────────────────────

function WeightChart() {
  const data = mockWeightHistory;
  const maxWeight = Math.max(...data.map((d) => d.avg_weight));
  const minWeight = Math.min(...data.map((d) => d.avg_weight));
  const range = maxWeight - minWeight;

  return (
    <div className="flex items-end gap-3 h-40 mt-4">
      {data.map((item, i) => {
        const heightPct = range > 0 ? ((item.avg_weight - minWeight) / range) * 60 + 40 : 80;
        return (
          <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-xs text-white/70 font-medium">{item.avg_weight}</span>
            <div className="w-full flex items-end justify-center" style={{ height: "100px" }}>
              <div
                className="w-full max-w-[40px] rounded-t-lg transition-all duration-500"
                style={{
                  height: `${heightPct}%`,
                  background:
                    i === data.length - 1
                      ? "linear-gradient(to top, rgba(0, 0, 128, 0.8), rgba(59, 130, 246, 0.6))"
                      : "linear-gradient(to top, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.25))",
                  animationDelay: `${i * 100 + 300}ms`,
                }}
              />
            </div>
            <span className="text-xs text-white/50">{item.date}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Breed Distribution Chart ───────────────────────────────

function BreedChart() {
  const data = mockBreedDistribution;

  return (
    <div className="space-y-3 mt-4">
      {data.map((item) => (
        <div key={item.breed} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${breedDotColors[item.breed] || "bg-white/40"}`} />
              <span className="text-sm text-white/80">{item.breed}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">{item.count} head</span>
              <span className="text-sm font-semibold text-white">{item.percentage}%</span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${breedColors[item.breed] || "bg-white/30"}`}
              style={{ width: `${item.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Widget Definitions ─────────────────────────────────────

const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  { id: "greeting", title: "Greeting & Weather", icon: Sun, defaultVisible: true, defaultOrder: 0 },
  { id: "stats", title: "Stat Cards", icon: LayoutGrid, defaultVisible: true, defaultOrder: 1 },
  { id: "charts", title: "Charts", icon: BarChart3, defaultVisible: true, defaultOrder: 2 },
  { id: "activity", title: "Activity & Events", icon: ListChecks, defaultVisible: true, defaultOrder: 3 },
  { id: "map", title: "Property Map", icon: MapPinned, defaultVisible: true, defaultOrder: 4 },
  { id: "paddocks", title: "Paddock Overview", icon: Fence, defaultVisible: true, defaultOrder: 5 },
];

// ─── Widget Content Components ──────────────────────────────

function GreetingWidget() {
  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {getGreeting()}, Tim
          </h1>
          <p className="text-white/50 mt-1">{formatDate(new Date())}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 glass-sm px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">24°C</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-sky-300" />
              <span className="text-sm text-white/70">Partly Cloudy</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-white/50" />
              <span className="text-sm text-white/50">Lismore NSW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsWidget() {
  const stats = mockDashboardStats;
  const [nyciPrice, setNyciPrice] = useState<number>(472.79);

  useEffect(() => {
    fetch("https://amlaupdater.vercel.app/api/check-prices")
      .then((r) => r.json())
      .then((data) => {
        if (data?.indicators?.nyci?.current) {
          setNyciPrice(data.indicators.nyci.current);
        }
      })
      .catch(() => {});
  }, []);

  // Herd value: total head × avg weight × NYCI price (c/kg → $/kg)
  const herdValue = stats.total_livestock * stats.avg_weight_kg * (nyciPrice / 100);
  // Avg weight gain from weight history
  const weightGain = mockWeightHistory.length >= 2
    ? mockWeightHistory[mockWeightHistory.length - 1].avg_weight - mockWeightHistory[mockWeightHistory.length - 2].avg_weight
    : 0;

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Total Livestock"
          value={stats.total_livestock.toLocaleString()}
          icon={Beef}
          trend={`\u2191 12 this week`}
          delay={50}
        />
        <StatCard
          label="Avg Weight"
          value={`${stats.avg_weight_kg.toFixed(0)} kg`}
          icon={Weight}
          trend={`\u2191 2.3% vs last month`}
          delay={100}
        />
        <StatCard
          label="Male / Female"
          value={`${stats.total_male} / ${stats.total_female}`}
          icon={Activity}
          delay={150}
        />
        <StatCard
          label="Active Medical"
          value={`${stats.medical_batches_active} batches`}
          icon={Stethoscope}
          delay={200}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <StatCard
          label="Est. Herd Value"
          value={`$${(herdValue / 1000).toFixed(0)}k`}
          icon={DollarSign}
          trend={`NYCI ${nyciPrice.toFixed(0)}c/kg`}
          delay={250}
        />
        <StatCard
          label="Avg Weight Gain"
          value={`+${weightGain.toFixed(0)} kg/mo`}
          icon={TrendingUp}
          trend="vs last month"
          delay={300}
        />
      </div>
    </div>
  );
}

function ChartsWidget() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Weight Trend Chart */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "250ms" } as React.CSSProperties}
      >
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Weight Trend</h2>
              <p className="text-xs text-white/50 mt-0.5">
                6-month average weight (kg)
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white/60" />
            </div>
          </div>
          <WeightChart />
        </GlassCard>
      </div>

      {/* Breed Distribution */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "300ms" } as React.CSSProperties}
      >
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Breed Distribution
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Breakdown by breed across herd
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Beef className="w-4 h-4 text-white/60" />
            </div>
          </div>
          <BreedChart />
        </GlassCard>
      </div>
    </div>
  );
}

function ActivityWidget() {
  const activities = mockActivity.slice(0, 6);
  const upcomingEvents = mockCalendarEvents
    .filter((e) => !e.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Recent Activity Feed */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "350ms" } as React.CSSProperties}
      >
        <GlassCard padding="none">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent Activity
              </h2>
              <p className="text-xs text-white/50 mt-0.5">Latest farm operations</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white/60" />
            </div>
          </div>
          <div className="max-h-[340px] overflow-y-auto px-5 pb-5">
            <div className="space-y-1">
              {activities.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 py-2.5 border-b border-white/[0.06] last:border-b-0"
                >
                  <ActivityIcon type={item.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90 leading-snug">
                      {item.description}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      {relativeTime(item.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Upcoming Events */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "400ms" } as React.CSSProperties}
      >
        <GlassCard padding="none">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Upcoming Events
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Next scheduled activities
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white/60" />
            </div>
          </div>
          <div className="px-5 pb-5 space-y-2">
            {upcomingEvents.map((event) => {
              const dateInfo = formatEventDate(event.date);
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-4 py-3 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                >
                  {/* Date block */}
                  <div className="w-12 h-14 rounded-xl bg-white/10 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-semibold text-white/50 uppercase leading-none">
                      {dateInfo.month}
                    </span>
                    <span className="text-lg font-bold text-white leading-tight">
                      {dateInfo.day}
                    </span>
                    <span className="text-[10px] text-white/40 leading-none">
                      {dateInfo.weekday}
                    </span>
                  </div>

                  {/* Event info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white truncate">
                        {event.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.time && (
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(event.time)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Type badge */}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border border-white/10 flex-shrink-0 ${eventBadgeColor(event.type)}`}
                  >
                    {event.type}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function MapWidget() {
  const paddocks = mockPaddocks;
  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: "425ms" } as React.CSSProperties}
    >
      <GlassCard padding="none">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Property Map</h2>
            <p className="text-xs text-white/50 mt-0.5">
              99 Anderson Rd, Nimbin NSW 2480 &middot; {paddocks.length} paddocks
            </p>
          </div>
          <Link
            href="/maps"
            className="text-sm text-white/50 hover:text-white flex items-center gap-1 transition-colors"
          >
            Full Map <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="h-[320px] rounded-b-2xl overflow-hidden">
          <MapView
            paddocks={paddocks}
            markers={mockMapMarkers}
            fences={mockFenceLines}
            propertyBoundary={null}
            showPaddocks={true}
            showLabels={true}
            mapStyle="satellite"
            selectedPaddock={null}
            onPaddockClick={() => {}}
            statusColors={statusColors}
            fenceConditionColors={fenceConditionColors}
            markerIcons={markerIcons}
            drawingMode="none"
            onDrawingComplete={() => {}}
          />
        </div>
      </GlassCard>
    </div>
  );
}

function PaddocksWidget() {
  const paddocks = mockPaddocks;
  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: "450ms" } as React.CSSProperties}
    >
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Paddock Overview
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              Current animal distribution
            </p>
          </div>
          <Link
            href="/paddocks"
            className="text-sm text-white/50 hover:text-white flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {paddocks.slice(0, 6).map((paddock) => {
            const pct =
              paddock.capacity > 0
                ? Math.round((paddock.current_count / paddock.capacity) * 100)
                : 0;
            const barColor = capacityColor(paddock.current_count, paddock.capacity);
            const textColor = capacityTextColor(paddock.current_count, paddock.capacity);

            return (
              <div
                key={paddock.id}
                className="rounded-xl bg-white/[0.06] border border-white/[0.08] p-4 hover:bg-white/[0.1] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {paddock.name}
                  </h3>
                  {paddock.status === "resting" && (
                    <GlassBadge variant="warning">Resting</GlassBadge>
                  )}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">
                    {paddock.current_count} / {paddock.capacity} head
                  </span>
                  <span className={`text-xs font-semibold ${textColor}`}>
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-8">
      <DashboardWidgets widgets={WIDGET_DEFINITIONS}>
        {{
          greeting: <GreetingWidget />,
          stats: <StatsWidget />,
          charts: <ChartsWidget />,
          activity: <ActivityWidget />,
          map: <MapWidget />,
          paddocks: <PaddocksWidget />,
        }}
      </DashboardWidgets>

      {/* ── Quick Actions (always visible, not a widget) ──── */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "500ms" } as React.CSSProperties}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Add Record",
              href: "/records/new",
              icon: Plus,
              description: "Create new livestock entry",
              color: "text-emerald-400",
            },
            {
              label: "Medical Batch",
              href: "/medical",
              icon: Syringe,
              description: "Start treatment batch",
              color: "text-blue-400",
            },
            {
              label: "View Map",
              href: "/maps",
              icon: Map,
              description: "Paddock & animal map",
              color: "text-purple-400",
            },
            {
              label: "Reports",
              href: "/reports",
              icon: FileText,
              description: "View analytics",
              color: "text-amber-400",
            },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <GlassCard
                hover
                className="flex flex-col items-center justify-center text-center py-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <span className="text-sm font-semibold text-white">
                  {action.label}
                </span>
                <span className="text-xs text-white/40 mt-1">
                  {action.description}
                </span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
