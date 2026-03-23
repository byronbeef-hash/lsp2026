"use client";

import { use, useState } from "react";
import {
  GlassCard,
  GlassInput,
  GlassSelect,
  GlassButton,
  GlassBadge,
  GlassSheet,
} from "@/components/glass";
import { useMedicalStore, useRecordsStore } from "@/stores/modules";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

export default function EditMedicalBatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const batches = useMedicalStore((s) => s.batches);
  const updateBatch = useMedicalStore((s) => s.updateBatch);
  const deleteBatch = useMedicalStore((s) => s.deleteBatch);
  const records = useRecordsStore((s) => s.records);

  const batchId = Number(id);
  const batch = batches.find((b) => b.uuid === id || b.id === batchId);

  if (!batch) return notFound();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newAnimalTag, setNewAnimalTag] = useState("");

  const [form, setForm] = useState({
    batch_name: batch.batch_name,
    treatment_type: batch.treatment_type,
    medication: batch.medication,
    dosage: batch.dosage,
    administered_by: batch.administered_by,
    scheduled_date: batch.scheduled_date,
    notes: batch.notes || "",
    status: batch.status,
  });

  const [animals, setAnimals] = useState<string[]>([...batch.animals]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addAnimal = () => {
    const tag = newAnimalTag.trim().toUpperCase();
    if (tag && !animals.includes(tag)) {
      setAnimals((prev) => [...prev, tag]);
      setNewAnimalTag("");
    }
  };

  const removeAnimal = (tag: string) => {
    setAnimals((prev) => prev.filter((a) => a !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    updateBatch(batch.id, {
      batch_name: form.batch_name.trim(),
      treatment_type: form.treatment_type,
      medication: form.medication.trim(),
      dosage: form.dosage.trim(),
      administered_by: form.administered_by.trim(),
      scheduled_date: form.scheduled_date,
      notes: form.notes.trim() || null,
      status: form.status as "active" | "completed" | "scheduled",
      animals,
      animal_count: animals.length,
    });

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    deleteBatch(batch.id);
    router.push("/medical");
  };

  const availableAnimals = records
    .filter((r) => !animals.includes(r.visual_tag))
    .map((r) => r.visual_tag);

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <Link
        href={`/medical/${batch.id}`}
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Batch Details
      </Link>

      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">
          Edit: {batch.batch_name}
        </h1>
        <p className="text-white/50 mt-1">
          Update medical treatment batch details
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm animate-fade-in-up">
          <CheckCircle className="w-4 h-4" />
          Treatment batch updated successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Treatment Info */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "50ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Treatment Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Batch Name *"
              name="batch_name"
              placeholder="e.g. Spring Vaccination 2026"
              value={form.batch_name}
              onChange={(e) => updateField("batch_name", e.target.value)}
              required
            />
            <GlassSelect
              label="Treatment Type *"
              name="treatment_type"
              placeholder="Select type"
              value={form.treatment_type}
              onChange={(e) => updateField("treatment_type", e.target.value)}
              options={[
                { value: "Vaccination", label: "Vaccination" },
                { value: "Drench", label: "Drench" },
                { value: "Treatment", label: "Treatment" },
                { value: "Examination", label: "Examination" },
              ]}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Medication *"
              name="medication"
              placeholder="e.g. Bovilis MH+IBR"
              value={form.medication}
              onChange={(e) => updateField("medication", e.target.value)}
              required
            />
            <GlassInput
              label="Dosage *"
              name="dosage"
              placeholder="e.g. 2ml subcutaneous"
              value={form.dosage}
              onChange={(e) => updateField("dosage", e.target.value)}
              required
            />
          </div>
        </GlassCard>

        {/* Administration */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "100ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Administration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Administered By *"
              name="administered_by"
              placeholder="e.g. Dr. Sarah Mitchell"
              value={form.administered_by}
              onChange={(e) => updateField("administered_by", e.target.value)}
              required
            />
            <GlassInput
              label="Scheduled Date *"
              name="scheduled_date"
              type="date"
              value={form.scheduled_date}
              onChange={(e) => updateField("scheduled_date", e.target.value)}
              required
            />
          </div>
          <GlassSelect
            label="Status"
            name="status"
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
            options={[
              { value: "scheduled", label: "Scheduled" },
              { value: "active", label: "Active" },
              { value: "completed", label: "Completed" },
            ]}
          />
        </GlassCard>

        {/* Notes */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "150ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Notes
          </h2>
          <textarea
            name="notes"
            placeholder="Add any additional notes about this treatment..."
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            rows={3}
            className="glass-input resize-none"
          />
        </GlassCard>

        {/* Animal Management */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "200ms" } as React.CSSProperties}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              Animals in Batch
            </h2>
            <GlassBadge variant="default">{animals.length} animals</GlassBadge>
          </div>

          {/* Animal List */}
          <div className="space-y-2">
            {animals.map((tag) => (
              <div
                key={tag}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 border border-white/5"
              >
                <span className="text-sm text-white/80 font-medium">{tag}</span>
                <button
                  type="button"
                  onClick={() => removeAnimal(tag)}
                  className="p-1 rounded-full hover:bg-red-500/20 text-white/40 hover:text-red-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Animal */}
          <div className="flex gap-2">
            <div className="flex-1">
              <GlassInput
                name="new_animal"
                placeholder="Enter animal tag (e.g. AU-0150)"
                value={newAnimalTag}
                onChange={(e) => setNewAnimalTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAnimal();
                  }
                }}
              />
            </div>
            <GlassButton
              type="button"
              onClick={addAnimal}
              icon={<Plus className="w-4 h-4" />}
            >
              Add
            </GlassButton>
          </div>

          {availableAnimals.length > 0 && (
            <div>
              <p className="text-xs text-white/40 mb-2">Quick add from records:</p>
              <div className="flex flex-wrap gap-1.5">
                {availableAnimals.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setAnimals((prev) => [...prev, tag])
                    }
                    className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Actions */}
        <div
          className="flex gap-3 justify-between animate-fade-in-up"
          style={{ animationDelay: "250ms" } as React.CSSProperties}
        >
          <GlassButton
            type="button"
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Batch
          </GlassButton>
          <div className="flex gap-3">
            <Link href={`/medical/${batch.id}`}>
              <GlassButton type="button">Cancel</GlassButton>
            </Link>
            <GlassButton
              type="submit"
              variant="primary"
              loading={loading}
              icon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </GlassButton>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Sheet */}
      <GlassSheet
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Treatment Batch"
      >
        <div className="space-y-4">
          <p className="text-white/70 text-sm">
            Are you sure you want to delete{" "}
            <strong className="text-white">{batch.batch_name}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <GlassButton
              onClick={() => setShowDeleteConfirm(false)}
              icon={<XCircle className="w-4 h-4" />}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="danger"
              onClick={handleDelete}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Delete Permanently
            </GlassButton>
          </div>
        </div>
      </GlassSheet>
    </div>
  );
}
