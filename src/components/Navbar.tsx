"use client";

import React, { useState } from "react";
import { 
  Search, MapPin, Tent, Caravan, Trees, Heart, Compass, Plus, Bell, XCircle 
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
    if (onNearMeToggle) {
      onNearMeToggle();
    } else {
      showToast("Searching places near your current GPS location (50 mi)");
    }
  };

  return (
    <>
      <header className="h-[72px] border-b border-line flex items-center justify-between px-6 shrink-0 bg-background z-20 sticky top-0">
        <div className="flex items-center flex-1 gap-4">
          {/* Search Bar with ⌘K Shortcut */}
          <div className="relative w-full max-w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            <input 
              type="text" 
              value={searchQuery !== undefined ? searchQuery : internalSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search places, events, travelers..." 
              className="w-full bg-card border border-line rounded-full pl-10 pr-12 py-2 text-sm focus:outline-none focus:border-amber transition-colors placeholder:text-muted text-white"
            />
            {(searchQuery || internalSearch) ? (
              <button 
                onClick={() => handleSearchChange("")} 
                className="absolute right-10 top-1/2 -translate-y-1/2 text-muted hover:text-white"
              >
                <XCircle className="w-4 h-4" />
              </button>
            ) : null}
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 bg-line/60 hover:bg-line rounded px-1.5 py-0.5 transition-colors cursor-pointer"
              title="Open Command Search Palette"
            >
              <span className="text-[10px] text-muted hover:text-white font-mono">⌘K</span>
            </button>
          </div>

          {/* Near Me Button */}
          <button 
            onClick={handleNearMe}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap ml-2 active:scale-95 ${
              nearMeActive 
                ? "border-amber bg-amber/15 text-amber shadow-sm font-bold" 
                : "border-line bg-card text-muted hover:text-white hover:border-line/80"
            }`}
          >
            <MapPin className="w-4 h-4" /> Near Me
          </button>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 ml-2 overflow-x-auto no-scrollbar">
            <FilterButton 
              icon={<Tent className="w-4 h-4" />} 
              label="Campgrounds" 
              active={activeFilters.includes("Campgrounds")} 
              onClick={() => handleFilterClick("Campgrounds")} 
            />
            <FilterButton 
              icon={<Caravan className="w-4 h-4" />} 
              label="RV parks" 
              active={activeFilters.includes("RV parks")} 
              onClick={() => handleFilterClick("RV parks")} 
            />
            <FilterButton 
              icon={<Heart className="w-4 h-4" />} 
              label="Beaches" 
              active={activeFilters.includes("Beaches")} 
              onClick={() => handleFilterClick("Beaches")} 
            />
            <FilterButton 
              icon={<Trees className="w-4 h-4" />} 
              label="Trails" 
              active={activeFilters.includes("Trails")} 
              onClick={() => handleFilterClick("Trails")} 
            />
          </div>
          
          {/* Filters Modal Button */}
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-line bg-card text-sm hover:bg-line/40 transition-colors whitespace-nowrap ml-2 text-muted hover:text-white active:scale-95"
          >
            <Compass className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Right User Actions */}
        <div className="flex items-center gap-4 ml-6 shrink-0 relative">
          <button 
            onClick={onNewPostClick || (() => {
              const input = document.getElementById("composer-input");
              if (input) input.focus();
              else window.location.href = "/";
            })}
            className="flex items-center gap-2 bg-amber text-background text-sm font-bold px-5 py-2.5 rounded-full hover:bg-amber/90 transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" /> New post
          </button>
          
          {/* Bell Notification Center */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-card hover:bg-line transition-colors border border-line relative group cursor-pointer active:scale-95"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-card"></span>
            </button>
            <NotificationsPopover 
              isOpen={isNotificationsOpen} 
              onClose={() => setIsNotificationsOpen(false)} 
            />
          </div>
          
          {/* User Profile Menu */}
          <div className="relative">
            <div 
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
              className="w-10 h-10 rounded-full bg-[#5271FF] border-2 border-transparent hover:border-amber transition-all flex items-center justify-center font-bold text-white cursor-pointer shadow-sm active:scale-95"
              title="Teertha Profile"
            >
              T
            </div>
            <ProfileMenu 
              isOpen={isProfileOpen} 
              onClose={() => setIsProfileOpen(false)} 
            />
          </div>
        </div>
      </header>

      {/* Global Modals Mounted */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />

      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)} 
      />
    </>
  );
}

function FilterButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all whitespace-nowrap active:scale-95 ${
        active 
          ? "border-amber bg-amber/15 text-amber font-semibold" 
          : "border-line bg-card text-muted hover:text-white hover:bg-line/50"
      }`}
    >
      <span className={active ? "text-amber" : "text-muted"}>{icon}</span> {label}
    </button>
  );
}
