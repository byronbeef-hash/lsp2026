"use client";

import { useState } from "react";
import { GlassCard, GlassBadge, GlassButton } from "@/components/glass";
import { usePaddockStore } from "@/stores/modules";
import {
  mockStockGroups,
  mockRotationHistory,
  mockRotationRecommendations,
} from "@/lib/mock-data";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Users,
  Fence,
  CalendarDays,
  Clock,
  Leaf,
  AlertTriangle,
  MoveRight,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import type { RotationRecommendation, StockGroup } from "@/types";

/* ------------------------------------------------------------------ */
/*  Helper: action badge                                               */
/* ------------------------------------------------------------------ */

const actionConfig: Record<
  RotationRecommendation["action"],
  { label: string; classes: string; pulse?: boolean }
> = {
  move_now: {
    label: "MOVE NOW",
    classes:
      "bg-red-500/30 text-red-300 border-red-400/30 animate-pulse",
    pulse: true,
  },
  move_soon: {
    label: "MOVE SOON",
    classes: "bg-amber-500/30 text-amber-300 border-amber-400/30",
  },
  hold: {
    label: "HOLD",
    classes: "bg-blue-500/20 text-blue-300 border-blue-400/20",
  },
  defer: {
    label: "DEFER",
    classes: "bg-white/10 text-white/50 border-white/10",
  },
};

const urgencyOrder: Record<RotationRecommendation["urgency"], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function grazingDaysColor(days: number) {
  if (days < 14) return "text-red-400";
  if (days <= 30) return "text-amber-400";
  return "text-emerald-400";
}

function grazingDaysBg(days: number) {
  if (days < 14) return "bg-red-500";
  if (days <= 30) return "bg-amber-500";
  return "bg-emerald-500";
}

function biomassColor(kg: number) {
  if (kg < 600) return "text-red-400";
  if (kg < 1200) return "text-amber-400";
  if (kg < 2200) return "text-yellow-300";
  return "text-emerald-400";
}

function biomassBarColor(kg: number) {
  if (kg < 600) return "bg-red-500";
  if (kg < 1200) return "bg-amber-500";
  if (kg < 2200) return "bg-yellow-400";
  return "bg-emerald-500";
}

const stockTypeLabel: Record<StockGroup["stockType"], string> = {
  cowcalf: "Cow/Calf",
  adult: "Adult",
  yearling: "Yearling",
  weaner: "Weaner",
  bull: "Bull",
};

const stockTypeBadge: Record<StockGroup["stockType"], "default" | "success" | "warning" | "danger" | "info"> = {
  cowcalf: "info",
  adult: "default",
  yearling: "success",
  weaner: "warning",
  bull: "danger",
};

/* ------------------------------------------------------------------ */
/*  Simulated paddock biomass / grazing / rest data                    */
/* ------------------------------------------------------------------ */

interface PaddockRotationData {
  name: string;
  status: "active" | "resting" | "maintenance";
  areaHa: number;
  currentHead: number;
  biomassKgHa: number;
  grazingDays: number;
  restDays: number;
}

const paddockRotationData: PaddockRotationData[] = [
  { name: "North Ridge", status: "active", areaHa: 45, currentHead: 28, biomassKgHa: 850, grazingDays: 8, restDays: 0 },
  { name: "South Valley", status: "active", areaHa: 60, currentHead: 22, biomassKgHa: 2400, grazingDays: 47, restDays: 0 },
  { name: "Western Hill", status: "active", areaHa: 32, currentHead: 12, biomassKgHa: 1650, grazingDays: 28, restDays: 0 },
  { name: "Creek Flats", status: "active", areaHa: 25, currentHead: 15, biomassKgHa: 1200, grazingDays: 18, restDays: 0 },
  { name: "Eastern Block", status: "active", areaHa: 38, currentHead: 4, biomassKgHa: 2800, grazingDays: 60, restDays: 0 },
  { name: "Dam Paddock", status: "resting", areaHa: 22, currentHead: 0, biomassKgHa: 1800, grazingDays: 0, restDays: 25 },
  { name: "Eastern Flats", status: "resting", areaHa: 55, currentHead: 0, biomassKgHa: 2100, grazingDays: 0, restDays: 32 },
  { name: "Holding Yards", status: "maintenance", areaHa: 2, currentHead: 0, biomassKgHa: 0, grazingDays: 0, restDays: 0 },
];

