"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassBadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variantStyles = {
  default: "bg-white/15 text-white/90",
  success: "bg-emerald-500/20 text-emerald-300 border-emerald-400/20",
  warning: "bg-amber-500/20 text-amber-300 border-amber-400/20",
  danger: "bg-red-500/20 text-red-300 border-red-400/20",
  info: "bg-blue-500/20 text-blue-300 border-blue-400/20",
};

export function GlassBadge({
  children,
  variant = "default",
  className,
}: GlassBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/10",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
