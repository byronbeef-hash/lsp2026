"use client";

import { useState } from "react";
import { GlassCard, GlassInput, GlassSelect, GlassButton } from "@/components/glass";
import { usePaddockStore } from "@/stores/modules";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewPaddockPage() {
  const router = useRouter();
  const addPaddock = usePaddockStore((s) => s.addPaddock);

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    area_hectares: "",
    capacity: "",
    pasture_type: "",
    water_source: false,
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await addPaddock({
      uuid: crypto.randomUUID(),
      name: form.name.trim(),
      area_hectares: parseFloat(form.area_hectares) || 0,
      capacity: parseInt(form.capacity) || 0,
      current_count: 0,
      status: "active",
      pasture_type: form.pasture_type,
      water_source: form.water_source,
      lat: 0,
      lng: 0,
      farm_uuid: null,
    });

    setLoading(false);
    setShowSuccess(true);

    setTimeout(() => {
      router.push("/paddocks");
    }, 1500);
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <Link
        href="/paddocks"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Paddocks
      </Link>

      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">New Paddock</h1>
        <p className="text-white/50 mt-1">Add a new paddock to your property</p>
      </div>

      {showSuccess && (
        <div className="animate-fade-in-up">
          <GlassCard className="border-emerald-400/30 bg-emerald-500/10">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">Paddock Created Successfully</p>
                <p className="text-xs text-emerald-300/70">Redirecting to paddocks...</p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Paddock Details */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "50ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Paddock Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Paddock Name *"
              name="name"
              placeholder="e.g. North Paddock"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
            <GlassInput
              label="Area (hectares) *"
              name="area_hectares"
              type="number"
              placeholder="e.g. 45"
              value={form.area_hectares}
              onChange={(e) => updateField("area_hectares", e.target.value)}
              min="0"
              step="0.1"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Capacity (head) *"
              name="capacity"
              type="number"
              placeholder="e.g. 80"
              value={form.capacity}
              onChange={(e) => updateField("capacity", e.target.value)}
              min="0"
              required
            />
            <GlassSelect
              label="Pasture Type *"
              name="pasture_type"
              placeholder="Select pasture type"
              value={form.pasture_type}
              onChange={(e) => updateField("pasture_type", e.target.value)}
              options={[
                { value: "Improved Pasture", label: "Improved Pasture" },
                { value: "Native Grass", label: "Native Grass" },
                { value: "Mixed Pasture", label: "Mixed Pasture" },
                { value: "Bare Ground", label: "Bare Ground" },
                { value: "Irrigated", label: "Irrigated" },
              ]}
              required
            />
          </div>
        </GlassCard>

        {/* Water Source */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "100ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Infrastructure
          </h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${
                form.water_source ? "bg-blue-500/60" : "bg-white/15"
              }`}
              onClick={() => updateField("water_source", !form.water_source)}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  form.water_source ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-sm text-white/80">
              Water Source {form.water_source ? "Available" : "Not Available"}
            </span>
          </label>
        </GlassCard>

        {/* Actions */}
        <div
          className="flex gap-3 justify-end animate-fade-in-up"
          style={{ animationDelay: "150ms" } as React.CSSProperties}
        >
          <Link href="/paddocks">
            <GlassButton type="button">Cancel</GlassButton>
          </Link>
          <GlassButton
            type="submit"
            variant="primary"
            loading={loading}
            disabled={showSuccess}
            icon={<Save className="w-4 h-4" />}
          >
            Save Paddock
          </GlassButton>
        </div>
      </form>
    </div>
  );
}
