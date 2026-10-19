"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Heart, MapPin, Send } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyUser?: string;
}

export default function StoryViewerModal({ isOpen, onClose, storyUser = "Sarah" }: StoryViewerModalProps) {
  const { showToast } = useToast();
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState("");

  const storiesData: Record<string, any> = {
    Sarah: {
      name: "Sarah Adventures",
      location: "Horseshoe Bend Overlook, AZ",
      time: "2h ago",
      text: "Caught the first light hitting the Colorado River. Cold morning but totally worth the hike!",
      avatarColor: "bg-[#10B981]",
    },
    JohnRV: {
      name: "JohnRV",
      location: "Moab Slickrock Trail, UT",
      time: "4h ago",
      text: "Rig handled Hell's Revenge like a champ. Setting up campfire for the evening talk.",
      avatarColor: "bg-[#5271FF]",
    },
    "OffRoad Joe": {
      name: "OffRoad Joe",
      location: "San Juan National Forest, CO",
      time: "6h ago",
      text: "Dispersed campsite at 9,500 ft elevation. Fall colors are peaking right now.",
      avatarColor: "bg-[#F43F5E]",
    },
  };

  const story = storiesData[storyUser] || storiesData.Sarah;

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onClose();
          return 100;
        }
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    showToast(`Reply sent to ${story.name}!`);
    setReplyText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative max-w-sm w-full h-[640px] bg-gradient-to-b from-[#141C33] to-[#0C1222] border border-line rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Progress Bar */}
        <div>
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-amber transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>

          {/* User Info Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${story.avatarColor} flex items-center justify-center font-bold text-white text-sm`}>
                {story.name[0]}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{story.name}</h4>
                <p className="text-[11px] text-muted flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber" /> {story.location} · {story.time}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted hover:text-white p-2 rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Content Placeholder */}
        <div className="my-auto bg-line/40 rounded-2xl p-6 text-center border border-line/60">
          <p className="text-sm font-medium text-white leading-relaxed">
            "{story.text}"
          </p>
          <span className="text-[11px] text-amber mt-3 inline-block font-semibold">
            📍 Captured live on RoadTraveler
          </span>
        </div>

        {/* Bottom Reply Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
            placeholder={`Reply to ${story.name}...`}
            className="flex-1 bg-background/80 border border-line rounded-full px-4 py-2.5 text-xs text-white placeholder:text-muted focus:outline-none focus:border-amber"
          />
          <button
            onClick={handleSendReply}
            className="p-2.5 bg-amber text-background rounded-full hover:scale-105 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
