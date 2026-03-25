"use client";

import { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";
import { ProductTour } from "@/components/ProductTour";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <SideNav />
      <BottomNav />

      {/* Main content — full width since sidebar is hidden by default */}
      <main className="pt-6 md:pt-24 pb-28 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
        {children}
      </main>

      <ProductTour />
    </div>
  );
}
