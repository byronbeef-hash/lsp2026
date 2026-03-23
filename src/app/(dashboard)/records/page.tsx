"use client";

import { useState, useMemo, useCallback } from "react";
import { GlassCard, GlassInput, GlassBadge, GlassButton, GlassSelect } from "@/components/glass";
import { useRecordsStore } from "@/stores/modules";
import {
  Beef,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit,
  Download,
  Upload,
  CheckSquare,
  Square,
  X,
  Syringe,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LivestockRecord } from "@/types";

const ITEMS_PER_PAGE = 10;

export default function RecordsPage() {
  const router = useRouter();

  const records = useRecordsStore((s) => s.records);
  const searchQuery = useRecordsStore((s) => s.searchQuery);
  const sortField = useRecordsStore((s) => s.sortField);
  const sortDirection = useRecordsStore((s) => s.sortDirection);
  const filterBreed = useRecordsStore((s) => s.filterBreed);
  const filterSex = useRecordsStore((s) => s.filterSex);
  const filterCondition = useRecordsStore((s) => s.filterCondition);
  const selectedIds = useRecordsStore((s) => s.selectedIds);
  const setSearch = useRecordsStore((s) => s.setSearch);
  const setSort = useRecordsStore((s) => s.setSort);
  const setFilter = useRecordsStore((s) => s.setFilter);
  const toggleSelect = useRecordsStore((s) => s.toggleSelect);
  const clearSelection = useRecordsStore((s) => s.clearSelection);
  const deleteRecord = useRecordsStore((s) => s.deleteRecord);
  const bulkDelete = useRecordsStore((s) => s.bulkDelete);
  const exportCSV = useRecordsStore((s) => s.exportCSV);
  const getFilteredRecords = useRecordsStore((s) => s.getFilteredRecords);

  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Map store filter values (null) to UI values ("All") and vice versa
  const uiFilterBreed = filterBreed ?? "All";
  const uiFilterSex = filterSex ?? "All";
  const uiFilterCondition = filterCondition ?? "All";

  const filtered = getFilteredRecords();
  const paginatedRecords = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const toggleSort = (field: keyof LivestockRecord) => {
    if (sortField === field) {
      setSort(field, sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSort(field, "asc");
    }
  };

  const SortIcon = ({ field }: { field: keyof LivestockRecord }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3" />;
    return sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedRecords.length && paginatedRecords.length > 0) {
      clearSelection();
    } else {
      paginatedRecords.forEach((r) => {
        if (!selectedIds.includes(r.id)) toggleSelect(r.id);
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteRecord(id);
    setDeleteConfirmId(null);
  };

  const handleBulkDelete = () => {
    bulkDelete(selectedIds);
  };

  const handleExportSelected = () => {
    const selectedRecords = records.filter((r) => selectedIds.includes(r.id));
    const headers = [
      "visual_tag", "eid", "breed", "sex", "weight_kg", "weight_lb",
      "condition", "date_of_birth", "record_date", "notes",
    ];
    const csvRows = [
      headers.join(","),
      ...selectedRecords.map((r) =>
        headers
          .map((h) => {
            const val = r[h as keyof LivestockRecord];
            if (val == null) return "";
            const str = String(val);
            return str.includes(",") ? `"${str}"` : str;
          })
          .join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `livestock-records-selected-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    exportCSV();
  };

  const activeFilterCount = [uiFilterBreed, uiFilterSex, uiFilterCondition].filter((f) => f !== "All").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Livestock Records</h1>
          <p className="text-white/50 mt-1">
            {filtered.length} of {records.length} records
          </p>
        </div>
        <div className="flex gap-2">
          <GlassButton
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportAll}
          >
            Export All
          </GlassButton>
          <Link href="/records/import">
            <GlassButton icon={<Upload className="w-4 h-4" />}>
              Import
            </GlassButton>
          </Link>
          <Link href="/records/new">
            <GlassButton variant="primary" icon={<Plus className="w-4 h-4" />}>
              Add Record
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by tag, breed, or EID..."
            value={searchQuery}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
            className="glass-input pl-10"
          />
        </div>
        <button
          className={`glass-btn px-4 relative ${showFilters ? "bg-white/20" : ""}`}
          aria-label="Filters"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Dropdowns */}
      {showFilters && (
        <div className="animate-fade-in-up">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setFilter("filterBreed", null);
                    setFilter("filterSex", null);
                    setFilter("filterCondition", null);
                  }}
                  className="text-xs text-white/50 hover:text-white transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <GlassSelect
                label="Breed"
                value={uiFilterBreed}
                onChange={(e) => {
                  setFilter("filterBreed", e.target.value === "All" ? null : e.target.value);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                options={[
                  { value: "All", label: "All Breeds" },
                  { value: "Angus", label: "Angus" },
                  { value: "Hereford", label: "Hereford" },
                  { value: "Brahman", label: "Brahman" },
                  { value: "Charolais", label: "Charolais" },
                ]}
              />
              <GlassSelect
                label="Sex"
                value={uiFilterSex}
                onChange={(e) => {
                  setFilter("filterSex", e.target.value === "All" ? null : e.target.value);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                options={[
                  { value: "All", label: "All" },
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                ]}
              />
              <GlassSelect
                label="Condition"
                value={uiFilterCondition}
                onChange={(e) => {
                  setFilter("filterCondition", e.target.value === "All" ? null : e.target.value);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                options={[
                  { value: "All", label: "All Conditions" },
                  { value: "Excellent", label: "Excellent" },
                  { value: "Good", label: "Good" },
                  { value: "Fair", label: "Fair" },
                  { value: "Poor", label: "Poor" },
                ]}
              />
            </div>
            <div className="mt-4">
              <GlassSelect
                label="Sort By"
                value={sortField as string}
                onChange={(e) => {
                  setSort(e.target.value as keyof LivestockRecord, sortDirection);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                options={[
                  { value: "visual_tag", label: "Tag" },
                  { value: "weight_kg", label: "Weight" },
                  { value: "breed", label: "Breed" },
                  { value: "record_date", label: "Date" },
                ]}
              />
              <button
                onClick={() => setSort(sortField, sortDirection === "asc" ? "desc" : "asc")}
                className="mt-2 text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1"
              >
                {sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {sortDirection === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="animate-fade-in-up">
          <GlassCard className="flex items-center justify-between">
            <span className="text-sm text-white/80 font-medium">
              {selectedIds.length} record{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <GlassButton
                size="sm"
                variant="danger"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={handleBulkDelete}
              >
                Delete Selected
              </GlassButton>
              <GlassButton
                size="sm"
                icon={<Download className="w-4 h-4" />}
                onClick={handleExportSelected}
              >
                Export Selected
              </GlassButton>
              <Link href="/medical/new">
                <GlassButton
                  size="sm"
                  icon={<Syringe className="w-4 h-4" />}
                >
                  Assign Medical Batch
                </GlassButton>
              </Link>
              <GlassButton
                size="sm"
                variant="ghost"
                icon={<X className="w-4 h-4" />}
                onClick={clearSelection}
              >
                Clear
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <GlassCard padding="none" className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 w-10">
                  <button onClick={toggleSelectAll} className="text-white/50 hover:text-white transition-colors">
                    {selectedIds.length === paginatedRecords.length && paginatedRecords.length > 0 ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="text-left px-5 py-3">
                  <button
                    onClick={() => toggleSort("visual_tag")}
                    className="flex items-center gap-1 text-xs uppercase tracking-wider text-white/50 font-semibold hover:text-white/80"
                  >
                    Tag <SortIcon field="visual_tag" />
                  </button>
                </th>
                <th className="text-left px-5 py-3">
                  <button
                    onClick={() => toggleSort("breed")}
                    className="flex items-center gap-1 text-xs uppercase tracking-wider text-white/50 font-semibold hover:text-white/80"
                  >
                    Breed <SortIcon field="breed" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-white/50 font-semibold">
                  Sex
                </th>
                <th className="text-left px-5 py-3">
                  <button
                    onClick={() => toggleSort("weight_kg")}
                    className="flex items-center gap-1 text-xs uppercase tracking-wider text-white/50 font-semibold hover:text-white/80"
                  >
                    Weight <SortIcon field="weight_kg" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-white/50 font-semibold">
                  Condition
                </th>
                <th className="text-left px-5 py-3">
                  <button
                    onClick={() => toggleSort("record_date")}
                    className="flex items-center gap-1 text-xs uppercase tracking-wider text-white/50 font-semibold hover:text-white/80"
                  >
                    Date <SortIcon field="record_date" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-white/50 font-semibold">
                  EID
                </th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-white/50 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((record) => (
                <tr
                  key={record.id}
                  className={`glass-table-row ${selectedIds.includes(record.id) ? "bg-white/10" : ""}`}
                >
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleSelect(record.id)}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      {selectedIds.includes(record.id) ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/records/${record.uuid}`}
                      className="font-semibold text-white hover:text-white/80 transition-colors"
                    >
                      {record.visual_tag}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-white/70">{record.breed || "\u2014"}</td>
                  <td className="px-5 py-3">
                    <GlassBadge variant={record.sex === "Male" ? "info" : "success"}>
                      {record.sex || "\u2014"}
                    </GlassBadge>
                  </td>
                  <td className="px-5 py-3 text-white/70">
                    {record.weight_kg ? `${record.weight_kg} kg` : "\u2014"}
                  </td>
                  <td className="px-5 py-3">
                    <GlassBadge
                      variant={
                        record.condition === "Excellent"
                          ? "success"
                          : record.condition === "Fair"
                            ? "warning"
                            : "default"
                      }
                    >
                      {record.condition || "\u2014"}
                    </GlassBadge>
                  </td>
                  <td className="px-5 py-3 text-white/50 text-sm">{record.record_date || "\u2014"}</td>
                  <td className="px-5 py-3 text-white/40 text-xs font-mono">{record.eid || "\u2014"}</td>
                  <td className="px-5 py-3">
                    {deleteConfirmId === record.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-red-300 mr-1">Delete?</span>
                        <button
                          onClick={() => handleDelete(record.id)}
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
                        <button
                          onClick={() => router.push(`/records/${record.uuid}`)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(record.id)}
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
              No records found matching your filters
            </div>
          )}
        </GlassCard>

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center mt-4">
            <GlassButton
              onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
              icon={<ChevronDown className="w-4 h-4" />}
            >
              Load More ({filtered.length - visibleCount} remaining)
            </GlassButton>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        {paginatedRecords.map((record) => (
          <div key={record.id} className="relative">
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleSelect(record.id)}
                className="mt-5 text-white/50 hover:text-white transition-colors flex-shrink-0"
              >
                {selectedIds.includes(record.id) ? (
                  <CheckSquare className="w-4 h-4 text-blue-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <Link href={`/records/${record.uuid}`}>
                  <GlassCard hover className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Beef className="w-6 h-6 text-white/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">{record.visual_tag}</p>
                        <GlassBadge variant={record.sex === "Male" ? "info" : "success"}>
                          {record.sex}
                        </GlassBadge>
                      </div>
                      <p className="text-sm text-white/50">
                        {record.breed} &middot; {record.weight_kg} kg &middot; {record.condition}
                      </p>
                    </div>
                  </GlassCard>
                </Link>
              </div>
              <div className="flex flex-col gap-1 mt-4 flex-shrink-0">
                <button
                  onClick={() => router.push(`/records/${record.uuid}`)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmId === record.id) {
                      handleDelete(record.id);
                    } else {
                      setDeleteConfirmId(record.id);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {deleteConfirmId === record.id && (
              <div className="ml-7 mb-2 flex items-center gap-2">
                <span className="text-xs text-red-300">Confirm delete?</span>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded bg-red-500/20"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="text-xs text-white/50 hover:text-white px-2 py-1 rounded bg-white/10"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Mobile Load More */}
        {hasMore && (
          <div className="flex justify-center mt-4">
            <GlassButton
              onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
              icon={<ChevronDown className="w-4 h-4" />}
            >
              Load More ({filtered.length - visibleCount} remaining)
            </GlassButton>
          </div>
        )}
      </div>
    </div>
  );
}
