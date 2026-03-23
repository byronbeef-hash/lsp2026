"use client";

import { useState } from "react";
import { GlassCard, GlassButton, GlassBadge } from "@/components/glass";
import {
  Wheat,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  BarChart3,
  Package,
  AlertTriangle,
} from "lucide-react";

type FeedType = "hay" | "grain" | "pellets" | "silage" | "supplement";
type FilterTab = "all" | FeedType;

interface FeedRecord {
  id: number;
  date: string;
  feedType: FeedType;
  quantity: number;
  unit: string;
  paddockMob: string;
  cost: number;
  notes: string;
}

interface InventoryItem {
  id: number;
  name: string;
  feedType: FeedType;
  quantityRemaining: number;
  unit: string;
  reorderLevel: number;
  costPerUnit: number;
}

const mockFeedRecords: FeedRecord[] = [
  { id: 1, date: "2026-03-24", feedType: "hay", quantity: 12, unit: "bales", paddockMob: "Weaners - Paddock 1", cost: 180, notes: "Lucerne hay, good quality" },
  { id: 2, date: "2026-03-23", feedType: "grain", quantity: 250, unit: "kg", paddockMob: "Feedlot Steers", cost: 125, notes: "Barley ration" },
  { id: 3, date: "2026-03-22", feedType: "supplement", quantity: 40, unit: "kg", paddockMob: "Breeders - Paddock 5", cost: 96, notes: "Mineral lick blocks x4" },
  { id: 4, date: "2026-03-21", feedType: "silage", quantity: 1, unit: "bales", paddockMob: "Dairy Heifers - Paddock 9", cost: 85, notes: "Wrapped silage round bale" },
  { id: 5, date: "2026-03-20", feedType: "pellets", quantity: 200, unit: "kg", paddockMob: "Show Team", cost: 160, notes: "Cattle finishing pellets" },
  { id: 6, date: "2026-03-19", feedType: "hay", quantity: 8, unit: "bales", paddockMob: "Weaners - Paddock 1", cost: 120, notes: "Oaten hay" },
  { id: 7, date: "2026-03-18", feedType: "grain", quantity: 500, unit: "kg", paddockMob: "Feedlot Steers", cost: 250, notes: "Barley + lupins mix" },
  { id: 8, date: "2026-03-17", feedType: "supplement", quantity: 20, unit: "kg", paddockMob: "Breeders - Paddock 5", cost: 68, notes: "Causmag added to water" },
];

const mockInventory: InventoryItem[] = [
  { id: 1, name: "Lucerne Hay", feedType: "hay", quantityRemaining: 45, unit: "bales", reorderLevel: 20, costPerUnit: 15 },
  { id: 2, name: "Barley", feedType: "grain", quantityRemaining: 1200, unit: "kg", reorderLevel: 500, costPerUnit: 0.50 },
  { id: 3, name: "Cattle Finishing Pellets", feedType: "pellets", quantityRemaining: 180, unit: "kg", reorderLevel: 200, costPerUnit: 0.80 },
  { id: 4, name: "Wrapped Silage Bales", feedType: "silage", quantityRemaining: 8, unit: "bales", reorderLevel: 5, costPerUnit: 85 },
  { id: 5, name: "Mineral Lick Blocks", feedType: "supplement", quantityRemaining: 6, unit: "blocks", reorderLevel: 10, costPerUnit: 24 },
];

const filterTabs: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hay", label: "Hay" },
  { value: "grain", label: "Grain" },
  { value: "pellets", label: "Pellets" },
  { value: "silage", label: "Silage" },
  { value: "supplement", label: "Supplement" },
];

