"use client";

import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Marker,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import type { Paddock, MapMarker, FenceLine, PropertyBoundary } from "@/types";
import {
  Search,
  MapPin,
  PenTool,
  Square,
  Minus,
  Edit3,
  Trash2,
  X,
  Check,
  Plus,
  Fence,
  Crosshair,
} from "lucide-react";

// Fix default marker icon issue with webpack/next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Types ────────────────────────────────────────────────

export type DrawingMode =
  | "none"
  | "paddock"
  | "boundary"
  | "marker"
  | "fence"
  | "edit"
  | "delete";

export interface NewPaddockData {
  polygon: [number, number][];
  area_hectares: number;
}

export interface NewMarkerData {
  lat: number;
  lng: number;
}

export interface NewFenceData {
  coordinates: [number, number][];
  length_km: number;
}

export interface NewBoundaryData {
  coordinates: [number, number][];
  area_hectares: number;
}

interface MapViewProps {
  paddocks: Paddock[];
  markers: MapMarker[];
  fences: FenceLine[];
  propertyBoundary: PropertyBoundary | null;
  showPaddocks: boolean;
  showLabels: boolean;
  mapStyle: "satellite" | "terrain" | "street";
  selectedPaddock: Paddock | null;
  onPaddockClick: (paddock: Paddock) => void;
  statusColors: Record<
    Paddock["status"],
    { fill: string; border: string; label: string }
  >;
  fenceConditionColors: Record<FenceLine["condition"], string>;
  markerIcons: Record<MapMarker["type"], string>;
  drawingMode: DrawingMode;
  onDrawingComplete: (
    type: "paddock" | "boundary" | "marker" | "fence",
    data: NewPaddockData | NewMarkerData | NewFenceData | NewBoundaryData
  ) => void;
  onDeletePaddock?: (paddockId: number) => void;
  onDeleteMarker?: (markerId: number) => void;
  onDeleteFence?: (fenceId: number) => void;
  onDeleteBoundary?: () => void;
}

// ── Constants ────────────────────────────────────────────

const TILE_URLS = {
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  terrain:
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  street:
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
};

const TILE_ATTRIBUTIONS = {
  satellite: "Tiles &copy; Esri",
  terrain:
    'Map data: &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  street:
    '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
};

// ── Utilities ────────────────────────────────────────────

