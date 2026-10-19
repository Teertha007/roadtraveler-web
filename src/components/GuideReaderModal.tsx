"use client";

import React from "react";
import { X, Clock, Bookmark, Share2, MapPin, CheckCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface GuideReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  guide?: any;
}

export default function GuideReaderModal({ isOpen, onClose, guide }: GuideReaderModalProps) {
  const { showToast } = useToast();

  if (!isOpen || !guide) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-card border border-line rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider bg-amber text-background px-2.5 py-0.5 rounded-md">
              {guide.category}
            </span>
            <span className="text-xs text-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {guide.readTime}
            </span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-3">{guide.title}</h1>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span>By <strong className="text-white">{guide.author}</strong></span>
              <span>·</span>
              <span>Published {guide.date}</span>
            </div>
          </div>

          <div className="aspect-[16/9] bg-line rounded-2xl relative overflow-hidden flex items-end p-6">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <span className="z-10 text-white text-sm font-medium flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber" /> {guide.imageText}
            </span>
          </div>

          <div className="text-sm text-[#D1D5DB] leading-relaxed flex flex-col gap-4 font-normal">
            <p>
              {guide.excerpt}
            </p>
            <h3 className="text-lg font-bold text-white mt-2">1. Understanding BLM Regulations</h3>
            <p>
              The Bureau of Land Management (BLM) allows free dispersed camping on millions of acres across the American West. The golden rule is the 14-day limit: you may camp in a single spot for up to 14 days within any 28-day period before needing to move at least 25 miles away.
            </p>
            <h3 className="text-lg font-bold text-white mt-2">2. Water & Power Management</h3>
            <p>
              Always top off your freshwater tank in town before heading down dirt washboards. Carry a portable 5-gallon backup jug, and ensure your solar panels or alternator chargers are clean from dust.
            </p>
            <h3 className="text-lg font-bold text-white mt-2">3. Leave No Trace Etiquette</h3>
            <p>
              Pack out every scrap of trash, use established rock campfire rings where fires are legally permitted, and respect quiet hours under the dark sky.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-line bg-background/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => showToast("Guide added to your saved reading list!")}
              className="px-4 py-2 bg-card border border-line rounded-xl text-xs font-bold text-white hover:border-amber transition-colors flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4 text-amber" /> Bookmark Guide
            </button>
            <button 
              onClick={() => showToast("Guide link copied to clipboard!")}
              className="p-2 text-muted hover:text-white rounded-xl hover:bg-line/40 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-amber text-background rounded-xl text-xs font-bold hover:bg-amber/90 transition-all shadow-md active:scale-95"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
}
