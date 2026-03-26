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
  // Global glass defaults
  glassOpacity: number; // 0-100
  glassBlur: number; // 0-40 (px) — liquid glass feel
  chartBarColor: string;
  // Per-section controls
  navOpacity: number; // 0-100
  navColor: string; // hex color for nav tint
  megaMenuOpacity: number; // 0-100
  sidebarOpacity: number; // 0-100
  sidebarColor: string; // hex color for sidebar tint
  cardOpacity: number; // 0-100 — dashboard stat cards
  cardColor: string; // hex color for card tint
  innerBubbleOpacity: number; // 0-100 — inner items (herd breakdown, sub-cards)
  chartSectionOpacity: number; // 0-100 — chart/graph sections
  gradientMode?: "none" | "subtle" | "diagonal" | "radial"; // background gradient style
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
  primaryColor: "#1a20a0",
  accentColor: "#4f8cff",
  bgGradientStart: "#0a0a5c",
  bgGradientEnd: "#2a50c8",
  glassOpacity: 28,
  glassBlur: 24,
  chartBarColor: "#4f8cff",
  navOpacity: 70,
  navColor: "#0a0a5c",
  megaMenuOpacity: 55,
  sidebarOpacity: 50,
  sidebarColor: "#0a0a5c",
  cardOpacity: 28,
  cardColor: "#1e2878",
  innerBubbleOpacity: 20,
  chartSectionOpacity: 32,
};

const LIGHT_NEUTRAL: ThemeSettings = {
  id: "builtin-light-neutral",
  name: "Sand",
  mode: "light",
  primaryColor: "#8b7355",
  accentColor: "#c4956a",
  bgGradientStart: "#f2e8d8",
  bgGradientEnd: "#e8d8c4",
  glassOpacity: 50,
  glassBlur: 18,
  chartBarColor: "#b08860",
  navOpacity: 65,
  navColor: "#f0e6d4",
  megaMenuOpacity: 60,
  sidebarOpacity: 55,
  sidebarColor: "#ece0d0",
  cardOpacity: 45,
  cardColor: "#faf4ea",
  innerBubbleOpacity: 30,
  chartSectionOpacity: 40,
};

const ORIGINAL_BLUE: ThemeSettings = {
  id: "builtin-original-blue",
  name: "Original Blue",
  mode: "dark",
  primaryColor: "#2030b0",
  accentColor: "#5a90ff",
  bgGradientStart: "#101080",
  bgGradientEnd: "#3060d0",
  glassOpacity: 25,
  glassBlur: 28,
  chartBarColor: "#5a90ff",
  navOpacity: 65,
  navColor: "#101080",
  megaMenuOpacity: 50,
  sidebarOpacity: 45,
  sidebarColor: "#101080",
  cardOpacity: 25,
  cardColor: "#2038a0",
  innerBubbleOpacity: 18,
  chartSectionOpacity: 30,
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
  glassBlur: 24,
  chartBarColor: "#6366f1",
  navOpacity: 92,
  navColor: "#0a0a0a",
  megaMenuOpacity: 80,
  sidebarOpacity: 85,
  sidebarColor: "#0a0a0a",
  cardOpacity: 40,
  cardColor: "#1a1a2e",
  innerBubbleOpacity: 30,
  chartSectionOpacity: 45,
};

const BEACH: ThemeSettings = {
  id: "builtin-beach",
  name: "Beach",
  mode: "light",
  primaryColor: "#3a7ca5",
  accentColor: "#5ba4c9",
  bgGradientStart: "#d4e8f0",
  bgGradientEnd: "#f0e4d0",
  glassOpacity: 40,
  glassBlur: 20,
  chartBarColor: "#5ba4c9",
  navOpacity: 60,
  navColor: "#dceef5",
  megaMenuOpacity: 55,
  sidebarOpacity: 50,
  sidebarColor: "#e0eff5",
  cardOpacity: 40,
  cardColor: "#f0f7fa",
  innerBubbleOpacity: 25,
  chartSectionOpacity: 35,
};

const SUNSET: ThemeSettings = {
  id: "builtin-sunset",
  name: "Sunset",
  mode: "light",
  primaryColor: "#b05a3a",
  accentColor: "#d4845c",
  bgGradientStart: "#f5d5c8",
  bgGradientEnd: "#e8c8e0",
  glassOpacity: 38,
  glassBlur: 22,
  chartBarColor: "#d4845c",
  navOpacity: 55,
  navColor: "#f8ddd0",
  megaMenuOpacity: 50,
  sidebarOpacity: 48,
  sidebarColor: "#f0d0c8",
  cardOpacity: 38,
  cardColor: "#faf0ec",
  innerBubbleOpacity: 22,
  chartSectionOpacity: 32,
};

