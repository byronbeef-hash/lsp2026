"use client";

import { useState, useMemo } from "react";
import { GlassCard, GlassBadge, GlassButton, GlassSelect } from "@/components/glass";
import { usePaddockStore } from "@/stores/modules";
import {
  MapPin,
  Maximize2,
  Users,
  Fence,
  Droplets,
  Leaf,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Paddock } from "@/types";

type StatusFilter = "all" | "active" | "resting" | "maintenance";
type SortField = "name" | "capacity" | "current_count";

const statusBadgeVariant: Record<Paddock["status"], "success" | "warning" | "danger"> = {
  active: "success",
  resting: "warning",
  maintenance: "danger",
};

const statusLabel: Record<Paddock["status"], string> = {
  active: "Active",
  resting: "Resting",
  maintenance: "Maintenance",
};

function getCapacityColor(percentage: number): string {
  if (percentage > 85) return "bg-red-500";
  if (percentage >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

function getCapacityTextColor(percentage: number): string {
  if (percentage > 85) return "text-red-400";
  if (percentage >= 70) return "text-amber-400";
  return "text-emerald-400";
}

function StatCard({
  label,
  value,
  icon: Icon,
  delay,
  onClick,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  delay: number;
  onClick?: () => void;
}) {
  return (
    <GlassCard
      className="animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` } as React.CSSProperties}
      hover={!!onClick}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/50 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-white/70" />
        </div>
      </div>
    </GlassCard>
  );
}

export default function PaddocksPage() {
  const router = useRouter();

  const paddocks = usePaddockStore((s) => s.paddocks);
  const deletePaddock = usePaddockStore((s) => s.deletePaddock);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return paddocks
      .filter((p) => statusFilter === "all" || p.status === statusFilter)
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [paddocks, statusFilter, sortField, sortDir]);

  const totalArea = paddocks.reduce((sum, p) => sum + p.area_hectares, 0);
  const totalCapacity = paddocks.reduce((sum, p) => sum + p.capacity, 0);
  const totalAnimals = paddocks.reduce((sum, p) => sum + p.current_count, 0);

  const handleDelete = (id: number) => {
    deletePaddock(id);
    setDeleteConfirmId(null);
  };

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "resting", label: "Resting" },
    { key: "maintenance", label: "Maintenance" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Paddocks</h1>
          <p className="text-white/50 mt-1">Property and paddock management</p>
        </div>
        <Link href="/paddocks/new">
          <GlassButton variant="primary" icon={<Plus className="w-4 h-4" />}>
            Add Paddock
          </GlassButton>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Total Area"
          value={`${totalArea} ha`}
          icon={Maximize2}
          delay={50}
        />
        <StatCard
          label="Total Capacity"
          value={totalCapacity.toString()}
          icon={Users}
          delay={100}
        />
        <StatCard
          label="Animals Housed"
          value={totalAnimals.toString()}
          icon={MapPin}
          delay={150}
          onClick={() => router.push("/records")}
        />
        <StatCard
          label="Paddocks"
          value={paddocks.length.toString()}
          icon={Fence}
          delay={200}
        />
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: "225ms" }}>
        {/* Status Filter Tabs */}
        <div className="flex gap-1 glass p-1 rounded-2xl w-fit">
          {statusTabs.map((tab) => {
            const count = tab.key === "all"
              ? paddocks.length
              : paddocks.filter((p) => p.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  statusFilter === tab.key
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {tab.label}
                <span className={`text-xs ${statusFilter === tab.key ? "text-white/70" : "text-white/30"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 sm:ml-auto items-center">
          <span className="text-xs text-white/40">Sort by:</span>
          <div className="flex gap-1 glass p-1 rounded-2xl">
            {([
              { key: "name" as SortField, label: "Name" },
              { key: "capacity" as SortField, label: "Capacity" },
              { key: "current_count" as SortField, label: "Count" },
            ]).map((s) => (
              <button
                key={s.key}
                onClick={() => {
                  if (sortField === s.key) {
                    setSortDir(sortDir === "asc" ? "desc" : "asc");
                  } else {
                    setSortField(s.key);
                    setSortDir("asc");
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  sortField === s.key
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {s.label}
                {sortField === s.key && (
                  <span className="ml-1">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Paddock Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((paddock, i) => {
          const percentage = Math.round((paddock.current_count / paddock.capacity) * 100);

          return (
            <div
              key={paddock.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${250 + i * 50}ms` } as React.CSSProperties}
            >
              <GlassCard hover>
                {/* Header */}
                <Link href={`/paddocks/${paddock.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Fence className="w-5 h-5 text-white/60" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{paddock.name}</h3>
                        <p className="text-sm text-white/50">{paddock.pasture_type}</p>
                      </div>
                    </div>
                    <GlassBadge variant={statusBadgeVariant[paddock.status]}>
                      {statusLabel[paddock.status]}
                    </GlassBadge>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 text-white/60">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>{paddock.area_hectares} ha</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/60">
                      <Leaf className="w-3.5 h-3.5" />
                      <span>{paddock.pasture_type}</span>
                    </div>
                    {paddock.water_source && (
                      <div className="flex items-center gap-1.5 text-blue-400">
                        <Droplets className="w-3.5 h-3.5" />
                        <span>Water</span>
                      </div>
                    )}
                  </div>

                  {/* Capacity Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-white/50">Capacity</span>
                      <span className={`text-xs font-medium ${getCapacityTextColor(percentage)}`}>
                        {paddock.current_count} / {paddock.capacity} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getCapacityColor(percentage)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </Link>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                  <GlassButton
                    size="sm"
                    icon={<Edit className="w-4 h-4" />}
                    onClick={() => router.push(`/paddocks/${paddock.id}/edit`)}
                  >
                    Edit
                  </GlassButton>
                  {deleteConfirmId === paddock.id ? (
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-xs text-red-300 mr-1">Delete?</span>
                      <button
                        onClick={() => handleDelete(paddock.id)}
                        className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-xs text-white/50 hover:text-white px-2 py-1 rounded bg-white/10 hover:bg-white/15 transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <GlassButton
                      size="sm"
                      variant="danger"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => setDeleteConfirmId(paddock.id)}
                    >
                      Delete
                    </GlassButton>
                  )}
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-white/40">
          <Fence className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No paddocks found for this filter</p>
        </div>
      )}
    </div>
  );
}