function createMarkerIcon(emoji: string): L.DivIcon {
  return L.divIcon({
    html: `<div style="font-size: 22px; text-align: center; line-height: 1; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5));">${emoji}</div>`,
    className: "custom-emoji-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

/** Shoelace formula for approximate area in hectares from lat/lng polygon */
function calculatePolygonAreaHectares(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  // Convert to meters using equirectangular approximation
  const toMeters = (lat: number, lng: number, refLat: number, refLng: number) => {
    const R = 6371000;
    const dLat = ((lat - refLat) * Math.PI) / 180;
    const dLng = ((lng - refLng) * Math.PI) / 180;
    const y = dLat * R;
    const x = dLng * R * Math.cos((refLat * Math.PI) / 180);
    return [x, y];
  };
  const refLat = coords[0][0];
  const refLng = coords[0][1];
  const mCoords = coords.map(([lat, lng]) => toMeters(lat, lng, refLat, refLng));

  // Shoelace formula
  let area = 0;
  for (let i = 0; i < mCoords.length; i++) {
    const j = (i + 1) % mCoords.length;
    area += mCoords[i][0] * mCoords[j][1];
    area -= mCoords[j][0] * mCoords[i][1];
  }
  area = Math.abs(area) / 2;
  return Math.round((area / 10000) * 10) / 10; // Convert to hectares, 1 decimal
}

/** Calculate polyline length in km */
function calculatePolylineLength(coords: [number, number][]): number {
  if (coords.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [lat1, lng1] = coords[i];
    const [lat2, lng2] = coords[i + 1];
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }
  return Math.round(total * 10) / 10;
}

// ── Sub-components ───────────────────────────────────────

function FlyToSelected({ paddock }: { paddock: Paddock | null }) {
  const map = useMap();
  const prevId = useRef<number | null>(null);

  useEffect(() => {
    if (paddock && paddock.id !== prevId.current) {
      prevId.current = paddock.id;
      if (paddock.polygon && paddock.polygon.length > 0) {
        const bounds = L.latLngBounds(
          paddock.polygon.map(([lat, lng]) => [lat, lng] as L.LatLngTuple)
        );
        map.flyToBounds(bounds, { padding: [60, 60], duration: 0.8 });
      } else {
        map.flyTo([paddock.lat, paddock.lng], 16, { duration: 0.8 });
      }
    }
    if (!paddock) {
      prevId.current = null;
    }
  }, [paddock, map]);

  return null;
}

function FlyToLocation({ location }: { location: { lat: number; lng: number; zoom: number } | null }) {
  const map = useMap();
  const prevLocation = useRef<typeof location>(null);

  useEffect(() => {
    if (location && location !== prevLocation.current) {
      prevLocation.current = location;
      map.flyTo([location.lat, location.lng], location.zoom, { duration: 1.0 });
    }
  }, [location, map]);

  return null;
}

// ── Drawing Handler ──────────────────────────────────────

function DrawingHandler({
  drawingMode,
  onDrawingComplete,
}: {
  drawingMode: DrawingMode;
  onDrawingComplete: MapViewProps["onDrawingComplete"];
}) {
  const map = useMap();
  const drawingLayerRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const activeDrawRef = useRef<L.Draw.Polygon | L.Draw.Marker | L.Draw.Polyline | null>(null);
  const currentModeRef = useRef<DrawingMode>("none");

  useEffect(() => {
    const drawnItems = drawingLayerRef.current;
    if (!map.hasLayer(drawnItems)) {
      map.addLayer(drawnItems);
    }

    return () => {
      if (map.hasLayer(drawnItems)) {
        map.removeLayer(drawnItems);
      }
    };
  }, [map]);

  useEffect(() => {
    // If same mode, skip
    if (currentModeRef.current === drawingMode) return;
    currentModeRef.current = drawingMode;

    // Cancel any active drawing
    if (activeDrawRef.current) {
      try {
        (activeDrawRef.current as L.Draw.Polygon).disable();
      } catch {
        // ignore
      }
      activeDrawRef.current = null;
    }

    if (drawingMode === "none" || drawingMode === "edit" || drawingMode === "delete") {
      return;
    }

    // Start drawing based on mode
    let handler: L.Draw.Polygon | L.Draw.Marker | L.Draw.Polyline;

    if (drawingMode === "paddock") {
      handler = new L.Draw.Polygon(map, {
        shapeOptions: {
          color: "#10b981",
          fillColor: "rgba(16, 185, 129, 0.3)",
          fillOpacity: 0.3,
          weight: 2,
        },
        allowIntersection: false,
        showArea: true,
      });
    } else if (drawingMode === "boundary") {
      handler = new L.Draw.Polygon(map, {
        shapeOptions: {
          color: "#3b82f6",
          fillColor: "rgba(59, 130, 246, 0.1)",
          fillOpacity: 0.1,
          weight: 3,
          dashArray: "10 6",
        },
        allowIntersection: false,
        showArea: true,
      });
    } else if (drawingMode === "marker") {
      handler = new L.Draw.Marker(map, {});
    } else if (drawingMode === "fence") {
      handler = new L.Draw.Polyline(map, {
        shapeOptions: {
          color: "#f59e0b",
          weight: 2,
          opacity: 0.8,
        },
      });
    } else {
      return;
    }

    handler.enable();
    activeDrawRef.current = handler;

    const onCreated = (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Created;
      const layer = event.layer;

      if (drawingMode === "paddock" || drawingMode === "boundary") {
        const polygon = layer as L.Polygon;
        const latLngs = polygon.getLatLngs()[0] as L.LatLng[];
        const coords: [number, number][] = latLngs.map((ll) => [ll.lat, ll.lng]);
        const area = calculatePolygonAreaHectares(coords);

        if (drawingMode === "paddock") {
          onDrawingComplete("paddock", { polygon: coords, area_hectares: area });
        } else {
          onDrawingComplete("boundary", { coordinates: coords, area_hectares: area });
        }
      } else if (drawingMode === "marker") {
        const marker = layer as L.Marker;
        const ll = marker.getLatLng();
        onDrawingComplete("marker", { lat: ll.lat, lng: ll.lng });
      } else if (drawingMode === "fence") {
        const polyline = layer as L.Polyline;
        const latLngs = polyline.getLatLngs() as L.LatLng[];
        const coords: [number, number][] = latLngs.map((ll) => [ll.lat, ll.lng]);
        const length = calculatePolylineLength(coords);
        onDrawingComplete("fence", { coordinates: coords, length_km: length });
      }

      // Clean up the temporary layer (parent will add the real one)
      drawingLayerRef.current.clearLayers();
      activeDrawRef.current = null;
      currentModeRef.current = "none";
    };

    map.on(L.Draw.Event.CREATED, onCreated);

    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      if (activeDrawRef.current) {
        try {
          (activeDrawRef.current as L.Draw.Polygon).disable();
        } catch {
          // ignore
        }
        activeDrawRef.current = null;
      }
    };
  }, [drawingMode, map, onDrawingComplete]);

  return null;
}

// ── Delete click handler ─────────────────────────────────

function DeleteClickHandler({
  drawingMode,
  paddocks,
  markers,
  fences,
  propertyBoundary,
  onDeletePaddock,
  onDeleteMarker,
  onDeleteFence,
  onDeleteBoundary,
}: {
  drawingMode: DrawingMode;
  paddocks: Paddock[];
  markers: MapMarker[];
  fences: FenceLine[];
  propertyBoundary: PropertyBoundary | null;
  onDeletePaddock?: (id: number) => void;
  onDeleteMarker?: (id: number) => void;
  onDeleteFence?: (id: number) => void;
  onDeleteBoundary?: () => void;
}) {
  useMapEvents({
    click(e) {
      if (drawingMode !== "delete") return;

      const clickLat = e.latlng.lat;
      const clickLng = e.latlng.lng;

      // Check markers first (closest match within ~50m)
      for (const marker of markers) {
        const dist = Math.sqrt(
          (marker.lat - clickLat) ** 2 + (marker.lng - clickLng) ** 2
        );
        if (dist < 0.0005) {
          onDeleteMarker?.(marker.id);
          return;
        }
      }

      // Check paddocks (point in polygon)
      for (const paddock of paddocks) {
        if (!paddock.polygon) continue;
        if (isPointInPolygon(clickLat, clickLng, paddock.polygon)) {
          onDeletePaddock?.(paddock.id);
          return;
        }
      }

      // Check property boundary
      if (propertyBoundary) {
        if (isPointInPolygon(clickLat, clickLng, propertyBoundary.coordinates)) {
          onDeleteBoundary?.();
          return;
        }
      }

      // Check fences (closest point on line within threshold)
      for (const fence of fences) {
        for (let i = 0; i < fence.coordinates.length - 1; i++) {
          const [lat1, lng1] = fence.coordinates[i];
          const [lat2, lng2] = fence.coordinates[i + 1];
          const dist = pointToSegmentDistance(clickLat, clickLng, lat1, lng1, lat2, lng2);
          if (dist < 0.0003) {
            onDeleteFence?.(fence.id);
            return;
          }
        }
      }
    },
  });

  return null;
}

function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    if (
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function pointToSegmentDistance(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

// ── Address Search Component ─────────────────────────────

export function AddressSearch({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { display_name: string; lat: string; lon: string }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const resolvedTimeout = useRef<NodeJS.Timeout | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=au`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      setResults(data);
      setShowResults(true);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => doSearch(value), 400);
  };

  const handleSelect = (result: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onLocationSelect(lat, lng, result.display_name);
    setQuery(result.display_name);
    setShowResults(false);
    setResolvedAddress(result.display_name);
    if (resolvedTimeout.current) clearTimeout(resolvedTimeout.current);
    resolvedTimeout.current = setTimeout(() => setResolvedAddress(null), 4000);
  };

  // Also support direct coordinate entry: "-28.594, 153.224"
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const coordMatch = query.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        onLocationSelect(lat, lng, `${lat}, ${lng}`);
        setShowResults(false);
        setResolvedAddress(`Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        if (resolvedTimeout.current) clearTimeout(resolvedTimeout.current);
        resolvedTimeout.current = setTimeout(() => setResolvedAddress(null), 4000);
      }
    }
  };

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1001] w-80 max-w-[calc(100vw-24px)]">
      <div className="glass-sm rounded-xl p-1.5">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-white/40 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder="Search address or coordinates..."
            className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                setShowResults(false);
              }}
              className="absolute right-2 p-1 rounded hover:bg-white/10"
            >
              <X className="w-3 h-3 text-white/40" />
            </button>
          )}
        </div>

        {showResults && results.length > 0 && (
          <div className="mt-1.5 max-h-48 overflow-y-auto">
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => handleSelect(r)}
                className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 rounded-lg transition-colors flex items-start gap-2"
              >
                <MapPin className="w-3 h-3 mt-0.5 text-white/40 shrink-0" />
                <span className="line-clamp-2">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="mt-1.5 px-3 py-2 text-xs text-white/40">
            Searching...
          </div>
        )}
      </div>

      {resolvedAddress && (
        <div className="mt-2 glass-sm rounded-lg px-3 py-2 text-xs text-white/60 animate-fade-in-up">
          <MapPin className="w-3 h-3 inline mr-1 text-blue-400" />
          {resolvedAddress}
        </div>
      )}
    </div>
  );
}

