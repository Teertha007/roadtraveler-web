"use client";

import React, { useState } from "react";
import {
  Search, MapPin, Tent, Caravan, Trees, Heart, Compass, Plus, Bell, XCircle,
} from "lucide-react";
import CommandPalette from "@/components/CommandPalette";
import NotificationsPopover from "@/components/NotificationsPopover";
import ProfileMenu from "@/components/ProfileMenu";
import FilterModal from "@/components/FilterModal";
import { useToast } from "@/context/ToastContext";

interface NavbarProps {
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  activeFilters?: string[];
  toggleFilter?: (f: string) => void;
  nearMeActive?: boolean;
  onNearMeToggle?: () => void;
  onNewPostClick?: () => void;
}

export default function Navbar({
  searchQuery = "",
  setSearchQuery,
  activeFilters = [],
  toggleFilter,
  nearMeActive = false,
  onNearMeToggle,
  onNewPostClick,
}: NavbarProps) {
  const { showToast } = useToast();
  const [internalSearch, setInternalSearch] = useState(searchQuery);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const handleSearchChange = (val: string) => {
    setInternalSearch(val);
    if (setSearchQuery) setSearchQuery(val);
  };

  const handleFilterClick = (filter: string) => {
    if (toggleFilter) toggleFilter(filter);
    else showToast(`Filtered by ${filter}`);
  };

  const handleNearMe = () => {
    if (onNearMeToggle) onNearMeToggle();
    else showToast("Searching places near your current GPS location (50 mi)");
  };

  return (
    <>
      <header className="min-h-[56px] md:h-[72px] border-b border-line flex flex-col gap-2 px-3 py-2 md:px-6 md:py-0 md:flex-row md:items-center md:justify-between shrink-0 bg-background z-20 sticky top-0">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <div className="relative flex-1 min-w-0 max-w-none md:max-w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            <input
              type="search"
              enterKeyHint="search"
              value={searchQuery !== undefined ? searchQuery : internalSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search places…"
              className="w-full bg-card border border-line rounded-full pl-10 pr-10 md:pr-12 py-2.5 text-sm focus:outline-none focus:border-amber transition-colors placeholder:text-muted text-white"
            />
            {(searchQuery || internalSearch) ? (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white p-1"
                aria-label="Clear search"
              >
                <XCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 gap-1 bg-line/60 hover:bg-line rounded px-1.5 py-0.5"
                title="Open Command Search Palette"
              >
                <span className="text-[10px] text-muted font-mono">⌘K</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleNearMe}
            className={`shrink-0 flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-2.5 md:px-4 rounded-full border text-sm font-medium active:scale-95 ${
              nearMeActive
                ? "border-amber bg-amber/15 text-amber font-bold"
                : "border-line bg-card text-muted"
            }`}
            aria-label="Near me"
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden lg:inline">Near Me</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 overflow-x-auto no-scrollbar">
            <FilterButton icon={<Tent className="w-4 h-4" />} label="Campgrounds" active={activeFilters.includes("Campgrounds")} onClick={() => handleFilterClick("Campgrounds")} />
            <FilterButton icon={<Caravan className="w-4 h-4" />} label="RV parks" active={activeFilters.includes("RV parks")} onClick={() => handleFilterClick("RV parks")} />
            <FilterButton icon={<Heart className="w-4 h-4" />} label="Beaches" active={activeFilters.includes("Beaches")} onClick={() => handleFilterClick("Beaches")} />
            <FilterButton icon={<Trees className="w-4 h-4" />} label="Trails" active={activeFilters.includes("Trails")} onClick={() => handleFilterClick("Trails")} />
          </div>

          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="shrink-0 flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-2.5 md:px-4 rounded-full border border-line bg-card text-sm text-muted active:scale-95"
            aria-label="Filters"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden md:inline">Filters</span>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0 justify-end">
          <button
            type="button"
            onClick={onNewPostClick || (() => {
              const input = document.getElementById("composer-input");
              if (input) input.focus();
              else window.location.href = "/";
            })}
            className="hidden sm:flex items-center gap-2 bg-amber text-background text-sm font-bold px-4 py-2.5 rounded-full active:scale-95 shadow-sm min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">New post</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-card border border-line relative active:scale-95"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-muted" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-card" />
            </button>
            <NotificationsPopover isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
              className="w-11 h-11 rounded-full bg-[#5271FF] border-2 border-transparent flex items-center justify-center font-bold text-white active:scale-95"
              title="Profile"
              aria-label="Profile"
            >
              T
            </button>
            <ProfileMenu isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
          </div>
        </div>
      </header>

      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} />
    </>
  );
}

function FilterButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm whitespace-nowrap active:scale-95 ${
        active ? "border-amber bg-amber/15 text-amber font-semibold" : "border-line bg-card text-muted"
      }`}
    >
      <span className={active ? "text-amber" : "text-muted"}>{icon}</span> {label}
    </button>
  );
}
