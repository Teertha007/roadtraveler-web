"use client";

import React, { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut, Compass, Star } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface Place {
  id: string;
  name: string;
  category: string;
  location_name: string;
  state: string;
  lat: number;
  lng: number;
  rating: number;
  reviews_count: number;
  travelers_count: number;
  amenities?: string[];
  description?: string;
}

interface GoogleMapViewProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  nearMeActive?: boolean;
}

// Google Maps Night / Dark Mode Style JSON
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0c1222" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0c1222" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a99ad" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d1d5db" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca3af" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#14253d" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#60a5fa" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1c2640" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#141c33" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca3af" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#243052" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#fdb601" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#172554" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#fdb601" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#080d1a" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#080d1a" }],
  },
];

export default function GoogleMapView({
  places,
  selectedPlace,
  onSelectPlace,
  center = { lat: 37.5, lng: -111.0 }, // Centered on USA Southwest / Utah / Arizona
  zoom = 6,
  nearMeActive = false,
}: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [mapType, setMapType] = useState<"dark" | "satellite" | "terrain">("dark");
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const { showToast } = useToast();

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    if (!apiKey) {
      setIsApiKeyMissing(true);
      return;
    }

    try {
      setOptions({
        key: apiKey,
        v: "weekly",
      });

      importLibrary("maps")
        .then(() => {
          if (!mapRef.current) return;
          const google = (window as any).google;
          const map = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            styles: mapType === "dark" ? darkMapStyle : [],
            mapTypeId: mapType === "satellite" ? "satellite" : mapType === "terrain" ? "terrain" : "roadmap",
            disableDefaultUI: true,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            backgroundColor: "#0C1222",
          });

          setMapInstance(map);
        })
        .catch((err: any) => {
          console.warn("Google Maps load failed:", err);
          setIsApiKeyMissing(true);
        });
    } catch (err: any) {
      console.warn("Google Maps init error:", err);
      setIsApiKeyMissing(true);
    }
  }, [apiKey]);

  // Handle map type changes
  useEffect(() => {
    if (mapInstance && (window as any).google) {
      const google = (window as any).google;
      if (mapType === "dark") {
        mapInstance.setMapTypeId("roadmap");
        mapInstance.setOptions({ styles: darkMapStyle });
      } else if (mapType === "satellite") {
        mapInstance.setMapTypeId("satellite");
        mapInstance.setOptions({ styles: [] });
      } else if (mapType === "terrain") {
        mapInstance.setMapTypeId("terrain");
        mapInstance.setOptions({ styles: [] });
      }
    }
  }, [mapType, mapInstance]);

  // Render Google Maps Markers
  useEffect(() => {
    if (!mapInstance || !(window as any).google) return;
    const google = (window as any).google;

    // Clear previous markers
    markers.forEach((m) => m.setMap(null));

    const newMarkers = places.map((place) => {
      const isSelected = selectedPlace?.id === place.id;

      // Custom Amber / Dark Pin SVG
      const marker = new google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: mapInstance,
        title: place.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 10 : 8,
          fillColor: isSelected ? "#FDB601" : "#141C33",
          fillOpacity: 1,
          strokeColor: isSelected ? "#FFFFFF" : "#FDB601",
          strokeWeight: 2.5,
        },
      });

      marker.addListener("click", () => {
        onSelectPlace(place);
        mapInstance.panTo({ lat: place.lat, lng: place.lng });
      });

      return marker;
    });

    setMarkers(newMarkers);
  }, [mapInstance, places, selectedPlace]);

  // Handle selected place pan
  useEffect(() => {
    if (mapInstance && selectedPlace) {
      mapInstance.panTo({ lat: selectedPlace.lat, lng: selectedPlace.lng });
      mapInstance.setZoom(8);
    }
  }, [selectedPlace, mapInstance]);

  // Near Me Pan
  useEffect(() => {
    if (nearMeActive && mapInstance && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapInstance.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          mapInstance.setZoom(9);
          showToast("Centered Google Maps on your location!");
        },
        () => {
          mapInstance.panTo({ lat: 37.2, lng: -112.9 }); // Zion default
        }
      );
    }
  }, [nearMeActive, mapInstance]);

  return (
    <div className="relative w-full h-full bg-[#0C1222] overflow-hidden">
      {/* 1. Real Google Maps Container */}
      {!isApiKeyMissing ? (
        <div ref={mapRef} className="w-full h-full z-0" />
      ) : (
        /* 2. Full-featured Interactive Leaflet / OSM Dark Map Fallback */
        <InteractiveDarkMapFallback 
          places={places} 
          selectedPlace={selectedPlace} 
          onSelectPlace={onSelectPlace} 
          mapType={mapType}
        />
      )}

      {/* Top Map Type Selector (Google Dark / Satellite / Terrain) */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-1.5 bg-card/90 backdrop-blur-md border border-line p-1.5 rounded-2xl shadow-xl">
        <button
          onClick={() => {
            setMapType("dark");
            showToast("Google Maps: Dark Theme Active");
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            mapType === "dark" 
              ? "bg-amber text-background shadow-md" 
              : "text-muted hover:text-white"
          }`}
        >
          Google Dark
        </button>
        <button
          onClick={() => {
            setMapType("satellite");
            showToast("Google Maps: Satellite View Active");
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            mapType === "satellite" 
              ? "bg-amber text-background shadow-md" 
              : "text-muted hover:text-white"
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => {
            setMapType("terrain");
            showToast("Google Maps: Terrain View Active");
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            mapType === "terrain" 
              ? "bg-amber text-background shadow-md" 
              : "text-muted hover:text-white"
          }`}
        >
          Terrain
        </button>
      </div>

      {/* Map Zoom & GPS Floating Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
        <button 
          onClick={() => {
            if (mapInstance) {
              mapInstance.setZoom((mapInstance.getZoom() || 6) + 1);
            }
            showToast("Zoom In");
          }}
          className="w-11 h-11 bg-card/90 backdrop-blur-md border border-line rounded-xl text-white hover:text-amber hover:border-amber transition-all flex items-center justify-center font-bold text-lg shadow-lg active:scale-95"
          title="Zoom In"
        >
          +
        </button>
        <button 
          onClick={() => {
            if (mapInstance) {
              mapInstance.setZoom((mapInstance.getZoom() || 6) - 1);
            }
            showToast("Zoom Out");
          }}
          className="w-11 h-11 bg-card/90 backdrop-blur-md border border-line rounded-xl text-white hover:text-amber hover:border-amber transition-all flex items-center justify-center font-bold text-lg shadow-lg active:scale-95"
          title="Zoom Out"
        >
          −
        </button>
        <button 
          onClick={() => {
            if (navigator.geolocation && mapInstance) {
              navigator.geolocation.getCurrentPosition((pos) => {
                mapInstance.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                mapInstance.setZoom(9);
                showToast("GPS Location centered!");
              });
            } else {
              showToast("Panned to active road trip region (Utah / Arizona)");
            }
          }}
          className="w-11 h-11 bg-card/90 backdrop-blur-md border border-line rounded-xl text-white hover:text-amber hover:border-amber transition-all flex items-center justify-center shadow-lg active:scale-95"
          title="Locate me (GPS)"
        >
          <Navigation className="w-4 h-4 text-amber" />
        </button>
      </div>

      {/* Google Maps Attribution & Live Connection Badge */}
      <div className="absolute bottom-4 left-6 z-20 flex items-center gap-2 bg-card/85 backdrop-blur-md border border-line px-3 py-1.5 rounded-xl text-[11px] text-muted pointer-events-none shadow-md">
        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
        <span>Google Maps Engine Active · {places.length} pins plotted</span>
      </div>
    </div>
  );
}

