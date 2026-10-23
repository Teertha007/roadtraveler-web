"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import AppShell from "@/components/AppShell";
import Navbar from "@/components/Navbar";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), { ssr: false });
const MapboxMap = dynamic(() => import("@/components/MapboxMap"), { ssr: false });
const GoogleMapView = dynamic(() => import("@/components/GoogleMapView"), { ssr: false });
import AddToTripModal from "@/components/AddToTripModal";
import { useToast } from "@/context/ToastContext";
import { 
  MapPin, Tent, Caravan, Trees, Heart, Compass, Star, Navigation, 
  Phone, Globe, Check, Plus, Layers, Filter, Search, X, ExternalLink
} from "lucide-react";

const useGoogleMaps = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
const useMapbox = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN) && !useGoogleMaps;

export default function MapPage() {
  const { showToast } = useToast();
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [nearMeActive, setNearMeActive] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadPlaces() {
      try {
        const params = new URLSearchParams();
        if (activeCategory !== "all") params.append("category", activeCategory);
        if (searchQuery) params.append("search", searchQuery);
        if (nearMeActive && coords) {
          params.append("lat", String(coords.lat));
          params.append("lng", String(coords.lng));
          params.append("radius", "50");
        }

        const res = await fetch(`/api/places?${params.toString()}`);
        const json = await res.json();
        if (json.success && json.data) {
          setPlaces(json.data);
          if (json.data.length > 0 && !selectedPlace) {
            setSelectedPlace(json.data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load map places:", err);
      }
    }
    loadPlaces();
  }, [activeCategory, searchQuery, nearMeActive, coords]);

  const categories = [
    { id: "all", label: "All Places", icon: <Layers className="w-4 h-4" /> },
    { id: "campground", label: "Campgrounds", icon: <Tent className="w-4 h-4" /> },
    { id: "rv_park", label: "RV Parks", icon: <Caravan className="w-4 h-4" /> },
    { id: "beach", label: "Beaches", icon: <Heart className="w-4 h-4" /> },
    { id: "trail", label: "Trails", icon: <Trees className="w-4 h-4" /> },
    { id: "rest_stop", label: "Rest Stops", icon: <MapPin className="w-4 h-4" /> },
  ];

  const handleDirections = (place: any) => {
    const url = `https://www.openstreetmap.org/directions?to=${place.lat}%2C${place.lng}`;
    window.open(url, "_blank");
    showToast(`Opening directions to ${place.name}`);
  };

  return (
    <AppShell>

        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          nearMeActive={nearMeActive}
          onNearMeToggle={() => {
            if (nearMeActive) {
              setNearMeActive(false);
              setCoords(null);
              showToast("Near Me off", "info");
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setNearMeActive(true);
                showToast("Showing places within 50 miles");
              },
              () => showToast("Location permission was blocked", "error")
            );
          }}
        />

        {/* Map Layout */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Left Places Drawer */}
          <div className="w-[420px] border-r border-line bg-card/95 backdrop-blur-md flex flex-col z-10 shrink-0 h-full">
            {/* Category Filter Pills */}
            <div className="p-4 border-b border-line flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    showToast(`Showing: ${cat.label}`);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat.id 
                      ? "bg-amber text-background font-bold shadow-sm" 
                      : "bg-background border border-line text-muted hover:text-white"
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Places List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-muted mb-1 px-1">
                <span>{places.length} places found</span>
                <span>OpenStreetMap</span>
              </div>

              {places.map((place) => {
                const isSelected = selectedPlace?.id === place.id;
                return (
                  <div
                    key={place.id}
                    onClick={() => {
                      setSelectedPlace(place);
                      showToast(`Focused on ${place.name}`);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-background border-amber shadow-lg ring-1 ring-amber/50" 
                        : "bg-background/50 border-line hover:border-line/80 hover:bg-background/80"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber">
                          {place.category.replace("_", " ")}
                        </span>
                        <h4 className="font-bold text-white text-sm mt-0.5">{place.name}</h4>
                        <p className="text-xs text-muted flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-amber" /> {place.location_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber/15 text-amber px-2 py-0.5 rounded-md text-xs font-bold">
                        <Star className="w-3 h-3 fill-amber" />
                        {place.rating}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 text-[11px] text-muted">
                      <span>{place.reviews_count} reviews</span>
                      <span>·</span>
                      <span className="text-[#10B981] font-medium">{place.travelers_count} visitors</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority: Google key → Mapbox token → free Leaflet/OSM */}
          <div className="flex-1 relative h-full min-h-[40vh]">
            {useGoogleMaps ? (
              <GoogleMapView
                places={places}
                selectedPlace={selectedPlace}
                onSelectPlace={(place) => setSelectedPlace(place)}
                nearMeActive={nearMeActive}
              />
            ) : useMapbox ? (
              <MapboxMap
                places={places}
                selectedPlace={selectedPlace}
                onSelectPlace={(place) => setSelectedPlace(place)}
                nearMeActive={nearMeActive}
                userCoords={coords}
              />
            ) : (
              <LeafletMap
                places={places}
                selectedPlace={selectedPlace}
                onSelectPlace={(place) => setSelectedPlace(place)}
              />
            )}

            {/* Selected Place Overlay Card */}
            {selectedPlace && (
              <div className="absolute bottom-6 right-6 max-w-[420px] w-full bg-card/95 border border-line rounded-3xl p-6 shadow-2xl backdrop-blur-md z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber">
                      {selectedPlace.category.replace("_", " ")}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{selectedPlace.name}</h3>
                    <p className="text-xs text-muted flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber" /> {selectedPlace.location_name}, {selectedPlace.state}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedPlace(null)}
                    className="text-muted hover:text-white p-1 rounded-lg hover:bg-line/50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Rating & Stats */}
                <div className="flex items-center gap-4 mt-3 py-2 border-y border-line text-xs">
                  <div className="flex items-center gap-1 text-amber font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber" /> {selectedPlace.rating}
                  </div>
                  <span className="text-muted">({selectedPlace.reviews_count} reviews)</span>
                  <span className="text-muted">·</span>
                  <span className="text-[#10B981] font-semibold">{selectedPlace.travelers_count} visitors</span>
                </div>

                {/* Amenities Chips */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selectedPlace.amenities?.map((amenity: string) => (
                    <span key={amenity} className="px-2.5 py-1 bg-background border border-line rounded-md text-[10px] text-muted font-medium">
                      {amenity.replace("_", " ")}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-5">
                  <button 
                    onClick={() => setIsTripModalOpen(true)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border border-amber bg-amber text-background hover:bg-amber/90 shadow-md active:scale-95"
                  >
                    Add to trip +
                  </button>
                  <button 
                    onClick={() => handleDirections(selectedPlace)}
                    className="px-5 py-2.5 bg-background border border-line rounded-xl text-xs font-bold text-white hover:border-amber transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber" />
                    Directions
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      {/* Add to Trip Modal */}
      {selectedPlace && (
        <AddToTripModal
          isOpen={isTripModalOpen}
          placeName={selectedPlace.name}
          placeLocation={selectedPlace.location_name}
          onClose={() => setIsTripModalOpen(false)}
        />
      )}
    </AppShell>
  );
}
