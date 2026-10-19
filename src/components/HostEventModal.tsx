"use client";

import React, { useState } from "react";
import { X, Calendar, MapPin, Plus, Clock, Users } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface HostEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: (event: any) => void;
}

export default function HostEventModal({ isOpen, onClose, onEventCreated }: HostEventModalProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      showToast("Please provide event title and location", "error");
      return;
    }

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, location, date, description }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          showToast(json.error || "Sign in to host an event", "error");
          return;
        }
        if (onEventCreated) onEventCreated(json.data);
        showToast(`"${title}" is on the events list`);
        onClose();
      });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-card border border-line rounded-3xl max-w-lg w-full shadow-2xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber" />
            <h3 className="font-bold text-base text-white">Host a Road Gathering</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-white block mb-1">Event Title</label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Arizona Desert Star Party & Campfire"
              className="w-full bg-background border border-line rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-white block mb-1">Location / Campground</label>
            <input 
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Sedona BLM Dispersed Area, AZ"
              className="w-full bg-background border border-line rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-white block mb-1">Date & Time</label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-background border border-line rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-white block mb-1">Description & Details</label>
            <textarea 
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share details about camping, high clearance requirements, group size, and campfire gear..."
              className="w-full bg-background border border-line rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber text-background rounded-xl text-xs font-bold hover:bg-amber/90 transition-all shadow-md active:scale-95"
            >
              Publish Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
