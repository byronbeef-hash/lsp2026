"use client";

import { use, useState, useMemo } from "react";
import { GlassCard, GlassBadge, GlassButton, GlassSheet } from "@/components/glass";
import { useRecordsStore, useMedicalStore } from "@/stores/modules";
import { animalWeightHistory } from "@/lib/mock-data";
import Image from "next/image";
import {
  Beef,
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Weight,
  Heart,
  Tag,
  Fingerprint,
  Printer,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Syringe,
  Activity,
  FileText,
  Clock,
  Plus,
  Scale,
  ArrowRightLeft,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

type TabKey = "overview" | "weight" | "medical" | "activity";

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <Icon className="w-4 h-4 text-white/40 flex-shrink-0" />
      <span className="text-sm text-white/50 w-32 flex-shrink-0">{label}</span>
      <span className="text-sm text-white/90">{value}</span>
    </div>
  );
}

export default function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const getRecordById = useRecordsStore((s) => s.getRecordById);
  const deleteRecord = useRecordsStore((s) => s.deleteRecord);
  const records = useRecordsStore((s) => s.records);
  const batches = useMedicalStore((s) => s.batches);

  // Find record by uuid
  const record = records.find((r) => r.uuid === id);

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [markedForSale, setMarkedForSale] = useState(false);

  if (!record) return notFound();

  // Real weight history for this animal
  const weightHistory = animalWeightHistory[record.visual_tag] || [];

  // Computed weight stats
  const weightStats = useMemo(() => {
    if (weightHistory.length < 2) return null;
    const first = weightHistory[0];
    const last = weightHistory[weightHistory.length - 1];
    const totalGain = last.weight_kg - first.weight_kg;
    const daysBetween = Math.round((new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24));
    const lifetimeAdg = daysBetween > 0 ? (totalGain / daysBetween).toFixed(2) : "0";
    const lastAdg = last.adg;
    const peakAdg = Math.max(...weightHistory.filter(w => w.adg !== null).map(w => w.adg as number));
    const maxWeight = Math.max(...weightHistory.map(w => w.weight_kg));
    const minWeight = Math.min(...weightHistory.map(w => w.weight_kg));
    return { totalGain, lifetimeAdg, lastAdg, peakAdg, maxWeight, minWeight, daysBetween };
  }, [weightHistory]);

  // Medical batches this animal is in
  const animalMedicalBatches = batches.filter((b) =>
    b.animals.includes(record.visual_tag)
  );

  // Mock activity log
  const activityLog = [
    {
      id: 1,
      type: "added",
      description: `${record.visual_tag} added to the system`,
      date: record.created_at,
      icon: Plus,
    },
    {
      id: 2,
      type: "weighed",
      description: `Weighed at ${record.weight_kg} kg during routine weigh-in`,
      date: record.record_date ?? "2026-03-01",
      icon: Scale,
    },
    {
      id: 3,
      type: "treated",
      description: "Spring Vaccination 2026 - Bovilis MH+IBR administered",
      date: "2026-03-01",
      icon: Syringe,
    },
    {
      id: 4,
      type: "moved",
      description: `Moved to paddock ${record.paddock_id ?? "N/A"}`,
      date: "2026-02-15",
      icon: ArrowRightLeft,
    },
    {
      id: 5,
      type: "weighed",
      description: `Weighed at ${(record.weight_kg ?? 450) - 7} kg`,
      date: "2026-02-08",
      icon: Scale,
    },
    {
      id: 6,
      type: "treated",
      description: "Clostridial Booster - Ultravac 7in1 administered",
      date: "2026-02-10",
      icon: Syringe,
    },
  ];

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: FileText },
    { key: "weight", label: "Weight History", icon: Weight },
    { key: "medical", label: "Medical History", icon: Syringe },
    { key: "activity", label: "Activity Log", icon: Activity },
  ];

  const handleDelete = () => {
    deleteRecord(record.id);
    router.push("/records");
  };

  const handleExport = () => {
    const headers = [
      "visual_tag", "eid", "breed", "sex", "weight_kg", "weight_lb",
      "condition", "date_of_birth", "record_date", "notes",
    ];
    const csvRows = [
      headers.join(","),
      headers
        .map((h) => {
          const val = record[h as keyof typeof record];
          if (val == null) return "";
          const str = String(val);
          return str.includes(",") ? `"${str}"` : str;
        })
        .join(","),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.visual_tag}-record.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Back button */}
      <Link
        href="/records"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Records
      </Link>

      {/* Header Card */}
      <GlassCard className="animate-fade-in-up">
        <div className="flex items-start gap-4">
          {record.profile_image ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
              <Image
                src={record.profile_image}
                alt={record.visual_tag}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Beef className="w-8 h-8 text-white/60" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-xl font-bold text-white">{record.visual_tag}</h1>
              <GlassBadge variant={record.sex === "Male" ? "info" : "success"}>
                {record.sex}
              </GlassBadge>
              {record.is_pregnant && (
                <GlassBadge variant="warning">Pregnant</GlassBadge>
              )}
              {markedForSale && (
                <GlassBadge variant="danger">For Sale</GlassBadge>
              )}
            </div>
            <p className="text-white/50">
              {record.breed} &middot;{" "}
              <GlassBadge
                variant={
                  record.condition === "Excellent"
                    ? "success"
                    : record.condition === "Fair"
                      ? "warning"
                      : "default"
                }
              >
                {record.condition}
              </GlassBadge>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap flex-shrink-0">
            <Link href={`/records/${record.uuid}/edit`}>
              <GlassButton size="sm" icon={<Edit className="w-4 h-4" />}>
                Edit
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

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap animate-fade-in-up" style={{ animationDelay: "25ms" } as React.CSSProperties}>
        <GlassButton
          size="sm"
          variant={markedForSale ? "danger" : "default"}
          icon={<DollarSign className="w-4 h-4" />}
          onClick={() => setMarkedForSale(!markedForSale)}
        >
          {markedForSale ? "Unmark for Sale" : "Mark for Sale"}
        </GlassButton>
        <GlassButton
          size="sm"
          icon={<Printer className="w-4 h-4" />}
          onClick={handleExport}
        >
          Print / Export
        </GlassButton>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 glass p-1 rounded-2xl w-fit animate-fade-in-up overflow-x-auto"
        style={{ animationDelay: "50ms" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <GlassCard
              className="animate-fade-in-up"
              style={{ animationDelay: "75ms" } as React.CSSProperties}
            >
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                Identification
              </h2>
              <DetailRow icon={Tag} label="Visual Tag" value={record.visual_tag} />
              <DetailRow
                icon={Fingerprint}
                label="EID"
                value={
                  record.eid ? (
                    <span className="font-mono text-xs">{record.eid}</span>
                  ) : (
                    <span className="text-white/30">Not assigned</span>
                  )
                }
              />
              <DetailRow icon={Beef} label="Breed" value={record.breed} />
              <DetailRow
                icon={Heart}
                label="Sex"
                value={
                  <GlassBadge variant={record.sex === "Male" ? "info" : "success"}>
                    {record.sex}
                  </GlassBadge>
                }
              />
            </GlassCard>

            <GlassCard
              className="animate-fade-in-up"
              style={{ animationDelay: "100ms" } as React.CSSProperties}
            >
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                Measurements
              </h2>
              <DetailRow
                icon={Weight}
                label="Weight"
                value={
                  record.weight_kg
                    ? `${record.weight_kg} kg (${record.weight_lb} lb)`
                    : null
                }
              />
              <DetailRow
                icon={Calendar}
                label="Record Date"
                value={record.record_date}
              />
              <DetailRow
                icon={Calendar}
                label="Date of Birth"
                value={record.date_of_birth}
              />
              <DetailRow
                icon={Heart}
                label="Condition"
                value={
                  <GlassBadge
                    variant={
                      record.condition === "Excellent"
                        ? "success"
                        : record.condition === "Fair"
                          ? "warning"
                          : "default"
                    }
                  >
                    {record.condition}
                  </GlassBadge>
                }
              />
            </GlassCard>
          </div>

          {/* Lineage */}
          <GlassCard
            className="animate-fade-in-up"
            style={{ animationDelay: "125ms" } as React.CSSProperties}
          >
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
              Lineage
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-1">Mother</p>
                <p className="text-white/80 font-medium">
                  {record.mother_visual_tag || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Father</p>
                <p className="text-white/80 font-medium">
                  {record.father_visual_tag || "Unknown"}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Notes */}
          {record.notes && (
            <GlassCard
              className="animate-fade-in-up"
              style={{ animationDelay: "150ms" } as React.CSSProperties}
            >
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                Notes
              </h2>
              <p className="text-white/70 text-sm">{record.notes}</p>
            </GlassCard>
          )}
        </>
      )}

      {activeTab === "weight" && (
        <div className="space-y-4">
          {/* Weight Stats Summary */}
          {weightStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: "75ms" } as React.CSSProperties}>
              <GlassCard>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Current Weight</p>
                <p className="text-2xl font-bold text-white mt-1">{record.weight_kg} kg</p>
                <p className="text-xs text-white/40">{record.weight_lb} lb</p>
              </GlassCard>
              <GlassCard>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Total Gain</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">+{weightStats.totalGain} kg</p>
                <p className="text-xs text-white/40">from weaning</p>
              </GlassCard>
              <GlassCard>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Lifetime ADG</p>
                <p className="text-2xl font-bold text-white mt-1">{weightStats.lifetimeAdg} kg/d</p>
                <p className="text-xs text-white/40">over {Math.round(weightStats.daysBetween / 30)} months</p>
              </GlassCard>
              <GlassCard>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Current ADG</p>
                <p className={`text-2xl font-bold mt-1 ${(weightStats.lastAdg ?? 0) >= 0.3 ? "text-emerald-400" : (weightStats.lastAdg ?? 0) >= 0.1 ? "text-amber-400" : "text-white/60"}`}>
                  {weightStats.lastAdg?.toFixed(2) ?? "--"} kg/d
                </p>
                <p className="text-xs text-white/40">peak: {weightStats.peakAdg.toFixed(2)} kg/d</p>
              </GlassCard>
            </div>
          )}

          {/* Weight Gain Chart */}
          <GlassCard className="animate-fade-in-up" style={{ animationDelay: "100ms" } as React.CSSProperties}>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">
              Weight Gain Chart
            </h2>
            {weightHistory.length > 1 && weightStats ? (
              <div>
                {/* SVG Area Chart */}
                <div className="relative">
                  <svg viewBox="0 0 800 300" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                    {/* Background grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                      const y = 20 + (260 - 20) * (1 - frac);
                      const val = Math.round(weightStats.minWeight + (weightStats.maxWeight - weightStats.minWeight) * frac);
                      return (
                        <g key={frac}>
                          <line x1="60" y1={y} x2="780" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                          <text x="52" y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="10">{val}</text>
                        </g>
                      );
                    })}

                    {/* Gradient fill under the line */}
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
                        <stop offset="100%" stopColor="rgba(59,130,246,0.02)" />
                      </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <path
                      d={(() => {
                        const pts = weightHistory.map((e, i) => {
                          const x = 60 + (i / (weightHistory.length - 1)) * 720;
                          const yFrac = (e.weight_kg - weightStats.minWeight) / (weightStats.maxWeight - weightStats.minWeight || 1);
                          const y = 260 - yFrac * 240;
                          return `${x},${y}`;
                        });
                        return `M${pts[0]} ${pts.map((p) => `L${p}`).join(" ")} L${60 + 720},260 L60,260 Z`;
                      })()}
                      fill="url(#weightGrad)"
                    />

                    {/* Line */}
                    <polyline
                      points={weightHistory.map((e, i) => {
                        const x = 60 + (i / (weightHistory.length - 1)) * 720;
                        const yFrac = (e.weight_kg - weightStats.minWeight) / (weightStats.maxWeight - weightStats.minWeight || 1);
                        const y = 260 - yFrac * 240;
                        return `${x},${y}`;
                      }).join(" ")}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />

                    {/* Data points + labels */}
                    {weightHistory.map((entry, i) => {
                      const x = 60 + (i / (weightHistory.length - 1)) * 720;
                      const yFrac = (entry.weight_kg - weightStats.minWeight) / (weightStats.maxWeight - weightStats.minWeight || 1);
                      const y = 260 - yFrac * 240;
                      const dotColor = entry.adg === null ? "#60a5fa" :
                        entry.adg >= 0.4 ? "#34d399" :
                        entry.adg >= 0.2 ? "#60a5fa" :
                        entry.adg >= 0.1 ? "#fbbf24" : "rgba(255,255,255,0.4)";
                      return (
                        <g key={i}>
                          {/* Dot */}
                          <circle cx={x} cy={y} r="5" fill={dotColor} stroke="#000030" strokeWidth="2" />
                          {/* Weight label above dot */}
                          <text x={x} y={y - 12} textAnchor="middle" fill="white" fontSize="10" fontWeight="600">
                            {entry.weight_kg}
                          </text>
                          {/* ADG label below dot (if not first) */}
                          {entry.adg !== null && (
                            <text x={x} y={y + 18} textAnchor="middle" fill={dotColor} fontSize="8.5" fontWeight="500">
                              {entry.adg.toFixed(2)}
                            </text>
                          )}
                          {/* Date on X-axis */}
                          <text x={x} y={282} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">
                            {new Date(entry.date).toLocaleDateString("en-AU", { month: "short", year: "2-digit" })}
                          </text>
                        </g>
                      );
                    })}

                    {/* Axis labels */}
                    <text x="10" y="150" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="9" transform="rotate(-90, 10, 150)">Weight (kg)</text>
                  </svg>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-3 justify-center">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> ADG ≥0.4 kg/d
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> ADG 0.2–0.4
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> ADG 0.1–0.2
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/40" /> ADG &lt;0.1
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/40 text-center py-8">Not enough data points for chart</p>
            )}
          </GlassCard>

          {/* Weight Records Table */}
          <GlassCard className="animate-fade-in-up" style={{ animationDelay: "125ms" } as React.CSSProperties}>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              Weight Records
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">Date</th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">Weight</th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">Change</th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">ADG</th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[...weightHistory].reverse().map((entry, index) => {
                    const revIdx = weightHistory.length - 1 - index;
                    const prevWeight = revIdx > 0 ? weightHistory[revIdx - 1].weight_kg : null;
                    const change = prevWeight !== null ? entry.weight_kg - prevWeight : null;
                    return (
                      <tr key={index} className="border-b border-white/5">
                        <td className="px-4 py-3 text-sm text-white/70">{entry.date}</td>
                        <td className="px-4 py-3 text-sm text-white font-medium">{entry.weight_kg} kg</td>
                        <td className="px-4 py-3">
                          {change !== null ? (
                            <span className={`inline-flex items-center gap-1 text-sm font-medium ${change > 0 ? "text-emerald-400" : change < 0 ? "text-red-400" : "text-white/50"}`}>
                              {change > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : change < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                              {change > 0 ? "+" : ""}{change} kg
                            </span>
                          ) : (
                            <span className="text-sm text-white/30">--</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {entry.adg !== null ? (
                            <span className={`text-sm font-medium ${entry.adg >= 0.4 ? "text-emerald-400" : entry.adg >= 0.2 ? "text-blue-400" : entry.adg >= 0.1 ? "text-amber-400" : "text-white/50"}`}>
                              {entry.adg.toFixed(2)} kg/d
                            </span>
                          ) : (
                            <span className="text-sm text-white/30">--</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-white/50">{entry.note || ""}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === "medical" && (
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "75ms" } as React.CSSProperties}>
          {animalMedicalBatches.length > 0 ? (
            animalMedicalBatches.map((batch) => (
              <Link href={`/medical/${batch.id}`} key={batch.id}>
                <GlassCard hover className="mb-3">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Syringe className="w-6 h-6 text-white/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-white">{batch.batch_name}</p>
                        <GlassBadge
                          variant={
                            batch.status === "active"
                              ? "success"
                              : batch.status === "scheduled"
                                ? "info"
                                : "default"
                          }
                        >
                          {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                        </GlassBadge>
                      </div>
                      <p className="text-sm text-white/50">
                        {batch.treatment_type} &middot; {batch.medication}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {batch.dosage} &middot; Scheduled: {batch.scheduled_date}
                        {batch.completed_date ? ` &middot; Completed: ${batch.completed_date}` : ""}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))
          ) : (
            <GlassCard>
              <div className="text-center py-8 text-white/40">
                <Syringe className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No medical records for this animal</p>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "75ms" } as React.CSSProperties}>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
            Activity Log
          </h2>
          <div className="space-y-0">
            {activityLog.map((entry, index) => (
              <div
                key={entry.id}
                className="flex gap-4 py-3 border-b border-white/5 last:border-0"
              >
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <entry.icon className="w-4 h-4 text-white/60" />
                  </div>
                  {index < activityLog.length - 1 && (
                    <div className="w-px h-full bg-white/10 absolute top-8" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <p className="text-sm text-white/80">{entry.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-white/30" />
                    <p className="text-xs text-white/40">
                      {new Date(entry.date).toLocaleDateString("en-AU", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <GlassBadge variant="default">{entry.type}</GlassBadge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Delete Confirmation Modal */}
      <GlassSheet
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Record"
      >
        <div className="space-y-4">
          <p className="text-white/70">
            Are you sure you want to delete <span className="font-semibold text-white">{record.visual_tag}</span>?
            This action cannot be undone.
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
              Delete Record
            </GlassButton>
          </div>
        </div>
      </GlassSheet>
    </div>
  );
}
