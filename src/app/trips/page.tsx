"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Navbar from "@/components/Navbar";
import { 
  Route, MapPin, Calendar, Clock, Plus, Share2, 
  Trash2, MoveUp, MoveDown, Check, Sparkles, Navigation
} from "lucide-react";

export default function TripsPage() {
  const [tripId, setTripId] = useState<string>("");
  const [activeTrip, setActiveTrip] = useState<any>({
    title: "Your trips",
    duration: "Sign in to load your itinerary",
    route: "",
  });

  const [itinerary, setItinerary] = useState<any[]>([
    {
      id: 1,
      type: "checkpoint",
      title: "Depart from Las Vegas, NV",
      note: "Full fuel tank, pick up groceries at Trader Joe's.",
      days: 0,
      icon: "start",
    },
    {
      id: 2,
      type: "place",
      title: "Zion River Resort RV Park & Campground",
      location: "Virgin, UT",
      note: "Reserved site #24 with 30A hookups. Take park shuttle to Angels Landing trailhead.",
      days: 2,
      icon: "tent",
    },
    {
      id: 3,
      type: "break",
      title: "Rest & Laundry Day in Moab",
      location: "Moab, UT",
      note: "Relax by the river, van maintenance and gear cleanup.",
      days: 1,
      icon: "rest",
    },
    {
      id: 4,
      type: "place",
      title: "Sand Flats Recreation Area",
      location: "Moab, UT",
      note: "Dispersed campsite overlooking Slickrock trail. $15 fee.",
      days: 2,
      icon: "tent",
    },
    {
      id: 5,
      type: "checkpoint",
      title: "Final Destination: Denver, CO",
      note: "Arrival via I-70 scenic corridor through Glenwood Canyon.",
      days: 1,
      icon: "end",
    },
  ]);

  const [newStopText, setNewStopText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    fetch("/api/trips")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success || !json.data?.[0]) return;
        const trip = json.data[0];
        setTripId(trip.id);
        setActiveTrip({
          title: trip.title,
          duration: `${trip.stops.length} stops`,
          route: trip.description || trip.stops.map((s: { location: string }) => s.location).filter(Boolean).join(" → "),
        });
        setItinerary(trip.stops.map((s: { id: string; stop_type: string; custom_title: string; location: string; note: string; days_duration: number }) => ({
          id: s.id,
          type: s.stop_type,
          title: s.custom_title,
          location: s.location,
          note: s.note,
          days: s.days_duration,
        })));
      })
      .catch(() => undefined);
  }, []);

  const addStop = async () => {
    if (!newStopText.trim() || !tripId) return;
    const res = await fetch(`/api/trips/${tripId}/stops`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newStopText, location: "En route", note: "Added from the planner." }),
    });
    const json = await res.json();
    if (!json.success) return;
    const s = json.data;
    setItinerary([...itinerary, { id: s.id, type: s.stop_type, title: s.custom_title, location: s.location, note: s.note, days: s.days_duration }]);
    setNewStopText("");
  };

  const removeStop = async (id: string | number) => {
    const res = await fetch(`/api/stops/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) setItinerary(itinerary.filter((item) => item.id !== id));
  };

  const handleShare = async () => {
    if (!tripId) return;
    await navigator.clipboard.writeText(`${window.location.origin}/trips?trip=${tripId}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <AppShell>

        <Navbar />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
            
            {/* Trip Header Banner */}
            <div className="bg-gradient-to-r from-amber/20 via-card to-card border border-line rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-amber text-xs font-bold uppercase tracking-widest">Active Trip Plan</span>
                <h1 className="text-3xl font-bold text-white mt-1">{activeTrip.title}</h1>
                <p className="text-muted text-sm mt-1 flex items-center gap-2">
                  <Route className="w-4 h-4 text-amber" /> {activeTrip.duration} · {activeTrip.route}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleShare}
                  className="px-5 py-2.5 bg-card border border-line rounded-full text-xs font-bold text-white hover:border-amber transition-all flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-amber" />
                  {isCopied ? "Link Copied!" : "Share Trip Link"}
                </button>
                <button className="px-6 py-2.5 bg-amber text-background rounded-full text-xs font-bold hover:bg-amber/90 transition-all flex items-center gap-2 shadow-md">
                  <Plus className="w-4 h-4" /> New trip
                </button>
              </div>
            </div>

            {/* Itinerary Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Itinerary Step List (2 Cols) */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex items-center justify-between px-2 mb-2">
                  <h3 className="font-bold text-white text-lg">Step-by-Step Itinerary</h3>
                  <span className="text-xs text-muted">Drag or adjust stops</span>
                </div>

                {itinerary.map((stop, index) => (
                  <div 
                    key={stop.id} 
                    className="bg-card border border-line rounded-2xl p-5 flex items-start gap-4 hover:border-line/80 transition-all group relative"
                  >
                    {/* Index / Icon */}
                    <div className="w-10 h-10 rounded-xl bg-background border border-line flex items-center justify-center font-bold text-sm text-amber shrink-0">
                      {index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          stop.type === 'break' 
                            ? 'bg-blue-500/15 text-blue-400' 
                            : stop.type === 'checkpoint' 
                            ? 'bg-amber/15 text-amber' 
                            : 'bg-[#10B981]/15 text-[#10B981]'
                        }`}>
                          {stop.type}
                        </span>
                        {stop.days > 0 && (
                          <span className="text-xs text-muted font-medium">· {stop.days} days</span>
                        )}
                      </div>

                      <h4 className="font-bold text-white text-base mt-1 group-hover:text-amber transition-colors">
                        {stop.title}
                      </h4>
                      {stop.location && (
                        <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber" /> {stop.location}
                        </p>
                      )}
                      <p className="text-xs text-[#9CA3AF] mt-2 bg-background/50 p-2.5 rounded-lg border border-line/40">
                        {stop.note}
                      </p>
                    </div>

                    {/* Actions */}
                    <button 
                      onClick={() => removeStop(stop.id)}
                      className="text-muted hover:text-red-400 p-2 rounded-lg hover:bg-background transition-colors"
                      title="Remove stop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Add Stop Input */}
                <div className="bg-card border border-line border-dashed rounded-2xl p-4 flex items-center gap-3 mt-2">
                  <input 
                    type="text"
                    value={newStopText}
                    onChange={(e) => setNewStopText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addStop()}
                    placeholder="Add a new stop, rest day, or viewpoint to this trip..."
                    className="flex-1 bg-background border border-line rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted focus:outline-none focus:border-amber"
                  />
                  <button 
                    onClick={addStop}
                    disabled={!newStopText.trim()}
                    className="bg-amber text-background px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-amber/90 transition-all disabled:opacity-50"
                  >
                    Add stop
                  </button>
                </div>
              </div>

              {/* Right Trip Summary Card */}
              <div className="flex flex-col gap-6">
                <div className="bg-card border border-line rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4">Route Breakdown</h3>
                  
                  <div className="flex flex-col gap-4 text-xs">
                    <div className="flex justify-between py-2 border-b border-line">
                      <span className="text-muted">Total Distance</span>
                      <span className="font-bold text-white">740 miles</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-line">
                      <span className="text-muted">Estimated Drive Time</span>
                      <span className="font-bold text-white">12 hrs 30 mins</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-line">
                      <span className="text-muted">Campground Stops</span>
                      <span className="font-bold text-white">2 sites reserved</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-line">
                      <span className="text-muted">Rest Days</span>
                      <span className="font-bold text-white">1 day in Moab</span>
                    </div>
                  </div>

                  <button className="w-full mt-6 py-3 bg-amber text-background font-bold text-xs rounded-xl hover:bg-amber/90 transition-all shadow-md">
                    Open in Leaflet Navigator
                  </button>
                </div>

                {/* Saved Places to Add Widget */}
                <div className="bg-gradient-to-b from-card to-background border border-line rounded-2xl p-6">
                  <span className="text-xs font-bold text-amber">Saved from your Feed</span>
                  <h4 className="font-bold text-white text-sm mt-1 mb-3">Horseshoe Bend Overlook</h4>
                  <p className="text-xs text-muted mb-4">
                    You bookmarked this place 2 hours ago. Would you like to add it as a stop between Zion and Moab?
                  </p>
                  <button 
                    onClick={() => {
                      setItinerary([
                        ...itinerary.slice(0, 2),
                        {
                          id: Date.now(),
                          type: "place",
                          title: "Horseshoe Bend Overlook",
                          location: "Page, AZ",
                          note: "Sunrise photo stop. $10 parking fee.",
                          days: 1,
                          icon: "tent",
                        },
                        ...itinerary.slice(2)
                      ]);
                    }}
                    className="w-full py-2.5 bg-line text-white rounded-xl text-xs font-bold hover:bg-line/80 transition-colors"
                  >
                    Insert as Stop 3 +
                  </button>
                </div>
              </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}
