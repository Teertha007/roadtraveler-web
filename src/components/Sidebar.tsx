"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home as HomeIcon, Map, Compass, Calendar, 
  Users, BookOpen, Route, Plus 
} from "lucide-react";

export default function Sidebar({ onAddPostClick }: { onAddPostClick?: () => void }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: <HomeIcon className="w-5 h-5" /> },
    { label: "Map", href: "/map", icon: <Map className="w-5 h-5" /> },
    { label: "Explore", href: "/explore", icon: <Compass className="w-5 h-5" /> },
    { label: "Events", href: "/events", icon: <Calendar className="w-5 h-5" /> },
    { label: "Community", href: "/community", icon: <Users className="w-5 h-5" /> },
    { label: "Guides", href: "/guides", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Trips", href: "/trips", icon: <Route className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-[92px] shrink-0 border-r border-line flex flex-col items-center py-6 gap-6 bg-background z-30 h-screen sticky top-0">
      {/* Brand Logo */}
      <Link 
        href="/"
        className="w-12 h-12 bg-amber rounded-xl flex items-center justify-center text-background font-bold mb-2 hover:scale-105 active:scale-95 transition-all shadow-md"
        title="RoadTraveler Home"
      >
        <span className="text-2xl mt-[-2px]">▲</span>
      </Link>
      
      {/* Navigation Links */}
      <nav className="flex flex-col gap-4 items-center flex-1 w-full px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1.5 w-full py-1.5 rounded-xl transition-all group ${
                isActive ? "text-amber" : "text-muted hover:text-white"
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${
                isActive ? "bg-amber/15 text-amber" : "group-hover:bg-line/50"
              }`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium tracking-tight ${
                isActive ? "font-bold text-amber" : ""
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      
      {/* Add Post Button */}
      <div className="mt-auto flex flex-col items-center">
        <button 
          onClick={onAddPostClick || (() => {
            const input = document.getElementById("composer-input");
            if (input) input.focus();
            else window.location.href = "/";
          })}
          className="w-12 h-12 bg-card border border-line rounded-full flex items-center justify-center hover:bg-line transition-all hover:scale-105 active:scale-95 group shadow-sm"
          title="Add new post"
        >
          <Plus className="w-5 h-5 text-muted group-hover:text-white transition-colors" />
        </button>
        <span className="text-[10px] text-muted mt-2">Add post</span>
      </div>
    </aside>
  );
}
