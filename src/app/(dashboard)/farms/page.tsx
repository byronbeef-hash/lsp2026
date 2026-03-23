"use client";

import { useState } from "react";
import {
  GlassCard,
  GlassInput,
  GlassButton,
  GlassBadge,
} from "@/components/glass";
import {
  Home,
  MapPin,
  Maximize2,
  User,
  Beef,
  Calendar,
  Plus,
  CheckCircle,
  ArrowRightLeft,
  X,
  Save,
} from "lucide-react";
import { useFarmStore } from "@/stores/modules";

export default function FarmsPage() {
  const { farms, currentFarmId, addFarm, switchFarm } = useFarmStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFarm, setNewFarm] = useState({
    name: "",
    location: "",
    size_hectares: "",
    owner_name: "",
  });

  const activeFarm = farms.find((f) => f.id === currentFarmId);

  // Mock animal counts per farm
  const farmAnimalCounts: Record<number, number> = {
    1: 247,
    2: 82,
  };

  const handleAddFarm = async () => {
    if (!newFarm.name.trim()) return;
    await addFarm({
      name: newFarm.name,
      location: newFarm.location,
      size_hectares: parseFloat(newFarm.size_hectares) || 0,
      owner_name: newFarm.owner_name,
    });
    setNewFarm({ name: "", location: "", size_hectares: "", owner_name: "" });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Farms</h1>
          <p className="text-white/50 mt-1">Manage your properties</p>
        </div>
        <GlassButton
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          Add Farm
        </GlassButton>
      </div>

      {/* Add Farm Form */}
      {showAddForm && (
        <GlassCard className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              New Farm
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Farm Name *"
              name="farm_name"
              placeholder="e.g. Willow Creek Station"
              value={newFarm.name}
              onChange={(e) =>
                setNewFarm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <GlassInput
              label="Location"
              name="farm_location"
              placeholder="e.g. Wagga Wagga, NSW"
              value={newFarm.location}
              onChange={(e) =>
                setNewFarm((prev) => ({ ...prev, location: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Size (hectares)"
              name="farm_size"
              type="number"
              placeholder="e.g. 215"
              value={newFarm.size_hectares}
              onChange={(e) =>
                setNewFarm((prev) => ({
                  ...prev,
                  size_hectares: e.target.value,
                }))
              }
              min="0"
              step="0.1"
            />
            <GlassInput
              label="Owner Name"
              name="farm_owner"
              placeholder="e.g. John Smith"
              value={newFarm.owner_name}
              onChange={(e) =>
                setNewFarm((prev) => ({ ...prev, owner_name: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end">
            <GlassButton
              variant="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={handleAddFarm}
            >
              Save Farm
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* Current Farm Highlight */}
      {activeFarm && (
        <GlassCard
          className="animate-fade-in-up border-2 border-emerald-400/20"
          style={{ animationDelay: "50ms" } as React.CSSProperties}
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Home className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-white">
                  {activeFarm.name}
                </h2>
                <GlassBadge variant="success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </GlassBadge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white/40" />
                  <div>
                    <p className="text-xs text-white/50">Location</p>
                    <p className="text-sm text-white/80">
                      {activeFarm.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-white/40" />
                  <div>
                    <p className="text-xs text-white/50">Size</p>
                    <p className="text-sm text-white/80">
                      {activeFarm.size_hectares} ha
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-white/40" />
                  <div>
                    <p className="text-xs text-white/50">Owner</p>
                    <p className="text-sm text-white/80">
                      {activeFarm.owner_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Beef className="w-4 h-4 text-white/40" />
                  <div>
                    <p className="text-xs text-white/50">Animals</p>
                    <p className="text-sm text-white/80">
                      {farmAnimalCounts[activeFarm.id] || 0} head
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Farm List */}
      <div>
        <h2
          className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 animate-fade-in-up"
          style={{ animationDelay: "100ms" } as React.CSSProperties}
        >
          All Properties
        </h2>
        <div className="space-y-3">
          {farms.map((farm, index) => {
            const isActive = farm.id === currentFarmId;
            return (
              <GlassCard
                key={farm.id}
                className={`animate-fade-in-up ${
                  isActive ? "border border-emerald-400/20" : ""
                }`}
                style={
                  {
                    animationDelay: `${150 + index * 50}ms`,
                  } as React.CSSProperties
                }
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isActive ? "bg-emerald-500/20" : "bg-white/10"
                    }`}
                  >
                    <Home
                      className={`w-5 h-5 ${
                        isActive ? "text-emerald-400" : "text-white/60"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white text-sm">
                        {farm.name}
                      </h3>
                      {isActive && (
                        <GlassBadge variant="success">Active</GlassBadge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/50 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {farm.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize2 className="w-3 h-3" />
                        {farm.size_hectares} ha
                      </span>
                      <span className="flex items-center gap-1">
                        <Beef className="w-3 h-3" />
                        {farmAnimalCounts[farm.id] || 0} head
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(farm.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {!isActive && (
                    <GlassButton
                      size="sm"
                      variant="primary"
                      icon={<ArrowRightLeft className="w-4 h-4" />}
                      onClick={() => switchFarm(farm.id)}
                    >
                      Switch
                    </GlassButton>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Farm Details Section */}
      {activeFarm && (
        <GlassCard
          className="animate-fade-in-up"
          style={{ animationDelay: "250ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
            Farm Details
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 py-3 border-b border-white/5">
              <Home className="w-4 h-4 text-white/40 flex-shrink-0" />
              <span className="text-sm text-white/50 w-32 flex-shrink-0">
                Name
              </span>
              <span className="text-sm text-white/90">{activeFarm.name}</span>
            </div>
            <div className="flex items-center gap-3 py-3 border-b border-white/5">
              <MapPin className="w-4 h-4 text-white/40 flex-shrink-0" />
              <span className="text-sm text-white/50 w-32 flex-shrink-0">
                Location
              </span>
              <span className="text-sm text-white/90">
                {activeFarm.location}
              </span>
            </div>
            <div className="flex items-center gap-3 py-3 border-b border-white/5">
              <Maximize2 className="w-4 h-4 text-white/40 flex-shrink-0" />
              <span className="text-sm text-white/50 w-32 flex-shrink-0">
                Size
              </span>
              <span className="text-sm text-white/90">
                {activeFarm.size_hectares} hectares
              </span>
            </div>
            <div className="flex items-center gap-3 py-3 border-b border-white/5">
              <User className="w-4 h-4 text-white/40 flex-shrink-0" />
              <span className="text-sm text-white/50 w-32 flex-shrink-0">
                Owner
              </span>
              <span className="text-sm text-white/90">
                {activeFarm.owner_name}
              </span>
            </div>
            <div className="flex items-center gap-3 py-3 border-b border-white/5">
              <Beef className="w-4 h-4 text-white/40 flex-shrink-0" />
              <span className="text-sm text-white/50 w-32 flex-shrink-0">
                Animals
              </span>
              <span className="text-sm text-white/90">
                {farmAnimalCounts[activeFarm.id] || 0} head
              </span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Calendar className="w-4 h-4 text-white/40 flex-shrink-0" />
              <span className="text-sm text-white/50 w-32 flex-shrink-0">
                Created
              </span>
              <span className="text-sm text-white/90">
                {new Date(activeFarm.created_at).toLocaleDateString("en-AU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
