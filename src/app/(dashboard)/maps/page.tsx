"use client";

import { useState, useMemo, useCallback } from "react";
import { GlassCard, GlassBadge, GlassButton } from "@/components/glass";
import { mockPaddocks, mockRecords, mockMapMarkers, mockFenceLines } from "@/lib/mock-data";
import {
  Map,
  Fence,
  Droplets,
  AlertTriangle,
  Filter,
  Users,
  Maximize2,
  MapPin,
  Layers,
  Eye,
  EyeOff,
  ChevronRight,
  X,
  Minimize2,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Paddock, MapMarker, FenceLine } from "@/types";

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/maps/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#000030]">
      <div className="text-center">
        <Map className="w-10 h-10 text-white/30 mx-auto mb-3 animate-pulse" />
        <p className="text-sm text-white/40">Loading map...</p>
      </div>
    </div>
  ),
});

type FilterMode = "all" | "active" | "resting" | "maintenance" | "alerts";
type MapLayer = "paddocks" | "markers" | "fences" | "labels";

const statusColors: Record<Paddock["status"], { fill: string; border: string; label: string }> = {
  active: { fill: "rgba(16, 185, 129, 0.25)", border: "#10b981", label: "Active" },
  resting: { fill: "rgba(245, 158, 11, 0.25)", border: "#f59e0b", label: "Resting" },
  maintenance: { fill: "rgba(239, 68, 68, 0.25)", border: "#ef4444", label: "Maintenance" },
};

function getCapacityPercentage(paddock: Paddock): number {
  return Math.round((paddock.current_count / paddock.capacity) * 100);
}

function hasAlert(paddock: Paddock): boolean {
  const pct = getCapacityPercentage(paddock);
  return pct > 85 || paddock.status === "maintenance";
}

