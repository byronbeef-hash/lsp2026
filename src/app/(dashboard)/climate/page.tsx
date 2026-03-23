"use client";

import { useState } from "react";
import { GlassCard, GlassBadge } from "@/components/glass";
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  CloudRain,
  Sun,
  Cloud,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
} from "lucide-react";

interface ForecastDay {
  day: string;
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: React.ElementType;
  rain_mm: number;
  wind_kmh: number;
}

const currentWeather = {
  temp: 24,
  feels_like: 22,
  condition: "Partly Cloudy",
  humidity: 58,
  wind_speed: 15,
  wind_dir: "NW",
  uv_index: 6,
  visibility: 12,
  pressure: 1018,
  dew_point: 14,
  sunrise: "6:12 AM",
  sunset: "6:45 PM",
};

const forecast: ForecastDay[] = [
  { day: "Tue", date: "Mar 24", high: 26, low: 16, condition: "Sunny", icon: Sun, rain_mm: 0, wind_kmh: 12 },
  { day: "Wed", date: "Mar 25", high: 28, low: 17, condition: "Sunny", icon: Sun, rain_mm: 0, wind_kmh: 10 },
  { day: "Thu", date: "Mar 26", high: 25, low: 18, condition: "Cloudy", icon: Cloud, rain_mm: 2, wind_kmh: 18 },
  { day: "Fri", date: "Mar 27", high: 22, low: 15, condition: "Rain", icon: CloudRain, rain_mm: 15, wind_kmh: 25 },
  { day: "Sat", date: "Mar 28", high: 20, low: 13, condition: "Rain", icon: CloudRain, rain_mm: 22, wind_kmh: 30 },
  { day: "Sun", date: "Mar 29", high: 23, low: 14, condition: "Partly Cloudy", icon: CloudSun, rain_mm: 3, wind_kmh: 15 },
  { day: "Mon", date: "Mar 30", high: 25, low: 15, condition: "Sunny", icon: Sun, rain_mm: 0, wind_kmh: 8 },
];

const alerts = [
  { type: "warning" as const, title: "Severe Weather Warning", message: "Heavy rainfall expected Friday-Saturday. 20-40mm forecast. Secure loose equipment and check drainage." },
  { type: "info" as const, title: "Frost Risk", message: "Minimum temperatures dropping to 13°C this weekend. Monitor young livestock in exposed paddocks." },
];

const monthlyRainfall = [
  { month: "Oct", actual: 42, average: 55 },
  { month: "Nov", actual: 68, average: 60 },
  { month: "Dec", actual: 35, average: 50 },
  { month: "Jan", actual: 85, average: 70 },
  { month: "Feb", actual: 52, average: 55 },
  { month: "Mar", actual: 28, average: 45 },
];

