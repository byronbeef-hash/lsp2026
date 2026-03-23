"use client";

import { useState } from "react";
import {
  GlassCard,
  GlassInput,
  GlassButton,
  GlassBadge,
} from "@/components/glass";
import {
  CloudRain,
  Plus,
  TrendingUp,
  Droplets,
  Calendar,
  X,
  Save,
  Trash2,
} from "lucide-react";
import { useRainGaugeStore } from "@/stores/modules";

export default function RainGaugePage() {
  const { readings, addReading, deleteReading, getMonthlyTotals } = useRainGaugeStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReading, setNewReading] = useState({
    date: new Date().toISOString().split("T")[0],
    amount_mm: "",
    notes: "",
  });

  const monthlyTotals = getMonthlyTotals();
  // Show last 6 months for chart
  const last6Months = monthlyTotals.slice(-6);
  const maxRainfall = last6Months.length > 0 ? Math.max(...last6Months.map((m) => m.total_mm)) : 1;

  const currentYear = new Date().getFullYear();
  const ytdTotal = monthlyTotals
    .filter((m) => m.year === currentYear)
    .reduce((sum, m) => sum + m.total_mm, 0);
  const monthlyAvg = monthlyTotals.length > 0
    ? Math.round(monthlyTotals.reduce((sum, m) => sum + m.total_mm, 0) / monthlyTotals.length)
    : 0;
  const highestMonth = monthlyTotals.length > 0
    ? monthlyTotals.reduce((max, m) => (m.total_mm > max.total_mm ? m : max))
    : null;

  // Current month readings
  const now = new Date();
  const currentMonthReadings = readings.filter((r) => {
    const d = new Date(r.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const currentMonthLabel = now.toLocaleDateString("en-AU", { month: "long", year: "numeric" });

  const handleAddReading = async () => {
    if (!newReading.amount_mm) return;
    await addReading({
      date: newReading.date,
      amount_mm: parseFloat(newReading.amount_mm),
      notes: newReading.notes || null,
    });
    setNewReading({
      date: new Date().toISOString().split("T")[0],
      amount_mm: "",
      notes: "",
    });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Rain Gauge</h1>
          <p className="text-white/50 mt-1">Rainfall tracking and averages</p>
        </div>
        <GlassButton
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          Add Reading
        </GlassButton>
      </div>

      {/* Inline Add Form */}
      {showAddForm && (
        <GlassCard className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              New Reading
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassInput
              label="Date"
              name="reading_date"
              type="date"
              value={newReading.date}
              onChange={(e) =>
                setNewReading((prev) => ({ ...prev, date: e.target.value }))
              }
            />
            <GlassInput
              label="Amount (mm) *"
              name="amount_mm"
              type="number"
              placeholder="e.g. 12"
              value={newReading.amount_mm}
              onChange={(e) =>
                setNewReading((prev) => ({
                  ...prev,
                  amount_mm: e.target.value,
                }))
              }
              min="0"
              step="0.1"
            />
            <GlassInput
              label="Notes"
              name="reading_notes"
              placeholder="Optional notes"
              value={newReading.notes}
              onChange={(e) =>
                setNewReading((prev) => ({ ...prev, notes: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end">
            <GlassButton
              variant="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={handleAddReading}
            >
              Save Reading
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* Stats Row */}
      <div
        className="grid grid-cols-3 gap-3 animate-fade-in-up"
        style={{ animationDelay: "50ms" } as React.CSSProperties}
      >
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">YTD Total</p>
              <p className="text-lg font-bold text-white">{ytdTotal}mm</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Monthly Avg</p>
              <p className="text-lg font-bold text-white">{monthlyAvg}mm</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <CloudRain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Highest Month</p>
              <p className="text-lg font-bold text-white">
                {highestMonth ? `${highestMonth.total_mm}mm` : "—"}
              </p>
              {highestMonth && (
                <p className="text-xs text-white/40">{highestMonth.month}</p>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Monthly Rainfall Chart */}
      <GlassCard
        className="animate-fade-in-up"
        style={{ animationDelay: "100ms" } as React.CSSProperties}
      >
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
          Monthly Rainfall (Last 6 Months)
        </h2>
        {last6Months.length > 0 ? (
          <div className="flex items-end gap-3 h-48">
            {last6Months.map((month, index) => {
              const heightPercent = maxRainfall > 0 ? (month.total_mm / maxRainfall) * 100 : 0;
              return (
                <div
                  key={`${month.month}-${month.year}`}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span className="text-xs text-white/70 font-medium">
                    {month.total_mm}mm
                  </span>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-blue-500/60 to-blue-400/30 transition-all duration-500"
                      style={{
                        height: `${heightPercent}%`,
                        animationDelay: `${200 + index * 100}ms`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-white/50">{month.month}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-white/30 text-sm">
            No rainfall data yet
          </div>
        )}
      </GlassCard>

      {/* Current Month Readings */}
      <GlassCard
        className="animate-fade-in-up"
        style={{ animationDelay: "150ms" } as React.CSSProperties}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            {currentMonthLabel} Readings
          </h2>
          <GlassBadge variant="info">
            {currentMonthReadings.reduce((sum, r) => sum + r.amount_mm, 0)}mm total
          </GlassBadge>
        </div>

        <div className="space-y-2">
          {currentMonthReadings.map((reading, index) => (
            <div
              key={reading.id}
              className="flex items-center gap-4 py-3 px-3 rounded-lg bg-white/5 border border-white/5 animate-fade-in-up"
              style={
                {
                  animationDelay: `${200 + index * 50}ms`,
                } as React.CSSProperties
              }
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Droplets className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-white/40" />
                  <span className="text-sm text-white/80">{reading.date}</span>
                </div>
                {reading.notes && (
                  <p className="text-xs text-white/40 mt-0.5 truncate">
                    {reading.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-lg font-bold text-blue-400">
                  {reading.amount_mm}mm
                </span>
                <button
                  onClick={() => deleteReading(reading.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {currentMonthReadings.length === 0 && (
          <div className="text-center py-8 text-white/40">
            <CloudRain className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No readings recorded this month</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
