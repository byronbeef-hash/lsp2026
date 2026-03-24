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
  Heart,
  Leaf,
  Wrench,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronRight,
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
  // FARM HEALTH DASHBOARD DATA
  // ===========================================================================
  const overallScore = 82;
  const subScores = [
    { label: "Herd Health", score: 85, icon: Heart, color: "from-emerald-400 to-emerald-600", bg: "bg-emerald-500" },
    { label: "Pasture Condition", score: 72, icon: Leaf, color: "from-amber-400 to-amber-600", bg: "bg-amber-500" },
    { label: "Financial Performance", score: 78, icon: DollarSign, color: "from-blue-400 to-blue-600", bg: "bg-blue-500" },
    { label: "Biosecurity Compliance", score: 90, icon: ShieldCheck, color: "from-violet-400 to-violet-600", bg: "bg-violet-500" },
    { label: "Infrastructure", score: 68, icon: Wrench, color: "from-orange-400 to-orange-600", bg: "bg-orange-500" },
  ];

  const keyMetrics = [
    { label: "Mortality Rate", value: "1.2%", trend: "down" as const, trendGood: true, badge: null },
    { label: "Calving Rate", value: "92%", trend: null, trendGood: true, badge: "Excellent" },
    { label: "Avg Daily Gain", value: "0.85 kg/d", trend: "up" as const, trendGood: true, badge: null },
    { label: "Feed Conversion", value: "7.2:1", trend: null, trendGood: true, badge: null },
    { label: "Days to Market", value: "420 days", trend: "down" as const, trendGood: true, badge: null },
    { label: "Revenue/Head", value: "$2,271", trend: "up" as const, trendGood: true, badge: null },
  ];

  const alerts = [
    { text: "2 animals overdue for vaccination", priority: "High" as const, color: "bg-red-500/20 text-red-300 border-red-500/30" },
    { text: "Back Block paddock below minimum biomass", priority: "Medium" as const, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    { text: "3 fence sections need repair", priority: "Medium" as const, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    { text: "Annual biosecurity plan review due in 14 days", priority: "Low" as const, color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  ];

  // Sparkline data (6 months, normalised 0-1)
  const trendData = {
    weightGain: [0.3, 0.4, 0.45, 0.55, 0.7, 0.85],   // trending up
    mortality:  [0.8, 0.7, 0.55, 0.4, 0.25, 0.15],     // trending down (good)
    nyciPrice:  [0.2, 0.35, 0.3, 0.5, 0.65, 0.8],      // trending up
  };

  // Circular gauge helpers
  const gaugeRadius = 70;
  const gaugeStroke = 10;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeArc = gaugeCircumference * 0.75; // 270 degree arc
  const gaugeDashOffset = gaugeArc - (gaugeArc * overallScore) / 100;
  const gaugeRotation = 135; // start from bottom-left

  function getScoreLabel(score: number) {
    if (score >= 90) return { text: "Excellent", color: "text-emerald-400" };
    if (score >= 75) return { text: "Good", color: "text-emerald-400" };
    if (score >= 60) return { text: "Fair", color: "text-amber-400" };
    return { text: "Needs Attention", color: "text-red-400" };
  }

  const scoreLabel = getScoreLabel(overallScore);

  function Sparkline({ data, color }: { data: number[]; color: string }) {
    return (
      <div className="flex items-end gap-[3px] h-6">
        {data.map((v, i) => (
          <div
            key={i}
            className={`w-[5px] rounded-full ${color} transition-all duration-300`}
            style={{ height: `${Math.max(v * 100, 8)}%`, opacity: 0.4 + v * 0.6 }}
          />
        ))}
      </div>
    );
  }

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

        {/* ================================================================= */}
        {/* FARM HEALTH DASHBOARD                                             */}
        {/* ================================================================= */}
        <div className="animate-fade-in-up" style={{ animationDelay: "50ms" }}>
          <GlassCard>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Heart className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Farm Health Dashboard</h2>
              <GlassBadge variant="success">Live</GlassBadge>
            </div>

            {/* Score Gauge + Sub-scores row */}
            <div className="flex flex-col lg:flex-row gap-8 mb-8">
              {/* Circular Gauge */}
              <div className="flex flex-col items-center justify-center flex-shrink-0">
                <div className="relative w-[180px] h-[180px]">
                  <svg viewBox="0 0 160 160" className="w-full h-full">
                    <defs>
                      <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    {/* Background arc */}
                    <circle
                      cx="80" cy="80" r={gaugeRadius}
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth={gaugeStroke}
                      strokeDasharray={`${gaugeArc} ${gaugeCircumference - gaugeArc}`}
                      strokeLinecap="round"
                      transform={`rotate(${gaugeRotation} 80 80)`}
                    />
                    {/* Score arc */}
                    <circle
                      cx="80" cy="80" r={gaugeRadius}
                      fill="none"
                      stroke="url(#healthGradient)"
                      strokeWidth={gaugeStroke}
                      strokeDasharray={gaugeArc}
                      strokeDashoffset={gaugeDashOffset}
                      strokeLinecap="round"
                      transform={`rotate(${gaugeRotation} 80 80)`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">{overallScore}</span>
                    <span className="text-xs text-white/40 -mt-0.5">/ 100</span>
                    <span className={`text-sm font-semibold mt-1 ${scoreLabel.color}`}>{scoreLabel.text}</span>
                  </div>
                </div>
                <p className="text-xs text-white/40 mt-2 text-center">Overall Farm Health Score</p>
              </div>

              {/* Sub-score bars */}
              <div className="flex-1 space-y-4 justify-center flex flex-col">
                {subScores.map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <s.icon className="w-3.5 h-3.5 text-white/50" />
                        <span className="text-sm text-white/80">{s.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{s.score}<span className="text-white/40 font-normal">/100</span></span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${s.color} transition-all duration-700`}
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {keyMetrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] p-3 text-center"
                >
                  <p className="text-[11px] text-white/40 mb-1 truncate">{m.label}</p>
                  <p className="text-lg font-bold text-white">{m.value}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {m.trend === "down" && (
                      <ArrowDown className={`w-3 h-3 ${m.trendGood ? "text-emerald-400" : "text-red-400"}`} />
                    )}
                    {m.trend === "up" && (
                      <ArrowUp className={`w-3 h-3 ${m.trendGood ? "text-emerald-400" : "text-red-400"}`} />
                    )}
                    {m.badge && (
                      <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                        {m.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Alerts & Actions + Trend Indicators side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Alerts & Actions */}
              <div className="lg:col-span-2">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Alerts & Actions</h3>
                <div className="space-y-2">
                  {alerts.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-3 hover:bg-white/[0.07] transition-colors"
                    >
                      <AlertCircle className={`w-4 h-4 flex-shrink-0 ${
                        a.priority === "High" ? "text-red-400" : a.priority === "Medium" ? "text-amber-400" : "text-blue-400"
                      }`} />
                      <span className="text-sm text-white/80 flex-1">{a.text}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${a.color}`}>
                        {a.priority}
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Trend Indicators */}
              <div>
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">6-Month Trends</h3>
                <div className="space-y-4">
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/50">Weight Gain</span>
                      <div className="flex items-center gap-1">
                        <ArrowUp className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-semibold">Trending Up</span>
                      </div>
                    </div>
                    <Sparkline data={trendData.weightGain} color="bg-emerald-400" />
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/50">Mortality Rate</span>
                      <div className="flex items-center gap-1">
                        <ArrowDown className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-semibold">Trending Down</span>
                      </div>
                    </div>
                    <Sparkline data={trendData.mortality} color="bg-blue-400" />
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/50">NYCI Price</span>
                      <div className="flex items-center gap-1">
                        <ArrowUp className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-semibold">Trending Up</span>
                      </div>
                    </div>
                    <Sparkline data={trendData.nyciPrice} color="bg-violet-400" />
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ================================================================= */}
        {/* REPORT CARDS                                                      */}
        {/* ================================================================= */}

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
