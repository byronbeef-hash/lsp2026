"use client";

import { cn } from "@/lib/utils";
import { CSSProperties, ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: "none" | "sm" | "md" | "lg";
  style?: CSSProperties;
}

const paddingMap = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function GlassCard({
  children,
  className,
  hover = false,
  onClick,
  padding = "md",
  style,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass",
        paddingMap[padding],
        hover && "cursor-pointer transition-all duration-200 hover:bg-white/[0.18] hover:-translate-y-0.5 hover:shadow-lg",
        className
      )}
      style={style}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      {children}
    </div>
  );
}
