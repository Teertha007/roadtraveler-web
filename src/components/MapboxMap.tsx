"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export interface MapPlace {
  id: string;
  name: string;
  location_name: string;
  lat: number;
  lng: number;
  rating: number;
}

export default function MapboxMap({
  places,
  selectedPlace,
  onSelectPlace,
  nearMeActive,
  userCoords,
}: {
  places: MapPlace[];
  selectedPlace: MapPlace | null;
  onSelectPlace: (place: MapPlace) => void;
  nearMeActive?: boolean;
  userCoords?: { lat: number; lng: number } | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const onSelectRef = useRef(onSelectPlace);
  onSelectRef.current = onSelectPlace;

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;
    const center: [number, number] = selectedPlace
      ? [selectedPlace.lng, selectedPlace.lat]
      : places[0]
        ? [places[0].lng, places[0].lat]
        : [-98.35, 39.5];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center,
      zoom: selectedPlace ? 8 : 4.2,
      attributionControl: true,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = places.map((place) => {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", place.name);
      el.style.cssText =
        "width:16px;height:16px;border-radius:999px;background:#FDB601;border:2px solid #0C1222;box-shadow:0 0 0 4px rgba(253,182,1,.25);cursor:pointer;padding:0;";
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(place);
      });
      return new mapboxgl.Marker({ element: el }).setLngLat([place.lng, place.lat]).addTo(map);
    });
  }, [places]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlace) return;
    map.flyTo({ center: [selectedPlace.lng, selectedPlace.lat], zoom: 9, essential: true });
  }, [selectedPlace]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !nearMeActive || !userCoords) return;
    map.flyTo({ center: [userCoords.lng, userCoords.lat], zoom: 9, essential: true });
  }, [nearMeActive, userCoords]);

  return <div ref={containerRef} className="h-full w-full" />;
}
