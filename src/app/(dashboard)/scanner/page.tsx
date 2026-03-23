"use client";

import { useState, useEffect } from "react";
import { GlassCard, GlassBadge, GlassButton, GlassInput } from "@/components/glass";
import { useRecordsStore } from "@/stores/modules";
import type { LivestockRecord } from "@/types";
import {
  ScanLine,
  Radio,
  Beef,
  Eye,
  Weight,
  Stethoscope,
  Clock,
  Search,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface RecentScan {
  record: LivestockRecord;
  scannedAt: Date;
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}

export default function ScannerPage() {
  const records = useRecordsStore((s) => s.records);

  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanResult, setScanResult] = useState<LivestockRecord | null>(null);

  const [manualEid, setManualEid] = useState("");
  const [manualResult, setManualResult] = useState<LivestockRecord | null | "not_found">(null);

  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [, forceUpdate] = useState(0);

  // Refresh relative timestamps every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        // Randomly pick a record from the store
        const randomRecord = records[Math.floor(Math.random() * records.length)];
        setScanResult(randomRecord ?? null);
        setIsScanning(false);
        setScanComplete(true);
        if (randomRecord) {
          setRecentScans((prev) => [
            { record: randomRecord, scannedAt: new Date() },
            ...prev.slice(0, 9),
          ]);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isScanning, records]);

  const handleScan = () => {
    if (isScanning) return;
    setScanComplete(false);
    setScanResult(null);
    setManualResult(null);
    setIsScanning(true);
  };

  const handleReset = () => {
    setScanComplete(false);
    setScanResult(null);
    setIsScanning(false);
  };

  const handleManualLookup = () => {
    const trimmed = manualEid.trim();
    if (!trimmed) return;
    const found = records.find(
      (r) => r.eid && r.eid.toLowerCase() === trimmed.toLowerCase(),
    );
    setManualResult(found ?? "not_found");
    if (found) {
      setRecentScans((prev) => [
        { record: found, scannedAt: new Date() },
        ...prev.filter((s) => s.record.id !== found.id).slice(0, 9),
      ]);
    }
  };

  const handleManualKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleManualLookup();
  };

  const renderResultCard = (record: LivestockRecord) => (
    <GlassCard>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <Beef className="w-7 h-7 text-white/60" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-lg font-bold text-white">{record.visual_tag}</p>
            <GlassBadge variant="success">{record.sex}</GlassBadge>
            <GlassBadge variant="default">{record.condition}</GlassBadge>
          </div>
          <p className="text-sm text-white/50 mt-1">
            {record.breed} &middot; {record.weight_kg} kg
          </p>
          <p className="text-xs text-white/30 mt-1 font-mono">
            EID: {record.eid ?? "Not assigned"}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-white/10 flex-wrap">
        <Link href={`/records/${record.id}`}>
          <GlassButton size="sm" icon={<Eye className="w-4 h-4" />}>
            View Record
          </GlassButton>
        </Link>
        <Link href={`/records/${record.id}`}>
          <GlassButton size="sm" icon={<Weight className="w-4 h-4" />}>
            Update Weight
          </GlassButton>
        </Link>
        <Link href="/medical">
          <GlassButton size="sm" icon={<Stethoscope className="w-4 h-4" />}>
            Add Treatment
          </GlassButton>
        </Link>
      </div>
    </GlassCard>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">EID Scanner</h1>
        <p className="text-white/50 mt-1">Scan electronic identification tags</p>
      </div>

      {/* Scanner Area */}
      <div className="animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <GlassCard className="flex flex-col items-center py-10">
          {/* Scanner Animation */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            {/* Outer ring */}
            <div
              className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${
                isScanning
                  ? "border-blue-400/60 animate-ping"
                  : scanComplete
                    ? "border-emerald-400/40"
                    : "border-white/15"
              }`}
            />

            {/* Middle ring */}
            <div
              className={`absolute inset-4 rounded-full border-2 transition-all duration-500 ${
                isScanning
                  ? "border-blue-400/40 animate-pulse"
                  : scanComplete
                    ? "border-emerald-400/30"
                    : "border-white/10"
              }`}
            />

            {/* Inner ring */}
            <div
              className={`absolute inset-8 rounded-full border-2 transition-all duration-500 ${
                isScanning
                  ? "border-blue-400/70"
                  : scanComplete
                    ? "border-emerald-400/50"
                    : "border-white/20"
              }`}
              style={
                isScanning
                  ? { animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.3s" }
                  : undefined
              }
            />

            {/* Center icon */}
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                isScanning
                  ? "bg-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                  : scanComplete
                    ? "bg-emerald-500/20"
                    : "bg-white/10"
              }`}
            >
              {isScanning ? (
                <Radio className="w-8 h-8 text-blue-400 animate-pulse" />
              ) : scanComplete ? (
                <Beef className="w-8 h-8 text-emerald-400" />
              ) : (
                <ScanLine className="w-8 h-8 text-white/60" />
              )}
            </div>
          </div>

          {/* Status */}
          <p
            className={`text-sm font-medium mb-4 ${
              isScanning
                ? "text-blue-300"
                : scanComplete
                  ? "text-emerald-300"
                  : "text-white/50"
            }`}
          >
            {isScanning
              ? "Scanning..."
              : scanComplete
                ? "Tag detected!"
                : "Ready to scan"}
          </p>

          {/* Scan Button */}
          {!scanComplete ? (
            <GlassButton
              variant="primary"
              size="lg"
              onClick={handleScan}
              loading={isScanning}
              icon={!isScanning ? <ScanLine className="w-4 h-4" /> : undefined}
            >
              {isScanning ? "Scanning..." : "Tap to Scan"}
            </GlassButton>
          ) : (
            <GlassButton variant="default" size="sm" onClick={handleReset}>
              Scan Another
            </GlassButton>
          )}
        </GlassCard>
      </div>

      {/* Scan Result */}
      {scanComplete && scanResult && (
        <div className="animate-fade-in-up">
          <h2 className="text-lg font-semibold text-white mb-3">Scan Result</h2>
          {renderResultCard(scanResult)}
        </div>
      )}

      {/* Manual Entry */}
      <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <h2 className="text-lg font-semibold text-white mb-3">Manual Entry</h2>
        <GlassCard>
          <div className="flex gap-3">
            <div className="flex-1">
              <GlassInput
                placeholder="Enter EID number..."
                value={manualEid}
                onChange={(e) => {
                  setManualEid(e.target.value);
                  setManualResult(null);
                }}
                onKeyDown={handleManualKeyDown}
              />
            </div>
            <GlassButton
              variant="primary"
              icon={<Search className="w-4 h-4" />}
              onClick={handleManualLookup}
            >
              Look Up
            </GlassButton>
          </div>

          {/* Manual lookup result */}
          {manualResult === "not_found" && (
            <div className="mt-4 flex items-center gap-2 text-amber-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              No animal found with this EID
            </div>
          )}
        </GlassCard>
      </div>

      {/* Manual lookup animal card */}
      {manualResult && manualResult !== "not_found" && (
        <div className="animate-fade-in-up">
          <h2 className="text-lg font-semibold text-white mb-3">Lookup Result</h2>
          {renderResultCard(manualResult)}
        </div>
      )}

      {/* Recent Scans */}
      <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <h2 className="text-lg font-semibold text-white mb-3">Recent Scans</h2>
        {recentScans.length === 0 ? (
          <GlassCard>
            <p className="text-sm text-white/40 text-center py-4">
              No scans yet this session
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {recentScans.map((scan, i) => (
              <div
                key={`${scan.record.id}-${scan.scannedAt.getTime()}`}
                className="animate-fade-in-up"
                style={{ animationDelay: `${150 + i * 50}ms` }}
              >
                <Link href={`/records/${scan.record.id}`}>
                  <GlassCard hover className="flex items-center gap-3" padding="sm">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <ScanLine className="w-5 h-5 text-white/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">
                        {scan.record.visual_tag}
                      </p>
                      <p className="text-xs text-white/40">{scan.record.breed}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/30 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(scan.scannedAt)}
                    </div>
                  </GlassCard>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
