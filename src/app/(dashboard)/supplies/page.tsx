"use client";

import { useState } from "react";
import { GlassCard, GlassButton, GlassBadge } from "@/components/glass";
import {
  Package,
  Plus,
  AlertTriangle,
  DollarSign,
  Boxes,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import type { Supply } from "@/types";
import { useSuppliesStore } from "@/stores/modules";

type Category = "all" | Supply["category"];

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "feed", label: "Feed" },
  { value: "fencing", label: "Fencing" },
  { value: "fertilizer", label: "Fertilizer" },
  { value: "seed", label: "Seed" },
  { value: "herbicide", label: "Herbicide" },
  { value: "medical", label: "Medical" },
  { value: "other", label: "Other" },
];

const categoryBadgeVariant = (
  category: Supply["category"]
): "success" | "info" | "warning" | "danger" | "default" => {
  switch (category) {
    case "feed":
      return "success";
    case "fencing":
      return "default";
    case "fertilizer":
      return "warning";
    case "seed":
      return "info";
    case "herbicide":
      return "danger";
    case "medical":
      return "info";
    case "other":
      return "default";
  }
};

export default function SuppliesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const { supplies, deleteSupply, getFilteredSupplies, getLowStockItems, setFilterCategory } = useSuppliesStore();

  const handleCategoryChange = (cat: Category) => {
    setActiveCategory(cat);
    setFilterCategory(cat === "all" ? null : cat);
  };

  const filtered = activeCategory === "all"
    ? supplies
    : supplies.filter((s) => s.category === activeCategory);

  const totalItems = supplies.length;
  const totalValue = supplies.reduce(
    (sum, s) => sum + s.quantity * s.cost_per_unit,
    0
  );
  const lowStockCount = getLowStockItems().length;

  const handleDelete = (id: number) => {
    deleteSupply(id);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Supplies</h1>
          <p className="text-white/50 mt-1">Inventory and stock management</p>
        </div>
        <Link href="/supplies/new">
          <GlassButton variant="primary" icon={<Plus className="w-4 h-4" />}>
            Add Supply
          </GlassButton>
        </Link>
      </div>

      {/* Stats Row */}
      <div
        className="grid grid-cols-3 gap-3 animate-fade-in-up"
        style={{ animationDelay: "50ms" } as React.CSSProperties}
      >
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Boxes className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Total Items</p>
              <p className="text-lg font-bold text-white">{totalItems}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Total Value</p>
              <p className="text-lg font-bold text-white">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Low Stock</p>
              <p className="text-lg font-bold text-white">{lowStockCount}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Category Tabs */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 animate-fade-in-up"
        style={{ animationDelay: "100ms" } as React.CSSProperties}
      >
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryChange(cat.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.value
                ? "bg-white/20 text-white border border-white/20"
                : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white/70"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Supply Cards */}
      <div className="space-y-3">
        {filtered.map((supply, index) => {
          const isLowStock = supply.quantity <= supply.reorder_level;
          return (
            <GlassCard
              key={supply.id}
              className="animate-fade-in-up"
              style={
                {
                  animationDelay: `${150 + index * 50}ms`,
                } as React.CSSProperties
              }
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isLowStock ? "bg-amber-500/20" : "bg-white/10"
                  }`}
                >
                  <Package
                    className={`w-5 h-5 ${
                      isLowStock ? "text-amber-400" : "text-white/60"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white text-sm truncate">
                      {supply.name}
                    </h3>
                    <GlassBadge variant={categoryBadgeVariant(supply.category)}>
                      {supply.category}
                    </GlassBadge>
                    {isLowStock && (
                      <GlassBadge variant="warning">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Low Stock
                      </GlassBadge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span>
                      Qty:{" "}
                      <span className="text-white/80 font-medium">
                        {supply.quantity} {supply.unit}
                      </span>
                    </span>
                    <span>
                      Cost:{" "}
                      <span className="text-white/80">
                        ${supply.cost_per_unit.toFixed(2)}/{supply.unit === "units" ? "unit" : supply.unit}
                      </span>
                    </span>
                    <span>
                      Supplier:{" "}
                      <span className="text-white/80">{supply.supplier}</span>
                    </span>
                    <span>
                      Reorder at:{" "}
                      <span className="text-white/80">
                        {supply.reorder_level} {supply.unit}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link href={`/supplies/new`}>
                    <GlassButton size="sm" icon={<Edit className="w-4 h-4" />} />
                  </Link>
                  <GlassButton
                    size="sm"
                    variant="danger"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => handleDelete(supply.id)}
                  />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <GlassCard className="text-center py-12">
          <Package className="w-10 h-10 mx-auto mb-3 text-white/30" />
          <p className="text-white/50 text-sm">
            No supplies found in this category
          </p>
        </GlassCard>
      )}
    </div>
  );
}
