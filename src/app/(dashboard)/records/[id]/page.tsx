"use client";

import { use, useState } from "react";
import { GlassCard, GlassBadge, GlassButton, GlassSheet } from "@/components/glass";
import { useRecordsStore, useMedicalStore } from "@/stores/modules";
import {
  Beef,
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Weight,
  Heart,
  Tag,
  Fingerprint,
  Printer,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Syringe,
  Activity,
  FileText,
  Clock,
  Plus,
  Scale,
  ArrowRightLeft,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

type TabKey = "overview" | "weight" | "medical" | "activity";

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <Icon className="w-4 h-4 text-white/40 flex-shrink-0" />
      <span className="text-sm text-white/50 w-32 flex-shrink-0">{label}</span>
      <span className="text-sm text-white/90">{value}</span>
    </div>
  );
}

export default function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const getRecordById = useRecordsStore((s) => s.getRecordById);
  const deleteRecord = useRecordsStore((s) => s.deleteRecord);
  const records = useRecordsStore((s) => s.records);
  const batches = useMedicalStore((s) => s.batches);

  // Find record by uuid
  const record = records.find((r) => r.uuid === id);

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [markedForSale, setMarkedForSale] = useState(false);

  if (!record) return notFound();

  // Mock weight history for this animal
  const weightHistory = [
    { date: "2025-12-05", weight_kg: (record.weight_kg ?? 450) - 32, notes: "Routine weigh-in" },
    { date: "2026-01-10", weight_kg: (record.weight_kg ?? 450) - 18, notes: "Post-treatment weigh" },
    { date: "2026-02-08", weight_kg: (record.weight_kg ?? 450) - 7, notes: "Monthly weigh-in" },
    { date: record.record_date ?? "2026-03-01", weight_kg: record.weight_kg ?? 450, notes: "Latest weigh-in" },
  ];

  // Medical batches this animal is in
  const animalMedicalBatches = batches.filter((b) =>
    b.animals.includes(record.visual_tag)
  );

  // Mock activity log
  const activityLog = [
    {
      id: 1,
      type: "added",
      description: `${record.visual_tag} added to the system`,
      date: record.created_at,
      icon: Plus,
    },
    {
      id: 2,
      type: "weighed",
      description: `Weighed at ${record.weight_kg} kg during routine weigh-in`,
      date: record.record_date ?? "2026-03-01",
      icon: Scale,
    },
    {
      id: 3,
      type: "treated",
      description: "Spring Vaccination 2026 - Bovilis MH+IBR administered",
      date: "2026-03-01",
      icon: Syringe,
    },
    {
      id: 4,
      type: "moved",
      description: `Moved to paddock ${record.paddock_id ?? "N/A"}`,
      date: "2026-02-15",
      icon: ArrowRightLeft,
    },
    {
      id: 5,
      type: "weighed",
      description: `Weighed at ${(record.weight_kg ?? 450) - 7} kg`,
      date: "2026-02-08",
      icon: Scale,
    },
    {
      id: 6,
      type: "treated",
      description: "Clostridial Booster - Ultravac 7in1 administered",
      date: "2026-02-10",
      icon: Syringe,
    },
  ];

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: FileText },
    { key: "weight", label: "Weight History", icon: Weight },
    { key: "medical", label: "Medical History", icon: Syringe },
    { key: "activity", label: "Activity Log", icon: Activity },
  ];

  const handleDelete = () => {
    deleteRecord(record.id);
    router.push("/records");
  };

  const handleExport = () => {
    const headers = [
      "visual_tag", "eid", "breed", "sex", "weight_kg", "weight_lb",
      "condition", "date_of_birth", "record_date", "notes",
    ];
    const csvRows = [
      headers.join(","),
      headers
        .map((h) => {
          const val = record[h as keyof typeof record];
          if (val == null) return "";
          const str = String(val);
          return str.includes(",") ? `"${str}"` : str;
        })
        .join(","),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.visual_tag}-record.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Back button */}
      <Link
        href="/records"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Records
      </Link>

      {/* Header Card */}
      <GlassCard className="animate-fade-in-up">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Beef className="w-8 h-8 text-white/60" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-xl font-bold text-white">{record.visual_tag}</h1>
              <GlassBadge variant={record.sex === "Male" ? "info" : "success"}>
                {record.sex}
              </GlassBadge>
              {record.is_pregnant && (
                <GlassBadge variant="warning">Pregnant</GlassBadge>
              )}
              {markedForSale && (
                <GlassBadge variant="danger">For Sale</GlassBadge>
              )}
            </div>
            <p className="text-white/50">
              {record.breed} &middot;{" "}
              <GlassBadge
                variant={
                  record.condition === "Excellent"
                    ? "success"
                    : record.condition === "Fair"
                      ? "warning"
                      : "default"
                }
              >
                {record.condition}
              </GlassBadge>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap flex-shrink-0">
            <Link href={`/records/${record.uuid}/edit`}>
              <GlassButton size="sm" icon={<Edit className="w-4 h-4" />}>
                Edit
              </GlassButton>
            </Link>
            <GlassButton
              size="sm"
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => setShowDeleteConfirm(true)}
            />
          </div>
        </div>
      </GlassCard>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap animate-fade-in-up" style={{ animationDelay: "25ms" } as React.CSSProperties}>
        <GlassButton
          size="sm"
          variant={markedForSale ? "danger" : "default"}
          icon={<DollarSign className="w-4 h-4" />}
          onClick={() => setMarkedForSale(!markedForSale)}
        >
          {markedForSale ? "Unmark for Sale" : "Mark for Sale"}
        </GlassButton>
        <GlassButton
          size="sm"
          icon={<Printer className="w-4 h-4" />}
          onClick={handleExport}
        >
          Print / Export
        </GlassButton>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 glass p-1 rounded-2xl w-fit animate-fade-in-up overflow-x-auto"
        style={{ animationDelay: "50ms" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <GlassCard
              className="animate-fade-in-up"
              style={{ animationDelay: "75ms" } as React.CSSProperties}
            >
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                Identification
              </h2>
              <DetailRow icon={Tag} label="Visual Tag" value={record.visual_tag} />
              <DetailRow
                icon={Fingerprint}
                label="EID"
                value={
                  record.eid ? (
                    <span className="font-mono text-xs">{record.eid}</span>
                  ) : (
                    <span className="text-white/30">Not assigned</span>
                  )
                }
              />
              <DetailRow icon={Beef} label="Breed" value={record.breed} />
              <DetailRow
                icon={Heart}
                label="Sex"
                value={
                  <GlassBadge variant={record.sex === "Male" ? "info" : "success"}>
                    {record.sex}
                  </GlassBadge>
                }
              />
            </GlassCard>

            <GlassCard
              className="animate-fade-in-up"
              style={{ animationDelay: "100ms" } as React.CSSProperties}
            >
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                Measurements
              </h2>
              <DetailRow
                icon={Weight}
                label="Weight"
                value={
                  record.weight_kg
                    ? `${record.weight_kg} kg (${record.weight_lb} lb)`
                    : null
                }
              />
              <DetailRow
                icon={Calendar}
                label="Record Date"
                value={record.record_date}
              />
              <DetailRow
                icon={Calendar}
                label="Date of Birth"
                value={record.date_of_birth}
              />
              <DetailRow
                icon={Heart}
                label="Condition"
                value={
                  <GlassBadge
                    variant={
                      record.condition === "Excellent"
                        ? "success"
                        : record.condition === "Fair"
                          ? "warning"
                          : "default"
                    }
                  >
                    {record.condition}
                  </GlassBadge>
                }
              />
            </GlassCard>
          </div>

          {/* Lineage */}
          <GlassCard
            className="animate-fade-in-up"
            style={{ animationDelay: "125ms" } as React.CSSProperties}
          >
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
              Lineage
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-1">Mother</p>
                <p className="text-white/80 font-medium">
                  {record.mother_visual_tag || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Father</p>
                <p className="text-white/80 font-medium">
                  {record.father_visual_tag || "Unknown"}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Notes */}
          {record.notes && (
            <GlassCard
              className="animate-fade-in-up"
              style={{ animationDelay: "150ms" } as React.CSSProperties}
            >
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                Notes
              </h2>
              <p className="text-white/70 text-sm">{record.notes}</p>
            </GlassCard>
          )}
        </>
      )}

      {activeTab === "weight" && (
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "75ms" } as React.CSSProperties}>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
            Weight History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                    Date
                  </th>
                  <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                    Weight (kg)
                  </th>
                  <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                    Change
                  </th>
                  <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {weightHistory.map((entry, index) => {
                  const prevWeight = index > 0 ? weightHistory[index - 1].weight_kg : null;
                  const change = prevWeight !== null ? entry.weight_kg - prevWeight : null;
                  return (
                    <tr key={index} className="border-b border-white/5">
                      <td className="px-4 py-3 text-sm text-white/70">{entry.date}</td>
                      <td className="px-4 py-3 text-sm text-white font-medium">{entry.weight_kg} kg</td>
                      <td className="px-4 py-3">
                        {change !== null ? (
                          <span
                            className={`inline-flex items-center gap-1 text-sm font-medium ${
                              change > 0
                                ? "text-emerald-400"
                                : change < 0
                                  ? "text-red-400"
                                  : "text-white/50"
                            }`}
                          >
                            {change > 0 ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : change < 0 ? (
                              <TrendingDown className="w-3.5 h-3.5" />
                            ) : (
                              <Minus className="w-3.5 h-3.5" />
                            )}
                            {change > 0 ? "+" : ""}
                            {change} kg
                          </span>
                        ) : (
                          <span className="text-sm text-white/30">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-white/50">{entry.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Weight summary */}
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-white/40 mb-1">Total Gain</p>
              <p className="text-lg font-bold text-emerald-400">
                +{weightHistory[weightHistory.length - 1].weight_kg - weightHistory[0].weight_kg} kg
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Avg. Monthly Gain</p>
              <p className="text-lg font-bold text-white">
                +{Math.round((weightHistory[weightHistory.length - 1].weight_kg - weightHistory[0].weight_kg) / (weightHistory.length - 1))} kg
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Current Weight</p>
              <p className="text-lg font-bold text-white">{record.weight_kg} kg</p>
            </div>
          </div>
        </GlassCard>
      )}

      {activeTab === "medical" && (
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "75ms" } as React.CSSProperties}>
          {animalMedicalBatches.length > 0 ? (
            animalMedicalBatches.map((batch) => (
              <Link href={`/medical/${batch.id}`} key={batch.id}>
                <GlassCard hover className="mb-3">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Syringe className="w-6 h-6 text-white/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-white">{batch.batch_name}</p>
                        <GlassBadge
                          variant={
                            batch.status === "active"
                              ? "success"
                              : batch.status === "scheduled"
                                ? "info"
                                : "default"
                          }
                        >
                          {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                        </GlassBadge>
                      </div>
                      <p className="text-sm text-white/50">
                        {batch.treatment_type} &middot; {batch.medication}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {batch.dosage} &middot; Scheduled: {batch.scheduled_date}
                        {batch.completed_date ? ` &middot; Completed: ${batch.completed_date}` : ""}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))
          ) : (
            <GlassCard>
              <div className="text-center py-8 text-white/40">
                <Syringe className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No medical records for this animal</p>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "75ms" } as React.CSSProperties}>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
            Activity Log
          </h2>
          <div className="space-y-0">
            {activityLog.map((entry, index) => (
              <div
                key={entry.id}
                className="flex gap-4 py-3 border-b border-white/5 last:border-0"
              >
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <entry.icon className="w-4 h-4 text-white/60" />
                  </div>
                  {index < activityLog.length - 1 && (
                    <div className="w-px h-full bg-white/10 absolute top-8" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <p className="text-sm text-white/80">{entry.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-white/30" />
                    <p className="text-xs text-white/40">
                      {new Date(entry.date).toLocaleDateString("en-AU", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <GlassBadge variant="default">{entry.type}</GlassBadge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Delete Confirmation Modal */}
      <GlassSheet
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Record"
      >
        <div className="space-y-4">
          <p className="text-white/70">
            Are you sure you want to delete <span className="font-semibold text-white">{record.visual_tag}</span>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <GlassButton onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={handleDelete}
            >
              Delete Record
            </GlassButton>
          </div>
        </div>
      </GlassSheet>
    </div>
  );
}
