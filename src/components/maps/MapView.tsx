"use client";

import { useEffect, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Paddock, MapMarker, FenceLine } from "@/types";

// Fix default marker icon issue with webpack/next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapViewProps {
  paddocks: Paddock[];
  markers: MapMarker[];
  fences: FenceLine[];
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
}

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

// Create emoji-based divIcon for markers
function createMarkerIcon(emoji: string): L.DivIcon {
  return L.divIcon({
    html: `<div style="font-size: 22px; text-align: center; line-height: 1; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5));">${emoji}</div>`,
    className: "custom-emoji-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

// Component to fly to selected paddock
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

export default function MapView({
  paddocks,
  markers,
  fences,
  showPaddocks,
  showLabels,
  mapStyle,
  selectedPaddock,
  onPaddockClick,
  statusColors,
  fenceConditionColors,
  markerIcons,
}: MapViewProps) {
  // Calculate center from paddock data
  const center = useMemo<L.LatLngTuple>(() => {
    if (paddocks.length === 0) return [-28.594, 153.224];
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
    </MapContainer>
  );
}
