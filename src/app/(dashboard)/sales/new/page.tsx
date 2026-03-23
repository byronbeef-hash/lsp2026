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
import { useSalesStore, useRecordsStore } from "@/stores/modules";

export default function NewSalePage() {
  const router = useRouter();
  const { addSale } = useSalesStore();
  const { records } = useRecordsStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    record_visual_tag: "",
    buyer_name: "",
    buyer_contact: "",
    sale_price: "",
    weight_at_sale: "",
    sale_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const pricePerKg =
    form.sale_price && form.weight_at_sale
      ? (parseFloat(form.sale_price) / parseFloat(form.weight_at_sale)).toFixed(
          2
        )
      : "0.00";

  // Pre-fill weight when animal is selected
  const handleAnimalSelect = (tag: string) => {
    updateField("record_visual_tag", tag);
    const animal = records.find((r) => r.visual_tag === tag);
    if (animal && animal.weight_kg) {
      updateField("weight_at_sale", animal.weight_kg.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await addSale({
      record_visual_tag: form.record_visual_tag,
      buyer_name: form.buyer_name,
      buyer_contact: form.buyer_contact,
      sale_price: parseFloat(form.sale_price) || 0,
      sale_date: form.sale_date,
      weight_at_sale: parseFloat(form.weight_at_sale) || 0,
      price_per_kg: parseFloat(pricePerKg) || 0,
      status: "pending",
      notes: form.notes || null,
    });

    router.push("/sales");
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <Link
        href="/sales"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Sales
      </Link>

      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">Record Sale</h1>
        <p className="text-white/50 mt-1">
          Record a new livestock sale transaction
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Animal Selection */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "50ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Animal
          </h2>
          <GlassSelect
            label="Animal Visual Tag *"
            name="record_visual_tag"
            placeholder="Select animal"
            value={form.record_visual_tag}
            onChange={(e) => handleAnimalSelect(e.target.value)}
            options={records.map((r) => ({
              value: r.visual_tag,
              label: `${r.visual_tag} - ${r.breed} ${r.sex} (${r.weight_kg}kg)`,
            }))}
            required
          />
        </GlassCard>

        {/* Buyer Details */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "100ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Buyer Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Buyer Name *"
              name="buyer_name"
              placeholder="e.g. Thompson Livestock Group"
              value={form.buyer_name}
              onChange={(e) => updateField("buyer_name", e.target.value)}
              required
            />
            <GlassInput
              label="Buyer Contact"
              name="buyer_contact"
              placeholder="e.g. 0412 345 678"
              value={form.buyer_contact}
              onChange={(e) => updateField("buyer_contact", e.target.value)}
            />
          </div>
        </GlassCard>

        {/* Sale Details */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "150ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Sale Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Sale Price ($) *"
              name="sale_price"
              type="number"
              placeholder="e.g. 2850"
              value={form.sale_price}
              onChange={(e) => updateField("sale_price", e.target.value)}
              min="0"
              step="0.01"
              required
            />
            <GlassInput
              label="Weight at Sale (kg) *"
              name="weight_at_sale"
              type="number"
              placeholder="e.g. 550"
              value={form.weight_at_sale}
              onChange={(e) => updateField("weight_at_sale", e.target.value)}
              min="0"
              step="0.1"
              required
            />
          </div>

          {/* Auto-calculated price per kg */}
          <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">
                Calculated Price/kg
              </span>
              <span className="text-lg font-bold text-emerald-400">
                ${pricePerKg}/kg
              </span>
            </div>
          </div>

          <GlassInput
            label="Sale Date *"
            name="sale_date"
            type="date"
            value={form.sale_date}
            onChange={(e) => updateField("sale_date", e.target.value)}
            required
          />
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
            placeholder="Add any notes about the sale..."
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            rows={3}
            className="glass-input resize-none"
          />
        </GlassCard>

        {/* Actions */}
        <div
          className="flex gap-3 justify-end animate-fade-in-up"
          style={{ animationDelay: "250ms" } as React.CSSProperties}
        >
          <Link href="/sales">
            <GlassButton type="button">Cancel</GlassButton>
          </Link>
          <GlassButton
            type="submit"
            variant="primary"
            loading={loading}
            icon={<Save className="w-4 h-4" />}
          >
            Record Sale
          </GlassButton>
        </div>
      </form>
    </div>
  );
}
