"use client";

import { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";
import { Analytics } from "@/components/Analytics";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <SideNav />
      <BottomNav />

      {/* Main content — shifts right when sidebar is open via CSS */}
      <main className="pt-6 md:pt-24 pb-28 md:pb-8 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto transition-all duration-300 sidebar-content">
        {children}
      </main>

      <Analytics />
    </div>
  );
}
