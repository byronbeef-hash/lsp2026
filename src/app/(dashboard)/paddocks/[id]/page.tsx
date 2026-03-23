"use client";

import { use, useState } from "react";
import { GlassCard, GlassBadge, GlassButton, GlassSelect, GlassSheet } from "@/components/glass";
import { usePaddockStore, useRecordsStore } from "@/stores/modules";
import {
  ArrowLeft,
  Fence,
  Maximize2,
  Users,
  Leaf,
  Droplets,
  Beef,
  ArrowRightLeft,
  Edit,
  Trash2,
  Clock,
  Sprout,
  Bug,
  Shovel,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import type { Paddock, LivestockRecord } from "@/types";

const statusBadgeVariant: Record<Paddock["status"], "success" | "warning" | "danger"> = {
  active: "success",
  resting: "warning",
  maintenance: "danger",
};

const statusLabel: Record<Paddock["status"], string> = {
  active: "Active",
  resting: "Resting",
  maintenance: "Maintenance",
};

function getCapacityColor(percentage: number): string {
  if (percentage > 85) return "bg-red-500";
  if (percentage >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

function getCapacityTextColor(percentage: number): string {
  if (percentage > 85) return "text-red-400";
  if (percentage >= 70) return "text-amber-400";
  return "text-emerald-400";
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <Icon className="w-4 h-4 text-white/40 flex-shrink-0" />
      <span className="text-sm text-white/50 w-32 flex-shrink-0">{label}</span>
      <span className="text-sm text-white/90">{value}</span>
    </div>
  );
}

function AnimalRow({ animal, onRemove }: { animal: LivestockRecord; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-4 py-3 px-1 border-b border-white/5 last:border-0 hover:bg-white/5 rounded-lg transition-colors">
      <Link href={`/records/${animal.uuid}`} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <Beef className="w-4 h-4 text-white/60" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-white text-sm">{animal.visual_tag}</p>
            <GlassBadge variant={animal.sex === "Male" ? "info" : "success"}>
              {animal.sex}
            </GlassBadge>
          </div>
          <p className="text-xs text-white/50">{animal.breed}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm text-white/80">{animal.weight_kg} kg</p>
        </div>
        <GlassBadge
          variant={
            animal.condition === "Excellent"
              ? "success"
              : animal.condition === "Fair"
                ? "warning"
                : "default"
          }
        >
          {animal.condition}
        </GlassBadge>
      </Link>
      <button
        onClick={onRemove}
        className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
        title="Remove from paddock"
      >
        <ArrowRightLeft className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function PaddockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const paddockId = parseInt(id, 10);

  const paddocks = usePaddockStore((s) => s.paddocks);
  const updatePaddock = usePaddockStore((s) => s.updatePaddock);
  const deletePaddock = usePaddockStore((s) => s.deletePaddock);
  const records = useRecordsStore((s) => s.records);

  const paddock = paddocks.find((p) => p.id === paddockId);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoveAnimals, setShowMoveAnimals] = useState(false);
  const [moveTargetPaddock, setMoveTargetPaddock] = useState("");
  const [selectedAnimalsToMove, setSelectedAnimalsToMove] = useState<Set<number>>(new Set());

  if (!paddock) return notFound();

  const animalsInPaddock = records.filter((r) => r.paddock_id === paddock.id);
  const percentage = Math.round((paddock.current_count / paddock.capacity) * 100);

  // Other paddocks for move target
  const otherPaddocks = paddocks.filter((p) => p.id !== paddock.id);

  // Mock paddock activities
  const paddockActivities = [
    {
      id: 1,
      type: "weed_spray",
      description: "Broadleaf weed spray applied - Grazon Extra",
      date: "2026-02-20",
      icon: Bug,
    },
    {
      id: 2,
      type: "fertilise",
      description: "Superphosphate applied - 200kg/ha",
      date: "2026-01-15",
      icon: Sprout,
    },
    {
      id: 3,
      type: "turn_soil",
      description: "Disc ploughed and harrowed - preparation for resowing",
      date: "2025-11-10",
      icon: Shovel,
    },
    {
      id: 4,
      type: "weed_spray",
      description: "Spot spray thistles - Roundup",
      date: "2025-10-05",
      icon: Bug,
    },
  ];

  const handleStatusChange = (newStatus: Paddock["status"]) => {
    updatePaddock(paddock.id, { status: newStatus });
  };

  const handleDelete = () => {
    deletePaddock(paddock.id);
    router.push("/paddocks");
  };

  const handleMoveAnimals = () => {
    if (!moveTargetPaddock) return;
    setShowMoveAnimals(false);
    setSelectedAnimalsToMove(new Set());
    setMoveTargetPaddock("");
  };

  const handleRemoveAnimal = (animalId: number) => {
    setSelectedAnimalsToMove(new Set([animalId]));
    setShowMoveAnimals(true);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Back button */}
      <Link
        href="/paddocks"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Paddocks
      </Link>

      {/* Header Card */}
      <GlassCard className="animate-fade-in-up">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Fence className="w-8 h-8 text-white/60" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-white">{paddock.name}</h1>
              <GlassBadge variant={statusBadgeVariant[paddock.status]}>
                {statusLabel[paddock.status]}
              </GlassBadge>
            </div>
            <p className="text-white/50">{paddock.pasture_type}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            <GlassButton
              size="sm"
              variant="primary"
              icon={<ArrowRightLeft className="w-4 h-4" />}
              onClick={() => setShowMoveAnimals(true)}
            >
              Move Animals
            </GlassButton>
            <Link href={`/paddocks/${paddock.id}/edit`}>
              <GlassButton size="sm" icon={<Edit className="w-4 h-4" />}>
                Edit Paddock
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

      {/* Quick Status Change */}
      <div className="flex gap-2 flex-wrap animate-fade-in-up" style={{ animationDelay: "25ms" } as React.CSSProperties}>
        <span className="text-sm text-white/50 self-center mr-2">Change Status:</span>
        {(["active", "resting", "maintenance"] as Paddock["status"][]).map((status) => (
          <GlassButton
            key={status}
            size="sm"
            variant={paddock.status === status ? "primary" : "default"}
            onClick={() => handleStatusChange(status)}
            icon={paddock.status === status ? <CheckCircle className="w-4 h-4" /> : undefined}
          >
            {statusLabel[status]}
          </GlassButton>
        ))}
      </div>

      {/* Overview Card */}
      <GlassCard
        className="animate-fade-in-up"
        style={{ animationDelay: "50ms" } as React.CSSProperties}
      >
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
          Overview
        </h2>
        <DetailRow icon={Maximize2} label="Area" value={`${paddock.area_hectares} hectares`} />
        <DetailRow icon={Users} label="Capacity" value={`${paddock.capacity} head`} />
        <DetailRow
          icon={Beef}
          label="Current Count"
          value={
            <span className="flex items-center gap-2">
              {paddock.current_count} head
              <GlassBadge
                variant={
                  percentage > 85 ? "danger" : percentage >= 70 ? "warning" : "success"
                }
              >
                {percentage}%
              </GlassBadge>
            </span>
          }
        />
        <DetailRow icon={Leaf} label="Pasture Type" value={paddock.pasture_type} />
        <DetailRow
          icon={Droplets}
          label="Water Source"
          value={
            paddock.water_source ? (
              <span className="text-blue-400 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" /> Available
              </span>
            ) : (
              <span className="text-white/40">Not available</span>
            )
          }
        />

        {/* Capacity Bar */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/50">Capacity Utilisation</span>
            <span className={`text-xs font-medium ${getCapacityTextColor(percentage)}`}>
              {paddock.current_count} / {paddock.capacity}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getCapacityColor(percentage)}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Animals in Paddock */}
      <GlassCard
        className="animate-fade-in-up"
        style={{ animationDelay: "100ms" } as React.CSSProperties}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Animals in Paddock
          </h2>
          <GlassBadge variant="default">{animalsInPaddock.length} found</GlassBadge>
        </div>

        {animalsInPaddock.length > 0 ? (
          <div>
            {animalsInPaddock.map((animal) => (
              <AnimalRow
                key={animal.id}
                animal={animal}
                onRemove={() => handleRemoveAnimal(animal.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/40">
            <Beef className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No animals currently in this paddock</p>
          </div>
        )}
      </GlassCard>

      {/* Paddock Activities */}
      <GlassCard
        className="animate-fade-in-up"
        style={{ animationDelay: "150ms" } as React.CSSProperties}
      >
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
          Paddock Activities
        </h2>
        <div className="space-y-0">
          {paddockActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex gap-4 py-3 border-b border-white/5 last:border-0"
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === "fertilise"
                      ? "bg-emerald-500/20"
                      : activity.type === "weed_spray"
                        ? "bg-amber-500/20"
                        : "bg-white/10"
                  }`}
                >
                  <activity.icon
                    className={`w-4 h-4 ${
                      activity.type === "fertilise"
                        ? "text-emerald-400"
                        : activity.type === "weed_spray"
                          ? "text-amber-400"
                          : "text-white/60"
                    }`}
                  />
                </div>
                {index < paddockActivities.length - 1 && (
                  <div className="w-px h-full bg-white/10 absolute top-8" />
                )}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <p className="text-sm text-white/80">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-white/30" />
                  <p className="text-xs text-white/40">
                    {new Date(activity.date).toLocaleDateString("en-AU", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <GlassBadge variant="default">
                    {activity.type.replace("_", " ")}
                  </GlassBadge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Move Animals Sheet */}
      <GlassSheet
        open={showMoveAnimals}
        onClose={() => {
          setShowMoveAnimals(false);
          setSelectedAnimalsToMove(new Set());
          setMoveTargetPaddock("");
        }}
        title="Move Animals"
      >
        <div className="space-y-4">
          <p className="text-white/70 text-sm">
            Select a destination paddock to move {selectedAnimalsToMove.size > 0 ? "selected" : ""} animals from{" "}
            <span className="font-semibold text-white">{paddock.name}</span>.
          </p>

          {/* Animals to move */}
          {selectedAnimalsToMove.size > 0 && (
            <div>
              <p className="text-xs text-white/50 mb-2">Animals to move:</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedAnimalsToMove).map((animalId) => {
                  const animal = records.find((r) => r.id === animalId);
                  return animal ? (
                    <GlassBadge key={animalId} variant="info">
                      {animal.visual_tag}
                    </GlassBadge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <GlassSelect
            label="Destination Paddock"
            value={moveTargetPaddock}
            onChange={(e) => setMoveTargetPaddock(e.target.value)}
            placeholder="Select paddock"
            options={otherPaddocks.map((p) => ({
              value: p.id.toString(),
              label: `${p.name} (${p.current_count}/${p.capacity})`,
            }))}
          />

          <div className="flex gap-3 justify-end">
            <GlassButton
              onClick={() => {
                setShowMoveAnimals(false);
                setSelectedAnimalsToMove(new Set());
                setMoveTargetPaddock("");
              }}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              icon={<ArrowRightLeft className="w-4 h-4" />}
              onClick={handleMoveAnimals}
              disabled={!moveTargetPaddock}
            >
              Move Animals
            </GlassButton>
          </div>
        </div>
      </GlassSheet>

      {/* Delete Confirmation Modal */}
      <GlassSheet
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Paddock"
      >
        <div className="space-y-4">
          <p className="text-white/70">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">{paddock.name}</span>?
            {animalsInPaddock.length > 0 && (
              <span className="text-amber-300">
                {" "}
                There are currently {animalsInPaddock.length} animals in this paddock that will need to be moved first.
              </span>
            )}
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
              Delete Paddock
            </GlassButton>
          </div>
        </div>
      </GlassSheet>
    </div>
  );
}
