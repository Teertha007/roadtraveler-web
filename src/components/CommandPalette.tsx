"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, BookOpen, Route, Users, X, ArrowRight } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { label: "Search Map for Campgrounds", icon: <MapPin className="w-4 h-4 text-amber" />, action: () => { router.push("/map"); onClose(); } },
    { label: "Browse Dispersed Camping in Utah", icon: <BookOpen className="w-4 h-4 text-[#10B981]" />, action: () => { router.push("/explore?search=Utah"); onClose(); } },
    { label: "Moab Overland Fest Gathering", icon: <Calendar className="w-4 h-4 text-purple-400" />, action: () => { router.push("/events"); onClose(); } },
    { label: "Southwest Itinerary Planner", icon: <Route className="w-4 h-4 text-amber" />, action: () => { router.push("/trips"); onClose(); } },
    { label: "Community Forum & 28 Badges", icon: <Users className="w-4 h-4 text-blue-400" />, action: () => { router.push("/community"); onClose(); } },
  ];

  const filtered = quickActions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4 animate-in fade-in duration-200">
      <div 
        className="bg-card border border-line rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-line flex items-center gap-3">
          <Search className="w-5 h-5 text-amber shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search places, events, guides, or roadtrips..."
            className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-muted"
          />
          <button onClick={onClose} className="text-muted hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 max-h-80 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted px-3 py-2">
            Quick Navigation & Recommendations
          </div>
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">No results found for "{query}".</div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                onClick={item.action}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-line/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-xs font-medium text-white group-hover:text-amber transition-colors">
                    {item.label}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-white transition-colors" />
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-background/50 border-t border-line flex items-center justify-between text-[11px] text-muted">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-line rounded text-white font-mono text-[10px]">Esc</kbd> to close</span>
          <span>Navigation powered by RoadTraveler API</span>
        </div>
      </div>
    </div>
  );
}
