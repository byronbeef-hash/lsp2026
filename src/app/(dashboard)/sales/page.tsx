"use client";

import { useState } from "react";
import {
  GlassCard,
  GlassButton,
  GlassBadge,
} from "@/components/glass";
import {
  DollarSign,
  Plus,
  TrendingUp,
  Clock,
  Tag,
  User,
  Calendar,
  Scale,
  Trash2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import type { SaleRecord } from "@/types";
import { useSalesStore } from "@/stores/modules";

type StatusFilter = "all" | SaleRecord["status"];

const statusBadgeVariant = (
  status: SaleRecord["status"]
): "success" | "warning" | "danger" | "default" => {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
      return "danger";
  }
};

export default function SalesPage() {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const { sales, deleteSale, markAsCompleted, getTotalRevenue } = useSalesStore();

  const filtered =
    activeFilter === "all"
      ? sales
      : sales.filter((s) => s.status === activeFilter);

  const completedSales = sales.filter((s) => s.status === "completed");
  const totalSales = sales.length;
  const totalRevenue = getTotalRevenue();
  const avgPricePerKg =
    completedSales.length > 0
      ? completedSales.reduce((sum, s) => sum + s.price_per_kg, 0) /
        completedSales.length
      : 0;
  const pendingSales = sales.filter((s) => s.status === "pending").length;

  const filters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales</h1>
          <p className="text-white/50 mt-1">
            Track livestock sales and revenue
          </p>
        </div>
        <Link href="/sales/new">
          <GlassButton variant="primary" icon={<Plus className="w-4 h-4" />}>
            Record Sale
          </GlassButton>
        </Link>
      </div>

      {/* Stats Row */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up"
        style={{ animationDelay: "50ms" } as React.CSSProperties}
      >
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Tag className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Total Sales</p>
              <p className="text-lg font-bold text-white">{totalSales}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Revenue</p>
              <p className="text-lg font-bold text-white">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Avg $/kg</p>
              <p className="text-lg font-bold text-white">
                ${avgPricePerKg.toFixed(2)}
              </p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Pending</p>
              <p className="text-lg font-bold text-white">{pendingSales}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filter Tabs */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 animate-fade-in-up"
        style={{ animationDelay: "100ms" } as React.CSSProperties}
      >
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === f.value
                ? "bg-white/20 text-white border border-white/20"
                : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white/70"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sale Cards */}
      <div className="space-y-3">
        {filtered.map((sale, index) => (
          <GlassCard
            key={sale.id}
            className="animate-fade-in-up"
            style={
              {
                animationDelay: `${150 + index * 50}ms`,
              } as React.CSSProperties
            }
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-white/60" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-white text-sm">
                    {sale.record_visual_tag}
                  </h3>
                  <GlassBadge variant={statusBadgeVariant(sale.status)}>
                    {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                  </GlassBadge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
                  <div className="flex items-center gap-1.5 text-white/50">
                    <User className="w-3 h-3" />
                    <span className="text-white/80">{sale.buyer_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/50">
                    <DollarSign className="w-3 h-3" />
                    <span className="text-white/80">
                      ${sale.sale_price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/50">
                    <Scale className="w-3 h-3" />
                    <span className="text-white/80">
                      {sale.weight_at_sale}kg @ ${sale.price_per_kg.toFixed(2)}/kg
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/50">
                    <Calendar className="w-3 h-3" />
                    <span className="text-white/80">{sale.sale_date}</span>
                  </div>
                </div>
                {sale.notes && (
                  <p className="text-xs text-white/40 mt-2 truncate">
                    {sale.notes}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    ${sale.sale_price.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/50">
                    ${sale.price_per_kg.toFixed(2)}/kg
                  </p>
                </div>
                <div className="flex gap-1">
                  {sale.status === "pending" && (
                    <GlassButton
                      size="sm"
                      variant="primary"
                      icon={<CheckCircle className="w-3.5 h-3.5" />}
                      onClick={() => markAsCompleted(sale.id)}
                    >
                      Complete
                    </GlassButton>
                  )}
                  <GlassButton
                    size="sm"
                    variant="danger"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => deleteSale(sale.id)}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <GlassCard className="text-center py-12">
          <DollarSign className="w-10 h-10 mx-auto mb-3 text-white/30" />
          <p className="text-white/50 text-sm">No sales found</p>
        </GlassCard>
      )}
    </div>
  );
}
