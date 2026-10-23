"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Compass, Calendar, Route, Plus } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/map", label: "Map", icon: Map },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/trips", label: "Trips", icon: Route },
] as const;

export default function MobileBottomNav({ onAddPostClick }: { onAddPostClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-line bg-background/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <div className="flex items-stretch justify-between px-1 pt-1 min-h-[56px]">
        {items.slice(0, 2).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium min-h-[44px] ${
                active ? "text-amber" : "text-muted"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => {
            if (onAddPostClick) onAddPostClick();
            else if (pathname !== "/") window.location.href = "/";
            else document.getElementById("composer-input")?.focus();
          }}
          className="flex-1 flex flex-col items-center justify-center -mt-3"
          aria-label="New post"
        >
          <span className="w-12 h-12 rounded-full bg-amber text-background flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Plus className="w-6 h-6" />
          </span>
        </button>

        {items.slice(2).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium min-h-[44px] ${
                active ? "text-amber" : "text-muted"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
