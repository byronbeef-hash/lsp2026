"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  GlassCard,
  GlassBadge,
  GlassButton,
  GlassInput,
  GlassSelect,
} from "@/components/glass";
import { mockRecords, mockMedicalBatches, mockPaddocks } from "@/lib/mock-data";
import type { LivestockRecord } from "@/types";
import {
  ScanLine,
  Radio,
  Beef,
  Weight,
  Lock,
  Unlock,
  Play,
  Square,
  Download,
  Mic,
  Save,
  Wifi,
  WifiOff,
  ToggleLeft,
  ToggleRight,
  Plus,
  Hash,
  Clock,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap,
  Settings,
  CircleDot,
} from "lucide-react";

// --- Types ---

type DisplayMode = "eid_scales" | "eid_only" | "scales_only";

interface SessionRecord {
  id: number;
  eid: string;
  vid: string;
  weight: number | null;
  medical: string;
  notes: string;
  time: Date;
  isExisting: boolean;
  animalRecord: LivestockRecord | null;
}

// --- Helper ---

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function generateRandomEid(): string {
  const suffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  // ~50% chance of matching an existing record
  if (Math.random() > 0.5) {
    const record = mockRecords[Math.floor(Math.random() * mockRecords.length)];
    return record.eid ?? `982000411234${suffix}`;
  }
  return `982000411234${suffix}`;
}

// --- Main Component ---

