"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Beef,
  Map,
  Stethoscope,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/records", label: "Livestock", icon: Beef },
  { href: "/maps", label: "Maps", icon: Map },
  { href: "/medical", label: "Medical", icon: Stethoscope },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

// These paths should highlight the "More" tab since they're accessed from it
const moreSubPaths = ["/paddocks", "/calendar", "/scanner", "/reports", "/notifications", "/settings", "/supplies", "/sales", "/rain-gauge", "/todo", "/farms", "/climate", "/markets", "/finance", "/chemicals", "/feed", "/machinery", "/ai-advisor", "/analytics", "/admin"];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-4 left-4 right-4 z-40 glass-nav px-2 py-2"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          let isActive = pathname === item.href ||
            (item.href !== "/" && item.href !== "/more" && pathname.startsWith(item.href));

          // Highlight "More" when on any sub-page
          if (item.href === "/more" && moreSubPaths.some(p => pathname.startsWith(p))) {
            isActive = true;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[60px]",
                isActive
                  ? "bg-white/20 text-white"
                  : "text-white/50 hover:text-white/80"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                {item.href === "/more" && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full" />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
