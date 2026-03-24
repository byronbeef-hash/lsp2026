"use client";

import { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <SideNav />
      <BottomNav />

      {/* Main content area — shifted right on desktop to accommodate sidebar */}
      <main className="pt-6 md:pt-24 pb-28 md:pb-8 px-4 md:pl-64 md:pr-6 max-w-[1600px]">
        {children}
      </main>
    </div>
  );
}
