"use client";

import React, { useState } from "react";
import { X, Check, SlidersHorizontal, MapPin, DollarSign, Sparkles } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (filters: any) => void;
}

export default function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
  const { showToast } = useToast();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(["pet_friendly"]);
  const [maxDistance, setMaxDistance] = useState(50);
  const [isFreeOnly, setIsFreeOnly] = useState(false);
  const [minRating, setMinRating] = useState(4.0);

  if (!isOpen) return null;

  const amenities = [
    { id: "pet_friendly", label: "Pet-Friendly" },
    { id: "restrooms", label: "Clean Restrooms" },
    { id: "parking", label: "RV / Trailer Parking" },
    { id: "rv_hookups", label: "30A / 50A RV Hookups" },
    { id: "showers", label: "Hot Showers" },
    { id: "potable_water", label: "Potable Water Fill" },
    { id: "free_entry", label: "Free Entry / BLM Land" },
    { id: "wheelchair_accessible", label: "Wheelchair Accessible" },
  ];

  const toggleAmenity = (id: string) => {
    if (selectedAmenities.includes(id)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== id));
    } else {
      setSelectedAmenities([...selectedAmenities, id]);
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply({ selectedAmenities, maxDistance, isFreeOnly, minRating });
    }
    showToast(`Applied ${selectedAmenities.length} amenity filters (${maxDistance} mi radius)`);
    onClose();
  };

  const handleReset = () => {
    setSelectedAmenities([]);
    setMaxDistance(50);
    setIsFreeOnly(false);
    setMinRating(0);
    showToast("Filters reset to default");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-card border border-line rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-amber" />
            <h3 className="font-bold text-lg text-white">Search & Discovery Filters</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* Amenities Multi-select */}
          <div>
            <label className="text-xs font-bold text-amber uppercase tracking-wider block mb-3">
              Essential Amenities
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {amenities.map((item) => {
                const checked = selectedAmenities.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleAmenity(item.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs text-left transition-all ${
                      checked 
                        ? "bg-amber/15 border-amber text-amber font-semibold shadow-sm" 
                        : "bg-background border-line text-muted hover:text-white hover:border-line/80"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                      checked ? "bg-amber border-amber text-background" : "border-line"
                    }`}>
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distance Radius Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-amber uppercase tracking-wider">
                Max Distance (Near Me)
              </label>
              <span className="text-xs font-bold text-white">{maxDistance} miles</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full accent-amber cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted mt-1">
              <span>5 mi</span>
              <span>50 mi (Standard)</span>
              <span>200 mi</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="text-xs font-bold text-amber uppercase tracking-wider block mb-2">
              Minimum Traveler Rating
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 3.0, 4.0, 4.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setMinRating(rate)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    minRating === rate 
                      ? "bg-amber text-background border-amber" 
                      : "bg-background border-line text-muted hover:text-white"
                  }`}
                >
                  {rate === 0 ? "Any Rating" : `${rate}+ ★`}
                </button>
              ))}
            </div>
          </div>

          {/* Free Camping Only Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-line">
            <div>
              <span className="text-sm font-bold text-white block">Free / BLM Dispersed Only</span>
              <span className="text-xs text-muted">Show spots without campground fees</span>
            </div>
            <button
              onClick={() => setIsFreeOnly(!isFreeOnly)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                isFreeOnly ? "bg-amber" : "bg-line"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isFreeOnly ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-line bg-background/50 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs font-bold text-muted hover:text-white transition-colors"
          >
            Reset Filters
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-line text-xs font-bold text-white hover:bg-line/40 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl bg-amber text-background text-xs font-bold hover:bg-amber/90 transition-all shadow-md active:scale-95"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
