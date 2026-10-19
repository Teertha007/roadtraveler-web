"use client";

import React, { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapPlace {
  id: string;
  name: string;
  location_name: string;
  lat: number;
  lng: number;
  rating: number;
}

const pin = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:999px;background:#FDB601;border:2px solid #0C1222;box-shadow:0 0 0 4px rgba(253,182,1,.25)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function FlyTo({ place }: { place: MapPlace | null }) {
  const map = useMap();
  useEffect(() => {
    if (place) map.flyTo([place.lat, place.lng], 9, { duration: 0.6 });
  }, [place, map]);
  return null;
}

export default function LeafletMap({
  places,
  selectedPlace,
  onSelectPlace,
}: {
  places: MapPlace[];
  selectedPlace: MapPlace | null;
  onSelectPlace: (place: MapPlace) => void;
}) {
  const center: [number, number] = selectedPlace
    ? [selectedPlace.lat, selectedPlace.lng]
    : places[0]
      ? [places[0].lat, places[0].lng]
      : [39.5, -98.35];

  return (
    <MapContainer center={center} zoom={5} className="h-full w-full" zoomControl={false}>
      <TileLayer
        attribution='&copy; OpenStreetMap &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FlyTo place={selectedPlace} />
      {places.map((place) => (
        <Marker key={place.id} position={[place.lat, place.lng]} icon={pin} eventHandlers={{ click: () => onSelectPlace(place) }}>
          <Popup>
            <strong>{place.name}</strong>
            <br />
            {place.location_name} · {place.rating}★
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
