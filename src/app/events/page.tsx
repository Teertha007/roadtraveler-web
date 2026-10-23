"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import Navbar from "@/components/Navbar";
import HostEventModal from "@/components/HostEventModal";
import ShareModal from "@/components/ShareModal";
import { useToast } from "@/context/ToastContext";
import { 
  Calendar, MapPin, Users, Plus, Check, Search, 
  Share2, Bookmark, Clock, ArrowRight, Tag
} from "lucide-react";

export default function EventsPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rsvpMap, setRsvpMap] = useState<Record<string, string>>({});

  // Modals
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [shareEvent, setShareEvent] = useState<any | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/events");
        const json = await res.json();
        if (json.success && json.data) {
          setEvents(json.data);
          const initialMap: Record<string, string> = {};
          json.data.forEach((e: any) => {
            initialMap[e.id] = e.status || "Interested";
          });
          setRsvpMap(initialMap);
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    }
    loadEvents();
  }, []);

  const handleRsvp = async (id: string, status: "going" | "interested") => {
    const nextStatus = status === "going" ? "Going" : "Interested";
    setRsvpMap(prev => ({ ...prev, [id]: nextStatus }));
    showToast(status === "going" ? "RSVP Confirmed: You're going!" : "Marked as Interested");

    try {
      const res = await fetch(`/api/events/${id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) {
        setRsvpMap((prev) => ({ ...prev, [id]: status === "going" ? "Interested" : "Going" }));
        showToast(json.error || "Sign in to RSVP", "error");
      }
    } catch (err) {
      console.error("Failed to RSVP:", err);
    }
  };

  const handleEventCreated = (newEvent: any) => {
    setEvents([newEvent, ...events]);
  };

  return (
    <AppShell>

        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
            
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-line rounded-3xl p-5 md:p-8">
              <div>
                <span className="text-amber text-xs font-bold uppercase tracking-widest">Traveler Gatherings</span>
                <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">Upcoming Overland & RV Events</h1>
                <p className="text-muted text-sm mt-1">
                  Connect with fellow road wanderers at upcoming rallies, trail runs, campfire talks, and swap meets.
                </p>
              </div>
              <button 
                onClick={() => setIsHostModalOpen(true)}
                className="bg-amber text-background px-6 py-3 rounded-full text-xs font-bold hover:bg-amber/90 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shrink-0 min-h-[44px]"
              >
                <Plus className="w-4 h-4" /> Host an event
              </button>
            </div>

            {/* Events Filter Bar */}
            <div className="flex items-center gap-2 border-b border-line pb-4 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => { setActiveFilter("all"); showToast("Showing all events"); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === "all" ? "bg-amber text-background" : "bg-card border border-line text-muted hover:text-white"
                }`}
              >
                All Events ({events.length})
              </button>
              <button 
                onClick={() => { setActiveFilter("festivals"); showToast("Showing Festivals & Rallies"); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === "festivals" ? "bg-amber text-background" : "bg-card border border-line text-muted hover:text-white"
                }`}
              >
                Festivals & Rallies
              </button>
              <button 
                onClick={() => { setActiveFilter("trail_runs"); showToast("Showing Trail Runs & Hikes"); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === "trail_runs" ? "bg-amber text-background" : "bg-card border border-line text-muted hover:text-white"
                }`}
              >
                Trail Runs & Hikes
              </button>
              <button 
                onClick={() => { setActiveFilter("swap_meets"); showToast("Showing Swap Meets"); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === "swap_meets" ? "bg-amber text-background" : "bg-card border border-line text-muted hover:text-white"
                }`}
              >
                Gear Swap Meets
              </button>
            </div>

            {/* Events List */}
            <div className="flex flex-col gap-6">
              {events.map((event) => {
                const parts = (event.date || "OCT 18").split(" ");
                const month = parts[0];
                const day = parts[1] || "18";
                const userStatus = rsvpMap[event.id] || event.status;

                return (
                  <div key={event.id} className="bg-card border border-line rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-amber/40 transition-all hover:shadow-xl">
                    <div className="flex items-start gap-6">
                      {/* Date Badge */}
                      <div className="w-20 h-20 bg-background border border-line rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-inner">
                        <span className="text-xs font-bold text-amber tracking-wider">{month}</span>
                        <span className="text-2xl font-black text-white">{day}</span>
                      </div>

                      {/* Event Details */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber/15 text-amber px-2 py-0.5 rounded">
                            Verified Gathering
                          </span>
                          <span className="text-xs text-muted">· Sat 9:00 AM</span>
                        </div>
                        <h3 className="text-xl font-bold text-white hover:text-amber transition-colors cursor-pointer">
                          {event.title}
                        </h3>
                        <p className="text-xs text-muted flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-amber" /> {event.location}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                          <span className="flex items-center gap-1 text-[#10B981] font-semibold">
                            <Users className="w-3.5 h-3.5" /> {event.going_count || 212} going
                          </span>
                          <span>·</span>
                          <span>{event.interested_count || 450} interested</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-4 md:pt-0 border-t md:border-t-0 border-line">
                      <button
                        onClick={() => handleRsvp(event.id, "going")}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                          userStatus === "Going"
                            ? "bg-[#10B981] text-background border-[#10B981] shadow-md"
                            : "bg-background border-line text-white hover:border-[#10B981] hover:text-[#10B981]"
                        }`}
                      >
                        {userStatus === "Going" ? "Going ✓" : "I'm Going"}
                      </button>
                      <button
                        onClick={() => handleRsvp(event.id, "interested")}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                          userStatus === "Interested"
                            ? "bg-amber text-background border-amber shadow-md"
                            : "bg-background border-line text-white hover:border-amber hover:text-amber"
                        }`}
                      >
                        {userStatus === "Interested" ? "Interested ★" : "Interested"}
                      </button>
                      <button 
                        onClick={() => setShareEvent(event)}
                        className="p-2.5 bg-background border border-line rounded-full text-muted hover:text-white transition-colors" 
                        title="Share event"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      {/* Modals */}
      <HostEventModal 
        isOpen={isHostModalOpen} 
        onClose={() => setIsHostModalOpen(false)} 
        onEventCreated={handleEventCreated}
      />

      {shareEvent && (
        <ShareModal 
          isOpen={Boolean(shareEvent)} 
          title={shareEvent.title}
          url={`http://localhost:3000/events/${shareEvent.id}`}
          onClose={() => setShareEvent(null)}
        />
      )}
    </AppShell>
  );
}