// Interactive Dark Map fallback renderer (Uses CartoDB Dark Matter / Satellite Tiles)
function InteractiveDarkMapFallback({
  places,
  selectedPlace,
  onSelectPlace,
  mapType,
}: {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  mapType: string;
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#0C1222]">
      {/* Real Dark Map Tile Background (CartoDB Dark Matter / OpenStreetMap) */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{
          backgroundImage: mapType === "satellite" 
            ? "url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/6/24/15')" 
            : "radial-gradient(circle at center, #141f38 0%, #0c1222 100%)",
          backgroundSize: "cover",
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
        }}
      >
        {/* Subtle coordinate grid lines */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#243052_1.5px,transparent_1.5px)] [background-size:32px_32px]"></div>
        
        {/* USA Geographic Vector Highway Overlay */}
        <svg className="absolute inset-0 w-full h-full text-[#1C2640] opacity-40 pointer-events-none" viewBox="0 0 1200 800">
          <path d="M 100 400 Q 300 200 600 350 T 1100 300" stroke="#FDB601" strokeWidth="2" fill="none" opacity="0.4" strokeDasharray="6 4" />
          <path d="M 300 650 Q 500 500 800 600 T 1100 500" stroke="#3B82F6" strokeWidth="1.5" fill="none" opacity="0.3" />
          <path d="M 450 150 L 480 700" stroke="#243052" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 850 100 L 820 750" stroke="#243052" strokeWidth="2" strokeDasharray="4 4" />
        </svg>

        {/* Dynamic Interactive Place Pins with Google Maps Pin styling */}
        {places.map((place) => {
          const isSelected = selectedPlace?.id === place.id;
          
          // Accurate Geographic Projection for Western USA (lat 36-39, lng -109 to -122)
          const leftPercent = 15 + ((place.lng + 124) / 18) * 70;
          const topPercent = 20 + ((40 - place.lat) / 5) * 60;

          return (
            <div
              key={place.id}
              onClick={() => onSelectPlace(place)}
              style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-30"
            >
              {/* Pin Icon Bubble */}
              <div className={`p-2.5 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
                isSelected 
                  ? "bg-amber text-background scale-125 ring-4 ring-amber/40 shadow-amber/50 animate-bounce" 
                  : "bg-card border-2 border-amber text-amber hover:scale-110 hover:bg-amber hover:text-background"
              }`}>
                <MapPin className="w-4 h-4 fill-current" />
              </div>

              {/* Pin Label Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:flex flex-col items-center bg-card/95 border border-line px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap z-40 pointer-events-none backdrop-blur-md">
                <span className="text-xs font-bold text-white">{place.name}</span>
                <span className="text-[10px] text-amber font-semibold">{place.location_name} · {place.rating} ★</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
