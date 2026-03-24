"use client";

import { cn } from "@/lib/utils";
import { BullLogo } from "@/components/icons/BullLogo";
import {
  LayoutDashboard,
  Beef,
  Map,
  Stethoscope,
  MapPin,
  BarChart3,
  Bell,
  User,
  LogOut,
  Settings,
  Settings2,
  ChevronDown,
  LayoutGrid,
  Calendar,
  ScanLine,
  Package,
  DollarSign,
  CloudRain,
  CheckSquare,
  Building2,
  CloudSun,
  TrendingUp,
  Wallet,
  FlaskConical,
  Wheat,
  Wrench,
  Sparkles,
  RotateCw,
  X,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const primaryNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/records", label: "Livestock", icon: Beef },
  { href: "/medical", label: "Medical", icon: Stethoscope },
  { href: "/paddocks", label: "Paddocks", icon: MapPin },
  { href: "/maps", label: "Maps", icon: Map },
  { href: "/climate", label: "Climate", icon: CloudSun },
  { href: "/markets", label: "Markets", icon: TrendingUp },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/ai-advisor", label: "AI", icon: Sparkles },
  { href: "/scanner", label: "Scan", icon: ScanLine },
];

const megaMenuItems = [
  { href: "/calendar", label: "Calendar", icon: Calendar, description: "Events & schedule", color: "bg-blue-500/20 text-blue-300" },
  { href: "/supplies", label: "Supplies", icon: Package, description: "Feed & inventory", color: "bg-amber-500/20 text-amber-300" },
  { href: "/sales", label: "Sales", icon: DollarSign, description: "Livestock sales", color: "bg-green-500/20 text-green-300" },
  { href: "/rain-gauge", label: "Rain Gauge", icon: CloudRain, description: "Rainfall tracking", color: "bg-cyan-500/20 text-cyan-300" },
  { href: "/todo", label: "Todo List", icon: CheckSquare, description: "Tasks & reminders", color: "bg-purple-500/20 text-purple-300" },
  { href: "/chemicals", label: "Chemicals", icon: FlaskConical, description: "Chemical batches", color: "bg-violet-500/20 text-violet-300" },
  { href: "/feed", label: "Feed", icon: Wheat, description: "Feed management", color: "bg-yellow-500/20 text-yellow-300" },
  { href: "/machinery", label: "Machinery", icon: Wrench, description: "Equipment & services", color: "bg-teal-500/20 text-teal-300" },
  { href: "/paddocks/rotation", label: "Stock Rotation", icon: RotateCw, description: "AI grazing plans", color: "bg-emerald-500/20 text-emerald-300" },
  { href: "/farms", label: "Farms", icon: Building2, description: "Farm management", color: "bg-rose-500/20 text-rose-300" },
  { href: "/notifications", label: "Notifications", icon: Bell, description: "Alerts & updates", color: "bg-red-500/20 text-red-300" },
  { href: "/settings", label: "Settings", icon: Settings, description: "Preferences", color: "bg-slate-500/20 text-slate-300" },
];