function getCapacityColor(percentage: number): string {
  if (percentage > 85) return "bg-red-500";
  if (percentage >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

const markerIcons: Record<MapMarker["type"], string> = {
  water: "💧",
  gate: "🚪",
  shed: "🏠",
  trough: "🪣",
  yard: "🔲",
  silo: "🏗️",
  dam: "🌊",
};

const fenceConditionColors: Record<FenceLine["condition"], string> = {
  good: "#10b981",
  fair: "#f59e0b",
  poor: "#f97316",
  needs_repair: "#ef4444",
};

export default function MapsPage() {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [activeLayers, setActiveLayers] = useState<Set<MapLayer>>(
    new Set(["paddocks", "markers", "fences", "labels"])
  );
  const [selectedPaddock, setSelectedPaddock] = useState<Paddock | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [mapStyle, setMapStyle] = useState<"satellite" | "terrain" | "street">("satellite");

  const filteredPaddocks = useMemo(() => {
    return mockPaddocks.filter((p) => {
      if (filter === "active") return p.status === "active";
      if (filter === "resting") return p.status === "resting";
      if (filter === "maintenance") return p.status === "maintenance";
      if (filter === "alerts") return hasAlert(p);
      return true;
    });
  }, [filter]);

  const totalArea = mockPaddocks.reduce((sum, p) => sum + p.area_hectares, 0);
  const totalAnimals = mockPaddocks.reduce((sum, p) => sum + p.current_count, 0);
  const totalFenceKm = mockFenceLines.reduce((sum, f) => sum + (f.length_km || 0), 0);
  const alertCount = mockPaddocks.filter(hasAlert).length;

  const toggleLayer = useCallback((layer: MapLayer) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  }, []);

  const animalsInPaddock = useCallback((paddockId: number) => {
    return mockRecords.filter((r) => r.paddock_id === paddockId);
  }, []);

  const mapHeight = isFullscreen ? "100vh" : "calc(100vh - 200px)";

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-[#000020]" : "space-y-4"}>
      {/* Header — hidden in fullscreen */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-white">Property Map</h1>
            <p className="text-white/50 mt-1">Interactive paddock and infrastructure map</p>
          </div>
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <GlassBadge variant="default">
              <MapPin className="w-3 h-3 mr-1" />
              {totalArea} ha
            </GlassBadge>
            <GlassBadge variant="default">
              <Users className="w-3 h-3 mr-1" />
              {totalAnimals} head
            </GlassBadge>
            <GlassBadge variant="default">
              <Fence className="w-3 h-3 mr-1" />
              {totalFenceKm.toFixed(1)} km fence
            </GlassBadge>
            {alertCount > 0 && (
              <GlassBadge variant="danger">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {alertCount} alert{alertCount !== 1 ? "s" : ""}
              </GlassBadge>
            )}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div
        className={`relative rounded-xl overflow-hidden border border-white/10 ${isFullscreen ? "" : "animate-fade-in-up"}`}
        style={{ height: isFullscreen ? "100vh" : "min(calc(100vh - 220px), 700px)" }}
      >
        {/* Map */}
        <MapView
          paddocks={filteredPaddocks}
          markers={activeLayers.has("markers") ? mockMapMarkers : []}
          fences={activeLayers.has("fences") ? mockFenceLines : []}
          showPaddocks={activeLayers.has("paddocks")}
          showLabels={activeLayers.has("labels")}
          mapStyle={mapStyle}
          selectedPaddock={selectedPaddock}
          onPaddockClick={(p) => setSelectedPaddock(p)}
          statusColors={statusColors}
          fenceConditionColors={fenceConditionColors}
          markerIcons={markerIcons}
        />

        {/* Map Controls Overlay — Top Left */}
        <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
          {/* Filter Buttons */}
          <div className="glass-sm rounded-xl p-1.5 flex gap-1">
            {(
              [
                { key: "all", label: "All", icon: Filter },
                { key: "active", label: "Active", icon: Fence },
                { key: "alerts", label: "Alerts", icon: AlertTriangle },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === key
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Map Controls Overlay — Top Right */}
        <div className="absolute top-3 right-3 z-[1000] flex gap-2">
          {/* Map Style Selector */}
          <div className="glass-sm rounded-xl p-1.5 flex gap-1">
            {(["satellite", "terrain", "street"] as const).map((style) => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  mapStyle === style
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          {/* Layer Toggle */}
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`glass-sm rounded-xl p-2.5 transition-all ${showLayerPanel ? "bg-white/20" : ""}`}
          >
            <Layers className="w-4 h-4 text-white/80" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="glass-sm rounded-xl p-2.5"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-white/80" />
            ) : (
              <Maximize2 className="w-4 h-4 text-white/80" />
            )}
          </button>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="glass-sm rounded-xl p-2.5 sm:hidden"
          >
            {showSidebar ? (
              <EyeOff className="w-4 h-4 text-white/80" />
            ) : (
              <Eye className="w-4 h-4 text-white/80" />
            )}
          </button>
        </div>

        {/* Layer Panel Dropdown */}
        {showLayerPanel && (
          <div className="absolute top-14 right-3 z-[1000] glass-sm rounded-xl p-3 w-48 animate-fade-in-up">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Map Layers
            </p>
            {(
              [
                { key: "paddocks" as MapLayer, label: "Paddock Boundaries" },
                { key: "markers" as MapLayer, label: "Infrastructure" },
                { key: "fences" as MapLayer, label: "Fence Lines" },
                { key: "labels" as MapLayer, label: "Labels" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleLayer(key)}
                className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-sm text-white/80 hover:bg-white/10 transition-colors"
              >
                <span>{label}</span>
                <span
                  className={`w-4 h-4 rounded border ${
                    activeLayers.has(key)
                      ? "bg-blue-500 border-blue-400"
                      : "border-white/30"
                  }`}
                >
                  {activeLayers.has(key) && (
                    <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                      <path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Paddock Info Sidebar */}
        {showSidebar && (
          <div className="absolute top-3 bottom-3 right-3 sm:right-auto sm:left-3 sm:top-16 z-[999] w-72 hidden sm:block">
            <div className="glass-sm rounded-xl h-full overflow-y-auto">
              <div className="p-3 border-b border-white/10">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Paddocks ({filteredPaddocks.length})
                </p>
              </div>
              <div className="p-2">
                {filteredPaddocks.map((paddock) => {
                  const pct = getCapacityPercentage(paddock);
                  const isSelected = selectedPaddock?.id === paddock.id;
                  return (
                    <button
                      key={paddock.id}
                      onClick={() => setSelectedPaddock(isSelected ? null : paddock)}
                      className={`w-full text-left p-2.5 rounded-lg mb-1 transition-all ${
                        isSelected
                          ? "bg-white/15 ring-1 ring-white/20"
                          : "hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white truncate">
                          {paddock.name}
                        </span>
                        <GlassBadge
                          variant={
                            paddock.status === "active"
                              ? "success"
                              : paddock.status === "resting"
                                ? "warning"
                                : "danger"
                          }
                        >
                          {statusColors[paddock.status].label}
                        </GlassBadge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/50">
                        <span>{paddock.area_hectares} ha</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {paddock.current_count}/{paddock.capacity}
                        </span>
                        {paddock.water_source && (
                          <Droplets className="w-3 h-3 text-blue-400" />
                        )}
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getCapacityColor(pct)}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Selected Paddock Detail Panel */}
        {selectedPaddock && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-[310px] z-[1000] animate-fade-in-up">
            <div className="glass-sm rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedPaddock.name}
                  </h3>
                  <p className="text-xs text-white/50">
                    {selectedPaddock.area_hectares} ha &middot;{" "}
                    {selectedPaddock.pasture_type} &middot;{" "}
                    {selectedPaddock.water_source ? "Water available" : "No water source"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/paddocks/${selectedPaddock.id}`}>
                    <GlassButton size="sm" variant="primary">
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </GlassButton>
                  </Link>
                  <button
                    onClick={() => setSelectedPaddock(null)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/5 rounded-lg p-2.5">
                  <p className="text-[10px] text-white/40 uppercase">Head Count</p>
                  <p className="text-lg font-bold text-white">
                    {selectedPaddock.current_count}
                    <span className="text-xs text-white/40 font-normal">
                      /{selectedPaddock.capacity}
                    </span>
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5">
                  <p className="text-[10px] text-white/40 uppercase">Capacity</p>
                  <p className="text-lg font-bold text-white">
                    {getCapacityPercentage(selectedPaddock)}%
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5">
                  <p className="text-[10px] text-white/40 uppercase">Status</p>
                  <p className="text-lg font-bold text-white capitalize">
                    {selectedPaddock.status}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5">
                  <p className="text-[10px] text-white/40 uppercase">Animals</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {animalsInPaddock(selectedPaddock.id)
                      .slice(0, 3)
                      .map((a) => (
                        <span
                          key={a.id}
                          className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/70"
                        >
                          {a.visual_tag}
                        </span>
                      ))}
                    {animalsInPaddock(selectedPaddock.id).length > 3 && (
                      <span className="text-[10px] text-white/40">
                        +{animalsInPaddock(selectedPaddock.id).length - 3} more
                      </span>
                    )}
                    {animalsInPaddock(selectedPaddock.id).length === 0 && (
                      <span className="text-[10px] text-white/40">None assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend — Bottom Left */}
        {!selectedPaddock && (
          <div className="absolute bottom-3 left-3 z-[999] glass-sm rounded-xl p-3 hidden sm:block">
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                <span className="w-3 h-3 rounded-sm border-2" style={{ borderColor: "#10b981", background: "rgba(16,185,129,0.25)" }} />
                Active
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                <span className="w-3 h-3 rounded-sm border-2" style={{ borderColor: "#f59e0b", background: "rgba(245,158,11,0.25)" }} />
                Resting
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                <span className="w-3 h-3 rounded-sm border-2" style={{ borderColor: "#ef4444", background: "rgba(239,68,68,0.25)" }} />
                Maintenance
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                <span className="w-5 h-0.5 rounded" style={{ background: "#10b981" }} />
                Good fence
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                <span className="w-5 h-0.5 rounded" style={{ background: "#ef4444" }} />
                Needs repair
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Paddock List — Below map on mobile */}
      {!isFullscreen && (
        <div className="sm:hidden animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <GlassCard>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
              Paddocks ({filteredPaddocks.length})
            </p>
            {filteredPaddocks.map((paddock) => {
              const pct = getCapacityPercentage(paddock);
              return (
                <Link key={paddock.id} href={`/paddocks/${paddock.id}`}>
                  <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                    <div
                      className="w-3 h-8 rounded-full"
                      style={{ backgroundColor: statusColors[paddock.status].border }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {paddock.name}
                      </p>
                      <p className="text-xs text-white/50">
                        {paddock.area_hectares} ha &middot; {paddock.current_count}/{paddock.capacity} head
                      </p>
                    </div>
                    <div className="w-16">
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getCapacityColor(pct)}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-white/40 text-right mt-0.5">{pct}%</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
