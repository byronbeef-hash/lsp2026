"use client";

import { useEffect, useState } from "react";

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
  weaner_steer: "Weaner Steer",
  processor_cow: "Processor Cow",
  online_weaner_steer: "Online Weaner",
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
    <div key={item.key} className="inline-flex items-center gap-5 px-6">
      <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
        {item.name}
      </span>
      <span className="text-sm font-bold text-white tabular-nums">
        {item.price.toFixed(2)}
        <span className="text-[10px] font-normal text-white/40 ml-1">c/kg</span>
      </span>
      <span
        className={`text-xs font-medium tabular-nums ${
          item.change >= 0 ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {item.change >= 0 ? "▲" : "▼"} {Math.abs(item.change).toFixed(2)}
      </span>
      <span className="text-[10px] text-white/30 tabular-nums">
        {item.volume.toLocaleString()} hd
      </span>
      {i < items.length - 1 && (
        <span className="text-white/10 text-xs">|</span>
      )}
    </div>
  ));

  return (
    <div className="w-full bg-[#000030]/80 backdrop-blur-md border-b border-white/10 overflow-hidden relative z-50">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[10px] text-white/30 animate-pulse">Loading MLA prices...</div>
        </div>
      )}
      <div
        className={`group flex items-center h-9 ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}
      >
        <div className="animate-ticker inline-flex items-center whitespace-nowrap group-hover:[animation-play-state:paused]">
          {/* Render content 3 times for seamless loop */}
          <div className="inline-flex items-center">{tickerContent}</div>
          <div className="inline-flex items-center">{tickerContent}</div>
          <div className="inline-flex items-center">{tickerContent}</div>
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
          animation: ticker 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
