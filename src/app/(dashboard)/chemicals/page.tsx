"use client";

import { useState } from "react";
import { GlassCard, GlassButton, GlassBadge } from "@/components/glass";
import {
  FlaskConical,
  Plus,
  Edit,
  Trash2,
  Beaker,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
} from "lucide-react";

type ApplicationType = "spray" | "pour-on" | "dip";
type BatchStatus = "planned" | "applied" | "completed";
type FilterTab = "all" | BatchStatus;

interface ChemicalBatch {
  id: number;
  name: string;
  product: string;
  applicationType: ApplicationType;
  targetPaddock: string;
  applicationDate: string;
  status: BatchStatus;
  cost: number;
  withholdingPeriod: string;
}

const mockBatches: ChemicalBatch[] = [
  {
    id: 1,
    name: "Roundup Paddock 3 Spray",
    product: "Roundup PowerMAX",
    applicationType: "spray",
    targetPaddock: "Paddock 3 - River Flat",
    applicationDate: "2026-03-18",
    status: "completed",
    cost: 485,
    withholdingPeriod: "14 days",
  },
  {
    id: 2,
    name: "Tick Dip - March",
    product: "Bayticol Pour-On",
    applicationType: "dip",
    targetPaddock: "Yards - Main Dip",
    applicationDate: "2026-03-22",
    status: "applied",
    cost: 1240,
    withholdingPeriod: "35 days (ESI)",
  },
  {
    id: 3,
    name: "Weed Control North Ridge",
    product: "Grazon Extra",
    applicationType: "spray",
    targetPaddock: "Paddock 7 - North Ridge",
    applicationDate: "2026-03-28",
    status: "planned",
    cost: 620,
    withholdingPeriod: "21 days",
  },
  {
    id: 4,
    name: "Lice Treatment - Weaners",
    product: "Extinosad Pour-On",
    applicationType: "pour-on",
    targetPaddock: "Paddock 1 - House",
    applicationDate: "2026-03-15",
    status: "completed",
    cost: 340,
    withholdingPeriod: "21 days (ESI)",
  },
  {
    id: 5,
    name: "Pasture Spray - South Block",
    product: "MCPA 500",
    applicationType: "spray",
    targetPaddock: "Paddock 12 - South Block",
    applicationDate: "2026-04-02",
    status: "planned",
    cost: 290,
    withholdingPeriod: "7 days",
  },
];

const filterTabs: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "planned", label: "Planned" },
  { value: "applied", label: "Applied" },
  { value: "completed", label: "Completed" },
];

const statusBadgeVariant = (status: BatchStatus): "info" | "warning" | "success" => {
  switch (status) {
    case "planned":
      return "info";
    case "applied":
      return "warning";
    case "completed":
      return "success";
  }
};

const applicationTypeLabel = (type: ApplicationType) => {
  switch (type) {
    case "spray":
      return "Spray";
    case "pour-on":
      return "Pour-On";
    case "dip":
      return "Dip";
  }
};

export default function ChemicalsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [batches, setBatches] = useState(mockBatches);

  const filtered = activeTab === "all" ? batches : batches.filter((b) => b.status === activeTab);

  const totalBatches = batches.length;
  const activeApplications = batches.filter((b) => b.status === "applied").length;
  const paddocksTreated = new Set(batches.filter((b) => b.status !== "planned").map((b) => b.targetPaddock)).size;
  const totalCost = batches.reduce((sum, b) => sum + b.cost, 0);

  const handleDelete = (id: number) => {
    setBatches((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Chemical Batches</h1>
          <p className="text-white/50 mt-1">Track chemical applications and withholding periods</p>
        </div>
        <GlassButton variant="primary" icon={<Plus className="w-4 h-4" />}>
          New Batch
        </GlassButton>
      </div>

      {/* Stats Row */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up"
        style={{ animationDelay: "50ms" } as React.CSSProperties}
      >
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Total Batches</p>
              <p className="text-lg font-bold text-white">{totalBatches}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Beaker className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Active Applications</p>
              <p className="text-lg font-bold text-white">{activeApplications}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Paddocks Treated</p>
              <p className="text-lg font-bold text-white">{paddocksTreated}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Total Cost</p>
              <p className="text-lg font-bold text-white">${totalCost.toLocaleString()}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filter Tabs */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 animate-fade-in-up"
        style={{ animationDelay: "100ms" } as React.CSSProperties}
      >
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.value
                ? "bg-white/20 text-white border border-white/20"
                : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Batch Cards */}
      <div className="space-y-3">
        {filtered.map((batch, index) => (
          <GlassCard
            key={batch.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${150 + index * 50}ms` } as React.CSSProperties}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <FlaskConical className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-white text-sm truncate">{batch.name}</h3>
                  <GlassBadge variant={statusBadgeVariant(batch.status)}>{batch.status}</GlassBadge>
                  <GlassBadge>{applicationTypeLabel(batch.applicationType)}</GlassBadge>
                </div>
                <p className="text-xs text-white/60 mb-1.5">{batch.product}</p>
                <div className="flex items-center gap-4 text-xs text-white/50 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="text-white/80">{batch.targetPaddock}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span className="text-white/80">{batch.applicationDate}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span className="text-white/80">${batch.cost.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    WHP: <span className="text-white/80">{batch.withholdingPeriod}</span>
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <GlassButton size="sm" icon={<Edit className="w-4 h-4" />} />
                <GlassButton
                  size="sm"
                  variant="danger"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => handleDelete(batch.id)}
                />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <GlassCard className="text-center py-12">
          <FlaskConical className="w-10 h-10 mx-auto mb-3 text-white/30" />
          <p className="text-white/50 text-sm">No chemical batches found</p>
        </GlassCard>
      )}
    </div>
  );
}