const OCEAN: ThemeSettings = {
  id: "builtin-ocean",
  name: "Ocean",
  mode: "dark",
  primaryColor: "#0a2e5c",
  accentColor: "#5bb8f0",
  bgGradientStart: "#b8d8f0",
  bgGradientEnd: "#d0e8f8",
  glassOpacity: 35,
  glassBlur: 20,
  chartBarColor: "#4a9ed6",
  navOpacity: 80,
  navColor: "#0a2450",
  megaMenuOpacity: 75,
  sidebarOpacity: 70,
  sidebarColor: "#0c2a58",
  cardOpacity: 35,
  cardColor: "#c0ddf0",
  innerBubbleOpacity: 25,
  chartSectionOpacity: 30,
};

export const BUILTIN_PRESETS: ThemeSettings[] = [NAVY_DARK, ORIGINAL_BLUE, OCEAN, LIGHT_NEUTRAL, BEACH, SUNSET, MIDNIGHT];
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
    // Rich 4-stop gradient for depth (interpolate a mid-point between start and end)
    const midR = Math.round((gs.r + ge.r) / 2);
    const midG = Math.round((gs.g + ge.g) / 2);
    const midB = Math.round((gs.b + ge.b) / 2);
    const midHex = `#${midR.toString(16).padStart(2,"0")}${midG.toString(16).padStart(2,"0")}${midB.toString(16).padStart(2,"0")}`;
    const gm = s.gradientMode || "subtle";
    if (gm === "none") {
      document.body.style.background = s.bgGradientStart;
    } else if (gm === "subtle") {
      document.body.style.background = `linear-gradient(180deg, ${s.bgGradientStart} 0%, ${midHex} 60%, ${s.bgGradientEnd} 100%)`;
    } else if (gm === "diagonal") {
      document.body.style.background = `linear-gradient(135deg, ${s.bgGradientStart} 0%, ${midHex} 50%, ${s.bgGradientEnd} 100%)`;
    } else if (gm === "radial") {
      document.body.style.background = `radial-gradient(ellipse at 30% 20%, ${s.bgGradientEnd} 0%, ${midHex} 40%, ${s.bgGradientStart} 100%)`;
    }

    // Glass on dark: light translucent liquid glass cards
    const glassA = s.glassOpacity / 100;
    // Lighter blue-white tint for frosted glass feel
    const cardR = Math.min(gs.r + 25, 60);
    const cardG = Math.min(gs.g + 30, 70);
    const cardB = Math.min(gs.b + 60, 200);
    root.style.setProperty("--glass-bg", `rgba(${cardR},${cardG},${cardB},${glassA})`);
    root.style.setProperty("--glass-bg-hover", `rgba(${cardR + 5},${cardG + 5},${Math.min(cardB + 15, 220)},${Math.min(glassA + 0.06, 1)})`);
    root.style.setProperty("--glass-bg-active", `rgba(${cardR + 10},${cardG + 10},${Math.min(cardB + 25, 230)},${Math.min(glassA + 0.1, 1)})`);
    root.style.setProperty("--glass-border", `rgba(255, 255, 255, ${0.08 + glassA * 0.12})`);
    root.style.setProperty("--glass-highlight", `inset 0 1px 0 rgba(255, 255, 255, ${0.12 + glassA * 0.15}), inset 0 -1px 0 rgba(0, 0, 0, ${0.05 + glassA * 0.05}), inset 0 0 30px rgba(120, 140, 255, ${0.04 + glassA * 0.04})`);
    root.style.setProperty("--glass-shadow", `0 4px 24px rgba(0, 0, 0, ${0.06 + glassA * 0.06})`);
    root.style.setProperty("--glass-blur", `${s.glassBlur}px`);
    root.style.setProperty("--glass-blur-heavy", `${Math.round(s.glassBlur * 2.5)}px`);

    // Per-section controls
    const nc = hexToRgb(s.navColor || s.bgGradientStart);
    const navA = s.navOpacity / 100;
    root.style.setProperty("--theme-nav-bg", `rgba(${nc.r},${nc.g},${nc.b},${navA})`);

    const sc = hexToRgb(s.sidebarColor || s.bgGradientStart);
    const sideA = s.sidebarOpacity / 100;
    root.style.setProperty("--theme-sidebar-bg", `rgba(${sc.r},${sc.g},${sc.b},${sideA})`);

    // Mega menu
    const megaA = (s.megaMenuOpacity ?? 55) / 100;
    root.style.setProperty("--theme-mega-menu-bg", `rgba(${cardR},${cardG},${cardB},${megaA})`);

    // Card-specific opacity (for stat cards on dashboard)
    const ccc = hexToRgb(s.cardColor || s.primaryColor);
    const cardA = (s.cardOpacity ?? s.glassOpacity) / 100;
    root.style.setProperty("--theme-card-bg", `rgba(${ccc.r},${ccc.g},${ccc.b},${cardA})`);

    // Inner bubble opacity (sub-items inside cards)
    const bubbleA = (s.innerBubbleOpacity ?? 20) / 100;
    root.style.setProperty("--theme-bubble-bg", `rgba(255,255,255,${bubbleA * 0.5})`);

    // Chart section opacity
    const chartA = (s.chartSectionOpacity ?? 32) / 100;
    root.style.setProperty("--theme-chart-section-bg", `rgba(${cardR},${cardG},${cardB},${chartA})`);
  } else {
    // Light mode — gradient background with frosted glass cards
    const midR = Math.round((gs.r + ge.r) / 2);
    const midG = Math.round((gs.g + ge.g) / 2);
    const midB = Math.round((gs.b + ge.b) / 2);
    const midHex = `#${midR.toString(16).padStart(2,"0")}${midG.toString(16).padStart(2,"0")}${midB.toString(16).padStart(2,"0")}`;
    const gm = s.gradientMode || "subtle";
    if (gm === "none") {
      document.body.style.background = s.bgGradientStart;
    } else if (gm === "subtle") {
      document.body.style.background = `linear-gradient(180deg, ${s.bgGradientStart} 0%, ${midHex} 60%, ${s.bgGradientEnd} 100%)`;
    } else if (gm === "diagonal") {
      document.body.style.background = `linear-gradient(135deg, ${s.bgGradientStart} 0%, ${midHex} 50%, ${s.bgGradientEnd} 100%)`;
    } else if (gm === "radial") {
      document.body.style.background = `radial-gradient(ellipse at 30% 20%, ${s.bgGradientEnd} 0%, ${midHex} 40%, ${s.bgGradientStart} 100%)`;
    }

    // Glass cards: use white with alpha = opacity slider value
    // Higher opacity = more solid frosted white, lower = more background visible
    const glassA = s.glassOpacity / 100;
    root.style.setProperty("--glass-bg", `rgba(255,255,255,${glassA})`);
    root.style.setProperty("--glass-bg-hover", `rgba(255,255,255,${Math.min(glassA + 0.05, 1)})`);
    root.style.setProperty("--glass-bg-active", `rgba(255,255,255,${Math.min(glassA + 0.08, 1)})`);
    root.style.setProperty("--glass-border", `rgba(0,0,0,${0.06 + glassA * 0.06})`);
    root.style.setProperty("--glass-highlight", `inset 0 1px 0 rgba(255,255,255,${0.4 + glassA * 0.3}), inset 0 -1px 0 rgba(0,0,0,${0.03 + glassA * 0.02})`);
    root.style.setProperty("--glass-shadow", `0 4px 20px rgba(0,0,0,${0.04 + glassA * 0.04})`);
    root.style.setProperty("--glass-blur", `${s.glassBlur}px`);
    root.style.setProperty("--glass-blur-heavy", `${Math.round(s.glassBlur * 2.5)}px`);

    // Nav — use navColor with navOpacity alpha
    const nc = hexToRgb(s.navColor || "#f5f0e8");
    const navA = s.navOpacity / 100;
    root.style.setProperty("--theme-nav-bg", `rgba(${nc.r},${nc.g},${nc.b},${navA})`);

    // Sidebar
    const sc = hexToRgb(s.sidebarColor || "#f5f0e8");
    const sideA = s.sidebarOpacity / 100;
    root.style.setProperty("--theme-sidebar-bg", `rgba(${sc.r},${sc.g},${sc.b},${sideA})`);

    // Mega menu — frosted white
    const megaA = (s.megaMenuOpacity ?? 60) / 100;
    root.style.setProperty("--theme-mega-menu-bg", `rgba(255,255,255,${megaA})`);

    // Dashboard cards — white with card opacity
    const cardA = (s.cardOpacity ?? 45) / 100;
    root.style.setProperty("--theme-card-bg", `rgba(255,255,255,${cardA})`);

    // Inner bubbles — subtle dark tint for contrast
    const bubbleA = (s.innerBubbleOpacity ?? 25) / 100;
    root.style.setProperty("--theme-bubble-bg", `rgba(0,0,0,${bubbleA * 0.08})`);

    // Chart sections — white frost
    const chartA = (s.chartSectionOpacity ?? 35) / 100;
    root.style.setProperty("--theme-chart-section-bg", `rgba(255,255,255,${chartA})`);
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
    // Ensure all fields are present before saving
    const currentWithDefaults = { ...NAVY_DARK, ...state.current };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      current: currentWithDefaults,
      presets: state.presets.filter((p) => !BUILTIN_IDS.has(p.id)), // only save user presets
      activePresetId: state.activePresetId,
    }));
  } catch { /* ignore */ }
}

/* ─── Initial state ───────────────────────────────────── */

function getInitialState() {
  const stored = loadFromStorage();
  const userPresets = (stored.presets ?? []).filter((p) => !BUILTIN_IDS.has(p.id));
  // Merge stored current with defaults to ensure new fields are present
  const current = stored.current ? { ...NAVY_DARK, ...stored.current } : { ...NAVY_DARK };
  return {
    current,
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
