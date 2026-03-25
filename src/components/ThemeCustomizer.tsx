"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Save, RotateCcw, Sun, Moon, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore, BUILTIN_PRESETS, applyThemeToDOM } from "@/stores/theme";

/* ─── Color swatch options ────────────────────────────── */

const PRIMARY_COLORS = [
  { value: "#000080", label: "Navy" },
  { value: "#1e3a8a", label: "Blue" },
  { value: "#0d9488", label: "Teal" },
  { value: "#15803d", label: "Green" },
  { value: "#7e22ce", label: "Purple" },
  { value: "#334155", label: "Slate" },
  { value: "#000000", label: "Black" },
];

const ACCENT_COLORS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Pink" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#10b981", label: "Emerald" },
  { value: "#ef4444", label: "Red" },
  { value: "#d97706", label: "Orange" },
];

const GRADIENT_COLORS = [
  { value: "#000040", label: "Navy Dark" },
  { value: "#000080", label: "Navy" },
  { value: "#0a0a0a", label: "Near Black" },
  { value: "#1a1a2e", label: "Midnight" },
  { value: "#0d1b2a", label: "Ocean" },
  { value: "#1b2838", label: "Storm" },
  { value: "#2d1b69", label: "Purple" },
  { value: "#0a3622", label: "Forest" },
  { value: "#f5f0e8", label: "Cream" },
  { value: "#e8e0d0", label: "Beige" },
  { value: "#f0f0f0", label: "Light" },
  { value: "#e2e8f0", label: "Slate" },
];

const CHART_COLORS = [
  { value: "#0000c8", label: "Blue" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#10b981", label: "Emerald" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#92400e", label: "Brown" },
  { value: "#ec4899", label: "Pink" },
];

/* ─── Sub-components ──────────────────────────────────── */

function ColorSwatches({
  colors,
  value,
  onChange,
}: {
  colors: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {colors.map((c) => (
        <button
          key={c.value}
          onClick={() => onChange(c.value)}
          className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 relative"
          style={{
            backgroundColor: c.value,
            borderColor: value === c.value ? "white" : "rgba(255,255,255,0.15)",
          }}
          title={c.label}
        >
          {value === c.value && (
            <Check className="w-3.5 h-3.5 absolute inset-0 m-auto text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
          )}
        </button>
      ))}
    </div>
  );
}

function SliderControl({
  label,
  value,
  min = 0,
  max = 100,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">{label}</span>
        <span className="text-xs text-white/70 font-medium tabular-nums">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.4) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
        }}
      />
    </div>
  );
}

/* ─── Main component ──────────────────────────────────── */

interface ThemeCustomizerProps {
  open: boolean;
  onClose: () => void;
}

