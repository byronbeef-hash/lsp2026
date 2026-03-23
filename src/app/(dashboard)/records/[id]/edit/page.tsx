"use client";

import { use, useState } from "react";
import { GlassCard, GlassInput, GlassSelect, GlassButton, GlassSheet } from "@/components/glass";
import { useRecordsStore } from "@/stores/modules";
import { ArrowLeft, Save, Trash2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

export default function EditRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const records = useRecordsStore((s) => s.records);
  const updateRecord = useRecordsStore((s) => s.updateRecord);
  const deleteRecord = useRecordsStore((s) => s.deleteRecord);

  const record = records.find((r) => r.uuid === id || r.id.toString() === id);

  if (!record) return notFound();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [markForSale, setMarkForSale] = useState(false);

  const [form, setForm] = useState({
    visual_tag: record.visual_tag || "",
    eid: record.eid || "",
    breed: record.breed || "",
    sex: record.sex || "",
    weight_kg: record.weight_kg?.toString() || "",
    condition: record.condition || "",
    record_date: record.record_date || "",
    date_of_birth: record.date_of_birth || "",
    mother_visual_tag: record.mother_visual_tag || "",
    father_visual_tag: record.father_visual_tag || "",
    notes: record.notes || "",
    is_pregnant: record.is_pregnant,
    is_dehorn: record.is_dehorn,
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const weight_kg = form.weight_kg ? parseFloat(form.weight_kg) : null;
    updateRecord(record.id, {
      visual_tag: form.visual_tag.trim(),
      eid: form.eid.trim() || null,
      breed: form.breed.trim() || null,
      sex: (form.sex as "Male" | "Female") || null,
      weight_kg,
      weight_lb: weight_kg ? parseFloat((weight_kg * 2.205).toFixed(1)) : null,
      condition: form.condition || null,
      record_date: form.record_date || null,
      date_of_birth: form.date_of_birth || null,
      mother_visual_tag: form.mother_visual_tag.trim() || null,
      father_visual_tag: form.father_visual_tag.trim() || null,
      notes: form.notes.trim() || null,
      is_pregnant: form.is_pregnant,
      is_dehorn: form.is_dehorn,
    });

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    deleteRecord(record.id);
    router.push("/records");
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <Link
        href={`/records/${record.uuid}`}
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Record
      </Link>

      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">
          Edit Record: {record.visual_tag}
        </h1>
        <p className="text-white/50 mt-1">
          Update livestock record details
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm animate-fade-in-up">
          <CheckCircle className="w-4 h-4" />
          Record updated successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identification */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "50ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Identification
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Visual Tag *"
              name="visual_tag"
              placeholder="e.g. AU-0148"
              value={form.visual_tag}
              onChange={(e) => updateField("visual_tag", e.target.value)}
              required
            />
            <GlassInput
              label="EID"
              name="eid"
              placeholder="Electronic ID (optional)"
              value={form.eid}
              onChange={(e) => updateField("eid", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Breed"
              name="breed"
              placeholder="e.g. Angus"
              value={form.breed}
              onChange={(e) => updateField("breed", e.target.value)}
            />
            <GlassSelect
              label="Sex *"
              name="sex"
              placeholder="Select sex"
              value={form.sex}
              onChange={(e) => updateField("sex", e.target.value)}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
              ]}
              required
            />
          </div>
        </GlassCard>

        {/* Measurements */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "100ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Measurements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Weight (kg)"
              name="weight_kg"
              type="number"
              placeholder="e.g. 480"
              value={form.weight_kg}
              onChange={(e) => updateField("weight_kg", e.target.value)}
              min="0"
              step="0.1"
            />
            <GlassSelect
              label="Condition"
              name="condition"
              placeholder="Select condition"
              value={form.condition}
              onChange={(e) => updateField("condition", e.target.value)}
              options={[
                { value: "Excellent", label: "Excellent" },
                { value: "Good", label: "Good" },
                { value: "Fair", label: "Fair" },
                { value: "Poor", label: "Poor" },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Record Date"
              name="record_date"
              type="date"
              value={form.record_date}
              onChange={(e) => updateField("record_date", e.target.value)}
            />
            <GlassInput
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={(e) => updateField("date_of_birth", e.target.value)}
            />
          </div>
        </GlassCard>

        {/* Lineage */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "150ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Lineage
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Mother Tag"
              name="mother_visual_tag"
              placeholder="Mother's visual tag"
              value={form.mother_visual_tag}
              onChange={(e) => updateField("mother_visual_tag", e.target.value)}
            />
            <GlassInput
              label="Father Tag"
              name="father_visual_tag"
              placeholder="Father's visual tag"
              value={form.father_visual_tag}
              onChange={(e) => updateField("father_visual_tag", e.target.value)}
            />
          </div>
        </GlassCard>

        {/* Notes */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "200ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Notes
          </h2>
          <textarea
            name="notes"
            placeholder="Add any additional notes..."
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            rows={3}
            className="glass-input resize-none"
          />
        </GlassCard>

        {/* Status */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "250ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Status
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${
                  form.is_pregnant ? "bg-emerald-500/60" : "bg-white/15"
                }`}
                onClick={() => updateField("is_pregnant", !form.is_pregnant)}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    form.is_pregnant ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </div>
              <span className="text-sm text-white/80">Pregnant</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${
                  form.is_dehorn ? "bg-emerald-500/60" : "bg-white/15"
                }`}
                onClick={() => updateField("is_dehorn", !form.is_dehorn)}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    form.is_dehorn ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </div>
              <span className="text-sm text-white/80">Dehorned</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={markForSale}
                onChange={(e) => setMarkForSale(e.target.checked)}
                className="w-4 h-4 rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-emerald-500/50"
              />
              <span className="text-sm text-white/80">Mark for Sale</span>
            </label>
          </div>
        </GlassCard>

        {/* Actions */}
        <div
          className="flex gap-3 justify-between animate-fade-in-up"
          style={{ animationDelay: "300ms" } as React.CSSProperties}
        >
          <GlassButton
            type="button"
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Record
          </GlassButton>
          <div className="flex gap-3">
            <Link href={`/records/${record.uuid}`}>
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
        title="Delete Record"
      >
        <div className="space-y-4">
          <p className="text-white/70 text-sm">
            Are you sure you want to delete the record for{" "}
            <strong className="text-white">{record.visual_tag}</strong>? This
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
