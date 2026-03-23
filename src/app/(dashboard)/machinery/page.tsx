"use client";

import { useState } from "react";
import { GlassCard, GlassButton, GlassBadge } from "@/components/glass";
import {
  Wrench,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  AlertTriangle,
  Calendar,
  Clock,
  ChevronDown,
  Gauge,
  Truck,
} from "lucide-react";

type EquipmentType = "tractor" | "ute" | "quad bike" | "trailer" | "pump" | "fencing gear";
type EquipmentStatus = "operational" | "needs service" | "out of service";
type FilterTab = "all" | EquipmentStatus;
type ServiceType = "oil change" | "tyre" | "repair" | "inspection";

interface ServiceRecord {
  id: number;
  date: string;
  type: ServiceType;
  cost: number;
  notes: string;
}

interface Equipment {
  id: number;
  name: string;
  type: EquipmentType;
  year: number;
  status: EquipmentStatus;
  lastServiceDate: string;
  nextServiceDue: string;
  hoursKm: string;
  value: number;
  serviceHistory: ServiceRecord[];
}

const mockEquipment: Equipment[] = [
  {
    id: 1,
    name: "John Deere 6120M",
    type: "tractor",
    year: 2021,
    status: "operational",
    lastServiceDate: "2026-02-15",
    nextServiceDue: "2026-05-15",
    hoursKm: "2,450 hrs",
    value: 185000,
    serviceHistory: [
      { id: 1, date: "2026-02-15", type: "oil change", cost: 380, notes: "Engine oil + filters replaced" },
      { id: 2, date: "2025-11-20", type: "inspection", cost: 150, notes: "Annual safety inspection passed" },
      { id: 3, date: "2025-08-10", type: "tyre", cost: 1200, notes: "Rear tyres replaced - Firestone" },
    ],
  },
  {
    id: 2,
    name: "Toyota Hilux SR5",
    type: "ute",
    year: 2023,
    status: "operational",
    lastServiceDate: "2026-03-01",
    nextServiceDue: "2026-06-01",
    hoursKm: "38,200 km",
    value: 62000,
    serviceHistory: [
      { id: 4, date: "2026-03-01", type: "oil change", cost: 290, notes: "15,000km service - Toyota dealer" },
      { id: 5, date: "2025-12-05", type: "tyre", cost: 880, notes: "All terrain tyres x4 - BF Goodrich" },
    ],
  },
  {
    id: 3,
    name: "Honda TRX520",
    type: "quad bike",
    year: 2022,
    status: "needs service",
    lastServiceDate: "2025-10-12",
    nextServiceDue: "2026-03-12",
    hoursKm: "1,180 hrs",
    value: 14500,
    serviceHistory: [
      { id: 6, date: "2025-10-12", type: "oil change", cost: 120, notes: "Oil and air filter" },
      { id: 7, date: "2025-06-18", type: "repair", cost: 450, notes: "Front CV joint replaced" },
    ],
  },
  {
    id: 4,
    name: "Cattle Trailer 24ft",
    type: "trailer",
    year: 2019,
    status: "operational",
    lastServiceDate: "2026-01-20",
    nextServiceDue: "2026-07-20",
    hoursKm: "N/A",
    value: 32000,
    serviceHistory: [
      { id: 8, date: "2026-01-20", type: "inspection", cost: 85, notes: "Roadworthy inspection - passed" },
      { id: 9, date: "2025-09-15", type: "repair", cost: 320, notes: "Floor boards replaced in rear section" },
      { id: 10, date: "2025-05-02", type: "tyre", cost: 640, notes: "Replaced 2 tyres and bearing repack" },
    ],
  },
  {
    id: 5,
    name: "Davey Fire Pump",
    type: "pump",
    year: 2020,
    status: "out of service",
    lastServiceDate: "2025-12-01",
    nextServiceDue: "2026-03-01",
    hoursKm: "320 hrs",
    value: 3200,
    serviceHistory: [
      { id: 11, date: "2025-12-01", type: "repair", cost: 180, notes: "Impeller housing cracked - awaiting parts" },
      { id: 12, date: "2025-06-20", type: "oil change", cost: 45, notes: "Engine oil change" },
    ],
  },
  {
    id: 6,
    name: "Gallagher Fencing Kit",
    type: "fencing gear",
    year: 2024,
    status: "operational",
    lastServiceDate: "2026-02-28",
    nextServiceDue: "2026-08-28",
    hoursKm: "N/A",
    value: 4800,
    serviceHistory: [
      { id: 13, date: "2026-02-28", type: "inspection", cost: 0, notes: "All gear checked and sorted" },
      { id: 14, date: "2025-11-10", type: "repair", cost: 220, notes: "Post driver piston seal replaced" },
    ],
  },
];