const feedTypeBadgeVariant = (type: FeedType): "success" | "info" | "warning" | "danger" | "default" => {
  switch (type) {
    case "hay": return "success";
    case "grain": return "warning";
    case "pellets": return "info";
    case "silage": return "default";
    case "supplement": return "danger";
  }
};

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [records, setRecords] = useState(mockFeedRecords);
  const [showInventory, setShowInventory] = useState(true);

  const filtered = activeTab === "all" ? records : records.filter((r) => r.feedType === activeTab);

  const monthlyCost = records.reduce((sum, r) => sum + r.cost, 0);
  const dailyConsumption = Math.round(records.reduce((sum, r) => sum + r.quantity, 0) / 7);
  const feedEfficiency = 6.8; // mock: kg feed per kg gain
  const lowStockCount = mockInventory.filter((i) => i.quantityRemaining <= i.reorderLevel).length;

  const handleDelete = (id: number) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Feed Management</h1>
          <p className="text-white/50 mt-1">Track feeding, costs and inventory</p>
        </div>
        <GlassButton variant="primary" icon={<Plus className="w-4 h-4" />}>
          Add Feed Record
        </GlassButton>
      </div>

      {/* Stats Row */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up"
        style={{ animationDelay: "50ms" } as React.CSSProperties}
      >
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Monthly Feed Cost</p>
              <p className="text-lg font-bold text-white">${monthlyCost.toLocaleString()}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Daily Consumption</p>
              <p className="text-lg font-bold text-white">{dailyConsumption} kg/day</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Feed Efficiency</p>
              <p className="text-lg font-bold text-white">{feedEfficiency} : 1</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Stock on Hand</p>
              <p className="text-lg font-bold text-white">
                {mockInventory.length} items
                {lowStockCount > 0 && (
                  <span className="text-xs text-amber-400 font-normal ml-1">({lowStockCount} low)</span>
                )}
              </p>
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

      {/* Feed Records */}
      <div className="space-y-3">
        {filtered.map((record, index) => (
          <GlassCard
            key={record.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${150 + index * 50}ms` } as React.CSSProperties}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Wheat className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-white text-sm">{record.paddockMob}</h3>
                  <GlassBadge variant={feedTypeBadgeVariant(record.feedType)}>{record.feedType}</GlassBadge>
                </div>
                <p className="text-xs text-white/60 mb-1.5">{record.notes}</p>
                <div className="flex items-center gap-4 text-xs text-white/50 flex-wrap">
                  <span>Date: <span className="text-white/80">{record.date}</span></span>
                  <span>Qty: <span className="text-white/80 font-medium">{record.quantity} {record.unit}</span></span>
                  <span>Cost: <span className="text-white/80">${record.cost.toFixed(2)}</span></span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <GlassButton size="sm" icon={<Edit className="w-4 h-4" />} />
                <GlassButton
                  size="sm"
                  variant="danger"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => handleDelete(record.id)}
                />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <GlassCard className="text-center py-12">
          <Wheat className="w-10 h-10 mx-auto mb-3 text-white/30" />
          <p className="text-white/50 text-sm">No feed records found in this category</p>
        </GlassCard>
      )}

      {/* Inventory Section */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "200ms" } as React.CSSProperties}
      >
        <button
          onClick={() => setShowInventory(!showInventory)}
          className="flex items-center gap-2 mb-3 text-white/70 hover:text-white transition-colors"
        >
          <Package className="w-4 h-4" />
          <span className="text-sm font-semibold uppercase tracking-wider">Current Inventory</span>
          <span className={`text-xs transition-transform ${showInventory ? "rotate-180" : ""}`}>▼</span>
        </button>

        {showInventory && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mockInventory.map((item, i) => {
              const isLow = item.quantityRemaining <= item.reorderLevel;
              return (
                <GlassCard
                  key={item.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${250 + i * 40}ms` } as React.CSSProperties}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-white text-sm">{item.name}</h4>
                      <GlassBadge variant={feedTypeBadgeVariant(item.feedType)} className="mt-1">
                        {item.feedType}
                      </GlassBadge>
                    </div>
                    {isLow && (
                      <GlassBadge variant="warning">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Low
                      </GlassBadge>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-white/50">
                    <div className="flex justify-between">
                      <span>Remaining</span>
                      <span className={`font-medium ${isLow ? "text-amber-400" : "text-white/80"}`}>
                        {item.quantityRemaining} {item.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reorder Level</span>
                      <span className="text-white/80">{item.reorderLevel} {item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost/Unit</span>
                      <span className="text-white/80">${item.costPerUnit.toFixed(2)}/{item.unit === "bales" ? "bale" : item.unit === "blocks" ? "block" : "kg"}</span>
                    </div>
                  </div>
                  {/* Stock level bar */}
                  <div className="mt-2.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isLow ? "bg-amber-400" : "bg-emerald-400"}`}
                      style={{ width: `${Math.min(100, (item.quantityRemaining / (item.reorderLevel * 3)) * 100)}%` }}
                    />
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
