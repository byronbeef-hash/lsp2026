"use client";

import { useState } from "react";
import {
  GlassCard,
  GlassInput,
  GlassSelect,
  GlassButton,
} from "@/components/glass";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSuppliesStore } from "@/stores/modules";
import type { Supply } from "@/types";

export default function NewSupplyPage() {
  const router = useRouter();
  const { addSupply } = useSuppliesStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    cost_per_unit: "",
    supplier: "",
    reorder_level: "",
    notes: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await addSupply({
      name: form.name,
      category: form.category as Supply["category"],
      quantity: parseFloat(form.quantity) || 0,
      unit: form.unit,
      cost_per_unit: parseFloat(form.cost_per_unit) || 0,
      supplier: form.supplier,
      reorder_level: parseFloat(form.reorder_level) || 0,
      last_ordered: new Date().toISOString().split("T")[0],
      notes: form.notes || null,
    });

    router.push("/supplies");
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <Link
        href="/supplies"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Supplies
      </Link>

      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">New Supply</h1>
        <p className="text-white/50 mt-1">Add a new item to your inventory</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Details */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "50ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Item Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Name *"
              name="name"
              placeholder="e.g. Cattle Feed Pellets"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
            <GlassSelect
              label="Category *"
              name="category"
              placeholder="Select category"
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              options={[
                { value: "feed", label: "Feed" },
                { value: "fencing", label: "Fencing" },
                { value: "fertilizer", label: "Fertilizer" },
                { value: "seed", label: "Seed" },
                { value: "herbicide", label: "Herbicide" },
                { value: "medical", label: "Medical" },
                { value: "other", label: "Other" },
              ]}
              required
            />
          </div>
        </GlassCard>

        {/* Quantity & Cost */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "100ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Quantity & Cost
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Quantity *"
              name="quantity"
              type="number"
              placeholder="e.g. 100"
              value={form.quantity}
              onChange={(e) => updateField("quantity", e.target.value)}
              min="0"
              step="0.1"
              required
            />
            <GlassSelect
              label="Unit *"
              name="unit"
              placeholder="Select unit"
              value={form.unit}
              onChange={(e) => updateField("unit", e.target.value)}
              options={[
                { value: "kg", label: "kg" },
                { value: "L", label: "Litres (L)" },
                { value: "units", label: "Units" },
                { value: "bales", label: "Bales" },
                { value: "bags", label: "Bags" },
                { value: "rolls", label: "Rolls" },
                { value: "boxes", label: "Boxes" },
              ]}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Cost Per Unit ($) *"
              name="cost_per_unit"
              type="number"
              placeholder="e.g. 0.85"
              value={form.cost_per_unit}
              onChange={(e) => updateField("cost_per_unit", e.target.value)}
              min="0"
              step="0.01"
              required
            />
            <GlassInput
              label="Reorder Level"
              name="reorder_level"
              type="number"
              placeholder="Alert when quantity drops to..."
              value={form.reorder_level}
              onChange={(e) => updateField("reorder_level", e.target.value)}
              min="0"
            />
          </div>
        </GlassCard>

        {/* Supplier & Notes */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "150ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Supplier & Notes
          </h2>
          <GlassInput
            label="Supplier"
            name="supplier"
            placeholder="e.g. Southern Stock Feeds"
            value={form.supplier}
            onChange={(e) => updateField("supplier", e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-white/70">
              Notes
            </label>
            <textarea
              name="notes"
              placeholder="Add any additional notes..."
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
          <Link href="/supplies">
            <GlassButton type="button">Cancel</GlassButton>
          </Link>
          <GlassButton
            type="submit"
            variant="primary"
            loading={loading}
            icon={<Save className="w-4 h-4" />}
          >
            Save Supply
          </GlassButton>
        </div>
      </form>
    </div>
  );
}
