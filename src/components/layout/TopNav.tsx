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
];

const moreMenuItems = [
  { href: "/calendar", label: "Calendar", icon: Calendar, description: "Events & schedule" },
  { href: "/supplies", label: "Supplies", icon: Package, description: "Feed & inventory" },
  { href: "/sales", label: "Sales", icon: DollarSign, description: "Livestock sales" },
  { href: "/rain-gauge", label: "Rain Gauge", icon: CloudRain, description: "Rainfall tracking" },
  { href: "/todo", label: "Todo List", icon: CheckSquare, description: "Tasks & reminders" },
  { href: "/chemicals", label: "Chemicals", icon: FlaskConical, description: "Chemical batches" },
  { href: "/feed", label: "Feed", icon: Wheat, description: "Feed management" },
  { href: "/machinery", label: "Machinery", icon: Wrench, description: "Equipment & services" },
  { href: "/ai-advisor", label: "AI Advisor", icon: Sparkles, description: "AI farm insights" },
  { href: "/farms", label: "Farms", icon: Building2, description: "Farm management" },
  { href: "/scanner", label: "EID Scanner", icon: ScanLine, description: "Scan tags" },
  { href: "/notifications", label: "Notifications", icon: Bell, description: "Alerts & updates" },
  { href: "/settings", label: "Settings", icon: Settings, description: "Preferences" },
];

export function TopNav() {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="hidden md:block fixed top-4 left-4 right-4 z-40">
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

          {/* More Menu Button */}
          <Link
            href="/more"
            className={cn(
              "p-2 rounded-xl transition-colors",
              pathname === "/more" ? "bg-white/20" : "hover:bg-white/10"
            )}
            aria-label="All modules"
            title="All modules"
          >
            <LayoutGrid className="w-5 h-5 text-white/70" />
          </Link>

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

          {/* Profile & More Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
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
              <div className="absolute right-0 mt-2 w-60 glass-sm p-2 animate-fade-in-up max-h-[70vh] overflow-y-auto">
                {/* User info */}
                <div className="px-3 py-2 mb-1 border-b border-white/10">
                  <p className="text-sm font-medium text-white">Tim Dickinson</p>
                  <p className="text-xs text-white/50">tim@livestock.com.au</p>
                </div>

                {/* More menu items */}
                <div className="py-1">
                  {moreMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-white/15 text-white"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                        onClick={() => setProfileOpen(false)}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <div className="min-w-0">
                          <span className="block">{item.label}</span>
                          <span className="block text-[10px] text-white/40">{item.description}</span>
                        </div>
                        {item.href === "/notifications" && (
                          <span className="ml-auto w-5 h-5 rounded-full bg-red-500/80 text-white text-[10px] flex items-center justify-center font-bold shrink-0">3</span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Divider + Sign out */}
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
    </header>
  );
}
