import { create } from "zustand";

/* ─── Types ───────────────────────────────────────────── */

export interface ThemeSettings {
  id: string;
  name: string;
  mode: "dark" | "light";
  primaryColor: string;
  accentColor: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  glassOpacity: number; // 0-100
  navOpacity: number; // 0-100
  chartBarColor: string;
  sidebarOpacity: number; // 0-100
}

interface ThemeStore {
  current: ThemeSettings;
  presets: ThemeSettings[];
  activePresetId: string | null;

  updateSetting: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void;
  savePreset: (name: string) => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
  resetToDefault: () => void;
}

/* ─── Built-in presets ────────────────────────────────── */

const NAVY_DARK: ThemeSettings = {
  id: "builtin-navy-dark",
  name: "Navy Dark",
  mode: "dark",
  primaryColor: "#000080",
  accentColor: "#3b82f6",
  bgGradientStart: "#000040",
  bgGradientEnd: "#000080",
  glassOpacity: 15,
  navOpacity: 85,
  chartBarColor: "#0000c8",
  sidebarOpacity: 70,
};

const LIGHT_NEUTRAL: ThemeSettings = {
  id: "builtin-light-neutral",
  name: "Light Neutral",
  mode: "light",
  primaryColor: "#92400e",
  accentColor: "#d97706",
  bgGradientStart: "#f5f0e8",
  bgGradientEnd: "#e8e0d0",
  glassOpacity: 8,
  navOpacity: 92,
  chartBarColor: "#92400e",
  sidebarOpacity: 88,
};

const ORIGINAL_BLUE: ThemeSettings = {
  id: "builtin-original-blue",
  name: "Original Blue",
  mode: "dark",
  primaryColor: "#1a0aaf",
  accentColor: "#4f46e5",
  bgGradientStart: "#0c0060",
  bgGradientEnd: "#1a10c0",
  glassOpacity: 20,
  navOpacity: 80,
  chartBarColor: "#4f46e5",
  sidebarOpacity: 65,
};

const MIDNIGHT: ThemeSettings = {
  id: "builtin-midnight",
  name: "Midnight",
  mode: "dark",
  primaryColor: "#1e293b",
  accentColor: "#6366f1",
  bgGradientStart: "#0a0a0a",
  bgGradientEnd: "#1a1a2e",
  glassOpacity: 40,
  navOpacity: 92,
  chartBarColor: "#6366f1",
  sidebarOpacity: 85,
};

export const BUILTIN_PRESETS: ThemeSettings[] = [NAVY_DARK, ORIGINAL_BLUE, LIGHT_NEUTRAL, MIDNIGHT];
const BUILTIN_IDS = new Set(BUILTIN_PRESETS.map((p) => p.id));
const MAX_USER_PRESETS = 5;

/* ─── Helpers ─────────────────────────────────────────── */

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/** Push current theme settings into CSS custom properties + data-theme */
export function applyThemeToDOM(s: ThemeSettings) {
  const root = document.documentElement;

  // Mode
  root.setAttribute("data-theme", s.mode);

  // Primary color channels
  const pc = hexToRgb(s.primaryColor);
  const ac = hexToRgb(s.accentColor);
  const gs = hexToRgb(s.bgGradientStart);
  const ge = hexToRgb(s.bgGradientEnd);
  const cb = hexToRgb(s.chartBarColor);

  root.style.setProperty("--theme-primary", s.primaryColor);
  root.style.setProperty("--theme-primary-rgb", `${pc.r},${pc.g},${pc.b}`);
  root.style.setProperty("--theme-accent", s.accentColor);
  root.style.setProperty("--theme-accent-rgb", `${ac.r},${ac.g},${ac.b}`);

  // Gradient
  root.style.setProperty("--theme-bg-start", s.bgGradientStart);
  root.style.setProperty("--theme-bg-end", s.bgGradientEnd);

  if (s.mode === "dark") {
    document.body.style.background = `linear-gradient(135deg, ${s.bgGradientStart} 0%, ${s.bgGradientEnd} 100%)`;

    // Glass on dark: use primary tint
    const glassA = s.glassOpacity / 100;
    root.style.setProperty("--glass-bg", `rgba(${pc.r},${pc.g},${Math.min(pc.b + 40, 255)},${glassA})`);
    root.style.setProperty("--glass-bg-hover", `rgba(${pc.r},${pc.g},${Math.min(pc.b + 50, 255)},${Math.min(glassA + 0.1, 1)})`);
    root.style.setProperty("--glass-bg-active", `rgba(${pc.r},${pc.g},${Math.min(pc.b + 60, 255)},${Math.min(glassA + 0.15, 1)})`);

    // Nav
    const navA = s.navOpacity / 100;
    root.style.setProperty("--theme-nav-bg", `rgba(${gs.r},${gs.g},${gs.b},${navA})`);

    // Sidebar
    const sideA = s.sidebarOpacity / 100;
    root.style.setProperty("--theme-sidebar-bg", `rgba(${gs.r},${gs.g},${gs.b},${sideA})`);
  } else {
    // Light mode
    document.body.style.background = `linear-gradient(135deg, ${s.bgGradientStart} 0%, ${s.bgGradientEnd} 100%)`;

    const glassA = s.glassOpacity / 100;
    root.style.setProperty("--glass-bg", `rgba(0,0,0,${glassA})`);
    root.style.setProperty("--glass-bg-hover", `rgba(0,0,0,${Math.min(glassA + 0.03, 1)})`);
    root.style.setProperty("--glass-bg-active", `rgba(0,0,0,${Math.min(glassA + 0.07, 1)})`);

    const navA = s.navOpacity / 100;
    root.style.setProperty("--theme-nav-bg", `rgba(255,255,255,${navA})`);

    const sideA = s.sidebarOpacity / 100;
    root.style.setProperty("--theme-sidebar-bg", `rgba(255,255,255,${sideA})`);
  }

  // Chart bar
  root.style.setProperty("--theme-chart-bar", s.chartBarColor);
  root.style.setProperty("--theme-chart-bar-rgb", `${cb.r},${cb.g},${cb.b}`);
  root.style.setProperty("--chart-bar-fill", `rgba(${cb.r},${cb.g},${cb.b},0.6)`);
}

