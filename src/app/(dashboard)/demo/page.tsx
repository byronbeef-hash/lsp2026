"use client";

import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  BarChart3,
  Bluetooth,
  Lock,
  ScanLine,
  MapPin,
  Leaf,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  FileText,
  RotateCcw,
  Calendar,
  Package,
  DollarSign,
  CloudRain,
  CheckSquare,
  FlaskConical,
  Wheat,
  Wrench,
  Building2,
  Bell,
  Settings,
  Sparkles,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Camera,
  Video,
  Activity,
  Heart,
  Zap,
  Shield,
  Star,
  Users,
  Globe,
  Check,
  ArrowRight,
  Gauge,
  Layers,
  Sun,
  Droplets,
  Beef,
  Scale,
} from "lucide-react";

const TOTAL_STEPS = 13;

// ─── Mock Data ───────────────────────────────────────────────────────
const mockAnimals = [
  { tag: "AU-0142", breed: "Angus", sex: "Female", weight: 485, condition: "Good", eid: "982 000456781234" },
  { tag: "AU-0143", breed: "Hereford", sex: "Male", weight: 620, condition: "Excellent", eid: "982 000456781235" },
  { tag: "AU-0144", breed: "Brahman", sex: "Female", weight: 410, condition: "Fair", eid: "982 000456781236" },
  { tag: "AU-0145", breed: "Charolais", sex: "Male", weight: 540, condition: "Good", eid: "982 000456781237" },
  { tag: "AU-0146", breed: "Angus x", sex: "Female", weight: 465, condition: "Good", eid: "982 000456781238" },
];

const moreModules = [
  { title: "Medical Batches", description: "Batch treatments & vet records", icon: Heart, color: "bg-rose-500/20 text-rose-300" },
  { title: "Calendar", description: "Events & schedule management", icon: Calendar, color: "bg-blue-500/20 text-blue-300" },
  { title: "Supplies", description: "Feed, fencing & inventory", icon: Package, color: "bg-amber-500/20 text-amber-300" },
  { title: "Sales", description: "Livestock sales & buyers", icon: DollarSign, color: "bg-green-500/20 text-green-300" },
  { title: "Rain Gauge", description: "Rainfall tracking & history", icon: CloudRain, color: "bg-cyan-500/20 text-cyan-300" },
  { title: "Todo List", description: "Tasks & reminders", icon: CheckSquare, color: "bg-purple-500/20 text-purple-300" },
  { title: "Chemicals", description: "Chemical batches & applications", icon: FlaskConical, color: "bg-violet-500/20 text-violet-300" },
  { title: "Feed", description: "Feed management & inventory", icon: Wheat, color: "bg-yellow-500/20 text-yellow-300" },
  { title: "Machinery", description: "Equipment & maintenance logs", icon: Wrench, color: "bg-teal-500/20 text-teal-300" },
  { title: "Farms", description: "Multi-farm management", icon: Building2, color: "bg-rose-500/20 text-rose-300" },
  { title: "Finance", description: "Income, expenses & budgets", icon: DollarSign, color: "bg-emerald-500/20 text-emerald-300" },
  { title: "Notifications", description: "Alerts & updates", icon: Bell, color: "bg-red-500/20 text-red-300" },
  { title: "Settings", description: "Account & preferences", icon: Settings, color: "bg-slate-500/20 text-slate-300" },
];

// ─── Step Components ─────────────────────────────────────────────────

function StepWelcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="animate-fade-in-up">
        <div className="relative w-28 h-28 mx-auto mb-8">
          <Image
            src="/Logo Silver on Blue.png"
            alt="LiveStock Manager"
            fill
            className="object-contain drop-shadow-2xl animate-pulse"
          />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
          Welcome to LiveStock Manager
        </h1>
        <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
          The complete digital farm management platform
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl mb-12 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        {[
          { label: "20+ Modules", icon: Layers },
          { label: "Real-time MLA Prices", icon: TrendingUp },
          { label: "AI-Powered Insights", icon: Sparkles },
          { label: "Bluetooth Scale Integration", icon: Bluetooth },
        ].map((stat, i) => (
          <GlassCard key={stat.label} className="text-center py-4 animate-fade-in-up" style={{ animationDelay: `${300 + i * 100}ms` }}>
            <stat.icon className="w-6 h-6 text-blue-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white/90">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "700ms" }}>
        <p className="text-white/40 text-sm flex items-center gap-2 justify-center">
          Press <kbd className="px-2 py-0.5 rounded bg-white/10 text-white/60 text-xs font-mono">Enter</kbd> or click below to begin
        </p>
      </div>
    </div>
  );
}

