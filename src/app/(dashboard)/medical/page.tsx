"use client";

import { useState, useMemo } from "react";
import { GlassCard, GlassBadge, GlassButton } from "@/components/glass";
import { useMedicalStore } from "@/stores/modules";
import {
  Plus,
  Syringe,
  Calendar,
  Users,
  Pill,
  User,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  Activity,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MedicalBatch } from "@/types";

type FilterTab = "all" | "active" | "scheduled" | "completed";

const statusBadgeVariant = (
  status: MedicalBatch["status"]
): "success" | "info" | "default" => {
  switch (status) {
    case "active":
      return "success";
    case "scheduled":
      return "info";
    case "completed":
      return "default";
  }
};

const treatmentTypeLabel = (type: string) => {
  switch (type) {
    case "Vaccination":
      return "warning";
    case "Drench":
      return "info";
    case "Treatment":
      return "danger";
    case "Examination":
      return "default";
    default:
      return "default";
  }
};

export default function MedicalBatchesPage() {
  const router = useRouter();

  const batches = useMedicalStore((s) => s.batches);
  const searchQuery = useMedicalStore((s) => s.searchQuery);
  const filterStatus = useMedicalStore((s) => s.filterStatus);
  const setSearch = useMedicalStore((s) => s.setSearch);
  const setFilterStatus = useMedicalStore((s) => s.setFilterStatus);
  const deleteBatch = useMedicalStore((s) => s.deleteBatch);
  const completeBatch = useMedicalStore((s) => s.completeBatch);
  const getFilteredBatches = useMedicalStore((s) => s.getFilteredBatches);

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Map filterStatus (null = "all") to tab key
  const activeTab: FilterTab = filterStatus ?? "all";

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "scheduled", label: "Scheduled" },
    { key: "completed", label: "Completed" },
  ];

  const filtered = getFilteredBatches();

  // Stats
  const activeBatches = batches.filter((b) => b.status === "active").length;
  const animalsInTreatment = batches
    .filter((b) => b.status === "active")
    .reduce((sum, b) => sum + b.animal_count, 0);
  const completedThisMonth = batches.filter((b) => {
    if (b.status !== "completed" || !b.completed_date) return false;
    const completedDate = new Date(b.completed_date);
    const now = new Date();
    return (
      completedDate.getMonth() === now.getMonth() &&
      completedDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const handleDelete = (id: number) => {
    deleteBatch(id);
    setDeleteConfirmId(null);
  };

  const handleCompleteBatch = (id: number) => {
    completeBatch(id);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Medical Batches</h1>
          <p className="text-white/50 mt-1">
            Treatment and vaccination management
          </p>
        </div>
        <Link href="/medical/new">
          <GlassButton variant="primary" icon={<Plus className="w-4 h-4" />}>
            New Treatment
          </GlassButton>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in-up" style={{ animationDelay: "25ms" }}>
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/50 mb-1">Active Batches</p>
              <p className="text-2xl font-bold text-white">{activeBatches}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/50 mb-1">Animals in Treatment</p>
              <p className="text-2xl font-bold text-white">{animalsInTreatment}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/50 mb-1">Completed This Month</p>
              <p className="text-2xl font-bold text-white">{completedThisMonth}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white/70" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Search */}
      <div className="animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by batch name, medication, or type..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input pl-10"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        className="flex gap-1 glass p-1 rounded-2xl w-fit animate-fade-in-up"
        style={{ animationDelay: "75ms" }}
      >
        {tabs.map((tab) => {
          const count = tab.key === "all"
            ? batches.length
            : batches.filter((b) => b.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key === "all" ? null : tab.key as MedicalBatch["status"])}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.key
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              {tab.label}
              <span className={`text-xs ${activeTab === tab.key ? "text-white/70" : "text-white/30"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div
        className="hidden md:block animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <GlassCard padding="none" className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-white/50 font-semibold">
                  Batch Name
                </th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-white/50 font-semibold">
                  Type
                </th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-white/50 font-semibold">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-white/50 font-semibold">
                  Medication
                </th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-white/50 font-semibold">
                  Animals
                </th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-white/50 font-semibold">
                  Scheduled
                </th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-white/50 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((batch) => (
                <tr key={batch.id} className="glass-table-row">
                  <td className="px-5 py-3">
                    <Link
                      href={`/medical/${batch.id}`}
                      className="font-semibold text-white hover:text-white/80 transition-colors"
                    >
                      {batch.batch_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <GlassBadge
                      variant={
                        treatmentTypeLabel(batch.treatment_type) as
                          | "default"
                          | "success"
                          | "warning"
                          | "danger"
                          | "info"
                      }
                    >
                      {batch.treatment_type}
                    </GlassBadge>
                  </td>
                  <td className="px-5 py-3">
                    <GlassBadge variant={statusBadgeVariant(batch.status)}>
                      {batch.status.charAt(0).toUpperCase() +
                        batch.status.slice(1)}
                    </GlassBadge>
                  </td>
                  <td className="px-5 py-3 text-white/70 text-sm">
                    {batch.medication}
                  </td>
                  <td className="px-5 py-3 text-white/70 text-sm">
                    {batch.animal_count}
                  </td>
                  <td className="px-5 py-3 text-white/50 text-sm">
                    {batch.scheduled_date}
                  </td>
                  <td className="px-5 py-3">
                    {deleteConfirmId === batch.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-red-300 mr-1">Delete?</span>
                        <button
                          onClick={() => handleDelete(batch.id)}
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
                      <div className="flex items-center gap-1">
                        {batch.status !== "completed" && (
                          <button
                            onClick={() => handleCompleteBatch(batch.id)}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-white/50 hover:text-emerald-400 transition-colors"
                            title="Complete Batch"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/medical/${batch.id}`)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(batch.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-white/40">
              No medical batches found{searchQuery ? ` matching "${searchQuery}"` : " for this filter"}.
            </div>
          )}
        </GlassCard>
      </div>

      {/* Mobile Card View */}
      <div
        className="md:hidden space-y-3 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        {filtered.map((batch) => (
          <div key={batch.id}>
            <GlassCard hover className="mb-1">
              <Link href={`/medical/${batch.id}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Syringe className="w-6 h-6 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-white">
                        {batch.batch_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <GlassBadge
                        variant={
                          treatmentTypeLabel(batch.treatment_type) as
                            | "default"
                            | "success"
                            | "warning"
                            | "danger"
                            | "info"
                        }
                      >
                        {batch.treatment_type}
                      </GlassBadge>
                      <GlassBadge variant={statusBadgeVariant(batch.status)}>
                        {batch.status.charAt(0).toUpperCase() +
                          batch.status.slice(1)}
                      </GlassBadge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-white/50">
                        <Pill className="w-3.5 h-3.5" />
                        <span>
                          {batch.medication} &middot; {batch.dosage}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/50">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {batch.animal_count} animals
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {batch.scheduled_date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              {/* Mobile action buttons */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                {batch.status !== "completed" && (
                  <GlassButton
                    size="sm"
                    icon={<CheckCircle className="w-4 h-4" />}
                    onClick={() => handleCompleteBatch(batch.id)}
                  >
                    Complete
                  </GlassButton>
                )}
                <GlassButton
                  size="sm"
                  icon={<Edit className="w-4 h-4" />}
                  onClick={() => router.push(`/medical/${batch.id}`)}
                >
                  Edit
                </GlassButton>
                {deleteConfirmId === batch.id ? (
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => handleDelete(batch.id)}
                      className="text-xs text-red-400 font-semibold px-3 py-1.5 rounded-lg bg-red-500/20"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="text-xs text-white/50 px-3 py-1.5 rounded-lg bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <GlassButton
                    size="sm"
                    variant="danger"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => setDeleteConfirmId(batch.id)}
                  >
                    Delete
                  </GlassButton>
                )}
              </div>
            </GlassCard>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/40">
            No medical batches found{searchQuery ? ` matching "${searchQuery}"` : " for this filter"}.
          </div>
        )}
      </div>
    </div>
  );
}