// ── Drawing Toolbar Component ────────────────────────────

export function DrawingToolbar({
  drawingMode,
  onModeChange,
}: {
  drawingMode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
}) {
  const tools = [
    { mode: "paddock" as DrawingMode, icon: Plus, label: "Add Paddock", color: "text-emerald-400" },
    { mode: "boundary" as DrawingMode, icon: Square, label: "Set Boundary", color: "text-blue-400" },
    { mode: "marker" as DrawingMode, icon: MapPin, label: "Add Marker", color: "text-amber-400" },
    { mode: "fence" as DrawingMode, icon: Minus, label: "Add Fence", color: "text-orange-400" },
    { mode: "edit" as DrawingMode, icon: Edit3, label: "Edit", color: "text-purple-400" },
    { mode: "delete" as DrawingMode, icon: Trash2, label: "Delete", color: "text-red-400" },
  ];

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1001]">
      <div className="glass-sm rounded-xl p-1.5 flex gap-1">
        {tools.map(({ mode, icon: Icon, label, color }) => (
          <button
            key={mode}
            onClick={() => onModeChange(drawingMode === mode ? "none" : mode)}
            title={label}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              drawingMode === mode
                ? "bg-white/20 text-white shadow-sm ring-1 ring-white/20"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${drawingMode === mode ? color : ""}`} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
      {drawingMode !== "none" && (
        <div className="mt-2 text-center">
          <span className="glass-sm rounded-lg px-3 py-1.5 text-xs text-white/60 inline-block">
            {drawingMode === "paddock" && "Click to draw paddock vertices. Double-click to finish."}
            {drawingMode === "boundary" && "Click to draw property boundary. Double-click to finish."}
            {drawingMode === "marker" && "Click on the map to place a marker."}
            {drawingMode === "fence" && "Click to draw fence points. Double-click to finish."}
            {drawingMode === "edit" && "Click a shape to select it, then drag vertices to edit."}
            {drawingMode === "delete" && "Click on a paddock, marker, or fence to delete it."}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Paddock Creation Form ────────────────────────────────

export interface PaddockFormData {
  name: string;
  pasture_type: string;
  capacity: number;
  water_source: boolean;
  water_source_notes: string;
  status: "active" | "resting" | "maintenance";
}

export function PaddockCreationForm({
  areaHectares,
  onSave,
  onCancel,
}: {
  areaHectares: number;
  onSave: (data: PaddockFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<PaddockFormData>({
    name: "",
    pasture_type: "Improved",
    capacity: 0,
    water_source: false,
    water_source_notes: "",
    status: "active",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="absolute inset-0 z-[1002] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="glass rounded-2xl p-6 w-96 max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)] overflow-y-auto animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">New Paddock</h3>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <div className="mb-4 bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/40 uppercase">Calculated Area</p>
          <p className="text-xl font-bold text-white">{areaHectares} hectares</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 uppercase tracking-wider mb-1.5">
              Paddock Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. North Ridge"
              className="glass-input text-sm"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 uppercase tracking-wider mb-1.5">
              Pasture Type
            </label>
            <select
              value={form.pasture_type}
              onChange={(e) => setForm({ ...form, pasture_type: e.target.value })}
              className="glass-input text-sm"
            >
              <option value="Improved">Improved Pasture</option>
              <option value="Native">Native Grass</option>
              <option value="Mixed">Mixed Pasture</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-white/50 uppercase tracking-wider mb-1.5">
              Capacity (head)
            </label>
            <input
              type="number"
              value={form.capacity || ""}
              onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
              placeholder="Max animals"
              className="glass-input text-sm"
              min={0}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.water_source}
                onChange={(e) => setForm({ ...form, water_source: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500/30"
              />
              <span className="text-sm text-white/80">Water Source Available</span>
            </label>
            {form.water_source && (
              <input
                type="text"
                value={form.water_source_notes}
                onChange={(e) => setForm({ ...form, water_source_notes: e.target.value })}
                placeholder="e.g. Dam, Trough, Creek"
                className="glass-input text-sm mt-2"
              />
            )}
          </div>

          <div>
            <label className="block text-xs text-white/50 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as PaddockFormData["status"] })}
              className="glass-input text-sm"
            >
              <option value="active">Active</option>
              <option value="resting">Resting</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 glass-btn text-sm py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 glass-btn glass-btn-primary text-sm py-2.5 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Paddock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main MapView Component ───────────────────────────────

export default function MapView({
  paddocks,
  markers,
  fences,
  propertyBoundary,
  showPaddocks,
  showLabels,
  mapStyle,
  selectedPaddock,
  onPaddockClick,
  statusColors,
  fenceConditionColors,
  markerIcons,
  drawingMode,
  onDrawingComplete,
  onDeletePaddock,
  onDeleteMarker,
  onDeleteFence,
  onDeleteBoundary,
}: MapViewProps) {
  const [flyToLocation, setFlyToLocation] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);

  const center = useMemo<L.LatLngTuple>(() => {
    if (paddocks.length === 0) return [-28.5841, 153.2482];
    const avgLat =
      paddocks.reduce((sum, p) => sum + p.lat, 0) / paddocks.length;
    const avgLng =
      paddocks.reduce((sum, p) => sum + p.lng, 0) / paddocks.length;
    return [avgLat, avgLng];
  }, [paddocks]);

  const markerIconCache = useMemo(() => {
    const cache: Record<string, L.DivIcon> = {};
    Object.entries(markerIcons).forEach(([type, emoji]) => {
      cache[type] = createMarkerIcon(emoji);
    });
    return cache;
  }, [markerIcons]);

  const handleLocationSelect = useCallback(
    (lat: number, lng: number, _address: string) => {
      setFlyToLocation({ lat, lng, zoom: 16 });
    },
    []
  );

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="w-full h-full"
      zoomControl={false}
      attributionControl={false}
      style={{ background: "#000030" }}
    >
      <TileLayer
        url={TILE_URLS[mapStyle]}
        attribution={TILE_ATTRIBUTIONS[mapStyle]}
        maxZoom={19}
      />

      <FlyToSelected paddock={selectedPaddock} />
      <FlyToLocation location={flyToLocation} />

      {/* Drawing Handler */}
      <DrawingHandler
        drawingMode={drawingMode}
        onDrawingComplete={onDrawingComplete}
      />

      {/* Delete Click Handler */}
      {drawingMode === "delete" && (
        <DeleteClickHandler
          drawingMode={drawingMode}
          paddocks={paddocks}
          markers={markers}
          fences={fences}
          propertyBoundary={propertyBoundary}
          onDeletePaddock={onDeletePaddock}
          onDeleteMarker={onDeleteMarker}
          onDeleteFence={onDeleteFence}
          onDeleteBoundary={onDeleteBoundary}
        />
      )}

      {/* Property Boundary */}
      {propertyBoundary && (
        <Polygon
          positions={propertyBoundary.coordinates.map(
            ([lat, lng]) => [lat, lng] as L.LatLngTuple
          )}
          pathOptions={{
            fillColor: "rgba(59, 130, 246, 0.08)",
            fillOpacity: 0.08,
            color: "#3b82f6",
            weight: 3,
            dashArray: "10 6",
            opacity: 0.8,
          }}
        >
          <Tooltip>
            <div>
              <strong>{propertyBoundary.name}</strong>
              <br />
              {propertyBoundary.area_hectares} ha
              <br />
              {propertyBoundary.address}
            </div>
          </Tooltip>
        </Polygon>
      )}

      {/* Paddock Polygons */}
      {showPaddocks &&
        paddocks.map((paddock) => {
          if (!paddock.polygon || paddock.polygon.length === 0) return null;
          const colors = statusColors[paddock.status];
          const isSelected = selectedPaddock?.id === paddock.id;
          return (
            <Polygon
              key={paddock.id}
              positions={paddock.polygon.map(
                ([lat, lng]) => [lat, lng] as L.LatLngTuple
              )}
              pathOptions={{
                fillColor: colors.fill,
                fillOpacity: isSelected ? 0.5 : 0.3,
                color: colors.border,
                weight: isSelected ? 3 : 2,
                dashArray: paddock.status === "resting" ? "8 4" : undefined,
              }}
              eventHandlers={{
                click: () => onPaddockClick(paddock),
              }}
            >
              {showLabels && (
                <Tooltip
                  direction="center"
                  permanent
                  className="paddock-label"
                >
                  <div style={{ textAlign: "center" }}>
                    <strong>{paddock.name}</strong>
                    <br />
                    <span style={{ fontSize: "11px", opacity: 0.8 }}>
                      {paddock.current_count}/{paddock.capacity} head
                    </span>
                  </div>
                </Tooltip>
              )}
            </Polygon>
          );
        })}

      {/* Fence Lines */}
      {fences.map((fence) => (
        <Polyline
          key={fence.id}
          positions={fence.coordinates.map(
            ([lat, lng]) => [lat, lng] as L.LatLngTuple
          )}
          pathOptions={{
            color: fenceConditionColors[fence.condition],
            weight: fence.type === "boundary" ? 3 : 2,
            opacity: 0.7,
            dashArray:
              fence.type === "electric"
                ? "6 6"
                : fence.condition === "needs_repair"
                  ? "4 8"
                  : undefined,
          }}
        >
          <Tooltip>
            <div>
              <strong>{fence.name}</strong>
              <br />
              Type: {fence.type} &middot; Condition: {fence.condition}
              {fence.length_km && (
                <>
                  <br />
                  Length: {fence.length_km} km
                </>
              )}
            </div>
          </Tooltip>
        </Polyline>
      ))}

      {/* Infrastructure Markers */}
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={markerIconCache[marker.type] || markerIconCache.water}
        >
          <Tooltip>
            <div>
              <strong>{marker.name}</strong>
              <br />
              Type: {marker.type}
              {marker.notes && (
                <>
                  <br />
                  {marker.notes}
                </>
              )}
            </div>
          </Tooltip>
        </Marker>
      ))}

      {/* Address Search Overlay */}
      <AddressSearchOverlay onLocationSelect={handleLocationSelect} />
    </MapContainer>
  );
}

// Wrapper to render the address search inside the map container's DOM context
function AddressSearchOverlay({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}) {
  // This uses a portal-like approach by positioning absolutely within the MapContainer
  return <AddressSearch onLocationSelect={onLocationSelect} />;
}