/* ─── Persist helpers ─────────────────────────────────── */

const STORAGE_KEY = "lsp-theme-store";

function loadFromStorage(): { current?: ThemeSettings; presets?: ThemeSettings[]; activePresetId?: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveToStorage(state: { current: ThemeSettings; presets: ThemeSettings[]; activePresetId: string | null }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      current: state.current,
      presets: state.presets.filter((p) => !BUILTIN_IDS.has(p.id)), // only save user presets
      activePresetId: state.activePresetId,
    }));
  } catch { /* ignore */ }
}

/* ─── Initial state ───────────────────────────────────── */

function getInitialState() {
  const stored = loadFromStorage();
  const userPresets = (stored.presets ?? []).filter((p) => !BUILTIN_IDS.has(p.id));
  return {
    current: stored.current ?? { ...NAVY_DARK },
    presets: [...BUILTIN_PRESETS, ...userPresets],
    activePresetId: stored.activePresetId ?? NAVY_DARK.id,
  };
}

/* ─── Store ───────────────────────────────────────────── */

export const useThemeStore = create<ThemeStore>((set, get) => ({
  ...getInitialState(),

  updateSetting: (key, value) => {
    set((state) => {
      const next = { ...state.current, [key]: value };
      const newState = { current: next, presets: state.presets, activePresetId: null };
      saveToStorage(newState);
      if (typeof window !== "undefined") applyThemeToDOM(next);
      return newState;
    });
  },

  savePreset: (name: string) => {
    set((state) => {
      const userPresets = state.presets.filter((p) => !BUILTIN_IDS.has(p.id));
      if (userPresets.length >= MAX_USER_PRESETS) return state; // limit reached

      const id = `user-${Date.now()}`;
      const preset: ThemeSettings = { ...state.current, id, name };
      const newPresets = [...state.presets, preset];
      const newState = { current: { ...preset }, presets: newPresets, activePresetId: id };
      saveToStorage(newState);
      return newState;
    });
  },

  loadPreset: (id: string) => {
    set((state) => {
      const preset = state.presets.find((p) => p.id === id);
      if (!preset) return state;
      const next = { ...preset };
      if (typeof window !== "undefined") applyThemeToDOM(next);
      const newState = { current: next, presets: state.presets, activePresetId: id };
      saveToStorage(newState);
      return newState;
    });
  },

  deletePreset: (id: string) => {
    if (BUILTIN_IDS.has(id)) return; // cannot delete built-in
    set((state) => {
      const newPresets = state.presets.filter((p) => p.id !== id);
      const activePresetId = state.activePresetId === id ? null : state.activePresetId;
      const newState = { current: state.current, presets: newPresets, activePresetId };
      saveToStorage(newState);
      return newState;
    });
  },

  resetToDefault: () => {
    const userPresets = get().presets.filter((p) => !BUILTIN_IDS.has(p.id));
    const def = { ...NAVY_DARK };
    if (typeof window !== "undefined") applyThemeToDOM(def);
    const newState = { current: def, presets: [...BUILTIN_PRESETS, ...userPresets], activePresetId: NAVY_DARK.id };
    saveToStorage(newState);
    set(newState);
  },
}));
