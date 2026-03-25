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
/* chart text colors set by globals.css and theme store */
@media print {
  :root {
    --chart-text: rgba(0,0,0,0.85) !important;
    --chart-text-muted: rgba(0,0,0,0.5) !important;
  }
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
  #report-printable svg text {
    fill: black !important;
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
  name: "Nimbin Station",
  address: "Nimbin NSW 2480",
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
// Chart colour palette
// ---------------------------------------------------------------------------
const CHART_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#14b8a6", // teal
];

// ---------------------------------------------------------------------------
// SVG Pie Chart Component
// ---------------------------------------------------------------------------
function PieChart({
  data,
  size = 200,
}: {
  data: { label: string; value: number; color?: string }[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  let cumulativeAngle = -90; // start from top
  const slices = data.map((d, i) => {
    const pct = d.value / total;
    const angle = pct * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;

    const midRad = ((startAngle + angle / 2) * Math.PI) / 180;
    const labelR = r * 0.65;
    const lx = cx + labelR * Math.cos(midRad);
    const ly = cy + labelR * Math.sin(midRad);

    const color = d.color || CHART_COLORS[i % CHART_COLORS.length];
    const pathD =
      data.length === 1
        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { pathD, color, pct, lx, ly, label: d.label };
  });

  const legendY = size + 12;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size + data.length * 20 + 16}`}
        width={size}
        className="max-w-full"
      >
        <defs>
          {slices.map((s, i) => (
            <linearGradient
              key={`pg-${i}`}
              id={`pie-grad-${i}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={s.color} stopOpacity="1" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.7" />
            </linearGradient>
          ))}
        </defs>
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.pathD}
            fill={`url(#pie-grad-${i})`}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="1"
          />
        ))}
        {slices.map((s, i) =>
          s.pct >= 0.06 ? (
            <text
              key={`t-${i}`}
              x={s.lx}
              y={s.ly}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="11"
              fontWeight="700"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              {(s.pct * 100).toFixed(0)}%
            </text>
          ) : null,
        )}
        {/* Legend */}
        {data.map((d, i) => {
          const ly = legendY + i * 20;
          const color = d.color || CHART_COLORS[i % CHART_COLORS.length];
          return (
            <g key={`leg-${i}`}>
              <rect
                x={10}
                y={ly}
                width={12}
                height={12}
                rx={3}
                fill={color}
              />
              <text
                x={28}
                y={ly + 10}
                fill="var(--chart-text)"
                fontSize="11"
                className="print:fill-black"
              >
                {d.label} ({(d.value / total * 100).toFixed(1)}%)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG Vertical Bar Chart Component
// ---------------------------------------------------------------------------
function BarChart({
  data,
  width = 360,
  height = 200,
  barColor,
}: {
  data: { label: string; value: number; color?: string }[];
  width?: number;
  height?: number;
  barColor?: string;
}) {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.value));
  const padLeft = 44;
  const padRight = 12;
  const padTop = 20;
  const padBottom = 40;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const barW = Math.min(40, (chartW / data.length) * 0.6);
  const gap = chartW / data.length;

  // Grid lines
  const gridLines = 4;
  const gridStep = maxVal / gridLines;

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${width} ${height}`} width={width} className="max-w-full">
        <defs>
          {data.map((d, i) => {
            const c = d.color || barColor || CHART_COLORS[i % CHART_COLORS.length];
            return (
              <linearGradient key={`bg-${i}`} id={`bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c} stopOpacity="1" />
                <stop offset="100%" stopColor={c} stopOpacity="0.6" />
              </linearGradient>
            );
          })}
        </defs>
        {/* Grid lines */}
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = padTop + chartH - (i / gridLines) * chartH;
          const val = Math.round(gridStep * i);
          return (
            <g key={`grid-${i}`}>
              <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <text x={padLeft - 6} y={y + 4} textAnchor="end" fill="var(--chart-text-muted)" fontSize="9" className="print:fill-gray-500">
                {val}
              </text>
            </g>
          );
        })}
        {/* Bars */}
        {data.map((d, i) => {
          const barH = maxVal > 0 ? (d.value / maxVal) * chartH : 0;
          const x = padLeft + gap * i + (gap - barW) / 2;
          const y = padTop + chartH - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx={4} fill={`url(#bar-grad-${i})`} />
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                fill="var(--chart-text)"
                fontSize="10"
                fontWeight="700"
                className="print:fill-black"
              >
                {d.value}
              </text>
              <text
                x={x + barW / 2}
                y={height - padBottom + 14}
                textAnchor="middle"
                fill="var(--chart-text-muted)"
                fontSize="9"
                className="print:fill-gray-500"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG Horizontal Bar Chart Component
// ---------------------------------------------------------------------------
function HBarChart({
  data,
  width = 360,
  height,
}: {
  data: { label: string; value: number; color?: string }[];
  width?: number;
  height?: number;
}) {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.value));
  const barH = 28;
  const gap = 8;
  const padLeft = 90;
  const padRight = 50;
  const padTop = 8;
  const computedH = height || padTop + data.length * (barH + gap);
  const chartW = width - padLeft - padRight;

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${width} ${computedH}`} width={width} className="max-w-full">
        <defs>
          {data.map((d, i) => {
            const c = d.color || CHART_COLORS[i % CHART_COLORS.length];
            return (
              <linearGradient key={`hbg-${i}`} id={`hbar-grad-${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={c} stopOpacity="0.7" />
                <stop offset="100%" stopColor={c} stopOpacity="1" />
              </linearGradient>
            );
          })}
        </defs>
        {data.map((d, i) => {
          const y = padTop + i * (barH + gap);
          const w = maxVal > 0 ? (d.value / maxVal) * chartW : 0;
          return (
            <g key={i}>
              {/* Background track */}
              <rect x={padLeft} y={y} width={chartW} height={barH} rx={4} fill="rgba(255,255,255,0.05)" />
              {/* Value bar */}
              <rect x={padLeft} y={y} width={w} height={barH} rx={4} fill={`url(#hbar-grad-${i})`} />
              {/* Label */}
              <text x={padLeft - 8} y={y + barH / 2 + 4} textAnchor="end" fill="var(--chart-text)" fontSize="11" className="print:fill-black">
                {d.label}
              </text>
              {/* Value */}
              <text x={padLeft + w + 8} y={y + barH / 2 + 4} textAnchor="start" fill="var(--chart-text)" fontSize="11" fontWeight="700" className="print:fill-black">
                {d.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG Area Chart Component (for weight trend)
// ---------------------------------------------------------------------------
function AreaChart({
  data,
  width = 400,
  height = 200,
  color = "#3b82f6",
}: {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length === 0) return null;
  const padLeft = 50;
  const padRight = 16;
  const padTop = 20;
  const padBottom = 36;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const minVal = Math.min(...data.map((d) => d.value)) * 0.95;
  const maxVal = Math.max(...data.map((d) => d.value)) * 1.02;
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = padLeft + (i / (data.length - 1)) * chartW;
    const y = padTop + chartH - ((d.value - minVal) / range) * chartH;
    return { x, y, label: d.label, value: d.value };
  });

  const lineD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${lineD} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;

  // Grid
  const gridLines = 4;

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${width} ${height}`} width={width} className="max-w-full">
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {/* Grid */}
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = padTop + chartH - (i / gridLines) * chartH;
          const val = Math.round(minVal + (range * i) / gridLines);
          return (
            <g key={`ag-${i}`}>
              <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <text x={padLeft - 8} y={y + 4} textAnchor="end" fill="var(--chart-text-muted)" fontSize="9" className="print:fill-gray-500">
                {val}
              </text>
            </g>
          );
        })}
        {/* Area fill */}
        <path d={areaD} fill="url(#area-fill)" />
        {/* Line */}
        <path d={lineD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots and labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" fill="var(--chart-text)" fontSize="9" fontWeight="700" className="print:fill-black">
              {p.value}
            </text>
            <text x={p.x} y={height - padBottom + 16} textAnchor="middle" fill="var(--chart-text-muted)" fontSize="9" className="print:fill-gray-500">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chart Section Wrapper
// ---------------------------------------------------------------------------
function ChartSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 rounded-2xl bg-white/[0.04] print:bg-gray-50 border border-white/[0.08] print:border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-white/60 print:text-gray-500 uppercase tracking-wider mb-4">
        {title}
      </h3>
      <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
        {children}
      </div>
    </div>
  );
}

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

      <ChartSection title="Visual Overview">
        <div className="flex-1 flex flex-col items-center">
          <p className="text-xs text-white/50 print:text-gray-500 mb-2 font-medium">Breed Distribution</p>
          <PieChart
            data={mockBreedDistribution.map((b) => ({ label: b.breed, value: b.count }))}
            size={210}
          />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <p className="text-xs text-white/50 print:text-gray-500 mb-2 font-medium">Head Count by Category</p>
          <BarChart
            data={[
              { label: "Cows", value: 120, color: "#3b82f6" },
              { label: "Bulls", value: 5, color: "#10b981" },
              { label: "Weaners", value: 100, color: "#f59e0b" },
              { label: "Steers", value: 48, color: "#f43f5e" },
              { label: "Heifers", value: 52, color: "#8b5cf6" },
            ]}
            width={340}
            height={210}
          />
        </div>
      </ChartSection>

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

      <ChartSection title="Weight Trends & Distribution">
        <div className="flex-1 flex flex-col items-center">
          <p className="text-xs text-white/50 print:text-gray-500 mb-2 font-medium">Monthly Avg Weight (kg)</p>
          <AreaChart
            data={[
              { label: "Aug", value: 420 },
              { label: "Sep", value: 435 },
              { label: "Oct", value: 445 },
              { label: "Nov", value: 455 },
              { label: "Dec", value: 462 },
              { label: "Jan", value: 468 },
              { label: "Feb", value: 474 },
              { label: "Mar", value: 480 },
            ]}
            width={380}
            height={220}
            color="#3b82f6"
          />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <p className="text-xs text-white/50 print:text-gray-500 mb-2 font-medium">Weight Distribution (head)</p>
          <BarChart
            data={[
              { label: "300-350", value: 15, color: "#06b6d4" },
              { label: "350-400", value: 25, color: "#3b82f6" },
              { label: "400-450", value: 40, color: "#10b981" },
              { label: "450-500", value: 30, color: "#f59e0b" },
              { label: "500+", value: 15, color: "#8b5cf6" },
            ]}
            width={340}
            height={220}
          />
        </div>
      </ChartSection>

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

      <ChartSection title="Treatment Overview">
        <div className="flex-1 flex flex-col items-center">
          <p className="text-xs text-white/50 print:text-gray-500 mb-2 font-medium">Treatment Types</p>
          <PieChart
            data={[
              { label: "Vaccination", value: 45, color: "#3b82f6" },
              { label: "Drench", value: 25, color: "#10b981" },
              { label: "Examination", value: 15, color: "#f59e0b" },
              { label: "Treatment", value: 15, color: "#f43f5e" },
            ]}
            size={210}
          />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <p className="text-xs text-white/50 print:text-gray-500 mb-2 font-medium">Batch Status</p>
          <HBarChart
            data={[
              { label: "Active", value: batches.filter((b) => b.status === "active").length || 3, color: "#3b82f6" },
              { label: "Completed", value: batches.filter((b) => b.status === "completed").length || 5, color: "#10b981" },
              { label: "Scheduled", value: batches.filter((b) => b.status === "scheduled").length || 2, color: "#f59e0b" },
            ]}
            width={340}
          />
        </div>
      </ChartSection>

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

      <ChartSection title="Financial Overview">
        <div className="flex-1 flex flex-col items-center">
          <p className="text-xs text-white/50 print:text-gray-500 mb-2 font-medium">Monthly Revenue</p>
          <BarChart
            data={[
              { label: "Oct", value: 12400 },
              { label: "Nov", value: 18600 },
              { label: "Dec", value: 9200 },
              { label: "Jan", value: 22100 },
              { label: "Feb", value: 15800 },
              { label: "Mar", value: 19500 },
            ]}
            width={360}
            height={220}
            barColor="#10b981"
          />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <p className="text-xs text-white/50 print:text-gray-500 mb-2 font-medium">Revenue by Buyer</p>
          <PieChart
            data={[
              { label: "JBS Australia", value: 38200, color: "#3b82f6" },
              { label: "Teys Australia", value: 24800, color: "#10b981" },
              { label: "NH Foods", value: 18600, color: "#f59e0b" },
              { label: "Private Buyers", value: 16000, color: "#8b5cf6" },
            ]}
            size={210}
          />
        </div>
      </ChartSection>

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

      <ChartSection title="Sales Overview">
        <div className="flex-1 flex flex-col items-center">
          <p className="text-xs text-white/50 print:text-gray-500 mb-2 font-medium">Sales by Month (head)</p>
          <BarChart
            data={[
              { label: "Oct", value: 8, color: "#3b82f6" },
              { label: "Nov", value: 12, color: "#3b82f6" },
              { label: "Dec", value: 5, color: "#3b82f6" },
              { label: "Jan", value: 15, color: "#3b82f6" },
              { label: "Feb", value: 10, color: "#3b82f6" },
              { label: "Mar", value: 14, color: "#3b82f6" },
            ]}
            width={340}
            height={210}
            barColor="#3b82f6"
          />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <p className="text-xs text-white/50 print:text-gray-500 mb-2 font-medium">Sales by Category</p>
          <PieChart
            data={[
              { label: "Steers", value: 42, color: "#3b82f6" },
              { label: "Heifers", value: 28, color: "#10b981" },
              { label: "Cows", value: 20, color: "#f59e0b" },
              { label: "Bulls", value: 10, color: "#f43f5e" },
            ]}
            size={210}
          />
        </div>
      </ChartSection>

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
                  onClick={() => {
                    setActiveReport(isActive ? null : card.id);
                    if (!isActive) {
                      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                    }
                  }}
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
            ref={reportRef}
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
