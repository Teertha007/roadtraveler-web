"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";

/** Desktop rail + mobile bottom tabs. Use on every authenticated app page. */
export default function AppShell({
  children,
  onAddPostClick,
}: {
  children: React.ReactNode;
  onAddPostClick?: () => void;
}) {
  return (
    <div className="flex w-full h-[100dvh] overflow-hidden bg-background text-foreground">
      <Sidebar onAddPostClick={onAddPostClick} />
      <div className="flex-1 flex flex-col min-w-0 pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>
      <MobileBottomNav onAddPostClick={onAddPostClick} />
    </div>
  );
}
