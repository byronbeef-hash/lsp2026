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
  const [hexInput, setHexInput] = useState(value);
  // Sync hex input when value changes externally
  useEffect(() => { setHexInput(value); }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 flex-wrap items-center">
        {/* Native color picker circle */}
        <label className="relative w-7 h-7 rounded-full border-2 border-white/20 cursor-pointer overflow-hidden hover:scale-110 transition-all shrink-0" title="Pick any colour">
          <input
            type="color"
            value={value}
            onChange={(e) => { onChange(e.target.value); setHexInput(e.target.value); }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)` }} />
        </label>
        {/* Preset swatches */}
        {colors.map((c) => (
          <button
            key={c.value}
            onClick={() => { onChange(c.value); setHexInput(c.value); }}
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
      {/* Hex input field */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md border border-white/20 shrink-0" style={{ backgroundColor: value }} />
        <input
          type="text"
          value={hexInput}
          onChange={(e) => {
            const v = e.target.value;
            setHexInput(v);
            if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
          }}
          onBlur={() => { if (!/^#[0-9a-fA-F]{6}$/.test(hexInput)) setHexInput(value); }}
          placeholder="#000080"
          className="flex-1 bg-white/10 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-white/80 font-mono outline-none focus:border-white/30 placeholder:text-white/20 w-20"
        />
      </div>
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

/* ─── Master Brightness Slider ────────────────────────── */

function lerpColor(a: string, b: string, t: number): string {
  // Interpolate between two hex colors
  const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

// 5 color stops across the brightness range (0-100)
const BRIGHTNESS_STOPS = [
  { at: 0, bgStart: "#000020", bgEnd: "#000040", nav: "#000020", side: "#000020", mode: "dark" as const, glass: 12, blur: 22 },
  { at: 25, bgStart: "#000040", bgEnd: "#000080", nav: "#000040", side: "#000040", mode: "dark" as const, glass: 20, blur: 18 },
  { at: 50, bgStart: "#0a1628", bgEnd: "#1a3050", nav: "#0a1628", side: "#0a1628", mode: "dark" as const, glass: 30, blur: 16 },
  { at: 75, bgStart: "#e8dcc8", bgEnd: "#f0e4d0", nav: "#e8dcc8", side: "#ddd0bc", mode: "light" as const, glass: 45, blur: 14 },
  { at: 100, bgStart: "#f5f0e8", bgEnd: "#faf6f0", nav: "#f5f0e8", side: "#ede6d8", mode: "light" as const, glass: 55, blur: 12 },
];

function interpolateStops(v: number) {
  // Find the two stops we're between
  let lo = BRIGHTNESS_STOPS[0], hi = BRIGHTNESS_STOPS[BRIGHTNESS_STOPS.length - 1];
  for (let i = 0; i < BRIGHTNESS_STOPS.length - 1; i++) {
    if (v >= BRIGHTNESS_STOPS[i].at && v <= BRIGHTNESS_STOPS[i + 1].at) {
      lo = BRIGHTNESS_STOPS[i];
      hi = BRIGHTNESS_STOPS[i + 1];
      break;
    }
  }
  const range = hi.at - lo.at || 1;
  const t = (v - lo.at) / range;
  return {
    bgStart: lerpColor(lo.bgStart, hi.bgStart, t),
    bgEnd: lerpColor(lo.bgEnd, hi.bgEnd, t),
    nav: lerpColor(lo.nav, hi.nav, t),
    side: lerpColor(lo.side, hi.side, t),
    mode: v >= 62 ? "light" as const : "dark" as const,
    glass: Math.round(lo.glass + (hi.glass - lo.glass) * t),
    blur: Math.round(lo.blur + (hi.blur - lo.blur) * t),
  };
}

function MasterBrightnessSlider() {
  const { current, updateSetting } = useThemeStore();
  const [sliderValue, setSliderValue] = useState(() => {
    // Estimate current position from mode and glass opacity
    if (current.mode === "light") return Math.min(100, 70 + current.glassOpacity * 0.3);
    return Math.min(60, 10 + current.glassOpacity * 1.5);
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    setSliderValue(v);

    const s = interpolateStops(v);

    // Apply all interpolated values in one batch
    // We set them directly on the store which triggers applyThemeToDOM once via Zustand
    const store = useThemeStore.getState();
    const updated = {
      ...store.current,
      mode: s.mode,
      bgGradientStart: s.bgStart,
      bgGradientEnd: s.bgEnd,
      navColor: s.nav,
      sidebarColor: s.side,
      glassOpacity: s.glass,
      glassBlur: s.blur,
      navOpacity: Math.max(30, Math.min(90, s.glass + 15)),
      sidebarOpacity: Math.max(25, Math.min(85, s.glass + 10)),
      cardOpacity: Math.max(10, Math.min(80, s.glass - 5)),
      innerBubbleOpacity: Math.max(5, Math.min(60, s.glass - 10)),
      chartSectionOpacity: Math.max(10, Math.min(70, s.glass - 5)),
      megaMenuOpacity: Math.max(30, Math.min(90, s.glass + 10)),
    };
    // Update store state and apply to DOM in one go
    useThemeStore.setState({ current: updated, activePresetId: null });
    applyThemeToDOM(updated);
  }, []);

  return (
    <section>
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Master Brightness</h3>
      <p className="text-[10px] text-white/30 mb-3">Gradually shift the entire interface from dark to light</p>
      <div className="flex items-center gap-3">
        <Moon className="w-4 h-4 text-blue-300/50 shrink-0" />
        <div className="flex-1 relative">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={sliderValue}
            onChange={handleChange}
            className="master-slider w-full h-3 rounded-full appearance-none cursor-pointer relative z-10"
            style={{
              background: "transparent",
            }}
          />
          {/* Custom track behind the input */}
          <div
            className="absolute inset-0 h-3 rounded-full pointer-events-none border border-white/10"
            style={{
              background: `linear-gradient(to right,
                #000020 0%,
                #000050 15%,
                #000080 25%,
                #1a237e 35%,
                #3949ab 45%,
                #7986cb 55%,
                #c5b9a0 65%,
                #e0d4be 75%,
                #ede6d8 85%,
                #faf6f0 100%
              )`,
            }}
          />
        </div>
        <Sun className="w-4 h-4 text-amber-400/70 shrink-0" />
      </div>
      <div className="flex justify-between mt-1.5 px-7">
        <span className="text-[9px] text-white/25">Dark</span>
        <span className="text-[9px] text-white/25">Mid</span>
        <span className="text-[9px] text-white/25">Light</span>
      </div>
    </section>
  );
}

/* ─── Tint Slider (lighten while keeping primary hue) ──── */

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function TintSlider() {
  const { current } = useThemeStore();
  const [tintValue, setTintValue] = useState(0);

  const primaryColor = current.primaryColor || "#000080";
  const hsl = hexToHSL(primaryColor);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    setTintValue(v);

    const t = v / 100; // 0 = deepest, 1 = lightest tint

    // Shift hue slightly toward sky-blue (210°) as we lighten for a natural feel
    // This prevents navy (240°) from going purple/lavender at high lightness
    const hueShift = hsl.h > 220 ? (hsl.h - 210) * t * 0.6 : 0;
    const adjustedHue = hsl.h - hueShift;

    // Lightness scales from dark to very light
    const bgL = 5 + t * 87;     // 5% → 92% lightness
    // Saturation decreases more aggressively as we lighten (pastel, not vivid)
    const bgS = Math.max(12, hsl.s * (1 - t * 0.55));
    const navL = 8 + t * 82;
    const sideL = 7 + t * 80;

    const bgStart = hslToHex(adjustedHue, bgS, bgL);
    const bgEnd = hslToHex(adjustedHue, bgS, Math.min(bgL + 5, 95));
    const navCol = hslToHex(adjustedHue, bgS * 0.9, navL);
    const sideCol = hslToHex(adjustedHue, bgS * 0.85, sideL);

    // Switch mode based on lightness
    const isLight = bgL > 55;

    // Glass opacity scales smoothly
    const glassOp = Math.round(12 + t * 45);

    const store = useThemeStore.getState();
    const updated = {
      ...store.current,
      mode: isLight ? "light" as const : "dark" as const,
      bgGradientStart: bgStart,
      bgGradientEnd: bgEnd,
      navColor: navCol,
      sidebarColor: sideCol,
      glassOpacity: glassOp,
      glassBlur: Math.round(20 - t * 8),
      navOpacity: Math.max(50, Math.round(50 + t * 35)),
      sidebarOpacity: Math.max(40, Math.round(40 + t * 35)),
      cardOpacity: Math.round(10 + t * 42),
      innerBubbleOpacity: Math.round(8 + t * 25),
      chartSectionOpacity: Math.round(10 + t * 30),
      megaMenuOpacity: Math.round(35 + t * 35),
    };

    useThemeStore.setState({ current: updated, activePresetId: null });
    applyThemeToDOM(updated);
  }, [hsl.h, hsl.s]);

  // Build gradient track — shift hue toward sky blue as it lightens
  const shift = (t: number) => hsl.h > 220 ? hsl.h - (hsl.h - 210) * t * 0.6 : hsl.h;
  const s0 = hslToHex(shift(0), hsl.s, 5);
  const s1 = hslToHex(shift(0.15), hsl.s, 15);
  const s2 = hslToHex(shift(0.3), hsl.s * 0.9, 30);
  const s3 = hslToHex(shift(0.5), hsl.s * 0.75, 50);
  const s4 = hslToHex(shift(0.7), hsl.s * 0.5, 70);
  const s5 = hslToHex(shift(0.85), hsl.s * 0.35, 85);
  const s6 = hslToHex(shift(1), hsl.s * 0.2, 94);

  return (
    <section>
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Colour Tint</h3>
      <p className="text-[10px] text-white/30 mb-3">Lighten the interface while keeping your primary colour</p>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full shrink-0 border border-white/20" style={{ background: s1 }} />
        <div className="flex-1 relative">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={tintValue}
            onChange={handleChange}
            className="master-slider w-full h-3 rounded-full appearance-none cursor-pointer relative z-10"
            style={{ background: "transparent" }}
          />
          <div
            className="absolute inset-0 h-3 rounded-full pointer-events-none border border-white/10"
            style={{
              background: `linear-gradient(to right, ${s0} 0%, ${s1} 15%, ${s2} 30%, ${s3} 50%, ${s4} 70%, ${s5} 85%, ${s6} 100%)`,
            }}
          />
        </div>
        <div className="w-4 h-4 rounded-full shrink-0 border border-white/20" style={{ background: s5 }} />
      </div>
      <div className="flex justify-between mt-1.5 px-7">
        <span className="text-[9px] text-white/25">Deep</span>
        <span className="text-[9px] text-white/25">Primary</span>
        <span className="text-[9px] text-white/25">Pastel</span>
      </div>
    </section>
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

          {/* ── Master Brightness ──────────────────────── */}
          <MasterBrightnessSlider />
          <TintSlider />

          {/* ── Mode ───────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Mode</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Switch to Navy Dark preset for dark mode
                  if (current.mode !== "dark") loadPreset("builtin-navy-dark");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all",
                  current.mode === "dark"
                    ? "bg-white/15 ring-1 ring-white/30 text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                )}
              >
                <Moon className="w-3.5 h-3.5" />
                Dark
              </button>
              <button
                onClick={() => {
                  // Switch to Sand preset for light mode
                  if (current.mode !== "light") loadPreset("builtin-light-neutral");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all",
                  current.mode === "light"
                    ? "bg-white/15 ring-1 ring-white/30 text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                )}
              >
                <Sun className="w-3.5 h-3.5" />
                Light
              </button>
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

          {/* ── Background Fade ─────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Background Fade</h3>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {([
                { key: "none", label: "Flat" },
                { key: "subtle", label: "Subtle" },
                { key: "diagonal", label: "Diagonal" },
                { key: "radial", label: "Radial" },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => updateSetting("gradientMode", key)}
                  className={cn(
                    "py-1.5 rounded-lg text-[10px] font-medium transition-all",
                    (current.gradientMode || "subtle") === key
                      ? "bg-white/15 ring-1 ring-white/25 text-white"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* ── Glass Opacity ──────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Global</h3>
            <div className="space-y-3">
              <SliderControl
                label="Liquid Glass Blur"
                value={current.glassBlur}
                min={0}
                max={40}
                onChange={(v) => updateSetting("glassBlur", v)}
              />
              <SliderControl
                label="Default Glass Opacity"
                value={current.glassOpacity}
                min={0}
                max={100}
                onChange={(v) => updateSetting("glassOpacity", v)}
              />
            </div>

            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 mt-5">Per Section — Opacity & Color</h3>
            <div className="space-y-4">
              {/* Nav Bar */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-white/50 flex-1">Top Nav Bar</span>
                  <input type="color" value={current.navColor || current.bgGradientStart} onChange={(e) => updateSetting("navColor", e.target.value)} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" title="Nav color" />
                </div>
                <SliderControl label="" value={current.navOpacity} min={10} max={100} onChange={(v) => updateSetting("navOpacity", v)} />
              </div>

              {/* Mega Menu */}
              <div>
                <span className="text-xs text-white/50">Mega Menu</span>
                <SliderControl label="" value={current.megaMenuOpacity ?? 55} min={10} max={100} onChange={(v) => updateSetting("megaMenuOpacity", v)} />
              </div>

              {/* Side Menu */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-white/50 flex-1">Side Menu</span>
                  <input type="color" value={current.sidebarColor || current.bgGradientStart} onChange={(e) => updateSetting("sidebarColor", e.target.value)} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" title="Sidebar color" />
                </div>
                <SliderControl label="" value={current.sidebarOpacity} min={10} max={100} onChange={(v) => updateSetting("sidebarOpacity", v)} />
              </div>

              {/* Dashboard Cards */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-white/50 flex-1">Dashboard Cards</span>
                  <input type="color" value={current.cardColor || current.primaryColor} onChange={(e) => updateSetting("cardColor", e.target.value)} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" title="Card color" />
                </div>
                <SliderControl label="" value={current.cardOpacity ?? current.glassOpacity} min={0} max={100} onChange={(v) => updateSetting("cardOpacity", v)} />
              </div>

              {/* Inner Bubbles */}
              <div>
                <span className="text-xs text-white/50">Inner Bubbles</span>
                <SliderControl label="" value={current.innerBubbleOpacity ?? 20} min={0} max={100} onChange={(v) => updateSetting("innerBubbleOpacity", v)} />
              </div>

              {/* Chart Sections */}
              <div>
                <span className="text-xs text-white/50">Chart Sections</span>
                <SliderControl label="" value={current.chartSectionOpacity ?? 32} min={0} max={100} onChange={(v) => updateSetting("chartSectionOpacity", v)} />
              </div>

              {/* Background */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-white/50 flex-1">Page Background</span>
                  <input type="color" value={current.bgGradientStart} onChange={(e) => updateSetting("bgGradientStart", e.target.value)} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" title="BG start" />
                  <input type="color" value={current.bgGradientEnd} onChange={(e) => updateSetting("bgGradientEnd", e.target.value)} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" title="BG end" />
                </div>
              </div>
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
