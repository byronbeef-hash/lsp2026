"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, TrendingUp } from "lucide-react";

interface IndicatorData {
  current: number;
  m1_change: number;
  y1_change: number;
  volume: number;
}

interface TickerItem {
  key: string;
  name: string;
  price: number;
  change: number;
  volume: number;
}

const FALLBACK_DATA: Record<string, IndicatorData> = {
  nyci: { current: 472.79, m1_change: 9.92, y1_change: 132.48, volume: 26233 },
  oyci: { current: 489.2, m1_change: 8.14, y1_change: 127.38, volume: 13441 },
  weaner_steer: { current: 531.67, m1_change: 1.65, y1_change: 139.69, volume: 6048 },
  processor_cow: { current: 370.61, m1_change: 6.7, y1_change: 102.79, volume: 15186 },
  online_weaner_steer: { current: 532.0, m1_change: 2.0, y1_change: 139.0, volume: 5941 },
};

const INDICATOR_LABELS: Record<string, string> = {
  nyci: "NYCI",
  oyci: "OYCI",
  weaner_steer: "WEANER STEER",
  processor_cow: "PROCESSOR COW",
  online_weaner_steer: "ONLINE WEANER",
};

function buildTickerItems(indicators: Record<string, IndicatorData>): TickerItem[] {
  return Object.entries(INDICATOR_LABELS).map(([key, name]) => {
    const data = indicators[key] ?? FALLBACK_DATA[key];
    return {
      key,
      name,
      price: data.current,
      change: data.m1_change,
      volume: data.volume,
    };
  });
}

export function MlaTicker() {
  const [items, setItems] = useState<TickerItem[]>(() => buildTickerItems(FALLBACK_DATA));
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mla-ticker-visible");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("mla-ticker-visible", String(visible));
  }, [visible]);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrices() {
      try {
        const res = await fetch("https://amlaupdater.vercel.app/api/check-prices", {
          next: { revalidate: 300 },
        });
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (!cancelled && data?.indicators) {
          setItems(buildTickerItems(data.indicators));
        }
      } catch {
        // Keep fallback data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPrices();
    return () => { cancelled = true; };
  }, []);

  const tickerContent = items.map((item, i) => (
    <div key={`${item.key}-${i}`} className="inline-flex items-center gap-4 px-5">
      <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
        {item.name}
      </span>
      <span className="text-[13px] font-bold text-white tabular-nums">
        {item.price.toFixed(2)}
        <span className="text-[10px] font-normal text-white/40 ml-0.5">c/kg</span>
      </span>
      <span
        className={`text-[11px] font-semibold tabular-nums ${
          item.change >= 0 ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {item.change >= 0 ? "▲" : "▼"} {Math.abs(item.change).toFixed(2)}
      </span>
      <span className="text-[10px] text-white/25 tabular-nums">
        {item.volume.toLocaleString()} hd
      </span>
    </div>
  ));

  return (
    <div className="relative">
      {/* Toggle button — always visible */}
      <button
        onClick={() => setVisible(!visible)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white/70"
        title={visible ? "Hide ticker" : "Show ticker"}
      >
        <TrendingUp className="w-3 h-3" />
        {visible ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {/* Ticker bar */}
      <div
        className={`w-full bg-[#000018] border-b border-white/8 overflow-hidden transition-all duration-300 ${
          visible ? "py-2.5 opacity-100" : "py-0 h-0 opacity-0"
        }`}
      >
        {loading && (
          <div className="flex items-center justify-center">
            <div className="text-[10px] text-white/30 animate-pulse">Loading MLA prices...</div>
          </div>
        )}
        <div
          className={`group flex items-center ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}
        >
          <div className="animate-ticker inline-flex items-center whitespace-nowrap group-hover:[animation-play-state:paused]">
            {tickerContent}
            {tickerContent}
            {tickerContent}
          </div>
        </div>

        <style jsx>{`
          @keyframes ticker {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-33.333%);
            }
          }
          .animate-ticker {
            animation: ticker 35s linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
