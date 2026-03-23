"use client";

import { useState, useCallback } from "react";
import { GlassCard, GlassButton } from "@/components/glass";
import {
  mockBreedDistribution,
  mockWeightHistory,
  mockDashboardStats,
} from "@/lib/mock-data";
import { useRecordsStore } from "@/stores/modules";
import { useMedicalStore } from "@/stores/modules";
import { usePaddockStore } from "@/stores/modules";
import { useSalesStore } from "@/stores/modules";
import {
  BarChart3,
  TrendingUp,
  Beef,
  Activity,
  Heart,
  Stethoscope,
  MapPin,
  DollarSign,
  Baby,
  Download,
  CheckCircle2,
} from "lucide-react";

const breedColors: Record<string, string> = {
  Angus: "bg-blue-500",
  Hereford: "bg-emerald-500",
  Brahman: "bg-amber-500",
  Charolais: "bg-purple-500",
  Mixed: "bg-rose-400",
};

const conditionScores = [
  { label: "Excellent", count: 2, color: "bg-emerald-500" },
  { label: "Good", count: 4, color: "bg-blue-500" },
  { label: "Fair", count: 1, color: "bg-amber-500" },
  { label: "Poor", count: 0, color: "bg-red-500" },
];

function downloadCSV(filename: string, rows: string[][]): void {
  const csv = rows.map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const stats = mockDashboardStats;
  const maxWeight = Math.max(...mockWeightHistory.map((w) => w.avg_weight));
  const minWeight = Math.min(...mockWeightHistory.map((w) => w.avg_weight));
  const weightRange = maxWeight - minWeight || 1;
  const maxCondition = Math.max(...conditionScores.map((c) => c.count), 1);

  const records = useRecordsStore((s) => s.records);
  const batches = useMedicalStore((s) => s.batches);
  const paddocks = usePaddockStore((s) => s.paddocks);
  const sales = useSalesStore((s) => s.sales);

  const [successReport, setSuccessReport] = useState<string | null>(null);

  const showSuccess = useCallback((title: string) => {
    setSuccessReport(title);
    setTimeout(() => setSuccessReport(null), 2500);
  }, []);

  // --- Report generators ---

  const generateHerdSummary = useCallback(() => {
    const headers = ["Tag", "EID", "Breed", "Sex", "Weight (kg)", "Condition", "Paddock ID", "Date"];
    const rows = records.map((r) => [
      r.visual_tag,
      r.eid ?? "",
      r.breed ?? "",
      r.sex ?? "",
      String(r.weight_kg ?? ""),
      r.condition ?? "",
      String(r.paddock_id ?? ""),
      r.record_date ?? "",
    ]);
    downloadCSV("herd-summary.csv", [headers, ...rows]);
    showSuccess("Herd Summary Report");
  }, [records, showSuccess]);

  const generateWeightGainAnalysis = useCallback(() => {
    const headers = ["Month", "Avg Weight (kg)"];
    const rows = mockWeightHistory.map((w) => [w.date, String(w.avg_weight)]);
    // Also include individual animal weights
    const animalHeaders = ["Tag", "Breed", "Sex", "Current Weight (kg)", "Birth Date"];
    const animalRows = records.map((r) => [
      r.visual_tag,
      r.breed ?? "",
      r.sex ?? "",
      String(r.weight_kg ?? ""),
      r.date_of_birth ?? "",
    ]);
    downloadCSV("weight-gain-analysis.csv", [
      headers,
      ...rows,
      [],
      animalHeaders,
      ...animalRows,
    ]);
    showSuccess("Weight Gain Analysis");
  }, [records, showSuccess]);

  const generateMedicalHistory = useCallback(() => {
    const headers = [
      "Batch Name",
      "Treatment Type",
      "Medication",
      "Dosage",
      "Administered By",
      "Animal Count",
      "Status",
      "Scheduled Date",
      "Completed Date",
      "Notes",
    ];
    const rows = batches.map((b) => [
      b.batch_name,
      b.treatment_type,
      b.medication,
      b.dosage,
      b.administered_by,
      String(b.animal_count),
      b.status,
      b.scheduled_date,
      b.completed_date ?? "",
      b.notes ?? "",
    ]);
    downloadCSV("medical-history.csv", [headers, ...rows]);
    showSuccess("Medical Treatment History");
  }, [batches, showSuccess]);

  const generatePaddockUtilisation = useCallback(() => {
    const headers = [
      "Paddock Name",
      "Area (ha)",
      "Capacity",
      "Current Count",
      "Utilisation %",
      "Status",
      "Pasture Type",
      "Water Source",
    ];
    const rows = paddocks.map((p) => [
      p.name,
      String(p.area_hectares),
      String(p.capacity),
      String(p.current_count),
      p.capacity > 0 ? String(Math.round((p.current_count / p.capacity) * 100)) : "0",
      p.status,
      p.pasture_type,
      p.water_source ? "Yes" : "No",
    ]);
    downloadCSV("paddock-utilisation.csv", [headers, ...rows]);
    showSuccess("Paddock Utilization Report");
  }, [paddocks, showSuccess]);

  const generateFinancialSummary = useCallback(() => {
    const headers = [
      "Tag",
      "Buyer",
      "Sale Price ($)",
      "Weight at Sale (kg)",
      "Price per kg ($/kg)",
      "Status",
      "Sale Date",
      "Notes",
    ];
    const rows = sales.map((s) => [
      s.record_visual_tag,
      s.buyer_name,
      String(s.sale_price),
      String(s.weight_at_sale),
      String(s.price_per_kg),
      s.status,
      s.sale_date,
      s.notes ?? "",
    ]);
    const totalCompleted = sales
      .filter((s) => s.status === "completed")
      .reduce((sum, s) => sum + s.sale_price, 0);
    downloadCSV("financial-summary.csv", [
      headers,
      ...rows,
      [],
      ["Total Completed Revenue", `$${totalCompleted.toFixed(2)}`, "", "", "", "", "", ""],
    ]);
    showSuccess("Financial Summary");
  }, [sales, showSuccess]);

  const generateBreedingReport = useCallback(() => {
    const headers = [
      "Tag",
      "Sex",
      "Breed",
      "Pregnant",
      "Mother Tag",
      "Father Tag",
      "Date of Birth",
      "Condition",
    ];
    const rows = records.map((r) => [
      r.visual_tag,
      r.sex ?? "",
      r.breed ?? "",
      r.is_pregnant ? "Yes" : "No",
      r.mother_visual_tag ?? "",
      r.father_visual_tag ?? "",
      r.date_of_birth ?? "",
      r.condition ?? "",
    ]);
    downloadCSV("breeding-report.csv", [headers, ...rows]);
    showSuccess("Breeding & Pregnancy Report");
  }, [records, showSuccess]);

  const generateDownloadAll = useCallback(() => {
    // Combine all data into one JSON export and also trigger CSVs
    generateHerdSummary();
    setTimeout(() => generateMedicalHistory(), 300);
    setTimeout(() => generatePaddockUtilisation(), 600);
    setTimeout(() => generateFinancialSummary(), 900);
    setTimeout(() => generateBreedingReport(), 1200);
    showSuccess("All Reports");
  }, [
    generateHerdSummary,
    generateMedicalHistory,
    generatePaddockUtilisation,
    generateFinancialSummary,
    generateBreedingReport,
    showSuccess,
  ]);

  const availableReports = [
    {
      title: "Herd Summary Report",
      description: "Overview of current herd size, breed composition, and demographics.",
      icon: Beef,
      onGenerate: generateHerdSummary,
    },
    {
      title: "Weight Gain Analysis",
      description: "Track average daily gain and weight trends across your herd.",
      icon: TrendingUp,
      onGenerate: generateWeightGainAnalysis,
    },
    {
      title: "Medical Treatment History",
      description: "Complete log of vaccinations, treatments, and health records.",
      icon: Stethoscope,
      onGenerate: generateMedicalHistory,
    },
    {
      title: "Paddock Utilization Report",
      description: "Capacity usage, pasture condition, and rotation schedules.",
      icon: MapPin,
      onGenerate: generatePaddockUtilisation,
    },
    {
      title: "Financial Summary",
      description: "Revenue, expenses, and profitability analysis for your operation.",
      icon: DollarSign,
      onGenerate: generateFinancialSummary,
    },
    {
      title: "Breeding & Pregnancy Report",
      description: "Pregnancy rates, breeding records, and calving predictions.",
      icon: Baby,
      onGenerate: generateBreedingReport,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
        <p className="text-white/50 mt-1">Insights and data analysis</p>
      </div>

      {/* Success toast */}
      {successReport && (
        <div className="animate-fade-in-up fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/90 text-white text-sm font-medium shadow-lg backdrop-blur-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {successReport} exported successfully
          </div>
        </div>
      )}

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          {
            label: "Total Head",
            value: stats.total_livestock.toLocaleString(),
            icon: Beef,
            trend: null,
            delay: 50,
          },
          {
            label: "Avg Daily Gain",
            value: "+0.8 kg/day",
            icon: TrendingUp,
            trend: "+5% vs last month",
            delay: 100,
          },
          {
            label: "Mortality Rate",
            value: "0.4%",
            icon: Activity,
            trend: null,
            delay: 150,
          },
          {
            label: "Pregnancy Rate",
            value: "42%",
            icon: Heart,
            trend: null,
            delay: 200,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="animate-fade-in-up"
            style={{ animationDelay: `${kpi.delay}ms` }}
          >
            <GlassCard>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/50 mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold text-white">{kpi.value}</p>
                  {kpi.trend && (
                    <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {kpi.trend}
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <kpi.icon className="w-5 h-5 text-white/70" />
                </div>
              </div>
            </GlassCard>
          </div>
        ))}
      </div>

      {/* Herd Composition */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "250ms" } as React.CSSProperties}
      >
        <GlassCard>
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-white/70" />
            <h2 className="text-lg font-semibold text-white">Herd Composition</h2>
          </div>
          <div className="space-y-4">
            {mockBreedDistribution.map((breed) => (
              <div key={breed.breed}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-white/80">{breed.breed}</span>
                  <span className="text-sm text-white/50">
                    {breed.count} head ({breed.percentage}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${breedColors[breed.breed] || "bg-white/40"} transition-all duration-700`}
                    style={{ width: `${breed.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Weight Trends & Condition Score side by side on desktop */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Weight Trends */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "300ms" } as React.CSSProperties}
        >
          <GlassCard>
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-white/70" />
              <h2 className="text-lg font-semibold text-white">Weight Trends</h2>
            </div>
            <p className="text-xs text-white/40 mb-4">6-month average weight (kg)</p>
            <div className="flex items-end gap-2 h-40">
              {mockWeightHistory.map((entry) => {
                const normalised =
                  ((entry.avg_weight - minWeight + 10) / (weightRange + 20)) * 100;
                return (
                  <div key={entry.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-white/60 font-medium">{entry.avg_weight}</span>
                    <div
                      className="w-full rounded-t-md bg-blue-500/60 transition-all duration-500"
                      style={{ height: `${Math.max(normalised, 15)}%` }}
                    />
                    <span className="text-xs text-white/40">{entry.date}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Condition Score Distribution */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "350ms" } as React.CSSProperties}
        >
          <GlassCard>
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-5 h-5 text-white/70" />
              <h2 className="text-lg font-semibold text-white">Condition Score Distribution</h2>
            </div>
            <div className="space-y-4">
              {conditionScores.map((score) => (
                <div key={score.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-white/80">{score.label}</span>
                    <span className="text-sm text-white/50">{score.count} animals</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${score.color} transition-all duration-700`}
                      style={{ width: `${(score.count / maxCondition) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Available Reports */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "400ms" } as React.CSSProperties}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Available Reports</h2>
          <GlassButton
            variant="primary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={generateDownloadAll}
          >
            Download All
          </GlassButton>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableReports.map((report) => (
            <GlassCard key={report.title} className="flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <report.icon className="w-5 h-5 text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm">{report.title}</h3>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">
                    {report.description}
                  </p>
                </div>
              </div>
              <div className="mt-auto pt-2">
                <GlassButton
                  variant="default"
                  size="sm"
                  className="w-full"
                  icon={
                    successReport === report.title ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )
                  }
                  onClick={report.onGenerate}
                >
                  {successReport === report.title ? "Exported!" : "Generate"}
                </GlassButton>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