export function TopNav() {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [brightness, setBrightness] = useState(100);
  const [customColor, setCustomColor] = useState("#000040");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [glassOpacity, setGlassOpacity] = useState(70);
  const profileRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Load theme and brightness from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("lsp-theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
    const savedBrightness = localStorage.getItem("lsp-brightness");
    if (savedBrightness) {
      const val = parseInt(savedBrightness);
      setBrightness(val);
      document.documentElement.style.filter = `brightness(${val / 100})`;
    }
    const savedColor = localStorage.getItem("lsp-custom-bg");
    if (savedColor) {
      setCustomColor(savedColor);
    }
    const savedOpacity = localStorage.getItem("lsp-glass-opacity");
    if (savedOpacity) {
      const val = parseInt(savedOpacity);
      setGlassOpacity(val);
      applyGlassOpacity(val);
    }
  }, []);

  const applyGlassOpacity = (val: number) => {
    const opacity = val / 100;
    document.documentElement.style.setProperty("--glass-bg", `rgba(0, 0, 40, ${opacity})`);
    document.documentElement.style.setProperty("--glass-bg-hover", `rgba(0, 0, 50, ${Math.min(opacity + 0.1, 1)})`);
    document.documentElement.style.setProperty("--glass-bg-active", `rgba(0, 0, 60, ${Math.min(opacity + 0.15, 1)})`);
  };

  const handleGlassOpacity = (val: number) => {
    setGlassOpacity(val);
    applyGlassOpacity(val);
    localStorage.setItem("lsp-glass-opacity", String(val));
  };

  const applyCustomColor = (color: string) => {
    setCustomColor(color);
    localStorage.setItem("lsp-custom-bg", color);
    document.documentElement.setAttribute("data-theme", "dark");
    setTheme("dark");
    localStorage.setItem("lsp-theme", "dark");
    document.documentElement.style.setProperty("--bg-custom", color);
    document.body.style.background = `linear-gradient(135deg, ${color} 0%, ${color}dd 50%, ${color}bb 100%)`;
  };

  const resetCustomColor = () => {
    localStorage.removeItem("lsp-custom-bg");
    document.body.style.background = "";
    document.documentElement.style.removeProperty("--bg-custom");
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("lsp-theme", next);
  };

  const handleBrightness = (val: number) => {
    setBrightness(val);
    document.documentElement.style.filter = `brightness(${val / 100})`;
    localStorage.setItem("lsp-brightness", String(val));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setMegaMenuOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setThemeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mega menu on navigation
  useEffect(() => {
    setMegaMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  return (
    <header className="hidden md:block fixed top-4 left-4 right-4 z-40" ref={megaMenuRef}>
      <nav className="glass-nav px-4 lg:px-6 py-3 flex items-center justify-between" role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <BullLogo size={47} />
        </Link>

        {/* Primary Nav Links */}
        <div className="flex items-center gap-0.5">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dashboard Customize — only on dashboard */}
          {pathname === "/" && (
            <button
              onClick={() => window.dispatchEvent(new Event("toggle-dashboard-edit"))}
              className="p-2 rounded-xl transition-colors hover:bg-white/10"
              aria-label="Customize dashboard"
            >
              <Settings2 className="w-5 h-5 text-white/70" />
            </button>
          )}

          {/* Theme & Brightness */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => { setThemeOpen(!themeOpen); setProfileOpen(false); setMegaMenuOpen(false); }}
              className={cn(
                "p-2 rounded-xl transition-colors",
                themeOpen ? "bg-white/20" : "hover:bg-white/10"
              )}
              aria-label="Display settings"
              title="Display settings"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-300/80" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-500/80" />
              )}
            </button>

            {themeOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-sm p-3 animate-fade-in-up z-50">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Display</p>

                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/10 transition-colors mb-2"
                >
                  <span className="text-sm text-white/80">
                    {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
                  </span>
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-amber-300" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400" />
                  )}
                </button>

                {/* Brightness slider */}
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/50">Brightness</span>
                    <span className="text-xs text-white/70 font-medium">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => handleBrightness(parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.3) ${((brightness - 50) / 100) * 100}%, rgba(255,255,255,0.1) ${((brightness - 50) / 100) * 100}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-white/30">Darker</span>
                    <button
                      onClick={() => handleBrightness(100)}
                      className="text-[10px] text-white/50 hover:text-white/80"
                    >
                      Reset
                    </button>
                    <span className="text-[10px] text-white/30">Lighter</span>
                  </div>
                </div>

                {/* Panel Opacity slider */}
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/50">Panel Opacity</span>
                    <span className="text-xs text-white/70 font-medium">{glassOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={glassOpacity}
                    onChange={(e) => handleGlassOpacity(parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.3) ${((glassOpacity - 20) / 80) * 100}%, rgba(255,255,255,0.1) ${((glassOpacity - 20) / 80) * 100}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-white/30">Glass</span>
                    <button
                      onClick={() => handleGlassOpacity(70)}
                      className="text-[10px] text-white/50 hover:text-white/80"
                    >
                      Reset
                    </button>
                    <span className="text-[10px] text-white/30">Solid</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 my-2" />

                {/* Custom Colour */}
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span className="text-sm text-white/80">Custom Background</span>
                  <div className="w-5 h-5 rounded-full border-2 border-white/30" style={{ backgroundColor: customColor }} />
                </button>

                {showColorPicker && (
                  <div className="px-3 py-2 space-y-2">
                    {/* Colour presets */}
                    <div className="flex gap-1.5 flex-wrap">
                      {[
                        { color: "#000040", label: "Navy" },
                        { color: "#1a1a2e", label: "Midnight" },
                        { color: "#0d1b2a", label: "Ocean" },
                        { color: "#1b2838", label: "Steam" },
                        { color: "#2d1b69", label: "Purple" },
                        { color: "#0a3622", label: "Forest" },
                        { color: "#3d0c02", label: "Wine" },
                        { color: "#1a1a1a", label: "Carbon" },
                      ].map((preset) => (
                        <button
                          key={preset.color}
                          onClick={() => applyCustomColor(preset.color)}
                          className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                          style={{
                            backgroundColor: preset.color,
                            borderColor: customColor === preset.color ? "white" : "rgba(255,255,255,0.2)",
                          }}
                          title={preset.label}
                        />
                      ))}
                    </div>

                    {/* Colour wheel + hex input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => applyCustomColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        title="Pick any colour"
                      />
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => {
                          const v = e.target.value;
                          setCustomColor(v);
                          if (/^#[0-9a-fA-F]{6}$/.test(v)) applyCustomColor(v);
                        }}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white/80 font-mono"
                        placeholder="#000040"
                      />
                    </div>

                    {/* Reset button */}
                    <button
                      onClick={() => { resetCustomColor(); setCustomColor("#000040"); }}
                      className="text-[10px] text-white/50 hover:text-white/80 w-full text-center py-1"
                    >
                      Reset to Default
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* More Mega Menu Toggle */}
          <button
            onClick={() => { setMegaMenuOpen(!megaMenuOpen); setProfileOpen(false); }}
            className={cn(
              "p-2 rounded-xl transition-colors",
              megaMenuOpen ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/70"
            )}
            aria-label="All modules"
            title="All modules"
          >
            {megaMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <LayoutGrid className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <Link
            href="/notifications"
            className={cn(
              "p-2 rounded-xl transition-colors relative",
              pathname === "/notifications" ? "bg-white/20" : "hover:bg-white/10"
            )}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-white/70" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
          </Link>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setProfileOpen(!profileOpen); setMegaMenuOpen(false); }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl transition-colors",
                profileOpen ? "bg-white/20" : "hover:bg-white/10"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-white/50 transition-transform duration-200",
                profileOpen && "rotate-180"
              )} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-sm p-2 animate-fade-in-up">
                <div className="px-3 py-2 mb-1 border-b border-white/10">
                  <p className="text-sm font-medium text-white">Demo User</p>
                  <p className="text-xs text-white/50">info@agrieid.com</p>
                </div>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                <Link
                  href="/farms"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <Building2 className="w-4 h-4" /> Farms
                </Link>
                <div className="border-t border-white/10 mt-1 pt-1">
                  <button
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-300/80 hover:bg-red-500/10 transition-colors w-full"
                    onClick={() => setProfileOpen(false)}
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mega Menu — slides down below nav */}
      {megaMenuOpen && (
        <div className="mt-2 px-4 lg:px-6 py-4 animate-fade-in-up rounded-2xl" style={{ background: "rgba(0, 0, 40, 0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
            {megaMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center text-center p-3 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-white/15 ring-1 ring-white/20"
                      : "hover:bg-white/10"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110",
                    item.color
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-white">{item.label}</span>
                  <span className="text-[10px] text-white/40 mt-0.5">{item.description}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
