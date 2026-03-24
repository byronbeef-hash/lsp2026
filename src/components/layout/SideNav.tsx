"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Beef,
  Stethoscope,
  MapPin,
  Map,
  CloudSun,
  TrendingUp,
  Wallet,
  BarChart3,
  Sparkles,
  ScanLine,
  Calendar,
  Package,
  DollarSign,
  CloudRain,
  CheckSquare,
  FlaskConical,
  Wheat,
  Wrench,
  Building2,
  Bell,
  Settings,
  ChevronRight,
  RotateCw,
  Plus,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: { href: string; label: string }[];
}

const sideNavItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/records",
    label: "Livestock",
    icon: Beef,
    children: [
      { href: "/records", label: "All Records" },
      { href: "/records/new", label: "Add Record" },
    ],
  },
  {
    href: "/medical",
    label: "Medical",
    icon: Stethoscope,
    children: [
      { href: "/medical", label: "All Batches" },
      { href: "/medical/new", label: "New Treatment" },
      { href: "/chemicals", label: "Chemicals" },
    ],
  },
  {
    href: "/paddocks",
    label: "Paddocks",
    icon: MapPin,
    children: [
      { href: "/paddocks", label: "All Paddocks" },
      { href: "/paddocks/new", label: "Add Paddock" },
      { href: "/paddocks/rotation", label: "Stock Rotation" },
    ],
  },
  { href: "/maps", label: "Maps", icon: Map },
  {
    href: "/climate",
    label: "Climate",
    icon: CloudSun,
    children: [
      { href: "/climate", label: "Pasture AI" },
      { href: "/rain-gauge", label: "Rain Gauge" },
    ],
  },
  {
    href: "/markets",
    label: "Markets",
    icon: TrendingUp,
    children: [
      { href: "/markets", label: "MLA Prices" },
      { href: "/sales", label: "Sales" },
    ],
  },
  {
    href: "/finance",
    label: "Finance",
    icon: Wallet,
  },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/ai-advisor", label: "AI Advisor", icon: Sparkles },
  { href: "/scanner", label: "EID Scanner", icon: ScanLine },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  {
    href: "/supplies",
    label: "Supplies",
    icon: Package,
    children: [
      { href: "/supplies", label: "All Supplies" },
      { href: "/supplies/new", label: "Add Supply" },
      { href: "/feed", label: "Feed" },
    ],
  },
  { href: "/todo", label: "Todo List", icon: CheckSquare },
  { href: "/machinery", label: "Machinery", icon: Wrench },
  { href: "/farms", label: "Farms", icon: Building2 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SideNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Auto-expand active parent on mount
  useEffect(() => {
    sideNavItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
        if (isChildActive) {
          setExpandedItems((prev) => new Set([...prev, item.href]));
        }
      }
    });
  }, [pathname]);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  };

  const isItemActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    if (item.href !== "/" && pathname.startsWith(item.href + "/")) return true;
    if (item.children) {
      return item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
    }
    return false;
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col fixed left-4 top-[84px] bottom-4 z-30 glass-sm rounded-2xl transition-all duration-300 overflow-hidden",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center p-3 border-b border-white/10 hover:bg-white/10 transition-colors shrink-0"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <PanelLeftOpen className="w-4 h-4 text-white/60" />
        ) : (
          <PanelLeftClose className="w-4 h-4 text-white/60" />
        )}
      </button>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {sideNavItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);
          const expanded = expandedItems.has(item.href);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.href}>
              {/* Parent item */}
              <div className="flex items-center">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 py-2 rounded-lg text-sm transition-all duration-150 flex-1 min-w-0",
                    collapsed ? "justify-center px-2" : "px-3",
                    active
                      ? "bg-white/15 text-white font-medium"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", active && "text-white")} />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
                {hasChildren && !collapsed && (
                  <button
                    onClick={() => toggleExpand(item.href)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                  >
                    <ChevronRight
                      className={cn(
                        "w-3.5 h-3.5 text-white/40 transition-transform duration-200",
                        expanded && "rotate-90"
                      )}
                    />
                  </button>
                )}
              </div>

              {/* Children */}
              {hasChildren && expanded && !collapsed && (
                <div className="ml-6 pl-3 border-l border-white/10 space-y-0.5 mt-0.5 mb-1">
                  {item.children!.map((child) => {
                    const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block py-1.5 px-2.5 rounded-lg text-xs transition-colors",
                          childActive
                            ? "bg-white/10 text-white font-medium"
                            : "text-white/50 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