function StepDashboard() {
  const herdStats = [
    { label: "Total Livestock", value: "325", icon: Beef, color: "text-blue-300" },
    { label: "Avg Weight", value: "480kg", icon: Scale, color: "text-emerald-300" },
    { label: "Herd Value", value: "$738k", icon: DollarSign, color: "text-amber-300" },
    { label: "Weight Gain", value: "+2kg/mo", icon: TrendingUp, color: "text-green-300" },
  ];

  const breakdown = [
    { label: "Cows", count: 120, pct: 37 },
    { label: "Bulls", count: 5, pct: 2 },
    { label: "Weaners", count: 100, pct: 31 },
    { label: "Steers", count: 48, pct: 15 },
    { label: "Heifers", count: 52, pct: 16 },
  ];

  return (
    <div className="space-y-6 px-2">
      <div className="animate-fade-in-up text-center mb-8">
        <GlassBadge variant="info" className="mb-3">Dashboard</GlassBadge>
        <h2 className="text-3xl font-bold text-white">Your Farm at a Glance</h2>
        <p className="text-white/50 mt-2 max-w-lg mx-auto">
          Everything you need to know about your operation, updated in real-time
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
        {herdStats.map((stat, i) => (
          <GlassCard key={stat.label} className="text-center animate-fade-in-up" style={{ animationDelay: `${200 + i * 80}ms` }}>
            <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/50 mt-1">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Herd Breakdown</h3>
        <div className="space-y-3">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-sm text-white/70 w-20">{item.label}</span>
              <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500/60 to-blue-400/40 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                  style={{ width: `${item.pct}%` }}
                >
                  <span className="text-[10px] font-bold text-white/90">{item.count}</span>
                </div>
              </div>
              <span className="text-xs text-white/40 w-10 text-right">{item.pct}%</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-3 gap-3 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
        {[
          { label: "Paddocks", value: "12", icon: MapPin },
          { label: "Active Tasks", value: "8", icon: CheckSquare },
          { label: "Alerts", value: "3", icon: Bell },
        ].map((w) => (
          <GlassCard key={w.label} className="text-center py-3">
            <w.icon className="w-4 h-4 text-white/50 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{w.value}</p>
            <p className="text-[11px] text-white/40">{w.label}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function StepRecords() {
  return (
    <div className="space-y-6 px-2">
      <div className="animate-fade-in-up text-center mb-8">
        <GlassBadge variant="success" className="mb-3">Records</GlassBadge>
        <h2 className="text-3xl font-bold text-white">Complete Animal Management</h2>
        <p className="text-white/50 mt-2 max-w-lg mx-auto">
          20 animals with full profiles, weight history, medical records, and photos
        </p>
      </div>

      {/* Search bar mock */}
      <GlassCard padding="sm" className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <Search className="w-4 h-4 text-white/40" />
        <span className="text-sm text-white/30 flex-1">Search by tag, breed, or EID...</span>
        <Filter className="w-4 h-4 text-white/40" />
      </GlassCard>

      {/* Table */}
      <GlassCard padding="none" className="overflow-hidden animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-white/50 font-medium">Tag</th>
                <th className="text-left p-3 text-white/50 font-medium">Breed</th>
                <th className="text-left p-3 text-white/50 font-medium">Sex</th>
                <th className="text-right p-3 text-white/50 font-medium">Weight</th>
                <th className="text-left p-3 text-white/50 font-medium">Condition</th>
                <th className="text-left p-3 text-white/50 font-medium hidden sm:table-cell">EID</th>
              </tr>
            </thead>
            <tbody>
              {mockAnimals.map((animal, i) => (
                <tr
                  key={animal.tag}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${300 + i * 80}ms` }}
                >
                  <td className="p-3 font-mono text-blue-300 font-semibold">{animal.tag}</td>
                  <td className="p-3 text-white/80">{animal.breed}</td>
                  <td className="p-3 text-white/80">{animal.sex}</td>
                  <td className="p-3 text-right text-white font-semibold">{animal.weight}kg</td>
                  <td className="p-3">
                    <GlassBadge variant={animal.condition === "Excellent" ? "success" : animal.condition === "Fair" ? "warning" : "info"}>
                      {animal.condition}
                    </GlassBadge>
                  </td>
                  <td className="p-3 text-white/40 font-mono text-xs hidden sm:table-cell">{animal.eid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Features */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
        {[
          { icon: Search, label: "Search by tag/breed/EID" },
          { icon: Filter, label: "Sort by any column" },
          { icon: CheckSquare, label: "Multi-select & bulk actions" },
          { icon: Download, label: "CSV export" },
          { icon: Upload, label: "CSV import" },
          { icon: Edit, label: "Edit/delete per record" },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-2 text-white/60 text-xs">
            <f.icon className="w-3.5 h-3.5 text-blue-300 shrink-0" />
            <span>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepAnimalProfile() {
  const tabs = ["Record Details", "Weight History", "Medical", "Activity", "Progeny", "Photo", "Video", "Papers"];

  return (
    <div className="space-y-6 px-2">
      <div className="animate-fade-in-up text-center mb-8">
        <GlassBadge variant="info" className="mb-3">Profile</GlassBadge>
        <h2 className="text-3xl font-bold text-white">Detailed Animal Profiles</h2>
        <p className="text-white/50 mt-2">Everything you need to know about each animal</p>
      </div>

      {/* Animal Card */}
      <GlassCard className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
        <div className="flex gap-4 items-start">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-600/30 border border-white/10 flex items-center justify-center shrink-0">
            <Camera className="w-8 h-8 text-white/30" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white">AU-0142</h3>
              <GlassBadge variant="success">Active</GlassBadge>
            </div>
            <p className="text-white/60 text-sm">Angus Female</p>
            <div className="flex gap-4 mt-2">
              <span className="text-white font-bold text-lg">485<span className="text-sm text-white/50 font-normal">kg</span></span>
              <span className="text-emerald-300 text-sm flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +2.1 kg/mo
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tab Preview */}
      <div className="flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        {tabs.map((tab, i) => (
          <span
            key={tab}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              i === 0
                ? "bg-blue-500/30 text-blue-200 border border-blue-400/30"
                : "bg-white/5 text-white/50 border border-white/5"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Weight Chart Mock */}
      <GlassCard className="animate-fade-in-up" style={{ animationDelay: "450ms" }}>
        <h4 className="text-sm font-semibold text-white/70 mb-4">Weight History</h4>
        <div className="h-40 relative">
          <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(59,130,246,0.4)" />
                <stop offset="100%" stopColor="rgba(59,130,246,0.02)" />
              </linearGradient>
            </defs>
            <path
              d="M0,100 L50,90 L100,85 L150,70 L200,60 L250,45 L300,35 L350,25 L400,20 L400,120 L0,120 Z"
              fill="url(#chartGrad)"
            />
            <path
              d="M0,100 L50,90 L100,85 L150,70 L200,60 L250,45 L300,35 L350,25 L400,20"
              fill="none"
              stroke="rgba(59,130,246,0.8)"
              strokeWidth="2"
            />
            {[
              [0, 100], [50, 90], [100, 85], [150, 70], [200, 60], [250, 45], [300, 35], [350, 25], [400, 20],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3" fill="rgba(59,130,246,1)" />
            ))}
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-white/30 px-1">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* ADG Stats */}
      <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
        <GlassCard className="text-center">
          <p className="text-xs text-white/50 mb-1">Current ADG</p>
          <p className="text-2xl font-bold text-emerald-300">0.24</p>
          <p className="text-xs text-white/40">kg/day</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-xs text-white/50 mb-1">Lifetime Gain</p>
          <p className="text-2xl font-bold text-blue-300">+305</p>
          <p className="text-xs text-white/40">kg total</p>
        </GlassCard>
      </div>
    </div>
  );
}

function StepScanner() {
  return (
    <div className="space-y-6 px-2">
      <div className="animate-fade-in-up text-center mb-8">
        <GlassBadge variant="warning" className="mb-3">WeighApp</GlassBadge>
        <h2 className="text-3xl font-bold text-white">Bluetooth EID Scanner & Scales</h2>
        <p className="text-white/50 mt-2 max-w-lg mx-auto">
          Connect your AgriEID Bluetooth scales and NLIS reader for seamless weighing sessions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Scales Panel */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-semibold text-white/70">Bluetooth Scales</span>
            <GlassBadge variant="success" className="ml-auto">Connected</GlassBadge>
          </div>
          <div className="text-center py-6">
            <p className="text-5xl font-mono font-bold text-white tracking-wider">485.2</p>
            <p className="text-lg text-white/50 mt-1">kg</p>
          </div>
          <div className="flex gap-2 mt-2">
            <GlassButton variant="primary" size="sm" className="flex-1" icon={<Lock className="w-4 h-4" />}>
              LOCK
            </GlassButton>
            <GlassButton size="sm" className="flex-1">
              TARE
            </GlassButton>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-white/40">
            <Bluetooth className="w-3 h-3" />
            <span>AGU9i Scale - Signal Strong</span>
          </div>
        </GlassCard>

        {/* EID Panel */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <ScanLine className="w-4 h-4 text-amber-300" />
            <span className="text-sm font-semibold text-white/70">EID Reader</span>
            <GlassBadge variant="success" className="ml-auto">Ready</GlassBadge>
          </div>
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400/30 flex items-center justify-center mb-3">
              <ScanLine className="w-8 h-8 text-amber-300" />
            </div>
            <p className="text-sm text-white/60">Tap to scan EID tag</p>
          </div>
          <GlassCard padding="sm" className="bg-white/5 font-mono text-xs text-white/50">
            Last scan: 982 000456781234
          </GlassCard>
          <div className="mt-3 text-xs text-white/40">
            <p>Session: 12 animals weighed</p>
          </div>
        </GlassCard>
      </div>

      {/* Feature callouts */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
        {[
          { icon: Bluetooth, label: "AGU9i scale connection" },
          { icon: Zap, label: "Auto-weigh mode" },
          { icon: Layers, label: "Session management" },
          { icon: Download, label: "CSV export" },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-2 text-white/60 text-xs">
            <f.icon className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepMaps() {
  const paddocks = [
    { name: "River Flat", x: 10, y: 15, w: 35, h: 25, color: "rgba(34,197,94,0.35)" },
    { name: "Back Block", x: 50, y: 10, w: 40, h: 30, color: "rgba(59,130,246,0.35)" },
    { name: "House Pad", x: 10, y: 45, w: 25, h: 20, color: "rgba(234,179,8,0.35)" },
    { name: "Creek Pad", x: 40, y: 45, w: 30, h: 25, color: "rgba(168,85,247,0.35)" },
    { name: "Top Ridge", x: 75, y: 45, w: 20, h: 30, color: "rgba(239,68,68,0.35)" },
    { name: "Holding", x: 10, y: 70, w: 20, h: 15, color: "rgba(20,184,166,0.35)" },
  ];

  return (
    <div className="space-y-6 px-2">
      <div className="animate-fade-in-up text-center mb-8">
        <GlassBadge variant="success" className="mb-3">Maps</GlassBadge>
        <h2 className="text-3xl font-bold text-white">Interactive Property Mapping</h2>
        <p className="text-white/50 mt-2 max-w-lg mx-auto">
          Centered on your property at Anderson Rd, Nimbin NSW
        </p>
      </div>

      {/* Map Mock */}
      <GlassCard padding="none" className="overflow-hidden animate-fade-in-up" style={{ animationDelay: "150ms" }}>
        <div className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-green-900/40 via-green-800/30 to-emerald-900/40">
          {/* Paddock blocks */}
          <svg viewBox="0 0 100 90" className="absolute inset-0 w-full h-full">
            {paddocks.map((p) => (
              <g key={p.name}>
                <rect
                  x={p.x}
                  y={p.y}
                  width={p.w}
                  height={p.h}
                  fill={p.color}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="0.5"
                  rx="1"
                />
                <text
                  x={p.x + p.w / 2}
                  y={p.y + p.h / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(255,255,255,0.8)"
                  fontSize="3"
                  fontWeight="600"
                >
                  {p.name}
                </text>
              </g>
            ))}
            {/* Markers */}
            <circle cx="18" cy="52" r="1.5" fill="rgba(59,130,246,0.8)" />
            <text x="18" y="57" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="2">Dam</text>
            <circle cx="55" cy="38" r="1.5" fill="rgba(234,179,8,0.8)" />
            <text x="55" y="43" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="2">Gate</text>
          </svg>

          {/* Map controls mock */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            {["Satellite", "Terrain", "Street"].map((v, i) => (
              <span
                key={v}
                className={`text-[10px] px-2 py-1 rounded ${
                  i === 0 ? "bg-blue-500/40 text-white" : "bg-white/10 text-white/50"
                }`}
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Feature list */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
        {[
          { icon: Globe, label: "Satellite/terrain/street views" },
          { icon: Edit, label: "Draw paddock boundaries" },
          { icon: MapPin, label: "Add markers (dams, gates, troughs)" },
          { icon: Layers, label: "Fence line tracking" },
          { icon: Zap, label: "Fullscreen mode" },
          { icon: Search, label: "GPS location search" },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-2 text-white/60 text-xs">
            <f.icon className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepClimate() {
  return (
    <div className="space-y-6 px-2">
      <div className="animate-fade-in-up text-center mb-8">
        <GlassBadge variant="success" className="mb-3">Climate & AI</GlassBadge>
        <h2 className="text-3xl font-bold text-white">Pasture Intelligence & Carbon Tracking</h2>
        <p className="text-white/50 mt-2 max-w-lg mx-auto">
          AI-powered pasture health scoring with seasonal forecasting
        </p>
      </div>

      {/* PHI Gauge */}
      <GlassCard className="text-center animate-fade-in-up" style={{ animationDelay: "150ms" }}>
        <h4 className="text-sm font-semibold text-white/70 mb-4">Pasture Health Index (PHI)</h4>
        <div className="relative w-40 h-20 mx-auto mb-4">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <path
              d="M20,90 A80,80 0 0,1 180,90"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M20,90 A80,80 0 0,1 180,90"
              fill="none"
              stroke="url(#gaugeGrad)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray="251"
              strokeDashoffset="63"
            />
            <defs>
              <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <text x="100" y="80" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold">75</text>
            <text x="100" y="96" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12">/100</text>
          </svg>
        </div>
        <GlassBadge variant="success">Good</GlassBadge>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <GlassCard className="text-center">
          <Leaf className="w-5 h-5 text-green-300 mx-auto mb-2" />
          <p className="text-lg font-bold text-white">2,450</p>
          <p className="text-[11px] text-white/50">kg DM/ha</p>
          <p className="text-[10px] text-white/30 mt-1">Biomass</p>
        </GlassCard>
        <GlassCard className="text-center">
          <MapPin className="w-5 h-5 text-blue-300 mx-auto mb-2" />
          <p className="text-lg font-bold text-white">1,000</p>
          <p className="text-[11px] text-white/50">acres</p>
          <p className="text-[10px] text-white/30 mt-1">Property</p>
        </GlassCard>
        <GlassCard className="text-center">
          <Beef className="w-5 h-5 text-amber-300 mx-auto mb-2" />
          <p className="text-lg font-bold text-white">240</p>
          <p className="text-[11px] text-white/50">head</p>
          <p className="text-[10px] text-white/30 mt-1">Carrying Cap.</p>
        </GlassCard>
      </div>

      {/* Biomass Timeline Preview */}
      <GlassCard className="animate-fade-in-up" style={{ animationDelay: "450ms" }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white/70">Biomass Timeline</h4>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-500/30 border border-blue-400/30 flex items-center justify-center">
              <Play className="w-3 h-3 text-blue-300 ml-0.5" />
            </div>
            <span className="text-xs text-white/40">Play animation</span>
          </div>
        </div>
        <div className="h-24 bg-gradient-to-r from-red-500/20 via-yellow-500/20 via-green-500/20 to-green-600/20 rounded-lg border border-white/5 flex items-end px-2 gap-1">
          {[30, 40, 55, 70, 85, 90, 75, 60, 45, 55, 70, 80].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-green-400/30 rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-white/30 mt-1 px-1">
          <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
        </div>
      </GlassCard>
    </div>
  );
}

function StepMarkets() {
  const prices = [
    { name: "NYCI", label: "National Young Cattle Indicator", price: "472.79", unit: "c/kg", change: "+2.1%", up: true },
    { name: "OYCI", label: "Over the Hooks Young Cattle", price: "489.20", unit: "c/kg", change: "+1.7%", up: true },
    { name: "EYCI", label: "Eastern Young Cattle Indicator", price: "458.33", unit: "c/kg", change: "-0.4%", up: false },
    { name: "Feeder Steers", label: "330-400kg Feeder Steers", price: "385.50", unit: "c/kg", change: "+0.8%", up: true },
  ];

  return (
    <div className="space-y-6 px-2">
      <div className="animate-fade-in-up text-center mb-8">
        <GlassBadge variant="info" className="mb-3">Markets</GlassBadge>
        <h2 className="text-3xl font-bold text-white">Live Market Data</h2>
        <p className="text-white/50 mt-2 max-w-lg mx-auto">
          Real-time NLRS saleyard and online cattle indicators
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prices.map((p, i) => (
          <GlassCard key={p.name} className="animate-fade-in-up" style={{ animationDelay: `${150 + i * 100}ms` }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-lg font-bold text-white">{p.name}</h4>
                <p className="text-[11px] text-white/40">{p.label}</p>
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${p.up ? "text-emerald-300" : "text-red-300"}`}>
                {p.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {p.change}
              </div>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">
              {p.price} <span className="text-sm text-white/40 font-normal">{p.unit}</span>
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="text-center animate-fade-in-up" style={{ animationDelay: "600ms" }}>
        <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
          <Activity className="w-4 h-4 text-blue-300" />
          <span>Auto-refresh every 5 minutes from MLA data feeds</span>
        </div>
      </GlassCard>
    </div>
  );
}

function StepAIAdvisor() {
  return (
    <div className="space-y-6 px-2">
      <div className="animate-fade-in-up text-center mb-8">
        <GlassBadge variant="info" className="mb-3">AI Advisor</GlassBadge>
        <h2 className="text-3xl font-bold text-white">AI-Powered Farm Intelligence</h2>
        <p className="text-white/50 mt-2 max-w-lg mx-auto">
          Ask anything about your farm -- get expert AI advice tailored to your property
        </p>
      </div>

      {/* Chat Mock */}
      <GlassCard className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
        {/* User message */}
        <div className="flex justify-end mb-4">
          <div className="bg-blue-500/30 border border-blue-400/20 rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
            <p className="text-sm text-white">How can I improve my pasture quality?</p>
          </div>
        </div>
        {/* AI response */}
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/40 to-blue-500/40 border border-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-purple-300" />
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex-1">
            <p className="text-sm text-white/80 leading-relaxed">
              Based on your property data, here are my top recommendations:
            </p>
            <ol className="text-sm text-white/70 mt-2 space-y-1.5 list-decimal list-inside">
              <li>Rotate cattle from River Flat -- biomass is below optimal</li>
              <li>Apply lime to Back Block (pH is 5.2, target 6.0)</li>
              <li>Oversow with improved pasture species in May</li>
            </ol>
          </div>
        </div>
      </GlassCard>

      {/* Feature cards */}
      <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
        {[
          { icon: Star, label: "10-Point Profitability Plan", desc: "AI-generated actionable plan" },
          { icon: FileText, label: "Soil Test Analysis", desc: "Upload & get AI interpretation" },
          { icon: TrendingUp, label: "Market Timing Advisor", desc: "Optimal sell window calculation" },
          { icon: Gauge, label: "Stocking Rate Optimizer", desc: "Biomass-based recommendations" },
        ].map((f) => (
          <GlassCard key={f.label} className="text-center py-4">
            <f.icon className="w-5 h-5 text-purple-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-white/80">{f.label}</p>
            <p className="text-[10px] text-white/40 mt-1">{f.desc}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function StepReports() {
  const reports = [
    { icon: BarChart3, title: "Herd Summary", desc: "Overview of all livestock with stats", color: "text-blue-300" },
    { icon: TrendingUp, title: "Weight Gain", desc: "Weight trends & ADG analysis", color: "text-emerald-300" },
    { icon: Heart, title: "Medical", desc: "Treatment history & vaccinations", color: "text-rose-300" },
    { icon: DollarSign, title: "Financial", desc: "Income, expenses & profit/loss", color: "text-amber-300" },
    { icon: Shield, title: "Biosecurity Plan", desc: "Compliance & visitor log", color: "text-indigo-300" },
    { icon: Activity, title: "Sales History", desc: "Past sales with buyer info", color: "text-green-300" },
  ];

  return (
    <div className="space-y-6 px-2">
      <div className="animate-fade-in-up text-center mb-8">
        <GlassBadge variant="warning" className="mb-3">Reports</GlassBadge>
        <h2 className="text-3xl font-bold text-white">Professional Reports & Compliance</h2>
        <p className="text-white/50 mt-2 max-w-lg mx-auto">
          Generate PDF reports with charts, download or print
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {reports.map((r, i) => (
          <GlassCard
            key={r.title}
            hover
            className="text-center py-5 animate-fade-in-up"
            style={{ animationDelay: `${150 + i * 80}ms` }}
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
              <r.icon className={`w-6 h-6 ${r.color}`} />
            </div>
            <p className="text-sm font-semibold text-white">{r.title}</p>
            <p className="text-[11px] text-white/40 mt-1">{r.desc}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="animate-fade-in-up" style={{ animationDelay: "650ms" }}>
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Biosecurity Plan</h4>
            <p className="text-xs text-white/50 leading-relaxed">
              Complete biosecurity plan with visitor log, quarantine procedures, vaccination
              schedule, and chemical register. Compliant with state regulations.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function StepRotation() {
  return (
    <div className="space-y-6 px-2">
      <div className="animate-fade-in-up text-center mb-8">
        <GlassBadge variant="danger" className="mb-3">Rotation</GlassBadge>
        <h2 className="text-3xl font-bold text-white">Smart Grazing Management</h2>
        <p className="text-white/50 mt-2 max-w-lg mx-auto">
          AI-driven stock rotation recommendations based on real-time pasture data
        </p>
      </div>

      {/* Rotation Alert */}
      <GlassCard className="border-red-400/20 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/20 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 text-red-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-bold text-white">MOVE NOW</h4>
              <GlassBadge variant="danger">Urgent</GlassBadge>
            </div>
            <p className="text-sm text-white/70">
              River Flat <ArrowRight className="w-3 h-3 inline mx-1" /> Back Block
            </p>
            <p className="text-xs text-white/40 mt-2">
              Biomass on River Flat has dropped below 1,500 kg/ha. Back Block has recovered to 3,200 kg/ha and is ready for grazing.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Paddock Status */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        {[
          { name: "River Flat", biomass: 1200, status: "Overgrazed", days: 45, color: "danger" as const },
          { name: "Back Block", biomass: 3200, status: "Ready", days: 0, color: "success" as const },
          { name: "Creek Pad", biomass: 2100, status: "Recovering", days: 12, color: "warning" as const },
          { name: "Top Ridge", biomass: 2800, status: "Resting", days: 5, color: "info" as const },
        ].map((p) => (
          <GlassCard key={p.name} className="text-center">
            <p className="text-sm font-semibold text-white mb-1">{p.name}</p>
            <GlassBadge variant={p.color}>{p.status}</GlassBadge>
            <p className="text-lg font-bold text-white mt-2">{p.biomass.toLocaleString()}</p>
            <p className="text-[10px] text-white/40">kg DM/ha</p>
            {p.days > 0 && (
              <p className="text-[10px] text-white/30 mt-1">{p.days} days grazed</p>
            )}
          </GlassCard>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
        {[
          { icon: Sparkles, label: "AI rotation recommendations" },
          { icon: Leaf, label: "Biomass-based stocking rates" },
          { icon: Calendar, label: "Grazing days tracking" },
          { icon: Activity, label: "Rotation history" },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-2 text-white/60 text-xs">
            <f.icon className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepMoreModules() {
  return (
    <div className="space-y-6 px-2">
      <div className="animate-fade-in-up text-center mb-8">
        <GlassBadge className="mb-3">Modules</GlassBadge>
        <h2 className="text-3xl font-bold text-white">And So Much More...</h2>
        <p className="text-white/50 mt-2 max-w-lg mx-auto">
          A complete suite of tools for every aspect of farm management
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {moreModules.map((item, i) => (
          <GlassCard
            key={item.title}
            hover
            className="flex flex-col items-center text-center py-5 px-3 animate-fade-in-up"
            style={{ animationDelay: `${100 + i * 50}ms` }}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <p className="font-semibold text-white text-sm">{item.title}</p>
            <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{item.description}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function StepGetStarted() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "/forever",
      features: ["Up to 20 animals", "Basic records", "Weight tracking", "1 property"],
      cta: "Try Free Demo",
      href: "/login",
      primary: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      features: [
        "Unlimited animals",
        "All modules",
        "AI Advisor",
        "MLA live prices",
        "Bluetooth scales",
        "Pasture AI",
        "PDF reports",
        "Priority support",
      ],
      cta: "Start Pro Trial",
      href: "/login",
      primary: true,
      badge: "Most Popular",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: [
        "Everything in Pro",
        "Multi-farm",
        "API access",
        "Custom integrations",
        "Dedicated support",
        "On-site training",
      ],
      cta: "Contact Sales",
      href: "https://agrieid.com.au",
      primary: false,
    },
  ];

  return (
    <div className="space-y-8 px-2">
      <div className="animate-fade-in-up text-center mb-8">
        <GlassBadge variant="success" className="mb-3">Get Started</GlassBadge>
        <h2 className="text-3xl font-bold text-white">Ready to Transform Your Farm?</h2>
        <p className="text-white/50 mt-2">Trusted by 15,000+ Australian farmers</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiers.map((tier, i) => (
          <GlassCard
            key={tier.name}
            className={`relative text-center animate-fade-in-up ${
              tier.primary ? "border border-blue-400/30 ring-1 ring-blue-400/20" : ""
            }`}
            style={{ animationDelay: `${150 + i * 120}ms` }}
          >
            {tier.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <GlassBadge variant="info">{tier.badge}</GlassBadge>
              </div>
            )}
            <h3 className="text-lg font-bold text-white mt-2">{tier.name}</h3>
            <div className="my-4">
              <span className="text-3xl font-bold text-white">{tier.price}</span>
              <span className="text-sm text-white/40">{tier.period}</span>
            </div>
            <ul className="space-y-2 text-left mb-6">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <GlassButton
              variant={tier.primary ? "primary" : "default"}
              size="md"
              className="w-full"
            >
              {tier.cta}
            </GlassButton>
          </GlassCard>
        ))}
      </div>

      <div className="text-center animate-fade-in-up" style={{ animationDelay: "600ms" }}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative w-10 h-10">
            <Image
              src="/Logo Silver on Blue.png"
              alt="AgriEID"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-white/50 text-sm">Powered by AgriEID</span>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-white/30">
          <a href="https://agrieid.com.au" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
            agrieid.com.au
          </a>
          <span>|</span>
          <span>ABN 12 345 678 910</span>
        </div>
      </div>
    </div>
  );
}

// ─── Step Registry ───────────────────────────────────────────────────
const steps = [
  { title: "Welcome", component: StepWelcome },
  { title: "Dashboard", component: StepDashboard },
  { title: "Records", component: StepRecords },
  { title: "Profile", component: StepAnimalProfile },
  { title: "Scanner", component: StepScanner },
  { title: "Maps", component: StepMaps },
  { title: "Climate", component: StepClimate },
  { title: "Markets", component: StepMarkets },
  { title: "AI Advisor", component: StepAIAdvisor },
  { title: "Reports", component: StepReports },
  { title: "Rotation", component: StepRotation },
  { title: "Modules", component: StepMoreModules },
  { title: "Get Started", component: StepGetStarted },
];

// ─── Main Demo Page ──────────────────────────────────────────────────

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);

  const goToStep = useCallback(
    (step: number) => {
      if (step < 0 || step >= TOTAL_STEPS || step === currentStep || animating) return;
      setDirection(step > currentStep ? "next" : "prev");
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep(step);
        setAnimating(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 150);
    },
    [currentStep, animating]
  );

  const goNext = useCallback(() => goToStep(currentStep + 1), [currentStep, goToStep]);
  const goPrev = useCallback(() => goToStep(currentStep - 1), [currentStep, goToStep]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  const StepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="relative min-h-screen pb-24">
      {/* Fixed Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Content */}
      <div
        className={`max-w-3xl mx-auto pt-8 pb-8 transition-all duration-300 ${
          animating
            ? direction === "next"
              ? "opacity-0 translate-y-4"
              : "opacity-0 -translate-y-4"
            : "opacity-100 translate-y-0"
        }`}
      >
        <StepComponent />
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="glass border-t border-white/10 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            {/* Back button */}
            <GlassButton
              size="sm"
              onClick={goPrev}
              disabled={currentStep === 0}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Back</span>
            </GlassButton>

            {/* Step dots and counter */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToStep(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "w-6 bg-blue-400"
                        : i < currentStep
                        ? "bg-blue-400/40"
                        : "bg-white/20"
                    }`}
                    aria-label={`Go to step ${i + 1}: ${steps[i].title}`}
                  />
                ))}
              </div>
              <span className="text-xs text-white/40 tabular-nums whitespace-nowrap">
                {currentStep + 1} of {TOTAL_STEPS}
              </span>
            </div>

            {/* Next button */}
            {currentStep < TOTAL_STEPS - 1 ? (
              <GlassButton
                variant="primary"
                size="sm"
                onClick={goNext}
              >
                <span className="hidden sm:inline">
                  {currentStep === 0 ? "Start Demo" : "Next"}
                </span>
                <ChevronRight className="w-4 h-4" />
              </GlassButton>
            ) : (
              <GlassButton variant="primary" size="sm" onClick={() => goToStep(0)}>
                <span className="hidden sm:inline">Restart</span>
                <RotateCcw className="w-4 h-4" />
              </GlassButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
