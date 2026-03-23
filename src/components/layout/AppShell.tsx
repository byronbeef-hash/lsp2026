"use client";

import { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { MlaTicker } from "../MlaTicker";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      {/* Fixed top nav */}
      <TopNav />

      {/* MLA Ticker — sits below the nav bar */}
      <div className="hidden md:block fixed top-[64px] left-0 right-0 z-40">
        <MlaTicker />
      </div>

      {/* Bottom nav for mobile */}
      <BottomNav />

      {/* Main content area — extra top padding to account for ticker */}
      <main className="pt-6 md:pt-[120px] pb-28 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
