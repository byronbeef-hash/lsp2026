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
  History,
  Baby,
  Camera,
  ScrollText,
  Download,
  Eye,
  ImageIcon,
  Video,
  Play,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

type TabKey =
  | "details"
  | "weight"
  | "medical"
  | "activity"
  | "history"
  | "progeny"
  | "photo"
  | "video"
  | "papers";

/* ───────────── Table row for Record Details tab ───────────── */
function FieldRow({
  label,
  value,
  labelVariant,
}: {
  label: string;
  value: React.ReactNode;
  labelVariant?: "green" | "yellow";
}) {
  const labelBg =
    labelVariant === "green"
      ? "bg-emerald-500/20 text-emerald-300"
      : labelVariant === "yellow"
        ? "bg-amber-400/20 text-amber-300"
        : "bg-white/10 text-white/60";

  return (
    <tr className="border-b border-white/5 last:border-0">
      <td className="py-2.5 pr-4 w-44 align-top">
        <span
          className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium ${labelBg}`}
        >
          {label}
        </span>
      </td>
      <td className="py-2.5 text-sm text-white/90">{value ?? <span className="text-white/30">--</span>}</td>
    </tr>
  );
}

/* ───────────── Helper: calculate age from DOB ───────────── */
function calcAge(dob: string | null): string {
  if (!dob) return "--";
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years > 0) return `${years} yr${years > 1 ? "s" : ""} ${months} mo`;
  return `${months} mo`;
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

  const [activeTab, setActiveTab] = useState<TabKey>("details");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [markedForSale, setMarkedForSale] = useState(false);

  if (!record) return notFound();

  // ──── Mock extended data (fields not on the LivestockRecord type) ────
  const extendedData = {
    vid2: "V-" + (record.visual_tag || "").replace(/[^0-9]/g, "") + "-B",
    status: "On Property" as const,
    dosage: "Standard",
    geneticHealth: "Clear",
    purchaseDate: "2024-06-15",
    purchasePrice: "$2,400.00",
    group: "Breeders",
    marker: "Blue ear tag",
    medicalBatch: "Spring Vaccination 2026",
    teethCount: 8,
    teethCondition: "Good",
    feetCondition: "Good",
    pregnantMonths: record.is_pregnant ? 5 : null,
  };

  // ──── Mock progeny ────
  const progeny = [
    {
      id: 1,
      visual_tag: record.visual_tag + "-C1",
      sex: "Female" as const,
      dob: "2025-09-12",
      breed: record.breed || "Angus",
      weight_kg: 185,
      status: "On Property",
    },
    {
      id: 2,
      visual_tag: record.visual_tag + "-C2",
      sex: "Male" as const,
      dob: "2024-08-03",
      breed: record.breed || "Angus",
      weight_kg: 320,
      status: "Sold",
    },
    {
      id: 3,
      visual_tag: record.visual_tag + "-C3",
      sex: "Female" as const,
      dob: "2026-01-20",
      breed: record.breed || "Angus",
      weight_kg: 95,
      status: "On Property",
    },
  ];

  // ──── Mock record history (changelog) ────
  const recordHistory = [
    {
      id: 1,
      date: "2026-03-20 14:32",
      user: "Tim Dickinson",
      field: "Weight",
      oldValue: "445 kg",
      newValue: `${record.weight_kg} kg`,
    },
    {
      id: 2,
      date: "2026-03-15 09:10",
      user: "Tim Dickinson",
      field: "Condition",
      oldValue: "Fair",
      newValue: record.condition || "Good",
    },
    {
      id: 3,
      date: "2026-02-28 11:45",
      user: "Sarah Johnson",
      field: "Paddock",
      oldValue: "Paddock 3",
      newValue: `Paddock ${record.paddock_id ?? "5"}`,
    },
    {
      id: 4,
      date: "2026-02-10 08:22",
      user: "Tim Dickinson",
      field: "Notes",
      oldValue: "--",
      newValue: record.notes || "Routine check-up completed",
    },
    {
      id: 5,
      date: "2026-01-05 16:00",
      user: "Tim Dickinson",
      field: "Record Created",
      oldValue: "--",
      newValue: "Initial record created",
    },
  ];

  // ──── Mock papers / documents ────
  const papers = [
    {
      id: 1,
      name: "Birth Certificate",
      type: "Certificate",
      date: record.date_of_birth || "2022-03-15",
      fileSize: "245 KB",
    },
    {
      id: 2,
      name: "NLIS Transfer",
      type: "Transfer Document",
      date: "2024-06-15",
      fileSize: "128 KB",
    },
    {
      id: 3,
      name: "Vet Health Report",
      type: "Veterinary Report",
      date: "2026-02-10",
      fileSize: "512 KB",
    },
  ];

  // Real weight history for this animal
  const weightHistory = animalWeightHistory[record.visual_tag] || [];

  // Computed weight stats
  const weightStats = useMemo(() => {
    if (weightHistory.length < 2) return null;
    const first = weightHistory[0];
    const last = weightHistory[weightHistory.length - 1];
    const totalGain = last.weight_kg - first.weight_kg;
    const daysBetween = Math.round(
      (new Date(last.date).getTime() - new Date(first.date).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const lifetimeAdg =
      daysBetween > 0 ? (totalGain / daysBetween).toFixed(2) : "0";
    const lastAdg = last.adg;
    const peakAdg = Math.max(
      ...weightHistory.filter((w) => w.adg !== null).map((w) => w.adg as number)
    );
    const maxWeight = Math.max(...weightHistory.map((w) => w.weight_kg));
    const minWeight = Math.min(...weightHistory.map((w) => w.weight_kg));
    return {
      totalGain,
      lifetimeAdg,
      lastAdg,
      peakAdg,
      maxWeight,
      minWeight,
      daysBetween,
    };
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
      description:
        "Spring Vaccination 2026 - Bovilis MH+IBR administered",
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
      description:
        "Clostridial Booster - Ultravac 7in1 administered",
      date: "2026-02-10",
      icon: Syringe,
    },
  ];

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "details", label: "Record Details", icon: FileText },
    { key: "weight", label: "Weight History", icon: Weight },
    { key: "medical", label: "Medical History", icon: Syringe },
    { key: "activity", label: "Activity History", icon: Activity },
    { key: "history", label: "Record History", icon: History },
    { key: "progeny", label: "Progeny", icon: Baby },
    { key: "photo", label: "Photo", icon: Camera },
    { key: "video", label: "Video", icon: Video },
    { key: "papers", label: "Papers", icon: ScrollText },
  ];

  const handleDelete = () => {
    deleteRecord(record.id);
    router.push("/records");
  };

  const handleExport = () => {
    const headers = [
      "visual_tag",
      "eid",
      "breed",
      "sex",
      "weight_kg",
      "weight_lb",
      "condition",
      "date_of_birth",
      "record_date",
      "notes",
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
    <div className="space-y-5 max-w-6xl mx-auto">
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
              <h1 className="text-xl font-bold text-white">
                {record.visual_tag}
              </h1>
              <GlassBadge
                variant={record.sex === "Male" ? "info" : "success"}
              >
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
      <div
        className="flex gap-2 flex-wrap animate-fade-in-up"
        style={{ animationDelay: "25ms" } as React.CSSProperties}
      >
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
        className="flex gap-1 glass p-1 rounded-2xl w-fit max-w-full animate-fade-in-up overflow-x-auto"
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

      {/* ════════════════ TAB: Record Details ════════════════ */}
      {activeTab === "details" && (
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in-up"
          style={{ animationDelay: "75ms" } as React.CSSProperties}
        >
          {/* Column 1 - General */}
          <GlassCard>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
              General
            </h2>
            <table className="w-full">
              <tbody>
                <FieldRow label="EID" value={record.eid ? <span className="font-mono text-xs">{record.eid}</span> : null} labelVariant="green" />
                <FieldRow label="Visual Tag" value={record.visual_tag} labelVariant="green" />
                <FieldRow label="VID 2" value={extendedData.vid2} labelVariant="green" />
              </tbody>
            </table>

            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mt-5 mb-2">
              Status
            </h3>
            <table className="w-full">
              <tbody>
                <FieldRow
                  label="Status"
                  value={
                    <GlassBadge variant="success">{extendedData.status}</GlassBadge>
                  }
                  labelVariant="yellow"
                />
                <FieldRow
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
                  labelVariant="yellow"
                />
                <FieldRow label="Date of Birth" value={record.date_of_birth} labelVariant="yellow" />
                <FieldRow label="Date of Death" value={record.date_of_death} labelVariant="yellow" />
                <FieldRow label="Age" value={calcAge(record.date_of_birth)} labelVariant="yellow" />
                <FieldRow label="Dosage" value={extendedData.dosage} />
                <FieldRow label="Genetic Health" value={extendedData.geneticHealth} />
              </tbody>
            </table>

            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mt-5 mb-2">
              Purchased
            </h3>
            <table className="w-full">
              <tbody>
                <FieldRow label="Date of Purchase" value={extendedData.purchaseDate} />
                <FieldRow label="Purchase Price" value={extendedData.purchasePrice} labelVariant="green" />
              </tbody>
            </table>
          </GlassCard>

          {/* Column 2 - Descriptive */}
          <GlassCard>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
              Descriptive
            </h2>
            <table className="w-full">
              <tbody>
                <FieldRow label="Group" value={extendedData.group} />
                <FieldRow label="Marker" value={extendedData.marker} />
                <FieldRow label="Medical Batch" value={extendedData.medicalBatch} />
                <FieldRow
                  label="Sex"
                  value={
                    <GlassBadge variant={record.sex === "Male" ? "info" : "success"}>
                      {record.sex}
                    </GlassBadge>
                  }
                  labelVariant="green"
                />
                <FieldRow label="Breed" value={record.breed} labelVariant="green" />
                <FieldRow label="No. of Teeth" value={extendedData.teethCount} />
                <FieldRow label="Teeth Condition" value={extendedData.teethCondition} />
                <FieldRow label="Feet Condition" value={extendedData.feetCondition} />
                <FieldRow
                  label="Pregnant"
                  value={
                    record.is_pregnant ? (
                      <GlassBadge variant="warning">Yes</GlassBadge>
                    ) : (
                      "No"
                    )
                  }
                  labelVariant="yellow"
                />
                <FieldRow
                  label="Pregnant Months"
                  value={extendedData.pregnantMonths ? `${extendedData.pregnantMonths} months` : "--"}
                />
                <FieldRow
                  label="Dehorn"
                  value={record.is_dehorn ? "Yes" : "No"}
                />
                <FieldRow label="Mother Visual Tag" value={record.mother_visual_tag || "Unknown"} labelVariant="green" />
                <FieldRow label="Father Visual Tag" value={record.father_visual_tag || "Unknown"} labelVariant="green" />
                <FieldRow label="Record Date" value={record.record_date} />
                <FieldRow label="Notes" value={record.notes} />
              </tbody>
            </table>
          </GlassCard>

          {/* Column 3 - Photo */}
          <GlassCard>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
              Photo
            </h2>
            <div className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5">
              {record.profile_image ? (
                <Image
                  src={record.profile_image}
                  alt={record.visual_tag}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/30">
                  <Beef className="w-16 h-16 mb-2" />
                  <p className="text-sm">No photo available</p>
                </div>
              )}
            </div>
            <div className="mt-3 space-y-2 text-sm text-white/50">
              <p>
                <span className="text-white/30">Weight:</span>{" "}
                {record.weight_kg ? `${record.weight_kg} kg (${record.weight_lb} lb)` : "--"}
              </p>
              <p>
                <span className="text-white/30">Last Updated:</span>{" "}
                {record.updated_at
                  ? new Date(record.updated_at).toLocaleDateString("en-AU")
                  : "--"}
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ════════════════ TAB: Weight History ════════════════ */}
      {activeTab === "weight" && (
        <div className="space-y-4">
          {/* Weight Stats Summary */}
          {weightStats && (
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up"
              style={{ animationDelay: "75ms" } as React.CSSProperties}
            >
              <GlassCard>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Current Weight
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {record.weight_kg} kg
                </p>
                <p className="text-xs text-white/40">{record.weight_lb} lb</p>
              </GlassCard>
              <GlassCard>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Total Gain
                </p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  +{weightStats.totalGain} kg
                </p>
                <p className="text-xs text-white/40">from weaning</p>
              </GlassCard>
              <GlassCard>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Lifetime ADG
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {weightStats.lifetimeAdg} kg/d
                </p>
                <p className="text-xs text-white/40">
                  over {Math.round(weightStats.daysBetween / 30)} months
                </p>
              </GlassCard>
              <GlassCard>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Current ADG
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    (weightStats.lastAdg ?? 0) >= 0.3
                      ? "text-emerald-400"
                      : (weightStats.lastAdg ?? 0) >= 0.1
                        ? "text-amber-400"
                        : "text-white/60"
                  }`}
                >
                  {weightStats.lastAdg?.toFixed(2) ?? "--"} kg/d
                </p>
                <p className="text-xs text-white/40">
                  peak: {weightStats.peakAdg.toFixed(2)} kg/d
                </p>
              </GlassCard>
            </div>
          )}

          {/* Weight Gain Chart */}
          <GlassCard
            className="animate-fade-in-up"
            style={{ animationDelay: "100ms" } as React.CSSProperties}
          >
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">
              Weight Gain Chart
            </h2>
            {weightHistory.length > 1 && weightStats ? (
              <div>
                {/* SVG Area Chart */}
                <div className="relative">
                  <svg
                    viewBox="0 0 800 300"
                    className="w-full h-auto"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Background grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                      const y = 20 + (260 - 20) * (1 - frac);
                      const val = Math.round(
                        weightStats.minWeight +
                          (weightStats.maxWeight - weightStats.minWeight) * frac
                      );
                      return (
                        <g key={frac}>
                          <line
                            x1="60"
                            y1={y}
                            x2="780"
                            y2={y}
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth="1"
                          />
                          <text
                            x="52"
                            y={y + 4}
                            textAnchor="end"
                            fill="rgba(255,255,255,0.3)"
                            fontSize="10"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Gradient fill under the line */}
                    <defs>
                      <linearGradient
                        id="weightGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="rgba(59,130,246,0.3)"
                        />
                        <stop
                          offset="100%"
                          stopColor="rgba(59,130,246,0.02)"
                        />
                      </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <path
                      d={(() => {
                        const pts = weightHistory.map((e, i) => {
                          const x =
                            60 +
                            (i / (weightHistory.length - 1)) * 720;
                          const yFrac =
                            (e.weight_kg - weightStats.minWeight) /
                            (weightStats.maxWeight -
                              weightStats.minWeight || 1);
                          const y = 260 - yFrac * 240;
                          return `${x},${y}`;
                        });
                        return `M${pts[0]} ${pts.map((p) => `L${p}`).join(" ")} L${60 + 720},260 L60,260 Z`;
                      })()}
                      fill="url(#weightGrad)"
                    />

                    {/* Line */}
                    <polyline
                      points={weightHistory
                        .map((e, i) => {
                          const x =
                            60 +
                            (i / (weightHistory.length - 1)) * 720;
                          const yFrac =
                            (e.weight_kg - weightStats.minWeight) /
                            (weightStats.maxWeight -
                              weightStats.minWeight || 1);
                          const y = 260 - yFrac * 240;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />

                    {/* Data points + labels */}
                    {weightHistory.map((entry, i) => {
                      const x =
                        60 + (i / (weightHistory.length - 1)) * 720;
                      const yFrac =
                        (entry.weight_kg - weightStats.minWeight) /
                        (weightStats.maxWeight -
                          weightStats.minWeight || 1);
                      const y = 260 - yFrac * 240;
                      const dotColor =
                        entry.adg === null
                          ? "#60a5fa"
                          : entry.adg >= 0.4
                            ? "#34d399"
                            : entry.adg >= 0.2
                              ? "#60a5fa"
                              : entry.adg >= 0.1
                                ? "#fbbf24"
                                : "rgba(255,255,255,0.4)";
                      return (
                        <g key={i}>
                          {/* Dot */}
                          <circle
                            cx={x}
                            cy={y}
                            r="5"
                            fill={dotColor}
                            stroke="#000030"
                            strokeWidth="2"
                          />
                          {/* Weight label above dot */}
                          <text
                            x={x}
                            y={y - 12}
                            textAnchor="middle"
                            fill="white"
                            fontSize="10"
                            fontWeight="600"
                          >
                            {entry.weight_kg}
                          </text>
                          {/* ADG label below dot (if not first) */}
                          {entry.adg !== null && (
                            <text
                              x={x}
                              y={y + 18}
                              textAnchor="middle"
                              fill={dotColor}
                              fontSize="8.5"
                              fontWeight="500"
                            >
                              {entry.adg.toFixed(2)}
                            </text>
                          )}
                          {/* Date on X-axis */}
                          <text
                            x={x}
                            y={282}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.3)"
                            fontSize="9"
                          >
                            {new Date(entry.date).toLocaleDateString(
                              "en-AU",
                              { month: "short", year: "2-digit" }
                            )}
                          </text>
                        </g>
                      );
                    })}

                    {/* Axis labels */}
                    <text
                      x="10"
                      y="150"
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.2)"
                      fontSize="9"
                      transform="rotate(-90, 10, 150)"
                    >
                      Weight (kg)
                    </text>
                  </svg>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-3 justify-center">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />{" "}
                    ADG &ge;0.4 kg/d
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />{" "}
                    ADG 0.2--0.4
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />{" "}
                    ADG 0.1--0.2
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/40" />{" "}
                    ADG &lt;0.1
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/40 text-center py-8">
                Not enough data points for chart
              </p>
            )}
          </GlassCard>

          {/* Weight Records Table */}
          <GlassCard
            className="animate-fade-in-up"
            style={{ animationDelay: "125ms" } as React.CSSProperties}
          >
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              Weight Records
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                      Date
                    </th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                      Weight
                    </th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                      Change
                    </th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                      ADG
                    </th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...weightHistory].reverse().map((entry, index) => {
                    const revIdx = weightHistory.length - 1 - index;
                    const prevWeight =
                      revIdx > 0
                        ? weightHistory[revIdx - 1].weight_kg
                        : null;
                    const change =
                      prevWeight !== null
                        ? entry.weight_kg - prevWeight
                        : null;
                    return (
                      <tr
                        key={index}
                        className="border-b border-white/5"
                      >
                        <td className="px-4 py-3 text-sm text-white/70">
                          {entry.date}
                        </td>
                        <td className="px-4 py-3 text-sm text-white font-medium">
                          {entry.weight_kg} kg
                        </td>
                        <td className="px-4 py-3">
                          {change !== null ? (
                            <span
                              className={`inline-flex items-center gap-1 text-sm font-medium ${
                                change > 0
                                  ? "text-emerald-400"
                                  : change < 0
                                    ? "text-red-400"
                                    : "text-white/50"
                              }`}
                            >
                              {change > 0 ? (
                                <TrendingUp className="w-3.5 h-3.5" />
                              ) : change < 0 ? (
                                <TrendingDown className="w-3.5 h-3.5" />
                              ) : (
                                <Minus className="w-3.5 h-3.5" />
                              )}
                              {change > 0 ? "+" : ""}
                              {change} kg
                            </span>
                          ) : (
                            <span className="text-sm text-white/30">
                              --
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {entry.adg !== null ? (
                            <span
                              className={`text-sm font-medium ${
                                entry.adg >= 0.4
                                  ? "text-emerald-400"
                                  : entry.adg >= 0.2
                                    ? "text-blue-400"
                                    : entry.adg >= 0.1
                                      ? "text-amber-400"
                                      : "text-white/50"
                              }`}
                            >
                              {entry.adg.toFixed(2)} kg/d
                            </span>
                          ) : (
                            <span className="text-sm text-white/30">
                              --
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-white/50">
                          {entry.note || ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ════════════════ TAB: Medical History ════════════════ */}
      {activeTab === "medical" && (
        <div
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "75ms" } as React.CSSProperties}
        >
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
                        <p className="font-semibold text-white">
                          {batch.batch_name}
                        </p>
                        <GlassBadge
                          variant={
                            batch.status === "active"
                              ? "success"
                              : batch.status === "scheduled"
                                ? "info"
                                : "default"
                          }
                        >
                          {batch.status.charAt(0).toUpperCase() +
                            batch.status.slice(1)}
                        </GlassBadge>
                      </div>
                      <p className="text-sm text-white/50">
                        {batch.treatment_type} &middot; {batch.medication}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {batch.dosage} &middot; Scheduled:{" "}
                        {batch.scheduled_date}
                        {batch.completed_date
                          ? ` \u00b7 Completed: ${batch.completed_date}`
                          : ""}
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
                <p className="text-sm">
                  No medical records for this animal
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* ════════════════ TAB: Activity History ════════════════ */}
      {activeTab === "activity" && (
        <GlassCard
          className="animate-fade-in-up"
          style={{ animationDelay: "75ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
            Activity History
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
                  <p className="text-sm text-white/80">
                    {entry.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-white/30" />
                    <p className="text-xs text-white/40">
                      {new Date(entry.date).toLocaleDateString("en-AU", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <GlassBadge variant="default">
                      {entry.type}
                    </GlassBadge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* ════════════════ TAB: Record History (Changelog) ════════════════ */}
      {activeTab === "history" && (
        <GlassCard
          className="animate-fade-in-up"
          style={{ animationDelay: "75ms" } as React.CSSProperties}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
            Record History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                    Date
                  </th>
                  <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                    User
                  </th>
                  <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                    Field
                  </th>
                  <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                    Old Value
                  </th>
                  <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                    New Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {recordHistory.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-white/5"
                  >
                    <td className="px-4 py-3 text-sm text-white/50 whitespace-nowrap">
                      {entry.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/70">
                      {entry.user}
                    </td>
                    <td className="px-4 py-3">
                      <GlassBadge variant="info">{entry.field}</GlassBadge>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/40">
                      {entry.oldValue}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/90 font-medium">
                      {entry.newValue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* ════════════════ TAB: Progeny ════════════════ */}
      {activeTab === "progeny" && (
        <div
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "75ms" } as React.CSSProperties}
        >
          <GlassCard>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              Offspring ({progeny.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                      Visual Tag
                    </th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                      Sex
                    </th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                      Date of Birth
                    </th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                      Breed
                    </th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                      Weight
                    </th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {progeny.map((calf) => (
                    <tr
                      key={calf.id}
                      className="border-b border-white/5"
                    >
                      <td className="px-4 py-3 text-sm text-white font-medium">
                        {calf.visual_tag}
                      </td>
                      <td className="px-4 py-3">
                        <GlassBadge
                          variant={
                            calf.sex === "Male" ? "info" : "success"
                          }
                        >
                          {calf.sex}
                        </GlassBadge>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/70">
                        {calf.dob}
                      </td>
                      <td className="px-4 py-3 text-sm text-white/70">
                        {calf.breed}
                      </td>
                      <td className="px-4 py-3 text-sm text-white/90 font-medium">
                        {calf.weight_kg} kg
                      </td>
                      <td className="px-4 py-3">
                        <GlassBadge
                          variant={
                            calf.status === "On Property"
                              ? "success"
                              : "warning"
                          }
                        >
                          {calf.status}
                        </GlassBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ════════════════ TAB: Photo Gallery ════════════════ */}
      {activeTab === "photo" && (
        <div
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "75ms" } as React.CSSProperties}
        >
          <GlassCard>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              Photo Gallery
            </h2>

            {/* Main / profile photo */}
            <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 mb-4 max-w-2xl mx-auto">
              {record.profile_image ? (
                <Image
                  src={record.profile_image}
                  alt={record.visual_tag}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center text-white/30">
                  <Beef className="w-16 h-16 mb-2" />
                  <p className="text-sm">No profile photo</p>
                </div>
              )}
            </div>
            {record.profile_image && (
              <p className="text-center text-xs text-white/40 mb-6">
                Profile Photo &mdash; {record.visual_tag}
              </p>
            )}

            {/* Additional photo slots */}
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
              Additional Photos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((slot) => (
                <div
                  key={slot}
                  className="aspect-square rounded-xl border border-dashed border-white/15 bg-white/5 flex flex-col items-center justify-center text-white/25 hover:border-white/30 hover:bg-white/8 transition-all cursor-pointer"
                >
                  <ImageIcon className="w-8 h-8 mb-1" />
                  <p className="text-[10px]">Upload Photo</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ════════════════ TAB: Video (Facial Recognition) ════════════════ */}
      {activeTab === "video" && (
        <div
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "75ms" } as React.CSSProperties}
        >
          {/* Header */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                  Facial Recognition
                </h2>
                <GlassBadge variant="success">AI Enabled</GlassBadge>
              </div>
              <GlassButton size="sm" icon={<Video className="w-4 h-4" />}>
                Capture New Video
              </GlassButton>
            </div>

            {/* Mock video player */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/60 flex items-center justify-center cursor-pointer group mb-2">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
              <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur flex items-center justify-center group-hover:bg-white/25 transition-all">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
              <div className="absolute bottom-3 left-4 text-xs text-white/50">
                Last capture: 2 days ago
              </div>
              <div className="absolute bottom-3 right-4 text-xs text-white/40 font-mono">
                00:00 / 00:32
              </div>
            </div>
          </GlassCard>

          {/* Video Thumbnails */}
          <GlassCard>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
              Recent Captures
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { date: "2026-03-22 09:15am", duration: "0:32" },
                { date: "2026-03-15 14:30pm", duration: "0:45" },
                { date: "2026-03-08 11:20am", duration: "0:28" },
                { date: "2026-02-28 16:05pm", duration: "0:38" },
              ].map((vid, i) => (
                <div
                  key={i}
                  className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black/50 flex items-center justify-center cursor-pointer group hover:border-white/20 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                    <Play className="w-4 h-4 text-white/70 ml-0.5" />
                  </div>
                  <div className="absolute bottom-1.5 left-2 text-[10px] text-white/40">
                    {vid.date}
                  </div>
                  <div className="absolute top-1.5 right-2 text-[10px] text-white/40 font-mono bg-black/40 px-1 rounded">
                    {vid.duration}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* AI Analysis */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Fingerprint className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                  AI Analysis
                </h2>
                <p className="text-xs text-white/40">Facial recognition results from latest capture</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Identification */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Identification
                </h3>
                <table className="w-full">
                  <tbody>
                    <FieldRow label="Match Confidence" value={<span className="text-emerald-400 font-semibold">98.7%</span>} labelVariant="green" />
                    <FieldRow label="Biometric ID" value={<span className="font-mono text-xs">BIO-AU0142-2026</span>} labelVariant="green" />
                    <FieldRow label="Last Verified" value="2 days ago" />
                  </tbody>
                </table>
              </div>

              {/* Health Indicators */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Health Indicators Detected
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Normal gait", "Clear eyes", "No visible injuries"].map((indicator) => (
                    <div
                      key={indicator}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs text-emerald-300">{indicator}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                    Behavior Notes
                  </h3>
                  <p className="text-sm text-white/70">
                    Calm temperament, feeding normally
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Recognition History */}
          <GlassCard>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              Recognition History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                      Date
                    </th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                      Location
                    </th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                      Confidence
                    </th>
                    <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-white/50 font-semibold">
                      Match Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: "2026-03-22", location: "Paddock 5 - Gate Cam", confidence: "98.7%", status: "Verified" as const },
                    { date: "2026-03-15", location: "Yards - Crush Cam", confidence: "97.2%", status: "Verified" as const },
                    { date: "2026-03-08", location: "Paddock 5 - Gate Cam", confidence: "95.4%", status: "Verified" as const },
                    { date: "2026-02-28", location: "Paddock 3 - Water Trough", confidence: "89.1%", status: "Pending" as const },
                    { date: "2026-02-15", location: "Yards - Crush Cam", confidence: "99.1%", status: "Verified" as const },
                  ].map((entry, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="px-4 py-3 text-sm text-white/70">{entry.date}</td>
                      <td className="px-4 py-3 text-sm text-white/50">{entry.location}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${
                          parseFloat(entry.confidence) >= 95
                            ? "text-emerald-400"
                            : parseFloat(entry.confidence) >= 90
                              ? "text-blue-400"
                              : "text-amber-400"
                        }`}>
                          {entry.confidence}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <GlassBadge variant={entry.status === "Verified" ? "success" : "warning"}>
                          {entry.status === "Verified" && <ShieldCheck className="w-3 h-3 mr-1 inline" />}
                          {entry.status}
                        </GlassBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ════════════════ TAB: Papers ════════════════ */}
      {activeTab === "papers" && (
        <div
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "75ms" } as React.CSSProperties}
        >
          <GlassCard>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              Documents &amp; Certificates
            </h2>
            <div className="space-y-3">
              {papers.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <ScrollText className="w-5 h-5 text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {doc.name}
                    </p>
                    <p className="text-xs text-white/40">
                      {doc.type} &middot; {doc.date} &middot; {doc.fileSize}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload new document */}
            <div className="mt-4 p-4 rounded-xl border border-dashed border-white/15 bg-white/5 flex flex-col items-center justify-center text-white/30 hover:border-white/30 hover:bg-white/8 transition-all cursor-pointer">
              <Plus className="w-6 h-6 mb-1" />
              <p className="text-xs">Upload Document</p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <GlassSheet
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Record"
      >
        <div className="space-y-4">
          <p className="text-white/70">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">
              {record.visual_tag}
            </span>
            ? This action cannot be undone.
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
