"use client";

import React, { useState } from "react";
import { X, Route, Plus, Check, MapPin } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface AddToTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeName?: string;
  placeLocation?: string;
}

export default function AddToTripModal({ isOpen, onClose, placeName = "Horseshoe Bend Overlook", placeLocation = "Page, AZ" }: AddToTripModalProps) {
  const { showToast } = useToast();
  const [selectedTrip, setSelectedTrip] = useState("trip-1");
  const [newTripName, setNewTripName] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  if (!isOpen) return null;

  const existingTrips = [
    { id: "trip-1", title: "Southwest Red Rock Discovery", stops: 4, days: "6 Days" },
    { id: "trip-2", title: "Pacific Coast Highway (Highway 1)", stops: 7, days: "10 Days" },
    { id: "trip-3", title: "Colorado Fall Colors Loop", stops: 3, days: "4 Days" },
  ];

  const handleSaveToTrip = () => {
    const targetTitle = isCreatingNew 
      ? newTripName || "New Road Adventure"
      : existingTrips.find(t => t.id === selectedTrip)?.title;

    showToast(`Added "${placeName}" to ${targetTitle}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-card border border-line rounded-3xl max-w-md w-full shadow-2xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-amber" />
            <h3 className="font-bold text-base text-white">Add Place to Trip</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Place Badge */}
        <div className="p-3 bg-background border border-line rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber/15 text-amber flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-white truncate">{placeName}</h4>
            <span className="text-[10px] text-muted">{placeLocation}</span>
          </div>
        </div>

        {/* Trip Picker */}
        <div>
          <span className="text-xs font-bold text-amber uppercase tracking-wider block mb-3">
            Select Itinerary
          </span>

          <div className="flex flex-col gap-2">
            {existingTrips.map((trip) => {
              const isSelected = selectedTrip === trip.id && !isCreatingNew;
              return (
                <div
                  key={trip.id}
                  onClick={() => { setSelectedTrip(trip.id); setIsCreatingNew(false); }}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-amber/15 border-amber text-amber font-bold" 
                      : "bg-background/60 border-line text-muted hover:text-white hover:border-line/80"
                  }`}
                >
                  <div>
                    <h5 className="text-xs text-white">{trip.title}</h5>
                    <span className="text-[10px] text-muted">{trip.stops} stops · {trip.days}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber" />}
                </div>
              );
            })}
          </div>

          {/* Create New Trip Option */}
          <div className="mt-3">
            {isCreatingNew ? (
              <input
                type="text"
                autoFocus
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                placeholder="Enter new trip name (e.g. Utah National Parks)..."
                className="w-full bg-background border border-amber rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            ) : (
              <button
                onClick={() => setIsCreatingNew(true)}
                className="flex items-center gap-2 text-xs text-amber hover:underline font-bold mt-2"
              >
                <Plus className="w-4 h-4" /> Create a new trip itinerary
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-line">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-muted hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveToTrip}
            className="px-6 py-2.5 rounded-xl bg-amber text-background text-xs font-bold hover:bg-amber/90 transition-all shadow-md active:scale-95"
          >
            Add to Itinerary
          </button>
        </div>
      </div>
    </div>
  );
}