export default function ScannerPage() {
  // Session state
  const [sessionName, setSessionName] = useState("Morning Weigh");
  const [mobLot, setMobLot] = useState("Mob A");
  const [paddockId, setPaddockId] = useState("4");
  const [sessionActive, setSessionActive] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("eid_scales");

  // Scale state
  const [scaleConnected] = useState(true);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [weightLocked, setWeightLocked] = useState(false);
  const [lockedWeight, setLockedWeight] = useState<number>(0);
  const [autoWeigh, setAutoWeigh] = useState(true);
  const [autoWeighThreshold] = useState(5);
  const [autoWeighSteady] = useState(2);
  const [showAutoSettings, setShowAutoSettings] = useState(false);
  const weightRef = useRef(0);
  const targetWeightRef = useRef(0);
  const steadyCountRef = useRef(0);

  // EID state
  const [eidConnected] = useState(true);
  const [eidInput, setEidInput] = useState("");
  const [scannedEid, setScannedEid] = useState("");
  const [matchedRecord, setMatchedRecord] = useState<LivestockRecord | null>(
    null
  );
  const [isNewAnimal, setIsNewAnimal] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Record form
  const [visualTag, setVisualTag] = useState("");
  const [medicalBatch, setMedicalBatch] = useState("");
  const [notes, setNotes] = useState("");

  // Session records
  const [sessionRecords, setSessionRecords] = useState<SessionRecord[]>([
    // Pre-populated mock session records
    {
      id: 1,
      eid: "982000411234567",
      vid: "AU-0142",
      weight: 487.5,
      medical: "Spring Vaccination 2026",
      notes: "",
      time: new Date(Date.now() - 1800000),
      isExisting: true,
      animalRecord: mockRecords[0],
    },
    {
      id: 2,
      eid: "982000411234568",
      vid: "AU-0143",
      weight: 622.0,
      medical: "",
      notes: "Sire in good condition",
      time: new Date(Date.now() - 1200000),
      isExisting: true,
      animalRecord: mockRecords[1],
    },
    {
      id: 3,
      eid: "982000411234569",
      vid: "AU-0144",
      weight: 413.0,
      medical: "Lame Cattle Treatment",
      notes: "Still underweight, supplement",
      time: new Date(Date.now() - 600000),
      isExisting: true,
      animalRecord: mockRecords[2],
    },
  ]);
  const [nextId, setNextId] = useState(4);
  const [showHistory, setShowHistory] = useState(true);

  // Session stats
  const sessionStats = {
    records: sessionRecords.length,
    avg:
      sessionRecords.length > 0
        ? (
            sessionRecords.reduce((s, r) => s + (r.weight ?? 0), 0) /
            sessionRecords.filter((r) => r.weight !== null).length
          ).toFixed(1)
        : "--",
    min:
      sessionRecords.length > 0
        ? Math.min(
            ...sessionRecords.filter((r) => r.weight !== null).map((r) => r.weight!)
          ).toFixed(1)
        : "--",
    max:
      sessionRecords.length > 0
        ? Math.max(
            ...sessionRecords.filter((r) => r.weight !== null).map((r) => r.weight!)
          ).toFixed(1)
        : "--",
  };

  // Simulated weight fluctuation
  useEffect(() => {
    if (weightLocked) return;

    // Set a random target weight
    if (targetWeightRef.current === 0) {
      targetWeightRef.current = 350 + Math.random() * 300;
    }

    const interval = setInterval(() => {
      const target = targetWeightRef.current;
      const current = weightRef.current;
      const diff = target - current;

      // Move toward target with noise
      const step = diff * 0.08 + (Math.random() - 0.5) * 3;
      const newWeight = Math.max(0, current + step);
      weightRef.current = newWeight;
      setCurrentWeight(newWeight);

      // Auto-weigh: detect when weight is steady
      if (autoWeigh && sessionActive && Math.abs(step) < autoWeighThreshold) {
        steadyCountRef.current += 1;
        if (steadyCountRef.current >= autoWeighSteady * 5) {
          // Steady for enough ticks
          setLockedWeight(Math.round(newWeight * 10) / 10);
          setWeightLocked(true);
          steadyCountRef.current = 0;
        }
      } else {
        steadyCountRef.current = 0;
      }
    }, 200);

    return () => clearInterval(interval);
  }, [weightLocked, autoWeigh, autoWeighThreshold, autoWeighSteady, sessionActive]);

  // Handle EID scan
  const handleScan = useCallback(() => {
    setScanning(true);
    setTimeout(() => {
      const eid = generateRandomEid();
      setScannedEid(eid);
      setEidInput(eid);

      const found = mockRecords.find(
        (r) => r.eid && r.eid.toLowerCase() === eid.toLowerCase()
      );
      if (found) {
        setMatchedRecord(found);
        setIsNewAnimal(false);
        setVisualTag(found.visual_tag);
      } else {
        setMatchedRecord(null);
        setIsNewAnimal(true);
        setVisualTag("");
      }
      setScanning(false);
    }, 800);
  }, []);

  // Handle manual EID entry
  const handleEidLookup = useCallback(() => {
    const trimmed = eidInput.trim();
    if (!trimmed) return;
    setScannedEid(trimmed);

    const found = mockRecords.find(
      (r) => r.eid && r.eid.toLowerCase() === trimmed.toLowerCase()
    );
    if (found) {
      setMatchedRecord(found);
      setIsNewAnimal(false);
      setVisualTag(found.visual_tag);
    } else {
      setMatchedRecord(null);
      setIsNewAnimal(true);
    }
  }, [eidInput]);

  // Lock/unlock weight
  const handleLockWeight = useCallback(() => {
    if (weightLocked) {
      setWeightLocked(false);
      // Generate new target for next animal
      targetWeightRef.current = 350 + Math.random() * 300;
      weightRef.current = currentWeight;
    } else {
      const w = Math.round(currentWeight * 10) / 10;
      setLockedWeight(w);
      setWeightLocked(true);
    }
  }, [weightLocked, currentWeight]);

  // Save record
  const handleSaveRecord = useCallback(() => {
    if (!scannedEid) return;

    const record: SessionRecord = {
      id: nextId,
      eid: scannedEid,
      vid: visualTag || (matchedRecord?.visual_tag ?? "NEW"),
      weight: weightLocked ? lockedWeight : null,
      medical:
        medicalBatch
          ? mockMedicalBatches.find((m) => m.id.toString() === medicalBatch)
              ?.batch_name ?? ""
          : "",
      notes,
      time: new Date(),
      isExisting: !!matchedRecord,
      animalRecord: matchedRecord,
    };

    setSessionRecords((prev) => [record, ...prev]);
    setNextId((n) => n + 1);

    // Reset form
    setScannedEid("");
    setEidInput("");
    setMatchedRecord(null);
    setIsNewAnimal(false);
    setVisualTag("");
    setMedicalBatch("");
    setNotes("");
    setWeightLocked(false);
    targetWeightRef.current = 350 + Math.random() * 300;
    weightRef.current = currentWeight;
    steadyCountRef.current = 0;
  }, [
    scannedEid,
    visualTag,
    matchedRecord,
    weightLocked,
    lockedWeight,
    medicalBatch,
    notes,
    nextId,
    currentWeight,
  ]);

  // Export CSV
  const handleExportCsv = useCallback(() => {
    const headers = ["#", "EID", "VID", "Weight (kg)", "Medical", "Notes", "Time"];
    const rows = sessionRecords.map((r, i) => [
      sessionRecords.length - i,
      r.eid,
      r.vid,
      r.weight?.toFixed(1) ?? "",
      r.medical,
      r.notes,
      formatTime(r.time),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sessionName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessionRecords, sessionName]);

  const displayWeight = weightLocked
    ? lockedWeight.toFixed(1)
    : currentWeight.toFixed(1);

  const showScales = displayMode === "eid_scales" || displayMode === "scales_only";
  const showEid = displayMode === "eid_scales" || displayMode === "eid_only";

  const paddockOptions = mockPaddocks.map((p) => ({
    value: p.id.toString(),
    label: p.name,
  }));

  const medicalOptions = [
    { value: "", label: "None" },
    ...mockMedicalBatches
      .filter((m) => m.status !== "completed")
      .map((m) => ({
        value: m.id.toString(),
        label: m.batch_name,
      })),
  ];

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Weight className="w-5 h-5 text-emerald-400" />
              </div>
              EID Scanner & WeighApp
            </h1>
            <p className="text-white/50 mt-1 ml-[52px]">
              Scan, weigh and record livestock data
            </p>
          </div>
        </div>
      </div>

      {/* Top Bar - Session Setup */}
      <div className="animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <GlassCard padding="sm">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Session fields */}
            <div className="flex flex-1 gap-3 flex-wrap">
              <div className="flex-1 min-w-[140px]">
                <GlassInput
                  placeholder="Session Name"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="!py-2 text-sm"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <GlassInput
                  placeholder="Mob / Lot"
                  value={mobLot}
                  onChange={(e) => setMobLot(e.target.value)}
                  className="!py-2 text-sm"
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <GlassSelect
                  options={paddockOptions}
                  value={paddockId}
                  onChange={(e) => setPaddockId(e.target.value)}
                  placeholder="Paddock"
                  className="!py-2 text-sm"
                />
              </div>
            </div>

            {/* Display mode tabs + session toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex rounded-xl overflow-hidden border border-white/10">
                {(
                  [
                    { key: "eid_scales", label: "EID + Scales" },
                    { key: "eid_only", label: "EID Only" },
                    { key: "scales_only", label: "Scales Only" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDisplayMode(tab.key)}
                    className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                      displayMode === tab.key
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-white/50 hover:text-white/70"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <GlassButton
                variant={sessionActive ? "danger" : "primary"}
                size="sm"
                icon={
                  sessionActive ? (
                    <Square className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )
                }
                onClick={() => setSessionActive(!sessionActive)}
              >
                {sessionActive ? "Stop" : "Start"}
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Content - Two Panels */}
      <div
        className="grid gap-4 animate-fade-in-up"
        style={{
          animationDelay: "100ms",
          gridTemplateColumns:
            showScales && showEid ? "1fr 1fr" : "1fr",
        }}
      >
        {/* LEFT PANEL - Scales & Weight */}
        {showScales && (
          <div className="space-y-4">
            <GlassCard>
              {/* Scale connection */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {scaleConnected ? (
                    <Wifi className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm font-medium text-white/80">
                    AGU9i Scale
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      scaleConnected
                        ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                        : "bg-white/30"
                    }`}
                  />
                </div>
                <GlassBadge variant={scaleConnected ? "success" : "default"}>
                  {scaleConnected ? "Connected" : "Disconnected"}
                </GlassBadge>
              </div>

              {/* Weight Display */}
              <div className="relative flex flex-col items-center py-6">
                {/* Pulsing background ring when not locked */}
                <div
                  className={`absolute inset-0 rounded-2xl transition-all duration-1000 ${
                    weightLocked
                      ? "bg-emerald-500/5"
                      : "bg-blue-500/5"
                  }`}
                />

                {/* Weight value */}
                <div className="relative z-10 flex items-baseline gap-2">
                  <span
                    className={`text-7xl font-black tabular-nums tracking-tight transition-all duration-300 ${
                      weightLocked
                        ? "text-emerald-400"
                        : "text-white"
                    }`}
                    style={{
                      textShadow: weightLocked
                        ? "0 0 30px rgba(52,211,153,0.3)"
                        : "0 0 20px rgba(255,255,255,0.1)",
                    }}
                  >
                    {displayWeight}
                  </span>
                  <span className="text-2xl font-semibold text-white/50">
                    kg
                  </span>
                </div>

                {/* Status text */}
                <p
                  className={`text-sm font-medium mt-2 ${
                    weightLocked ? "text-emerald-300" : "text-white/40"
                  }`}
                >
                  {weightLocked ? (
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Weight Locked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 animate-pulse" /> Reading...
                    </span>
                  )}
                </p>

                {/* Subtle pulsing indicator bar */}
                {!weightLocked && (
                  <div className="mt-3 w-32 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-400/60 animate-pulse"
                      style={{
                        width: `${Math.min(100, (currentWeight / 800) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Lock Button */}
              <div className="mt-4">
                <GlassButton
                  variant={weightLocked ? "default" : "primary"}
                  size="lg"
                  className={`w-full ${
                    weightLocked
                      ? "!bg-emerald-500/20 !border-emerald-400/30 hover:!bg-emerald-500/30"
                      : "!bg-emerald-600/40 !border-emerald-400/40 hover:!bg-emerald-600/60"
                  }`}
                  icon={
                    weightLocked ? (
                      <Unlock className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )
                  }
                  onClick={handleLockWeight}
                >
                  {weightLocked ? "UNLOCK" : "LOCK"}
                </GlassButton>
              </div>

              {/* Auto-weigh toggle */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <button
                    className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                    onClick={() => setAutoWeigh(!autoWeigh)}
                  >
                    {autoWeigh ? (
                      <ToggleRight className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-white/40" />
                    )}
                    Auto-weigh
                  </button>
                  <button
                    onClick={() => setShowAutoSettings(!showAutoSettings)}
                    className="text-white/40 hover:text-white/70 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                {showAutoSettings && (
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-white/50">
                    <div className="glass rounded-lg p-2">
                      <span className="block mb-1">Threshold</span>
                      <span className="text-white font-semibold">
                        {autoWeighThreshold} kg
                      </span>
                    </div>
                    <div className="glass rounded-lg p-2">
                      <span className="block mb-1">Steady Time</span>
                      <span className="text-white font-semibold">
                        {autoWeighSteady}s
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Session Stats */}
            <GlassCard padding="sm">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-xs text-white/40 mb-0.5">Records</p>
                  <p className="text-lg font-bold text-white">
                    {sessionStats.records}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-0.5">Avg</p>
                  <p className="text-lg font-bold text-white">
                    {sessionStats.avg}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-0.5">Min</p>
                  <p className="text-lg font-bold text-emerald-300">
                    {sessionStats.min}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-0.5">Max</p>
                  <p className="text-lg font-bold text-blue-300">
                    {sessionStats.max}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* RIGHT PANEL - EID Reader & Record */}
        {showEid && (
          <div className="space-y-4">
            {/* EID Reader */}
            <GlassCard>
              {/* Connection status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Radio
                    className={`w-4 h-4 ${
                      eidConnected ? "text-emerald-400" : "text-red-400"
                    }`}
                  />
                  <span className="text-sm font-medium text-white/80">
                    EID Reader
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      eidConnected
                        ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                        : "bg-white/30"
                    }`}
                  />
                </div>
                <GlassBadge variant={eidConnected ? "success" : "default"}>
                  {eidConnected ? "Connected" : "Disconnected"}
                </GlassBadge>
              </div>

              {/* EID input + scan */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <GlassInput
                    placeholder="EID number..."
                    value={eidInput}
                    onChange={(e) => {
                      setEidInput(e.target.value);
                      if (!e.target.value) {
                        setScannedEid("");
                        setMatchedRecord(null);
                        setIsNewAnimal(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEidLookup();
                    }}
                    className="!py-2.5 font-mono text-sm"
                  />
                </div>
                <GlassButton
                  variant="primary"
                  icon={<ScanLine className="w-4 h-4" />}
                  onClick={handleScan}
                  loading={scanning}
                  className="!bg-blue-600/40 !border-blue-400/40 hover:!bg-blue-600/60"
                >
                  Scan
                </GlassButton>
              </div>

              {/* Scanned EID display */}
              {scannedEid && (
                <div className="mt-3 font-mono text-xs text-white/50 bg-white/5 rounded-lg px-3 py-2 flex items-center gap-2">
                  <CircleDot className="w-3.5 h-3.5 text-blue-400" />
                  <span>EID: {scannedEid}</span>
                </div>
              )}

              {/* Animal match result */}
              {matchedRecord && (
                <div className="mt-4 animate-fade-in-up">
                  <GlassBadge variant="info" className="mb-3">
                    Existing record &mdash; new weight will be added
                  </GlassBadge>
                  <div className="flex items-start gap-3 mt-2">
                    <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {matchedRecord.profile_image ? (
                        <img
                          src={matchedRecord.profile_image}
                          alt={matchedRecord.visual_tag}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            (
                              e.target as HTMLImageElement
                            ).parentElement!.innerHTML =
                              '<div class="flex items-center justify-center w-full h-full"><svg class="w-7 h-7 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg></div>';
                          }}
                        />
                      ) : (
                        <Beef className="w-7 h-7 text-white/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-bold text-white">
                          {matchedRecord.visual_tag}
                        </span>
                        <GlassBadge variant="success">
                          {matchedRecord.sex}
                        </GlassBadge>
                        <GlassBadge
                          variant={
                            matchedRecord.condition === "Excellent"
                              ? "success"
                              : matchedRecord.condition === "Fair"
                                ? "warning"
                                : "default"
                          }
                        >
                          {matchedRecord.condition}
                        </GlassBadge>
                      </div>
                      <p className="text-sm text-white/50 mt-1">
                        {matchedRecord.breed} &middot;{" "}
                        {matchedRecord.weight_kg} kg (last)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isNewAnimal && scannedEid && !matchedRecord && (
                <div className="mt-4 animate-fade-in-up">
                  <GlassBadge variant="warning" className="mb-2">
                    <Plus className="w-3 h-3 mr-1" />
                    New Animal &mdash; will create record
                  </GlassBadge>
                </div>
              )}
            </GlassCard>

            {/* Record Form */}
            <GlassCard>
              <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Record Details
              </h3>

              <div className="space-y-3">
                <GlassInput
                  label="Visual Tag"
                  placeholder="e.g. AU-0162"
                  value={visualTag}
                  onChange={(e) => setVisualTag(e.target.value)}
                  className="!py-2 text-sm"
                />

                <GlassSelect
                  label="Medical Batch"
                  options={medicalOptions}
                  value={medicalBatch}
                  onChange={(e) => setMedicalBatch(e.target.value)}
                  className="!py-2 text-sm"
                />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-white/70">
                    Notes
                  </label>
                  <div className="relative">
                    <textarea
                      className="glass-input w-full min-h-[60px] resize-none text-sm !py-2 pr-10"
                      placeholder="Add notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <button className="absolute right-3 top-2.5 text-white/30 hover:text-white/60 transition-colors">
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Weight summary in EID panel */}
                {showScales && weightLocked && (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/20 rounded-xl px-3 py-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-300 font-semibold">
                      {lockedWeight.toFixed(1)} kg locked
                    </span>
                  </div>
                )}

                <GlassButton
                  variant="primary"
                  size="lg"
                  className="w-full !bg-emerald-600/40 !border-emerald-400/40 hover:!bg-emerald-600/60 mt-2"
                  icon={<Save className="w-5 h-5" />}
                  onClick={handleSaveRecord}
                  disabled={!scannedEid && !visualTag}
                >
                  Save Record
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Session History */}
      <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <button
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              onClick={() => setShowHistory(!showHistory)}
            >
              <Stethoscope className="w-4 h-4" />
              <h3 className="text-sm font-semibold">
                Session History ({sessionRecords.length})
              </h3>
              {showHistory ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <GlassButton
              size="sm"
              variant="ghost"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportCsv}
              disabled={sessionRecords.length === 0}
            >
              Export CSV
            </GlassButton>
          </div>

          {showHistory && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/40">
                    <th className="text-left py-2 px-2 font-medium">#</th>
                    <th className="text-left py-2 px-2 font-medium">EID</th>
                    <th className="text-left py-2 px-2 font-medium">VID</th>
                    <th className="text-right py-2 px-2 font-medium">
                      Weight
                    </th>
                    <th className="text-left py-2 px-2 font-medium">
                      Medical
                    </th>
                    <th className="text-right py-2 px-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionRecords.map((record, index) => (
                    <tr
                      key={record.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-2 px-2 text-white/40 font-mono">
                        {sessionRecords.length - index}
                      </td>
                      <td className="py-2 px-2 font-mono text-xs text-white/60">
                        ...{record.eid.slice(-6)}
                      </td>
                      <td className="py-2 px-2">
                        <span className="font-semibold text-white">
                          {record.vid}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        {record.weight !== null ? (
                          <span className="font-semibold text-emerald-300">
                            {record.weight.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-white/30">&mdash;</span>
                        )}
                      </td>
                      <td className="py-2 px-2">
                        {record.medical ? (
                          <GlassBadge variant="info" className="text-[10px]">
                            {record.medical.length > 20
                              ? record.medical.slice(0, 20) + "..."
                              : record.medical}
                          </GlassBadge>
                        ) : (
                          <span className="text-white/20">&mdash;</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right text-white/40 text-xs font-mono">
                        <span className="flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(record.time)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {sessionRecords.length === 0 && (
                <p className="text-center text-white/30 py-6 text-sm">
                  No records yet. Scan an EID and save to begin.
                </p>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
