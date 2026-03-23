"use client";

import { useState, useMemo } from "react";
import { GlassCard, GlassBadge } from "@/components/glass";
import { useRecordsStore, useSalesStore, useSuppliesStore } from "@/stores/modules";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Receipt,
  PiggyBank,
  ShoppingCart,
  FileText,
  Download,
} from "lucide-react";

interface MonthlyFinance {
  month: string;
  income: number;
  expenses: number;
}

const monthlyData: MonthlyFinance[] = [
  { month: "Oct", income: 18500, expenses: 12200 },
  { month: "Nov", income: 22400, expenses: 14800 },
  { month: "Dec", income: 15200, expenses: 11500 },
  { month: "Jan", income: 28600, expenses: 16200 },
  { month: "Feb", income: 19800, expenses: 13400 },
  { month: "Mar", income: 6920, expenses: 8200 },
];

const recentTransactions = [
  { id: 1, description: "Sale - AU-0149 Angus Male", type: "income" as const, amount: 3200, date: "2026-02-28", category: "Livestock Sales" },
  { id: 2, description: "Sale - AU-0143 Hereford Steer", type: "income" as const, amount: 3720, date: "2026-02-20", category: "Livestock Sales" },
  { id: 3, description: "Cattle Feed Pellets - Southern Stock", type: "expense" as const, amount: 2125, date: "2026-03-05", category: "Feed" },
  { id: 4, description: "Ivermectin Plus - Drench Supply", type: "expense" as const, amount: 850, date: "2026-03-03", category: "Medical" },
  { id: 5, description: "Star Pickets - Rural Fencing", type: "expense" as const, amount: 382.50, date: "2026-03-01", category: "Fencing" },
  { id: 6, description: "Diesel - Farm Fuel", type: "expense" as const, amount: 520, date: "2026-02-28", category: "Fuel" },
  { id: 7, description: "Veterinary Visit - Dr Cooper", type: "expense" as const, amount: 480, date: "2026-02-25", category: "Medical" },
  { id: 8, description: "Superphosphate - Incitec Pivot", type: "expense" as const, amount: 520, date: "2026-02-22", category: "Fertilizer" },
];

const expenseCategories = [
  { category: "Feed", amount: 4250, pct: 32, color: "bg-amber-500" },
  { category: "Medical", amount: 2680, pct: 20, color: "bg-red-500" },
  { category: "Fencing", amount: 1850, pct: 14, color: "bg-emerald-500" },
  { category: "Fuel", amount: 1560, pct: 12, color: "bg-blue-500" },
  { category: "Fertilizer", amount: 1040, pct: 8, color: "bg-purple-500" },
  { category: "Labour", amount: 980, pct: 7, color: "bg-cyan-500" },
  { category: "Other", amount: 840, pct: 6, color: "bg-white/30" },
];

type FilterType = "all" | "income" | "expense";

export default function FinancePage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const sales = useSalesStore((s) => s.sales);
  const supplies = useSuppliesStore((s) => s.supplies);

  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = ((netProfit / totalIncome) * 100).toFixed(1);
  const maxMonthly = Math.max(...monthlyData.map((m) => Math.max(m.income, m.expenses)));

  const completedSalesRevenue = useMemo(() => {
    return sales.filter((s) => s.status === "completed").reduce((sum, s) => sum + s.sale_price, 0);
  }, [sales]);

  const totalSupplyValue = useMemo(() => {
    return supplies.reduce((sum, s) => sum + s.quantity * s.cost_per_unit, 0);
  }, [supplies]);

  const filteredTransactions = filter === "all"
    ? recentTransactions
    : recentTransactions.filter((t) => t.type === filter);

  const handleExportFinancials = () => {
    const rows = [
      ["Date", "Description", "Category", "Type", "Amount"],
      ...recentTransactions.map((t) => [
        t.date,
        t.description,
        t.category,
        t.type,
        t.type === "income" ? t.amount.toFixed(2) : `-${t.amount.toFixed(2)}`,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financial-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Finance</h1>
          <p className="text-white/50 mt-1">Income, expenses and profitability</p>
        </div>
        <button
          onClick={handleExportFinancials}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/70 text-sm hover:bg-white/15 transition-colors"
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: "40ms" }}>
        <GlassCard>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs text-white/40 uppercase">Income YTD</span>
          </div>
          <p className="text-2xl font-bold text-white">${(totalIncome / 1000).toFixed(1)}k</p>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +12% vs last year
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-xs text-white/40 uppercase">Expenses YTD</span>
          </div>
          <p className="text-2xl font-bold text-white">${(totalExpenses / 1000).toFixed(1)}k</p>
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +5% vs last year
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xs text-white/40 uppercase">Net Profit</span>
          </div>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            ${(Math.abs(netProfit) / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-white/40 mt-1">{profitMargin}% margin</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xs text-white/40 uppercase">Assets</span>
          </div>
          <p className="text-2xl font-bold text-white">${((completedSalesRevenue + totalSupplyValue) / 1000).toFixed(1)}k</p>
          <p className="text-xs text-white/40 mt-1">Sales + inventory value</p>
        </GlassCard>
      </div>

      {/* Income vs Expenses Chart */}
      <GlassCard className="animate-fade-in-up" style={{ animationDelay: "70ms" }}>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
          Income vs Expenses (6 months)
        </h2>
        <div className="grid grid-cols-6 gap-4">
          {monthlyData.map((m) => (
            <div key={m.month} className="text-center">
              <div className="h-32 flex items-end justify-center gap-1.5">
                <div
                  className="w-4 rounded-t-sm bg-emerald-500/60"
                  style={{ height: `${(m.income / maxMonthly) * 100}%` }}
                />
                <div
                  className="w-4 rounded-t-sm bg-red-500/40"
                  style={{ height: `${(m.expenses / maxMonthly) * 100}%` }}
                />
              </div>
              <p className="text-xs text-white/50 mt-2">{m.month}</p>
              <p className="text-[10px] text-emerald-400">${(m.income / 1000).toFixed(1)}k</p>
              <p className="text-[10px] text-red-400">${(m.expenses / 1000).toFixed(1)}k</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="w-3 h-3 rounded-sm bg-emerald-500/60" /> Income
          </div>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="w-3 h-3 rounded-sm bg-red-500/40" /> Expenses
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Expense Breakdown */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "90ms" }}>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
            Expense Breakdown
          </h2>
          <div className="space-y-3">
            {expenseCategories.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/80">{cat.category}</span>
                  <span className="text-sm font-semibold text-white">${cat.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color}`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Transactions */}
        <GlassCard className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "110ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
              Recent Transactions
            </h2>
            <div className="flex gap-1">
              {(["all", "income", "expense"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize ${
                    filter === f ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            {filteredTransactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  t.type === "income" ? "bg-emerald-500/15" : "bg-red-500/15"
                }`}>
                  {t.type === "income" ? (
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Receipt className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{t.description}</p>
                  <p className="text-[10px] text-white/40">{t.date} &middot; {t.category}</p>
                </div>
                <p className={`text-sm font-bold shrink-0 ${
                  t.type === "income" ? "text-emerald-400" : "text-red-400"
                }`}>
                  {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
