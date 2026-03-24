"use client";

import { useState, useMemo, useRef } from "react";
import { GlassCard, GlassButton, GlassBadge } from "@/components/glass";
import {
  mockBreedDistribution,
  mockWeightHistory,
  mockDashboardStats,
  mockMedicalBatches,
  mockRecords,
} from "@/lib/mock-data";
import { useRecordsStore } from "@/stores/modules";
import { useMedicalStore } from "@/stores/modules";
import { useSalesStore } from "@/stores/modules";
import {
  Beef,
  TrendingUp,
  Stethoscope,
  DollarSign,
  ShieldCheck,
  ReceiptText,
  Download,
  X,
  FileText,
  Printer,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ReportType =
  | "herd-summary"
  | "weight-gain"
  | "medical"
  | "financial"
  | "biosecurity"
  | "sales-history";

// ---------------------------------------------------------------------------
// Print CSS  (injected once via <style> in the component)
// ---------------------------------------------------------------------------
const PRINT_CSS = `
@media print {
  /* hide everything except the report */
  body * { visibility: hidden !important; }
  #report-printable, #report-printable * { visibility: visible !important; }
  #report-printable {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    background: white !important;
    color: black !important;
    padding: 24px !important;
    margin: 0 !important;
  }
  #report-printable h1,
  #report-printable h2,
  #report-printable h3,
  #report-printable p,
  #report-printable td,
  #report-printable th,
  #report-printable li,
  #report-printable span {
    color: black !important;
  }
  #report-printable table {
    border-collapse: collapse !important;
    width: 100% !important;
  }
  #report-printable th,
  #report-printable td {
    border: 1px solid #ccc !important;
    padding: 6px 10px !important;
    text-align: left !important;
    font-size: 11px !important;
  }
  #report-printable th {
    background: #f3f4f6 !important;
    font-weight: 700 !important;
  }
  /* hide action buttons inside report */
  .no-print { display: none !important; }
  @page { margin: 20mm; }
}
`;

// ---------------------------------------------------------------------------
// Farm details constant
// ---------------------------------------------------------------------------
const FARM = {
  name: "Anderson Road Farm",
  address: "99 Anderson Rd, Nimbin NSW 2480",
  owner: "Tim Dickinson",
  pic: "N0012345",
  phone: "0412 345 678",
};

// ---------------------------------------------------------------------------
// Helper: today formatted
// ---------------------------------------------------------------------------
function todayFormatted(): string {
  return new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Report cards definition
// ---------------------------------------------------------------------------
const REPORT_CARDS: {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "herd-summary",
    title: "Herd Summary Report",
    description:
      "Total head count by category, breed distribution, average weights, and condition scores.",
    icon: Beef,
  },
  {
    id: "weight-gain",
    title: "Weight Gain Analysis",
    description:
      "Monthly average weight trends and per-animal weight gain tracking.",
    icon: TrendingUp,
  },
  {
    id: "medical",
    title: "Medical & Treatment Report",
    description:
      "Vaccination schedules, treatments administered, and veterinary records.",
    icon: Stethoscope,
  },
  {
    id: "financial",
    title: "Financial Summary",
    description:
      "Revenue from sales, average price per kg, and profitability overview.",
    icon: DollarSign,
  },
  {
    id: "biosecurity",
    title: "Biosecurity Plan",
    description:
      "Property details, quarantine procedures, vaccination schedule, and emergency contacts.",
    icon: ShieldCheck,
  },
  {
    id: "sales-history",
    title: "Sales History",
    description:
      "Complete record of livestock sales, buyers, prices, and settlement status.",
    icon: ReceiptText,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const records = useRecordsStore((s) => s.records);
  const batches = useMedicalStore((s) => s.batches);
  const sales = useSalesStore((s) => s.sales);
  const stats = mockDashboardStats;

  // ---- Derived data for Herd Summary ----
  const herdCategoryData = useMemo(() => {
    const females = records.filter((r) => r.sex === "Female");
    const males = records.filter((r) => r.sex === "Male");
    const cows = females.filter(
      (r) => r.date_of_birth && new Date(r.date_of_birth) < new Date("2023-01-01")
    );
    const heifers = females.filter(
      (r) => r.date_of_birth && new Date(r.date_of_birth) >= new Date("2023-01-01")
    );
    const bulls = males.filter(
      (r) => r.date_of_birth && new Date(r.date_of_birth) < new Date("2023-06-01")
    );
    const steers = males.filter(
      (r) =>
        r.date_of_birth &&
        new Date(r.date_of_birth) >= new Date("2023-06-01") &&
        new Date(r.date_of_birth) < new Date("2024-01-01")
    );
    const weaners = males.filter(
      (r) => r.date_of_birth && new Date(r.date_of_birth) >= new Date("2024-01-01")
    );

    const avg = (arr: typeof records) => {
      if (arr.length === 0) return 0;
      return Math.round(arr.reduce((s, r) => s + (r.weight_kg ?? 0), 0) / arr.length);
    };

    return [
      { category: "Cows", count: cows.length, avgWeight: avg(cows) },
      { category: "Heifers", count: heifers.length, avgWeight: avg(heifers) },
      { category: "Bulls", count: bulls.length, avgWeight: avg(bulls) },
      { category: "Steers", count: steers.length, avgWeight: avg(steers) },
      { category: "Weaners", count: weaners.length, avgWeight: avg(weaners) },
    ];
  }, [records]);

  const conditionDist = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach((r) => {
      const c = r.condition ?? "Unknown";
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).map(([label, count]) => ({ label, count }));
  }, [records]);

  // ---- Financial derived ----
  const financialData = useMemo(() => {
    const completed = sales.filter((s) => s.status === "completed");
    const totalRevenue = completed.reduce((sum, s) => sum + s.sale_price, 0);
    const totalWeight = completed.reduce((sum, s) => sum + s.weight_at_sale, 0);
    const avgPricePerKg =
      totalWeight > 0 ? (totalRevenue / totalWeight).toFixed(2) : "0.00";
    const pending = sales.filter((s) => s.status === "pending");
    const pendingValue = pending.reduce((sum, s) => sum + s.sale_price, 0);
    return { completed, totalRevenue, avgPricePerKg, pending, pendingValue };
  }, [sales]);

  // ---- Handlers ----
  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setActiveReport(null);
  };

  // ---- Report header shared across all reports ----
  const ReportHeader = ({ title }: { title: string }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-white/50 print:text-gray-500 mt-1">
            Generated: {todayFormatted()}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white print:text-black">
            {FARM.name}
          </p>
          <p className="text-sm text-white/50 print:text-gray-500">
            {FARM.address}
          </p>
          <p className="text-sm text-white/50 print:text-gray-500">
            PIC: {FARM.pic}
          </p>
        </div>
      </div>
      <div className="border-b border-white/10 print:border-gray-300" />
    </div>
  );

  // ---- Table helper ----
  const Table = ({
    headers,
    rows,
  }: {
    headers: string[];
    rows: (string | number)[][];
  }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-white/10 print:border-gray-300">
            {headers.map((h) => (
              <th
                key={h}
                className="py-2 px-3 font-semibold text-white/70 print:text-black print:bg-gray-100"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-white/5 print:border-gray-200"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="py-2 px-3 text-white/80 print:text-black"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ---- Section divider ----
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-lg font-semibold text-white print:text-black mt-8 mb-3">
      {children}
    </h2>
  );

  const SubSection = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-base font-semibold text-white/80 print:text-black mt-6 mb-2">
      {children}
    </h3>
  );

  // ===========================================================================
  // REPORT CONTENT RENDERERS
  // ===========================================================================

  const renderHerdSummary = () => (
    <>
      <ReportHeader title="Herd Summary Report" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200">
          <p className="text-xs text-white/50 print:text-gray-500">Total Head</p>
          <p className="text-xl font-bold text-white print:text-black">{stats.total_livestock}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200">
          <p className="text-xs text-white/50 print:text-gray-500">Males</p>
          <p className="text-xl font-bold text-white print:text-black">{stats.total_male}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200">
          <p className="text-xs text-white/50 print:text-gray-500">Females</p>
          <p className="text-xl font-bold text-white print:text-black">{stats.total_female}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200">
          <p className="text-xs text-white/50 print:text-gray-500">Avg Weight</p>
          <p className="text-xl font-bold text-white print:text-black">{stats.avg_weight_kg} kg</p>
        </div>
      </div>

      <SectionTitle>Head Count by Category</SectionTitle>
      <Table
        headers={["Category", "Count", "Avg Weight (kg)"]}
        rows={herdCategoryData.map((c) => [c.category, c.count, c.avgWeight])}
      />

      <SectionTitle>Breed Distribution</SectionTitle>
      <Table
        headers={["Breed", "Count", "Percentage"]}
        rows={mockBreedDistribution.map((b) => [
          b.breed,
          b.count,
          `${b.percentage}%`,
        ])}
      />

      <SectionTitle>Average Weights by Category</SectionTitle>
      <Table
        headers={["Category", "Avg Weight (kg)", "Head Count"]}
        rows={herdCategoryData.map((c) => [c.category, c.avgWeight, c.count])}
      />

      <SectionTitle>Condition Score Distribution</SectionTitle>
      <Table
        headers={["Condition", "Count", "Percentage"]}
        rows={conditionDist.map((c) => [
          c.label,
          c.count,
          `${((c.count / records.length) * 100).toFixed(1)}%`,
        ])}
      />
    </>
  );

  const renderWeightGain = () => (
    <>
      <ReportHeader title="Weight Gain Analysis" />

      <SectionTitle>Monthly Average Weight Trend</SectionTitle>
      <Table
        headers={["Month", "Avg Weight (kg)"]}
        rows={mockWeightHistory.map((w) => [w.date, w.avg_weight])}
      />

      <SectionTitle>Individual Animal Weights</SectionTitle>
      <Table
        headers={["Tag", "Breed", "Sex", "Current Weight (kg)", "Condition"]}
        rows={records.map((r) => [
          r.visual_tag,
          r.breed ?? "-",
          r.sex ?? "-",
          r.weight_kg ?? "-",
          r.condition ?? "-",
        ])}
      />

      <div className="mt-6 p-4 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200">
        <h3 className="font-semibold text-white print:text-black mb-2">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-white/50 print:text-gray-500">Total Animals</p>
            <p className="font-bold text-white print:text-black">{records.length}</p>
          </div>
          <div>
            <p className="text-white/50 print:text-gray-500">Avg Weight</p>
            <p className="font-bold text-white print:text-black">{stats.avg_weight_kg} kg</p>
          </div>
          <div>
            <p className="text-white/50 print:text-gray-500">Heaviest</p>
            <p className="font-bold text-white print:text-black">
              {Math.max(...records.map((r) => r.weight_kg ?? 0))} kg
            </p>
          </div>
          <div>
            <p className="text-white/50 print:text-gray-500">Lightest</p>
            <p className="font-bold text-white print:text-black">
              {Math.min(...records.map((r) => r.weight_kg ?? 9999))} kg
            </p>
          </div>
        </div>
      </div>
    </>
  );

  const renderMedical = () => (
    <>
      <ReportHeader title="Medical & Treatment Report" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200">
          <p className="text-xs text-white/50 print:text-gray-500">Total Batches</p>
          <p className="text-xl font-bold text-white print:text-black">{batches.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200">
          <p className="text-xs text-white/50 print:text-gray-500">Active</p>
          <p className="text-xl font-bold text-white print:text-black">
            {batches.filter((b) => b.status === "active").length}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200">
          <p className="text-xs text-white/50 print:text-gray-500">Completed</p>
          <p className="text-xl font-bold text-white print:text-black">
            {batches.filter((b) => b.status === "completed").length}
          </p>
        </div>
      </div>

      <SectionTitle>Treatment Records</SectionTitle>
      <Table
        headers={[
          "Batch Name",
          "Type",
          "Medication",
          "Dosage",
          "Vet/Admin",
          "Animals",
          "Status",
          "Date",
        ]}
        rows={batches.map((b) => [
          b.batch_name,
          b.treatment_type,
          b.medication,
          b.dosage,
          b.administered_by,
          b.animal_count,
          b.status,
          b.completed_date ?? b.scheduled_date,
        ])}
      />

      <SectionTitle>Treatment Notes</SectionTitle>
      <div className="space-y-3">
        {batches.map((b) => (
          <div
            key={b.id}
            className="p-3 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200"
          >
            <p className="font-semibold text-white print:text-black text-sm">
              {b.batch_name}
            </p>
            <p className="text-sm text-white/60 print:text-gray-600 mt-1">
              {b.notes ?? "No notes"}
            </p>
          </div>
        ))}
      </div>
    </>
  );

  const renderFinancial = () => (
    <>
      <ReportHeader title="Financial Summary" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200">
          <p className="text-xs text-white/50 print:text-gray-500">Total Revenue</p>
          <p className="text-xl font-bold text-emerald-400 print:text-black">
            ${financialData.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200">
          <p className="text-xs text-white/50 print:text-gray-500">Avg $/kg</p>
          <p className="text-xl font-bold text-white print:text-black">
            ${financialData.avgPricePerKg}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200">
          <p className="text-xs text-white/50 print:text-gray-500">Completed Sales</p>
          <p className="text-xl font-bold text-white print:text-black">
            {financialData.completed.length}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200">
          <p className="text-xs text-white/50 print:text-gray-500">Pending Value</p>
          <p className="text-xl font-bold text-amber-400 print:text-black">
            ${financialData.pendingValue.toLocaleString()}
          </p>
        </div>
      </div>

      <SectionTitle>Completed Sales</SectionTitle>
      <Table
        headers={["Tag", "Buyer", "Sale Price", "Weight (kg)", "$/kg", "Date"]}
        rows={financialData.completed.map((s) => [
          s.record_visual_tag,
          s.buyer_name,
          `$${s.sale_price.toLocaleString()}`,
          s.weight_at_sale,
          `$${s.price_per_kg.toFixed(2)}`,
          s.sale_date,
        ])}
      />

      <SectionTitle>Pending Sales</SectionTitle>
      <Table
        headers={["Tag", "Buyer", "Sale Price", "Weight (kg)", "$/kg", "Date", "Notes"]}
        rows={financialData.pending.map((s) => [
          s.record_visual_tag,
          s.buyer_name,
          `$${s.sale_price.toLocaleString()}`,
          s.weight_at_sale,
          `$${s.price_per_kg.toFixed(2)}`,
          s.sale_date,
          s.notes ?? "-",
        ])}
      />
    </>
  );

  const renderBiosecurity = () => (
    <>
      <ReportHeader title="Biosecurity Plan" />

      <SectionTitle>1. Property Details</SectionTitle>
      <Table
        headers={["Item", "Detail"]}
        rows={[
          ["Property Name", FARM.name],
          ["Address", FARM.address],
          ["PIC Number", FARM.pic],
          ["Owner / Manager", FARM.owner],
          ["Contact Phone", FARM.phone],
          ["Property Size", "215 hectares"],
          ["Enterprise Type", "Beef Cattle - Breeding & Fattening"],
          ["Total Head", String(stats.total_livestock)],
        ]}
      />

      <SectionTitle>2. Visitor Log Requirements</SectionTitle>
      <div className="p-4 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200 text-sm text-white/80 print:text-black space-y-2">
        <p>All visitors to the property must:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Sign the visitor log at the main gate before entry</li>
          <li>Declare any recent livestock contact within the past 7 days</li>
          <li>Wear clean footwear or use boot wash facilities provided</li>
          <li>Stay on designated vehicle tracks unless escorted</li>
          <li>Not bring dogs or other animals onto the property without prior approval</li>
        </ul>
      </div>

      <SectionTitle>3. Quarantine Procedures</SectionTitle>
      <div className="p-4 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200 text-sm text-white/80 print:text-black space-y-2">
        <ul className="list-disc ml-5 space-y-1">
          <li>All incoming cattle must be isolated in Holding Yards (Paddock 4) for a minimum of 14 days</li>
          <li>Incoming animals to be inspected for signs of disease, parasites, and injury on arrival</li>
          <li>Drench and vaccinate all incoming stock before introduction to the main herd</li>
          <li>Maintain separate equipment for quarantine animals where practical</li>
          <li>Record all introductions in the property register with date, source, and PIC of origin</li>
          <li>Any animal showing signs of notifiable disease must be reported to the DPI immediately</li>
        </ul>
      </div>

      <SectionTitle>4. Vaccination Schedule</SectionTitle>
      <Table
        headers={["Vaccination", "Frequency", "Target Group", "Last Administered"]}
        rows={[
          ["Bovilis MH+IBR", "Annual (Spring)", "All breeders", "March 2026"],
          ["Ultravac 7in1", "Annual (Autumn)", "Whole herd", "February 2026"],
          ["Pestigard + 5in1", "Weaning", "Weaners", "February 2026"],
          ["Botulism (Longrange)", "Every 2 years", "Whole herd", "October 2025"],
          ["Vibriosis", "Pre-joining", "Bulls", "September 2025"],
        ]}
      />

      <SectionTitle>5. Chemical Usage Register</SectionTitle>
      <Table
        headers={["Chemical", "Purpose", "WHP/ESI", "Last Used", "Administered By"]}
        rows={[
          ["Ivermectin Plus", "Parasite control", "42 days meat / 28 days ESI", "March 2026", "Dr. Sarah Mitchell"],
          ["Oxytetracycline LA", "Antibiotic treatment", "28 days meat / 35 days ESI", "March 2026", "Dr. James Cooper"],
          ["Coopers Tik-Guard", "Tick control pour-on", "14 days meat / 0 days ESI", "February 2026", "Tim Dickinson"],
        ]}
      />

      <SectionTitle>6. Emergency Contacts</SectionTitle>
      <Table
        headers={["Contact", "Name", "Phone"]}
        rows={[
          ["Primary Veterinarian", "Dr. Sarah Mitchell", "0412 987 654"],
          ["Secondary Veterinarian", "Dr. James Cooper", "0423 456 789"],
          ["Property Owner", "Tim Dickinson", FARM.phone],
          ["NSW DPI Emergency", "Animal Health Hotline", "1800 675 888"],
          ["Local Land Services", "Northern Rivers LLS", "02 6623 3900"],
          ["Fire & Rescue", "Nimbin RFS", "000"],
        ]}
      />
    </>
  );

  const renderSalesHistory = () => (
    <>
      <ReportHeader title="Sales History" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200">
          <p className="text-xs text-white/50 print:text-gray-500">Total Sales</p>
          <p className="text-xl font-bold text-white print:text-black">{sales.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200">
          <p className="text-xs text-white/50 print:text-gray-500">Total Value</p>
          <p className="text-xl font-bold text-emerald-400 print:text-black">
            ${sales.reduce((s, r) => s + r.sale_price, 0).toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200">
          <p className="text-xs text-white/50 print:text-gray-500">Total Weight Sold</p>
          <p className="text-xl font-bold text-white print:text-black">
            {sales.reduce((s, r) => s + r.weight_at_sale, 0).toLocaleString()} kg
          </p>
        </div>
      </div>

      <SectionTitle>All Sales Records</SectionTitle>
      <Table
        headers={[
          "Tag",
          "Buyer",
          "Contact",
          "Sale Price",
          "Weight (kg)",
          "$/kg",
          "Status",
          "Date",
          "Notes",
        ]}
        rows={sales.map((s) => [
          s.record_visual_tag,
          s.buyer_name,
          s.buyer_contact,
          `$${s.sale_price.toLocaleString()}`,
          s.weight_at_sale,
          `$${s.price_per_kg.toFixed(2)}`,
          s.status,
          s.sale_date,
          s.notes ?? "-",
        ])}
      />

      <SectionTitle>Sales by Buyer</SectionTitle>
      {(() => {
        const grouped: Record<string, { count: number; total: number }> = {};
        sales.forEach((s) => {
          if (!grouped[s.buyer_name])
            grouped[s.buyer_name] = { count: 0, total: 0 };
          grouped[s.buyer_name].count++;
          grouped[s.buyer_name].total += s.sale_price;
        });
        return (
          <Table
            headers={["Buyer", "No. Sales", "Total Value"]}
            rows={Object.entries(grouped).map(([buyer, d]) => [
              buyer,
              d.count,
              `$${d.total.toLocaleString()}`,
            ])}
          />
        );
      })()}
    </>
  );

  // ---- Select renderer by report type ----
  const renderReport = () => {
    switch (activeReport) {
      case "herd-summary":
        return renderHerdSummary();
      case "weight-gain":
        return renderWeightGain();
      case "medical":
        return renderMedical();
      case "financial":
        return renderFinancial();
      case "biosecurity":
        return renderBiosecurity();
      case "sales-history":
        return renderSalesHistory();
      default:
        return null;
    }
  };

  // ===========================================================================
  // RENDER
  // ===========================================================================
  return (
    <>
      {/* Inject print CSS */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-white/50 mt-1">
            Generate and download professional farm reports
          </p>
        </div>

        {/* Report type cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_CARDS.map((card, idx) => {
            const isActive = activeReport === card.id;
            return (
              <div
                key={card.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <GlassCard
                  className={`flex flex-col cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    isActive
                      ? "ring-2 ring-blue-400/60 bg-white/15"
                      : "hover:bg-white/10"
                  }`}
                  onClick={() =>
                    setActiveReport(isActive ? null : card.id)
                  }
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isActive ? "bg-blue-500/30" : "bg-white/10"
                      }`}
                    >
                      <card.icon
                        className={`w-5 h-5 ${
                          isActive ? "text-blue-300" : "text-white/70"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-sm">
                          {card.title}
                        </h3>
                        {isActive && (
                          <GlassBadge variant="info">Active</GlassBadge>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-1 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto pt-2">
                    <div
                      className={`w-full text-center py-2 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-white/5 text-white/60"
                      }`}
                    >
                      {isActive ? "Viewing Report" : "Generate Report"}
                    </div>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>

        {/* Inline report display */}
        {activeReport && (
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <GlassCard className="relative">
              {/* Action buttons */}
              <div className="flex items-center gap-2 mb-6 no-print">
                <GlassButton
                  variant="primary"
                  size="sm"
                  icon={<Printer className="w-4 h-4" />}
                  onClick={handlePrint}
                >
                  Download PDF
                </GlassButton>
                <GlassButton
                  variant="default"
                  size="sm"
                  icon={<X className="w-4 h-4" />}
                  onClick={handleClose}
                >
                  Close Report
                </GlassButton>
              </div>

              {/* Printable report content */}
              <div id="report-printable" ref={reportRef}>
                {renderReport()}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </>
  );
}
