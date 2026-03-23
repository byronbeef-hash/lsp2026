"use client";

import { useState } from "react";
import { GlassCard, GlassInput, GlassSelect, GlassButton } from "@/components/glass";
import { useRecordsStore } from "@/stores/modules";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FormErrors {
  visual_tag?: string;
  weight_kg?: string;
  sex?: string;
  [key: string]: string | undefined;
}

export default function NewRecordPage() {
  const router = useRouter();
  const addRecord = useRecordsStore((s) => s.addRecord);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({
    visual_tag: "",
    eid: "",
    breed: "",
    sex: "",
    weight_kg: "",
    weight_lb: "",
    condition: "",
    date_of_birth: "",
    record_date: new Date().toISOString().split("T")[0],
    mother_visual_tag: "",
    father_visual_tag: "",
    notes: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate weight_lb from weight_kg
      if (field === "weight_kg") {
        const kg = parseFloat(value);
        if (!isNaN(kg) && kg >= 0) {
          updated.weight_lb = (kg * 2.205).toFixed(1);
        } else {
          updated.weight_lb = "";
        }
      }

      // Auto-calculate weight_kg from weight_lb
      if (field === "weight_lb") {
        const lb = parseFloat(value);
        if (!isNaN(lb) && lb >= 0) {
          updated.weight_kg = (lb / 2.205).toFixed(1);
        } else {
          updated.weight_kg = "";
        }
      }

      return updated;
    });

    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.visual_tag.trim()) {
      newErrors.visual_tag = "Visual tag is required";
    }

    if (form.weight_kg) {
      const weight = parseFloat(form.weight_kg);
      if (isNaN(weight) || weight <= 0) {
        newErrors.weight_kg = "Weight must be a positive number";
      }
      if (weight > 2000) {
        newErrors.weight_kg = "Weight seems too high. Please check the value.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    await addRecord({
      uuid: crypto.randomUUID(),
      visual_tag: form.visual_tag.trim(),
      eid: form.eid.trim() || null,
      breed: form.breed.trim() || null,
      sex: (form.sex as "Male" | "Female") || null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      weight_lb: form.weight_lb ? parseFloat(form.weight_lb) : null,
      condition: form.condition || null,
      date_of_birth: form.date_of_birth || null,
      date_of_sale: null,
      date_of_death: null,
      record_date: form.record_date || null,
      notes: form.notes.trim() || null,
      is_pregnant: false,
      is_dehorn: false,
      mother_visual_tag: form.mother_visual_tag.trim() || null,
      father_visual_tag: form.father_visual_tag.trim() || null,
      profile_image: null,
      farm_uuid: null,
      paddock_id: null,
    });

    setLoading(false);
    setShowSuccess(true);

    // Redirect after showing success briefly
    setTimeout(() => {
      router.push("/records");
    }, 1500);
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <Link
        href="/records"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Records
      </Link>

      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">New Livestock Record</h1>
        <p className="text-white/50 mt-1">Add a new animal to your records</p>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="animate-fade-in-up">
          <GlassCard className="border-emerald-400/30 bg-emerald-500/10">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">Record Created Successfully</p>
                <p className="text-xs text-emerald-300/70">Redirecting to records list...</p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identification */}
        <GlassCard className="space-y-4 animate-fade-in-up" style={{ animationDelay: "50ms" } as React.CSSProperties}>
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
              error={errors.visual_tag}
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
              error={errors.sex}
              required
            />
          </div>
        </GlassCard>

        {/* Measurements */}
        <GlassCard className="space-y-4 animate-fade-in-up" style={{ animationDelay: "100ms" } as React.CSSProperties}>
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
              error={errors.weight_kg}
              min="0"
              step="0.1"
            />
            <GlassInput
              label="Weight (lb) - auto-calculated"
              name="weight_lb"
              type="number"
              placeholder="Auto-calculated from kg"
              value={form.weight_lb}
              onChange={(e) => updateField("weight_lb", e.target.value)}
              min="0"
              step="0.1"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div />
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
        <GlassCard className="space-y-4 animate-fade-in-up" style={{ animationDelay: "150ms" } as React.CSSProperties}>
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
        <GlassCard className="space-y-4 animate-fade-in-up" style={{ animationDelay: "200ms" } as React.CSSProperties}>
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

        {/* Actions */}
        <div className="flex gap-3 justify-end animate-fade-in-up" style={{ animationDelay: "250ms" } as React.CSSProperties}>
          <Link href="/records">
            <GlassButton type="button">Cancel</GlassButton>
          </Link>
          <GlassButton
            type="submit"
            variant="primary"
            loading={loading}
            disabled={showSuccess}
            icon={<Save className="w-4 h-4" />}
          >
            Save Record
          </GlassButton>
        </div>
      </form>
    </div>
  );
}
