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
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              Weight Gain Chart
            </h2>
            {weightHistory.length > 1 ? (
              <div className="relative h-52">
                {/* Y-axis labels */}
                {weightStats && (
                  <>
                    <div className="absolute left-0 top-0 text-[10px] text-white/30">{weightStats.maxWeight}kg</div>
                    <div className="absolute left-0 bottom-0 text-[10px] text-white/30">{weightStats.minWeight}kg</div>
                  </>
                )}
                {/* Chart area */}
                <div className="ml-12 h-full flex items-end gap-1">
                  {weightHistory.map((entry, i) => {
                    const min = weightStats?.minWeight ?? 0;
                    const max = weightStats?.maxWeight ?? 1;
                    const range = max - min || 1;
                    const heightPct = ((entry.weight_kg - min) / range) * 85 + 10;
                    const adgColor = entry.adg === null ? "bg-blue-400/60" :
                      entry.adg >= 0.4 ? "bg-emerald-400" :
                      entry.adg >= 0.2 ? "bg-blue-400" :
                      entry.adg >= 0.1 ? "bg-amber-400" : "bg-white/30";
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 glass-sm rounded-lg px-2 py-1.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          <p className="font-bold">{entry.weight_kg} kg</p>
                          {entry.adg !== null && <p>ADG: {entry.adg} kg/d</p>}
                          {entry.note && <p className="text-white/50">{entry.note}</p>}
                        </div>
                        <div
                          className={`w-full rounded-t-md ${adgColor} transition-all duration-300 hover:opacity-80 min-h-[4px]`}
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-[8px] text-white/30 -rotate-45 origin-left whitespace-nowrap mt-1">
                          {new Date(entry.date).toLocaleDateString("en-AU", { month: "short", year: "2-digit" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex gap-4 mt-6 ml-12">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <span className="w-3 h-2 rounded-sm bg-emerald-400" /> ADG ≥0.4
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <span className="w-3 h-2 rounded-sm bg-blue-400" /> ADG 0.2–0.4
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <span className="w-3 h-2 rounded-sm bg-amber-400" /> ADG 0.1–0.2
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <span className="w-3 h-2 rounded-sm bg-white/30" /> ADG &lt;0.1
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