/* ------------------------------------------------------------------ */
/*  Score Bar                                                          */
/* ------------------------------------------------------------------ */

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-red-500"
      : score >= 60
      ? "bg-amber-500"
      : score >= 40
      ? "bg-blue-500"
      : "bg-white/20";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-white/50 w-8 text-right">{score}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function StockRotationPage() {
  const paddocks = usePaddockStore((s) => s.paddocks);
  const [executedMoves, setExecutedMoves] = useState<Set<number>>(new Set());

  const sortedRecs = [...mockRotationRecommendations].sort(
    (a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
  );

  const handleExecuteMove = (id: number) => {
    setExecutedMoves((prev) => new Set(prev).add(id));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/paddocks"
              className="text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              Paddocks
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            <span className="text-sm text-white/70">Stock Rotation</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Stock Rotation</h1>
          <p className="text-white/50 mt-1">
            AI-powered grazing management and rotation planning
          </p>
        </div>
        <Link href="/paddocks">
          <GlassButton
            variant="default"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Paddocks
          </GlassButton>
        </Link>
      </div>

      {/* ---------------------------------------------------------- */}
      {/*  A. AI Rotation Recommendations                            */}
      {/* ---------------------------------------------------------- */}
      <section>
        <div
          className="flex items-center gap-2 mb-4 animate-fade-in-up"
          style={{ animationDelay: "50ms" } as React.CSSProperties}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-300" />
          </div>
          <h2 className="text-lg font-semibold text-white">
            AI Rotation Recommendations
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {sortedRecs.map((rec, i) => {
            const cfg = actionConfig[rec.action];
            const executed = executedMoves.has(rec.id);

            return (
              <div
                key={rec.id}
                className="animate-fade-in-up"
                style={
                  { animationDelay: `${100 + i * 60}ms` } as React.CSSProperties
                }
              >
                <GlassCard>
                  {/* Top row: badge + score */}
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border ${cfg.classes}`}
                    >
                      {cfg.label}
                    </span>
                    <span
                      className={`text-xs font-medium ${grazingDaysColor(
                        rec.grazingDaysLeft
                      )}`}
                    >
                      <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
                      {rec.grazingDaysLeft}d left
                    </span>
                  </div>

                  {/* Stock group + movement */}
                  <h3 className="text-white font-semibold text-base mb-1">
                    {rec.stockGroupName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                    <span>{rec.fromPaddock}</span>
                    {rec.toPaddock !== "-" && (
                      <>
                        <ArrowRight className="w-3.5 h-3.5 text-white/40" />
                        <span className="text-white/80">{rec.toPaddock}</span>
                      </>
                    )}
                  </div>

                  {/* Reason */}
                  <p className="text-sm text-white/50 mb-4 leading-relaxed">
                    {rec.reason}
                  </p>

                  {/* Score bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/40">
                        Priority Score
                      </span>
                    </div>
                    <ScoreBar score={rec.score} />
                  </div>

                  {/* Execute button for actionable items */}
                  {(rec.action === "move_now" || rec.action === "move_soon") && (
                    <div className="pt-3 border-t border-white/5">
                      {executed ? (
                        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">
                            &#10003;
                          </span>
                          Move Executed
                        </div>
                      ) : (
                        <GlassButton
                          variant="primary"
                          size="sm"
                          icon={<MoveRight className="w-4 h-4" />}
                          onClick={() => handleExecuteMove(rec.id)}
                        >
                          Execute Move
                        </GlassButton>
                      )}
                    </div>
                  )}
                </GlassCard>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  B. Stock Groups Panel                                     */}
      {/* ---------------------------------------------------------- */}
      <section>
        <div
          className="flex items-center gap-2 mb-4 animate-fade-in-up"
          style={{ animationDelay: "300ms" } as React.CSSProperties}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-300" />
          </div>
          <h2 className="text-lg font-semibold text-white">Stock Groups</h2>
        </div>

        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "350ms" } as React.CSSProperties}
        >
          <GlassCard padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/50 font-medium px-5 py-3">
                      Name
                    </th>
                    <th className="text-left text-white/50 font-medium px-5 py-3">
                      Type
                    </th>
                    <th className="text-right text-white/50 font-medium px-5 py-3">
                      Head
                    </th>
                    <th className="text-right text-white/50 font-medium px-5 py-3">
                      DSE
                    </th>
                    <th className="text-left text-white/50 font-medium px-5 py-3">
                      Current Paddock
                    </th>
                    <th className="text-right text-white/50 font-medium px-5 py-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockStockGroups.map((group) => {
                    const paddock = paddockRotationData.find(
                      (_, idx) =>
                        idx + 1 === group.currentPaddockId
                    );
                    return (
                      <tr
                        key={group.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-5 py-3 text-white font-medium">
                          {group.name}
                        </td>
                        <td className="px-5 py-3">
                          <GlassBadge variant={stockTypeBadge[group.stockType]}>
                            {stockTypeLabel[group.stockType]}
                          </GlassBadge>
                        </td>
                        <td className="px-5 py-3 text-right text-white/80">
                          {group.headCount}
                        </td>
                        <td className="px-5 py-3 text-right text-white/80">
                          {group.totalDSE}
                        </td>
                        <td className="px-5 py-3 text-white/70">
                          {paddock?.name ?? "Unassigned"}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <GlassButton
                            size="sm"
                            variant="ghost"
                            icon={<MoveRight className="w-4 h-4" />}
                          >
                            Move
                          </GlassButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  C. Paddock Status Table                                   */}
      {/* ---------------------------------------------------------- */}
      <section>
        <div
          className="flex items-center gap-2 mb-4 animate-fade-in-up"
          style={{ animationDelay: "400ms" } as React.CSSProperties}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Fence className="w-4 h-4 text-emerald-300" />
          </div>
          <h2 className="text-lg font-semibold text-white">Paddock Status</h2>
        </div>

        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "450ms" } as React.CSSProperties}
        >
          <GlassCard padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/50 font-medium px-5 py-3">
                      Paddock
                    </th>
                    <th className="text-left text-white/50 font-medium px-5 py-3">
                      Status
                    </th>
                    <th className="text-right text-white/50 font-medium px-5 py-3">
                      Area (ha)
                    </th>
                    <th className="text-right text-white/50 font-medium px-5 py-3">
                      Head
                    </th>
                    <th className="text-right text-white/50 font-medium px-5 py-3">
                      Biomass (kg/ha)
                    </th>
                    <th className="text-right text-white/50 font-medium px-5 py-3">
                      Grazing Days
                    </th>
                    <th className="text-right text-white/50 font-medium px-5 py-3">
                      Rest Days
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paddockRotationData.map((p, i) => {
                    const statusVariant: Record<
                      string,
                      "success" | "warning" | "danger"
                    > = {
                      active: "success",
                      resting: "warning",
                      maintenance: "danger",
                    };
                    return (
                      <tr
                        key={i}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-5 py-3 text-white font-medium">
                          {p.name}
                        </td>
                        <td className="px-5 py-3">
                          <GlassBadge
                            variant={statusVariant[p.status] ?? "default"}
                          >
                            {p.status.charAt(0).toUpperCase() +
                              p.status.slice(1)}
                          </GlassBadge>
                        </td>
                        <td className="px-5 py-3 text-right text-white/80">
                          {p.areaHa}
                        </td>
                        <td className="px-5 py-3 text-right text-white/80">
                          {p.currentHead || "-"}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {p.biomassKgHa > 0 ? (
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${biomassBarColor(
                                    p.biomassKgHa
                                  )}`}
                                  style={{
                                    width: `${Math.min(
                                      (p.biomassKgHa / 3000) * 100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                              <span
                                className={`font-medium ${biomassColor(
                                  p.biomassKgHa
                                )}`}
                              >
                                {p.biomassKgHa.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-white/30">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {p.grazingDays > 0 ? (
                            <span
                              className={`font-medium ${grazingDaysColor(
                                p.grazingDays
                              )}`}
                            >
                              {p.grazingDays}
                            </span>
                          ) : (
                            <span className="text-white/30">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {p.restDays > 0 ? (
                            <span className="text-blue-300 font-medium">
                              {p.restDays}
                            </span>
                          ) : (
                            <span className="text-white/30">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  D. Rotation History                                       */}
      {/* ---------------------------------------------------------- */}
      <section>
        <div
          className="flex items-center gap-2 mb-4 animate-fade-in-up"
          style={{ animationDelay: "500ms" } as React.CSSProperties}
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-purple-300" />
          </div>
          <h2 className="text-lg font-semibold text-white">
            Rotation History
          </h2>
        </div>

        <div className="space-y-3">
          {mockRotationHistory
            .sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((record, i) => (
              <div
                key={record.id}
                className="animate-fade-in-up"
                style={
                  {
                    animationDelay: `${550 + i * 50}ms`,
                  } as React.CSSProperties
                }
              >
                <GlassCard>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Timeline dot + date */}
                    <div className="flex items-center gap-3 sm:w-36 flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 flex-shrink-0" />
                      <span className="text-sm text-white/50 font-medium">
                        {new Date(record.date).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Stock group + movement */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium">
                          {record.stockGroupName}
                        </span>
                        <span className="text-white/40 text-sm">
                          {record.fromPaddockName}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                        <span className="text-white/70 text-sm font-medium">
                          {record.toPaddockName}
                        </span>
                      </div>
                      <p className="text-sm text-white/40 mt-1 truncate">
                        {record.reason}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
