"use client";

import { useState } from "react";
import { GlassCard, GlassInput, GlassSelect, GlassButton } from "@/components/glass";
import { useMedicalStore } from "@/stores/modules";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewTreatmentPage() {
  const router = useRouter();
  const addBatch = useMedicalStore((s) => s.addBatch);

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({
    batch_name: "",
    treatment_type: "",
    medication: "",
    dosage: "",
    administered_by: "",
    scheduled_date: new Date().toISOString().split("T")[0],
    animal_count: "",
    notes: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await addBatch({
      uuid: crypto.randomUUID(),
      batch_name: form.batch_name.trim(),
      status: "scheduled",
      treatment_type: form.treatment_type,
      medication: form.medication.trim(),
      dosage: form.dosage.trim(),
      administered_by: form.administered_by.trim(),
      animal_count: parseInt(form.animal_count) || 0,
      animals: [],
      scheduled_date: form.scheduled_date,
      completed_date: null,
      notes: form.notes.trim() || null,
      farm_uuid: null,
    });

    setLoading(false);
    setShowSuccess(true);

    setTimeout(() => {
      router.push("/medical");
    }, 1500);
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <Link
        href="/medical"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Medical Batches
      </Link>

      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">New Treatment</h1>
        <p className="text-white/50 mt-1">
          Create a new medical treatment batch
        </p>
      </div>

      {showSuccess && (
        <div className="animate-fade-in-up">
          <GlassCard className="border-emerald-400/30 bg-emerald-500/10">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">Treatment Batch Created</p>
                <p className="text-xs text-emerald-300/70">Redirecting to medical batches...</p>
              </div>
            </div>
          </GlassCard>
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
        </GlassCard>

        {/* Animals */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "150ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Animals
          </h2>
          <GlassInput
            label="Animal Count *"
            name="animal_count"
            type="number"
            placeholder="e.g. 85"
            value={form.animal_count}
            onChange={(e) => updateField("animal_count", e.target.value)}
            min="1"
            required
          />
          <div className="space-y-1.5">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-white/70"
            >
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Add any additional notes about this treatment..."
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
              className="glass-input resize-none"
            />
          </div>
        </GlassCard>

        {/* Actions */}
        <div
          className="flex gap-3 justify-end animate-fade-in-up"
          style={{ animationDelay: "200ms" } as React.CSSProperties}
        >
          <Link href="/medical">
            <GlassButton type="button">Cancel</GlassButton>
          </Link>
          <GlassButton
            type="submit"
            variant="primary"
            loading={loading}
            disabled={showSuccess}
            icon={<Save className="w-4 h-4" />}
          >
            Save Treatment
          </GlassButton>
        </div>
      </form>
    </div>
  );
}