export default function ClimatePage() {
  const [selectedDay, setSelectedDay] = useState<ForecastDay | null>(null);

  const totalRainYTD = monthlyRainfall.reduce((sum, m) => sum + m.actual, 0);
  const avgRainYTD = monthlyRainfall.reduce((sum, m) => sum + m.average, 0);
  const rainVariance = ((totalRainYTD - avgRainYTD) / avgRainYTD * 100).toFixed(1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">Climate</h1>
        <p className="text-white/50 mt-1">Weather conditions and forecasts — Sydney, NSW</p>
      </div>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "30ms" }}>
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
                alert.type === "warning"
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-blue-500/10 border-blue-500/30"
              }`}
            >
              <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${
                alert.type === "warning" ? "text-amber-400" : "text-blue-400"
              }`} />
              <div>
                <p className="text-sm font-semibold text-white">{alert.title}</p>
                <p className="text-xs text-white/60 mt-0.5">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Conditions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <GlassCard className="col-span-2 flex items-center gap-5 py-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 flex items-center justify-center">
            <CloudSun className="w-9 h-9 text-amber-300" />
          </div>
          <div>
            <p className="text-4xl font-bold text-white">{currentWeather.temp}°C</p>
            <p className="text-sm text-white/50">
              Feels like {currentWeather.feels_like}°C &middot; {currentWeather.condition}
            </p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-white/50">Humidity</span>
          </div>
          <p className="text-2xl font-bold text-white">{currentWeather.humidity}%</p>
          <p className="text-xs text-white/40 mt-1">Dew point {currentWeather.dew_point}°C</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-white/50">Wind</span>
          </div>
          <p className="text-2xl font-bold text-white">{currentWeather.wind_speed} km/h</p>
          <p className="text-xs text-white/40 mt-1">Direction: {currentWeather.wind_dir}</p>
        </GlassCard>
      </div>

      {/* Extra conditions row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        {[
          { label: "UV Index", value: currentWeather.uv_index, sub: currentWeather.uv_index >= 6 ? "High" : "Moderate", icon: Sun, color: "text-yellow-400" },
          { label: "Visibility", value: `${currentWeather.visibility} km`, sub: "Good", icon: Eye, color: "text-emerald-400" },
          { label: "Pressure", value: `${currentWeather.pressure} hPa`, sub: "Stable", icon: Thermometer, color: "text-purple-400" },
          { label: "Sunrise/Sunset", value: currentWeather.sunrise, sub: currentWeather.sunset, icon: Sun, color: "text-orange-400" },
        ].map((item) => (
          <GlassCard key={item.label} className="py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
              <span className="text-[11px] text-white/40 uppercase tracking-wider">{item.label}</span>
            </div>
            <p className="text-lg font-bold text-white">{item.value}</p>
            <p className="text-xs text-white/40">{item.sub}</p>
          </GlassCard>
        ))}
      </div>

      {/* 7-Day Forecast */}
      <GlassCard className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
          7-Day Forecast
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {forecast.map((day) => {
            const Icon = day.icon;
            const isSelected = selectedDay?.day === day.day;
            return (
              <button
                key={day.day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`text-center py-3 px-1 rounded-xl transition-all ${
                  isSelected ? "bg-white/15 ring-1 ring-white/20" : "hover:bg-white/5"
                }`}
              >
                <p className="text-xs font-semibold text-white/70">{day.day}</p>
                <p className="text-[10px] text-white/30">{day.date}</p>
                <Icon className={`w-6 h-6 mx-auto my-2 ${
                  day.condition === "Sunny" ? "text-amber-400" :
                  day.condition === "Rain" ? "text-blue-400" : "text-white/50"
                }`} />
                <p className="text-sm font-bold text-white flex items-center justify-center gap-0.5">
                  <ArrowUp className="w-3 h-3 text-red-400" />
                  {day.high}°
                </p>
                <p className="text-xs text-white/40 flex items-center justify-center gap-0.5">
                  <ArrowDown className="w-3 h-3 text-blue-400" />
                  {day.low}°
                </p>
                {day.rain_mm > 0 && (
                  <p className="text-[10px] text-blue-300 mt-1">
                    {day.rain_mm}mm
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day detail */}
        {selectedDay && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-[10px] text-white/40 uppercase">Condition</p>
              <p className="text-sm font-semibold text-white mt-1">{selectedDay.condition}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-[10px] text-white/40 uppercase">Temperature</p>
              <p className="text-sm font-semibold text-white mt-1">{selectedDay.low}° — {selectedDay.high}°</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-[10px] text-white/40 uppercase">Rainfall</p>
              <p className="text-sm font-semibold text-white mt-1">{selectedDay.rain_mm} mm</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-[10px] text-white/40 uppercase">Wind</p>
              <p className="text-sm font-semibold text-white mt-1">{selectedDay.wind_kmh} km/h</p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Rainfall Comparison */}
      <GlassCard className="animate-fade-in-up" style={{ animationDelay: "130ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            Rainfall vs Average
          </h2>
          <GlassBadge variant={Number(rainVariance) < 0 ? "warning" : "success"}>
            {Number(rainVariance) > 0 ? "+" : ""}{rainVariance}% YTD
          </GlassBadge>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {monthlyRainfall.map((m) => {
            const maxVal = Math.max(...monthlyRainfall.map((r) => Math.max(r.actual, r.average)));
            const actualPct = (m.actual / maxVal) * 100;
            const avgPct = (m.average / maxVal) * 100;
            return (
              <div key={m.month} className="text-center">
                <div className="h-28 flex items-end justify-center gap-1">
                  <div className="w-3 rounded-t-sm bg-blue-500/60" style={{ height: `${actualPct}%` }} />
                  <div className="w-3 rounded-t-sm bg-white/15" style={{ height: `${avgPct}%` }} />
                </div>
                <p className="text-xs text-white/70 mt-2 font-medium">{m.actual}mm</p>
                <p className="text-[10px] text-white/30">{m.month}</p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="w-3 h-3 rounded-sm bg-blue-500/60" /> Actual
          </div>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="w-3 h-3 rounded-sm bg-white/15" /> Average
          </div>
          <div className="ml-auto text-xs text-white/40">
            YTD: {totalRainYTD}mm (avg: {avgRainYTD}mm)
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
