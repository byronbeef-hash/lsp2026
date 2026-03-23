"use client";

import { use, useState } from "react";
import { GlassCard, GlassBadge, GlassButton, GlassSheet } from "@/components/glass";
import { useMedicalStore, useRecordsStore } from "@/stores/modules";
import {
  ArrowLeft,
  Syringe,
  Calendar,
  Users,
  Pill,
  User,
  CheckCircle,
  Edit,
  Printer,
  FileText,
  Tag,
  Trash2,
  Plus,
  Search,
  X,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import type { MedicalBatch } from "@/types";

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

export default function MedicalBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const getBatchById = useMedicalStore((s) => s.getBatchById);
  const deleteBatch = useMedicalStore((s) => s.deleteBatch);
  const completeBatch = useMedicalStore((s) => s.completeBatch);
  const addAnimalToBatch = useMedicalStore((s) => s.addAnimalToBatch);
  const removeAnimalFromBatch = useMedicalStore((s) => s.removeAnimalFromBatch);
  // Subscribe to batches for live updates
  const batches = useMedicalStore((s) => s.batches);
  const records = useRecordsStore((s) => s.records);

  const batchId = Number(id);
  const batch = batches.find((b) => b.id === batchId);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [animalSearch, setAnimalSearch] = useState("");
  const [showAddAnimal, setShowAddAnimal] = useState(false);

  if (!batch) return notFound();

  // All available animal tags for adding
  const availableAnimals = records.filter(
    (r) => !batch.animals.includes(r.visual_tag)
  );
  const filteredAvailableAnimals = availableAnimals.filter((r) =>
    r.visual_tag.toLowerCase().includes(animalSearch.toLowerCase()) ||
    r.breed?.toLowerCase().includes(animalSearch.toLowerCase())
  );

  // Mock treatment timeline
  const timeline = [
    {
      id: 1,
      type: "created",
      description: `Batch "${batch.batch_name}" created`,
      date: batch.created_at,
      icon: Plus,
    },
    ...batch.animals.slice(0, 3).map((tag, idx) => ({
      id: idx + 10,
      type: "animal_added",
      description: `${tag} added to batch`,
      date: new Date(new Date(batch.created_at).getTime() + idx * 3600000).toISOString(),
      icon: Tag,
    })),
    {
      id: 20,
      type: "treatment_started",
      description: `Treatment started - ${batch.medication} administered`,
      date: batch.scheduled_date + "T08:00:00Z",
      icon: Syringe,
    },
    ...(batch.completed_date
      ? [
          {
            id: 30,
            type: "completed",
            description: "Batch marked as completed",
            date: batch.completed_date + "T17:00:00Z",
            icon: CheckCircle,
          },
        ]
      : []),
  ];

  const handleCompleteBatch = () => {
    completeBatch(batchId);
  };

  const handleDelete = () => {
    deleteBatch(batchId);
    router.push("/medical");
  };

  const handleRemoveAnimal = (tag: string) => {
    removeAnimalFromBatch(batchId, tag);
  };

  const handleAddAnimal = (tag: string) => {
    addAnimalToBatch(batchId, tag);
    setAnimalSearch("");
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/medical"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Medical Batches
      </Link>

      {/* Header Card */}
      <GlassCard className="animate-fade-in-up">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Syringe className="w-8 h-8 text-white/60" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-xl font-bold text-white">
                {batch.batch_name}
              </h1>
              <GlassBadge variant={statusBadgeVariant(batch.status)}>
                {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
              </GlassBadge>
            </div>
            <p className="text-white/50 text-sm">
              {batch.treatment_type} &middot; {batch.animal_count} animals
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link href={`/medical/${batch.id}/edit`}>
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
        {batch.status !== "completed" && (
          <GlassButton
            variant="primary"
            icon={<CheckCircle className="w-4 h-4" />}
            onClick={handleCompleteBatch}
          >
            Complete Batch
          </GlassButton>
        )}
        <GlassButton icon={<Printer className="w-4 h-4" />}>Print</GlassButton>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Treatment Details */}
        <GlassCard
          className="animate-fade-in-up"
          style={{ animationDelay: "50ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
            Treatment Details
          </h2>
          <DetailRow
            icon={Syringe}
            label="Type"
            value={batch.treatment_type}
          />
          <DetailRow icon={Pill} label="Medication" value={batch.medication} />
          <DetailRow icon={FileText} label="Dosage" value={batch.dosage} />
          <DetailRow
            icon={User}
            label="Administered By"
            value={batch.administered_by}
          />
        </GlassCard>

        {/* Schedule */}
        <GlassCard
          className="animate-fade-in-up"
          style={{ animationDelay: "100ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
            Schedule
          </h2>
          <DetailRow
            icon={Calendar}
            label="Scheduled Date"
            value={batch.scheduled_date}
          />
          <DetailRow
            icon={CheckCircle}
            label="Completed Date"
            value={
              batch.completed_date || (
                <span className="text-white/30">Not yet completed</span>
              )
            }
          />
        </GlassCard>
      </div>

      {/* Animals */}
      <GlassCard
        className="animate-fade-in-up"
        style={{ animationDelay: "150ms" } as React.CSSProperties}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Animals ({batch.animals.length})
          </h2>
          <GlassButton
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddAnimal(!showAddAnimal)}
          >
            Add Animal
          </GlassButton>
        </div>

        {/* Add Animal Search */}
        {showAddAnimal && (
          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search animals by tag or breed..."
                value={animalSearch}
                onChange={(e) => setAnimalSearch(e.target.value)}
                className="glass-input pl-10 text-sm"
              />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredAvailableAnimals.length > 0 ? (
                filteredAvailableAnimals.slice(0, 10).map((animal) => (
                  <button
                    key={animal.id}
                    onClick={() => handleAddAnimal(animal.visual_tag)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{animal.visual_tag}</span>
                      <span className="text-xs text-white/40">{animal.breed}</span>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-white/40" />
                  </button>
                ))
              ) : (
                <p className="text-sm text-white/30 text-center py-2">
                  {animalSearch ? "No animals found" : "All animals are already in this batch"}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Animals List */}
        <div className="flex flex-wrap gap-2">
          {batch.animals.map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-blue-500/20 text-blue-300 border border-blue-400/20"
            >
              <Link
                href={`/records/${records.find((r) => r.visual_tag === tag)?.uuid || ""}`}
                className="hover:text-blue-200 transition-colors"
              >
                {tag}
              </Link>
              <button
                onClick={() => handleRemoveAnimal(tag)}
                className="hover:text-red-300 transition-colors ml-1"
                title={`Remove ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {batch.animals.length === 0 && (
          <p className="text-sm text-white/30 text-center py-4">
            No animals in this batch
          </p>
        )}
      </GlassCard>

      {/* Treatment Timeline */}
      <GlassCard
        className="animate-fade-in-up"
        style={{ animationDelay: "200ms" } as React.CSSProperties}
      >
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
          Treatment Timeline
        </h2>
        <div className="space-y-0">
          {timeline.map((entry, index) => (
            <div
              key={entry.id}
              className="flex gap-4 py-3 border-b border-white/5 last:border-0"
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    entry.type === "completed"
                      ? "bg-emerald-500/20"
                      : entry.type === "treatment_started"
                        ? "bg-blue-500/20"
                        : "bg-white/10"
                  }`}
                >
                  <entry.icon
                    className={`w-4 h-4 ${
                      entry.type === "completed"
                        ? "text-emerald-400"
                        : entry.type === "treatment_started"
                          ? "text-blue-400"
                          : "text-white/60"
                    }`}
                  />
                </div>
                {index < timeline.length - 1 && (
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Notes */}
      {batch.notes && (
        <GlassCard
          className="animate-fade-in-up"
          style={{ animationDelay: "250ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
            Notes
          </h2>
          <p className="text-white/70 text-sm">{batch.notes}</p>
        </GlassCard>
      )}

      {/* Delete Confirmation Modal */}
      <GlassSheet
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Medical Batch"
      >
        <div className="space-y-4">
          <p className="text-white/70">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">{batch.batch_name}</span>?
            This will remove all treatment records for {batch.animal_count} animals.
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
              Delete Batch
            </GlassButton>
          </div>
        </div>
      </GlassSheet>
    </div>
  );
}
