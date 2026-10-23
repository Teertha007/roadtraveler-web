"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import AddToTripModal from "@/components/AddToTripModal";
import ReviewModal from "@/components/ReviewModal";
import ClaimListingModal from "@/components/ClaimListingModal";
import { useToast } from "@/context/ToastContext";
import { 
  MapPin, Star, Filter, Heart, Tent, Caravan, Trees, ShieldCheck, 
  Plus, Check, Search, SlidersHorizontal, ArrowUpDown
} from "lucide-react";

export default function ExplorePage() {
  const { showToast } = useToast();
  const [places, setPlaces] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("rating");

  // Modals
  const [activeTripPlace, setActiveTripPlace] = useState<any | null>(null);
  const [activeClaimPlace, setActiveClaimPlace] = useState<string | null>(null);
  const [reviewPlace, setReviewPlace] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    async function loadPlaces() {
      try {
        const params = new URLSearchParams();
        if (activeCategory !== "all") params.append("category", activeCategory);
        if (searchQuery) params.append("search", searchQuery);

        const res = await fetch(`/api/places?${params.toString()}`);
        const json = await res.json();
        if (json.success && json.data) {
          let list = json.data;
          if (selectedAmenities.length > 0) {
            list = list.filter((p: any) => 
              selectedAmenities.every(a => p.amenities?.includes(a))
            );
          }
          if (sortBy === "rating") {
            list.sort((a: any, b: any) => b.rating - a.rating);
          } else if (sortBy === "reviews") {
            list.sort((a: any, b: any) => b.reviews_count - a.reviews_count);
          }
          setPlaces(list);
        }
      } catch (err) {
        console.error("Failed to load explore listings:", err);
      }
    }
    loadPlaces();
  }, [activeCategory, searchQuery, selectedAmenities, sortBy]);

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
      showToast(`Removed amenity filter`, "info");
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
      showToast(`Filter applied: ${amenity.replace("_", " ")}`);
    }
  };

  const amenitiesList = [
    { id: "pet_friendly", label: "Pet-Friendly" },
    { id: "restrooms", label: "Restrooms" },
    { id: "parking", label: "Parking" },
    { id: "rv_hookups", label: "RV Hookups" },
    { id: "showers", label: "Showers" },
    { id: "potable_water", label: "Potable Water" },
    { id: "free_entry", label: "Free Entry" },
    { id: "wheelchair_accessible", label: "Wheelchair Accessible" },
  ];

  return (
    <div className="flex w-full h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
            
            {/* Explore Hero Banner */}
            <div className="bg-gradient-to-r from-card via-[#1A233F] to-card border border-line rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute right-0 top-0 w-96 h-96 bg-amber/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="max-w-[650px] z-10">
                <span className="text-amber text-xs font-bold uppercase tracking-widest">Directory & Discovery</span>
                <h1 className="text-3xl font-bold text-white mt-1 mb-2">Explore 10,000+ Verified Roadside Places</h1>
                <p className="text-muted text-sm leading-relaxed">
                  Discover campgrounds, RV parks, scenic overlooks, BLM dispersed camping, and rest stops reviewed by travelers across the USA.
                </p>
              </div>

              {/* Amenity Filter Bar */}
              <div className="flex flex-wrap gap-2 mt-6 z-10 pt-4 border-t border-line/60">
                <span className="text-xs font-bold text-muted flex items-center gap-1.5 mr-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Amenities:
                </span>
                {amenitiesList.map((amenity) => {
                  const isActive = selectedAmenities.includes(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`px-3 py-1 rounded-full text-xs transition-all border ${
                        isActive 
                          ? "bg-amber text-background border-amber font-bold shadow-sm" 
                          : "bg-background/80 border-line text-muted hover:text-white hover:border-line/80"
                      }`}
                    >
                      {amenity.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label: "All Places" },
                  { id: "campground", label: "Campgrounds" },
                  { id: "rv_park", label: "RV Parks" },
                  { id: "beach", label: "Beaches" },
                  { id: "trail", label: "Trails" },
                  { id: "rest_stop", label: "Rest Stops" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveCategory(tab.id);
                      showToast(`Showing: ${tab.label}`);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeCategory === tab.id 
                        ? "bg-amber text-background shadow-sm" 
                        : "bg-card border border-line text-muted hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-card border border-line rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber cursor-pointer"
                >
                  <option value="rating">Highest Rated ★</option>
                  <option value="reviews">Most Reviewed</option>
                </select>
              </div>
            </div>

            {/* Places Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <div key={place.id} className="bg-card border border-line rounded-2xl p-5 flex flex-col justify-between hover:border-amber/50 transition-all hover:shadow-xl group">
                  <div>
                    {/* Image Placeholder with category badge */}
                    <div className="aspect-[16/9] bg-line rounded-xl mb-4 relative overflow-hidden flex items-end p-4">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      <span className="absolute top-3 left-3 bg-amber text-background px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {place.category.replace("_", " ")}
                      </span>
                      <div className="z-10 text-white">
                        <span className="text-xs font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber" /> {place.location_name}
                        </span>
                      </div>
                    </div>

                    {/* Header & Rating */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-base text-white group-hover:text-amber transition-colors">
                        {place.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-amber/15 text-amber px-2 py-0.5 rounded-md text-xs font-bold shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber" />
                        {place.rating}
                      </div>
                    </div>

                    <p className="text-xs text-muted mb-4 line-clamp-2">
                      {place.description || `High-rated roadside destination in ${place.state} offering amenities and scenic outdoors.`}
                    </p>

                    {/* Amenities Chips */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {place.amenities?.map((amenity: string) => (
                        <span key={amenity} className="px-2 py-0.5 bg-background border border-line rounded-md text-[10px] text-muted">
                          {amenity.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom CTA Actions */}
                  <div className="pt-4 border-t border-line flex items-center justify-between">
                    <span className="text-xs text-muted font-medium">
                      {place.reviews_count} reviews · {place.travelers_count} visits
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReviewPlace({ id: place.id, name: place.name })}
                        className="px-3 py-1.5 rounded-full text-xs font-bold border border-line text-white hover:border-amber"
                      >
                        Review
                      </button>
                      <button 
                        onClick={() => setActiveTripPlace({ name: place.name, location: place.location_name, placeId: place.id })}
                        className="px-4 py-1.5 rounded-full text-xs font-bold border border-amber text-amber hover:bg-amber/10 transition-all active:scale-95"
                      >
                        Add to trip +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Claim Listing Banner */}
            <div className="bg-card border border-line rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mt-6">
              <div className="max-w-[700px]">
                <div className="flex items-center gap-2 text-amber text-xs font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" /> BUSINESS OWNER?
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Claim your Campground or RV Park Listing</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Verify business ownership to manage photos, update amenities, respond to reviews, and gain verified badge trust across the network.
                </p>
              </div>
              <button 
                onClick={() => setActiveClaimPlace("Zion River Resort RV Park")}
                className="bg-amber text-background px-6 py-3 rounded-full text-xs font-bold hover:bg-amber/90 transition-all shrink-0 hover:scale-105 active:scale-95 shadow-md"
              >
                Claim listing
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Modals */}
      {activeTripPlace && (
        <AddToTripModal 
          isOpen={Boolean(activeTripPlace)} 
          placeName={activeTripPlace.name} 
          placeLocation={activeTripPlace.location}
          placeId={activeTripPlace.placeId} 
          onClose={() => setActiveTripPlace(null)} 
        />
      )}

      <ReviewModal place={reviewPlace} onClose={() => setReviewPlace(null)} />

      {activeClaimPlace && (
        <ClaimListingModal 
          isOpen={Boolean(activeClaimPlace)} 
          listingName={activeClaimPlace} 
          onClose={() => setActiveClaimPlace(null)} 
        />
      )}
    </div>
  );
}
