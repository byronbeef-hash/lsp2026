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
import { usePaddockStore, useRecordsStore } from "@/stores/modules";
import {
  ArrowLeft,
  Save,
  Trash2,
  ArrowRightLeft,
  Beef,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import type { Paddock } from "@/types";

export default function EditPaddockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const paddockId = parseInt(id, 10);

  const paddocks = usePaddockStore((s) => s.paddocks);
  const updatePaddock = usePaddockStore((s) => s.updatePaddock);
  const deletePaddock = usePaddockStore((s) => s.deletePaddock);
  const records = useRecordsStore((s) => s.records);

  const paddock = paddocks.find((p) => p.id === paddockId || p.uuid === id);

  if (!paddock) return notFound();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [moveTarget, setMoveTarget] = useState("");
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);

  const animalsInPaddock = records.filter((r) => r.paddock_id === paddock.id);
  const otherPaddocks = paddocks.filter((p) => p.id !== paddock.id);

  const [form, setForm] = useState({
    name: paddock.name,
    area_hectares: paddock.area_hectares.toString(),
    capacity: paddock.capacity.toString(),
    pasture_type: paddock.pasture_type,
    water_source: paddock.water_source,
    status: paddock.status,
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAnimalSelection = (uuid: string) => {
    setSelectedAnimals((prev) =>
      prev.includes(uuid) ? prev.filter((a) => a !== uuid) : [...prev, uuid]
    );
  };

  const selectAllAnimals = () => {
    if (selectedAnimals.length === animalsInPaddock.length) {
      setSelectedAnimals([]);
    } else {
      setSelectedAnimals(animalsInPaddock.map((a) => a.uuid));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    updatePaddock(paddock.id, {
      name: form.name.trim(),
      area_hectares: parseFloat(form.area_hectares) || paddock.area_hectares,
      capacity: parseInt(form.capacity) || paddock.capacity,
      pasture_type: form.pasture_type,
      water_source: form.water_source,
      status: form.status as Paddock["status"],
    });

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    deletePaddock(paddock.id);
    router.push("/paddocks");
  };

  const handleBulkMove = () => {
    if (moveTarget && selectedAnimals.length > 0) {
      setSelectedAnimals([]);
      setMoveTarget("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <Link
        href={`/paddocks/${paddock.id}`}
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Paddock Details
      </Link>

      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">
          Edit: {paddock.name}
        </h1>
        <p className="text-white/50 mt-1">Update paddock details and manage animals</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm animate-fade-in-up">
          <CheckCircle className="w-4 h-4" />
          Changes saved successfully
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
              label="Area (hectares)"
              name="area_hectares"
              type="number"
              placeholder="e.g. 45"
              value={form.area_hectares}
              onChange={(e) => updateField("area_hectares", e.target.value)}
              min="0"
              step="0.1"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Capacity (head)"
              name="capacity"
              type="number"
              placeholder="e.g. 80"
              value={form.capacity}
              onChange={(e) => updateField("capacity", e.target.value)}
              min="0"
            />
            <GlassSelect
              label="Pasture Type"
              name="pasture_type"
              placeholder="Select type"
              value={form.pasture_type}
              onChange={(e) => updateField("pasture_type", e.target.value)}
              options={[
                { value: "Improved Pasture", label: "Improved Pasture" },
                { value: "Native Grass", label: "Native Grass" },
                { value: "Mixed Pasture", label: "Mixed Pasture" },
                { value: "Bare Ground", label: "Bare Ground" },
                { value: "Irrigated", label: "Irrigated" },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white/70">
                Water Source
              </label>
              <label className="flex items-center gap-3 cursor-pointer mt-2">
                <div
                  className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${
                    form.water_source ? "bg-blue-500/60" : "bg-white/15"
                  }`}
                  onClick={() => updateField("water_source", !form.water_source)}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      form.water_source
                        ? "translate-x-[22px]"
                        : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="text-sm text-white/80">
                  {form.water_source ? "Available" : "Not Available"}
                </span>
              </label>
            </div>
            <GlassSelect
              label="Status"
              name="status"
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              options={[
                { value: "active", label: "Active" },
                { value: "resting", label: "Resting" },
                { value: "maintenance", label: "Maintenance" },
              ]}
            />
          </div>
        </GlassCard>

        {/* Move Animals */}
        <GlassCard
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "100ms" } as React.CSSProperties}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              Animals in Paddock
            </h2>
            <GlassBadge variant="default">
              {animalsInPaddock.length} head
            </GlassBadge>
          </div>

          {animalsInPaddock.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      selectedAnimals.length === animalsInPaddock.length &&
                      animalsInPaddock.length > 0
                    }
                    onChange={selectAllAnimals}
                    className="w-4 h-4 rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-emerald-500/50"
                  />
                  <span className="text-xs text-white/50">Select All</span>
                </label>
                {selectedAnimals.length > 0 && (
                  <GlassBadge variant="info">
                    {selectedAnimals.length} selected
                  </GlassBadge>
                )}
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {animalsInPaddock.map((animal) => (
                  <label
                    key={animal.uuid}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAnimals.includes(animal.uuid)}
                      onChange={() => toggleAnimalSelection(animal.uuid)}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-emerald-500/50"
                    />
                    <Beef className="w-4 h-4 text-white/40" />
                    <span className="text-sm text-white/80 font-medium">
                      {animal.visual_tag}
                    </span>
                    <span className="text-xs text-white/40">{animal.breed}</span>
                    <GlassBadge
                      variant={animal.sex === "Male" ? "info" : "success"}
                    >
                      {animal.sex}
                    </GlassBadge>
                  </label>
                ))}
              </div>

              {selectedAnimals.length > 0 && (
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <GlassSelect
                      label="Move to Paddock"
                      name="move_target"
                      placeholder="Select destination"
                      value={moveTarget}
                      onChange={(e) => setMoveTarget(e.target.value)}
                      options={otherPaddocks.map((p) => ({
                        value: p.id.toString(),
                        label: `${p.name} (${p.current_count}/${p.capacity})`,
                      }))}
                    />
                  </div>
                  <GlassButton
                    type="button"
                    variant="primary"
                    onClick={handleBulkMove}
                    disabled={!moveTarget}
                    icon={<ArrowRightLeft className="w-4 h-4" />}
                  >
                    Move {selectedAnimals.length}
                  </GlassButton>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 text-white/40">
              <Beef className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No animals currently in this paddock</p>
            </div>
          )}
        </GlassCard>

        {/* Actions */}
        <div
          className="flex gap-3 justify-between animate-fade-in-up"
          style={{ animationDelay: "150ms" } as React.CSSProperties}
        >
          <GlassButton
            type="button"
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Paddock
          </GlassButton>
          <div className="flex gap-3">
            <Link href={`/paddocks/${paddock.id}`}>
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
        title="Delete Paddock"
      >
        <div className="space-y-4">
          <p className="text-white/70 text-sm">
            Are you sure you want to delete{" "}
            <strong className="text-white">{paddock.name}</strong>?
            {animalsInPaddock.length > 0 && (
              <span className="text-amber-300">
                {" "}
                There are {animalsInPaddock.length} animals currently in this
                paddock. They will need to be moved first.
              </span>
            )}
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