const filterTabs: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "operational", label: "Operational" },
  { value: "needs service", label: "Needs Service" },
  { value: "out of service", label: "Out of Service" },
];

const statusBadgeVariant = (status: EquipmentStatus): "success" | "warning" | "danger" => {
  switch (status) {
    case "operational": return "success";
    case "needs service": return "warning";
    case "out of service": return "danger";
  }
};

export default function MachineryPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [equipment, setEquipment] = useState(mockEquipment);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const filtered = activeTab === "all" ? equipment : equipment.filter((e) => e.status === activeTab);

  const totalEquipment = equipment.length;
  const dueForService = equipment.filter((e) => e.status === "needs service" || e.status === "out of service").length;
  const totalMaintenanceCost = equipment.reduce(
    (sum, e) => sum + e.serviceHistory.reduce((s, r) => s + r.cost, 0),
    0
  );
  const totalValue = equipment.reduce((sum, e) => sum + e.value, 0);

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = (id: number) => {
    setEquipment((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Machinery & Equipment</h1>
          <p className="text-white/50 mt-1">Manage equipment, services and maintenance</p>
        </div>
        <GlassButton variant="primary" icon={<Plus className="w-4 h-4" />}>
          Add Equipment
        </GlassButton>
      </div>

      {/* Stats Row */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up"
        style={{ animationDelay: "50ms" } as React.CSSProperties}
      >
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Total Equipment</p>
              <p className="text-lg font-bold text-white">{totalEquipment}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Due for Service</p>
              <p className="text-lg font-bold text-white">{dueForService}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Maintenance (YTD)</p>
              <p className="text-lg font-bold text-white">${totalMaintenanceCost.toLocaleString()}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Equipment Value</p>
              <p className="text-lg font-bold text-white">${(totalValue / 1000).toFixed(0)}k</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filter Tabs */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 animate-fade-in-up"
        style={{ animationDelay: "100ms" } as React.CSSProperties}
      >
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.value
                ? "bg-white/20 text-white border border-white/20"
                : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Equipment Cards */}
      <div className="space-y-3">
        {filtered.map((item, index) => {
          const isExpanded = expandedIds.has(item.id);
          return (
            <GlassCard
              key={item.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${150 + index * 50}ms` } as React.CSSProperties}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.status === "operational" ? "bg-blue-500/20" : item.status === "needs service" ? "bg-amber-500/20" : "bg-red-500/20"
                }`}>
                  <Truck className={`w-5 h-5 ${
                    item.status === "operational" ? "text-blue-400" : item.status === "needs service" ? "text-amber-400" : "text-red-400"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-white text-sm">{item.name}</h3>
                    <GlassBadge variant={statusBadgeVariant(item.status)}>{item.status}</GlassBadge>
                    <GlassBadge>{item.type}</GlassBadge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/50 flex-wrap">
                    <span>Year: <span className="text-white/80">{item.year}</span></span>
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3 h-3" />
                      <span className="text-white/80">{item.hoursKm}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Last: <span className="text-white/80">{item.lastServiceDate}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Next: <span className={`${
                        new Date(item.nextServiceDue) <= new Date() ? "text-amber-400" : "text-white/80"
                      }`}>{item.nextServiceDue}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Value: <span className="text-white/80">${item.value.toLocaleString()}</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <GlassButton size="sm" icon={<Edit className="w-4 h-4" />} />
                  <GlassButton
                    size="sm"
                    variant="danger"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => handleDelete(item.id)}
                  />
                </div>
              </div>

              {/* Service History Toggle */}
              <button
                onClick={() => toggleExpanded(item.id)}
                className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/10 text-xs text-white/50 hover:text-white/70 transition-colors w-full"
              >
                <Wrench className="w-3 h-3" />
                <span>Service History ({item.serviceHistory.length})</span>
                <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>

              {/* Expanded Service History */}
              {isExpanded && (
                <div className="mt-3 space-y-2">
                  {item.serviceHistory.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-xs"
                    >
                      <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-3 h-3 text-white/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white/80 font-medium capitalize">{service.type}</span>
                          <span className="text-white/40">{service.date}</span>
                        </div>
                        <p className="text-white/50 truncate">{service.notes}</p>
                      </div>
                      <span className="text-white/70 font-medium flex-shrink-0">
                        {service.cost > 0 ? `$${service.cost}` : "Free"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <GlassCard className="text-center py-12">
          <Truck className="w-10 h-10 mx-auto mb-3 text-white/30" />
          <p className="text-white/50 text-sm">No equipment found in this category</p>
        </GlassCard>
      )}
    </div>
  );
}