export function ThemeCustomizer({ open, onClose }: ThemeCustomizerProps) {
  const { current, presets, activePresetId, updateSetting, savePreset, loadPreset, deletePreset, resetToDefault } =
    useThemeStore();

  const panelRef = useRef<HTMLDivElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");

  const builtinIds = new Set(BUILTIN_PRESETS.map((p) => p.id));
  const userPresetCount = presets.filter((p) => !builtinIds.has(p.id)).length;

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid catching the opening click
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 100);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, onClose]);

  const handleSavePreset = useCallback(() => {
    if (!presetName.trim()) return;
    savePreset(presetName.trim());
    setPresetName("");
    setSaveDialogOpen(false);
  }, [presetName, savePreset]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />

      {/* Slide-out panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 bottom-0 w-80 z-50 overflow-y-auto border-l animate-slide-in-right"
        style={{
          background: current.mode === "dark"
            ? "rgba(10, 10, 30, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          borderColor: current.mode === "dark"
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.1)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/10"
          style={{
            background: current.mode === "dark"
              ? "rgba(10, 10, 30, 0.98)"
              : "rgba(255, 255, 255, 0.98)",
          }}
        >
          <h2 className="text-sm font-semibold text-white/90">Theme Customizer</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-6">
          {/* ── Presets ────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Presets</h3>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => {
                const isActive = activePresetId === preset.id;
                const isBuiltin = builtinIds.has(preset.id);
                return (
                  <button
                    key={preset.id}
                    onClick={() => loadPreset(preset.id)}
                    className={cn(
                      "relative flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all text-xs",
                      isActive
                        ? "bg-white/15 ring-1 ring-white/30"
                        : "bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <div
                      className="w-5 h-5 rounded-md shrink-0 border border-white/20"
                      style={{
                        background: `linear-gradient(135deg, ${preset.bgGradientStart}, ${preset.bgGradientEnd})`,
                      }}
                    />
                    <span className="text-white/80 truncate">{preset.name}</span>
                    {!isBuiltin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                        className="absolute top-1 right-1 p-0.5 rounded hover:bg-red-500/20 transition-colors"
                        title="Delete preset"
                      >
                        <X className="w-3 h-3 text-white/30 hover:text-red-400" />
                      </button>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Save current */}
            {!saveDialogOpen ? (
              <button
                onClick={() => {
                  if (userPresetCount >= 5) return;
                  setSaveDialogOpen(true);
                }}
                disabled={userPresetCount >= 5}
                className={cn(
                  "mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                  userPresetCount >= 5
                    ? "bg-white/5 text-white/30 cursor-not-allowed"
                    : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                )}
              >
                <Save className="w-3.5 h-3.5" />
                {userPresetCount >= 5 ? "Max 5 presets" : "Save Current"}
              </button>
            ) : (
              <div className="mt-3 flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Preset name..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSavePreset();
                    if (e.key === "Escape") setSaveDialogOpen(false);
                  }}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white/90 outline-none focus:border-white/40 placeholder:text-white/30"
                />
                <button
                  onClick={handleSavePreset}
                  className="px-3 py-1.5 bg-white/15 hover:bg-white/20 rounded-lg text-xs text-white/80 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setSaveDialogOpen(false)}
                  className="px-2 py-1.5 hover:bg-white/10 rounded-lg text-xs text-white/50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </section>

          {/* ── Mode ───────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Mode</h3>
            <div className="flex gap-2">
              {(["dark", "light"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => updateSetting("mode", mode)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all",
                    current.mode === mode
                      ? "bg-white/15 ring-1 ring-white/30 text-white"
                      : "bg-white/5 text-white/50 hover:bg-white/10"
                  )}
                >
                  {mode === "dark" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  {mode === "dark" ? "Dark" : "Light"}
                </button>
              ))}
            </div>
          </section>

          {/* ── Primary Color ──────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Primary Color</h3>
            <ColorSwatches
              colors={PRIMARY_COLORS}
              value={current.primaryColor}
              onChange={(v) => updateSetting("primaryColor", v)}
            />
          </section>

          {/* ── Accent Color ──────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Accent Color</h3>
            <ColorSwatches
              colors={ACCENT_COLORS}
              value={current.accentColor}
              onChange={(v) => updateSetting("accentColor", v)}
            />
          </section>

          {/* ── Background Gradient ────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Background Gradient</h3>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-white/40 mb-1.5 block">Start</span>
                <ColorSwatches
                  colors={GRADIENT_COLORS}
                  value={current.bgGradientStart}
                  onChange={(v) => updateSetting("bgGradientStart", v)}
                />
              </div>
              <div>
                <span className="text-[10px] text-white/40 mb-1.5 block">End</span>
                <ColorSwatches
                  colors={GRADIENT_COLORS}
                  value={current.bgGradientEnd}
                  onChange={(v) => updateSetting("bgGradientEnd", v)}
                />
              </div>
              {/* Preview */}
              <div
                className="h-6 rounded-lg border border-white/10"
                style={{
                  background: `linear-gradient(135deg, ${current.bgGradientStart}, ${current.bgGradientEnd})`,
                }}
              />
            </div>
          </section>

          {/* ── Glass Opacity ──────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Opacity Controls</h3>
            <div className="space-y-4">
              <SliderControl
                label="Liquid Glass Blur"
                value={current.glassBlur}
                min={0}
                max={40}
                onChange={(v) => updateSetting("glassBlur", v)}
              />
              <SliderControl
                label="Glass / Card Opacity"
                value={current.glassOpacity}
                min={0}
                max={100}
                onChange={(v) => updateSetting("glassOpacity", v)}
              />
              <SliderControl
                label="Nav Bar Opacity"
                value={current.navOpacity}
                min={30}
                max={100}
                onChange={(v) => updateSetting("navOpacity", v)}
              />
              <SliderControl
                label="Sidebar Opacity"
                value={current.sidebarOpacity}
                min={20}
                max={100}
                onChange={(v) => updateSetting("sidebarOpacity", v)}
              />
            </div>
          </section>

          {/* ── Chart Bar Color ─────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Chart Bar Color</h3>
            <ColorSwatches
              colors={CHART_COLORS}
              value={current.chartBarColor}
              onChange={(v) => updateSetting("chartBarColor", v)}
            />
          </section>

          {/* ── Reset ──────────────────────────────────── */}
          <section className="pt-2 border-t border-white/10">
            <button
              onClick={resetToDefault}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium bg-white/5 text-white/50 hover:bg-red-500/10 hover:text-red-300 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Default
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
