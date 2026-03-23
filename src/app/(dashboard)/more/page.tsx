"use client";

import { GlassCard } from "@/components/glass";
import { mockNotifications } from "@/lib/mock-data";
import {
  MapPin,
  Calendar,
  ScanLine,
  BarChart3,
  Bell,
  Settings,
  Package,
  DollarSign,
  CloudRain,
  CheckSquare,
  Building2,
} from "lucide-react";
import Link from "next/link";

interface MenuItem {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  color?: string;
}

export default function MorePage() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const menuItems: MenuItem[] = [
    {
      title: "Paddocks",
      description: "Manage paddocks & grazing",
      href: "/paddocks",
      icon: MapPin,
      color: "bg-emerald-500/20 text-emerald-300",
    },
    {
      title: "Calendar",
      description: "Events & schedule",
      href: "/calendar",
      icon: Calendar,
      color: "bg-blue-500/20 text-blue-300",
    },
    {
      title: "Supplies",
      description: "Feed, fencing & inventory",
      href: "/supplies",
      icon: Package,
      color: "bg-amber-500/20 text-amber-300",
    },
    {
      title: "Sales",
      description: "Livestock sales & buyers",
      href: "/sales",
      icon: DollarSign,
      color: "bg-green-500/20 text-green-300",
    },
    {
      title: "Rain Gauge",
      description: "Rainfall tracking",
      href: "/rain-gauge",
      icon: CloudRain,
      color: "bg-cyan-500/20 text-cyan-300",
    },
    {
      title: "Todo List",
      description: "Tasks & reminders",
      href: "/todo",
      icon: CheckSquare,
      color: "bg-purple-500/20 text-purple-300",
    },
    {
      title: "Scanner",
      description: "EID tag scanner",
      href: "/scanner",
      icon: ScanLine,
      color: "bg-orange-500/20 text-orange-300",
    },
    {
      title: "Reports",
      description: "Analytics & insights",
      href: "/reports",
      icon: BarChart3,
      color: "bg-indigo-500/20 text-indigo-300",
    },
    {
      title: "Farms",
      description: "Farm management",
      href: "/farms",
      icon: Building2,
      color: "bg-rose-500/20 text-rose-300",
    },
    {
      title: "Notifications",
      description: "Alerts & updates",
      href: "/notifications",
      icon: Bell,
      badge: unreadCount,
      color: "bg-red-500/20 text-red-300",
    },
    {
      title: "Settings",
      description: "Account & preferences",
      href: "/settings",
      icon: Settings,
      color: "bg-slate-500/20 text-slate-300",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">More</h1>
        <p className="text-white/50 mt-1">All tools and features</p>
      </div>

      {/* Quick Access Section */}
      <div className="animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <p className="text-xs uppercase tracking-wider text-white/30 font-semibold mb-3 px-1">
          Modules & Tools
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {menuItems.map((item, i) => (
            <div
              key={item.href}
              className="animate-fade-in-up"
              style={{ animationDelay: `${100 + i * 40}ms` }}
            >
              <Link href={item.href}>
                <GlassCard
                  hover
                  className="h-full flex flex-col items-center text-center py-5 px-3 relative"
                >
                  {/* Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute top-2.5 right-2.5 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}

                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 ${item.color || "bg-white/10 text-white/70"}`}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>

                  {/* Title */}
                  <p className="font-semibold text-white text-sm">
                    {item.title}
                  </p>

                  {/* Description */}
                  <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </GlassCard>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
