"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Heart, MapPin, Send } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  story?: { author: string; caption: string; time: string; image_url?: string | null };
}

export default function StoryViewerModal({ isOpen, onClose, story }: StoryViewerModalProps) {
  const { showToast } = useToast();
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState("");
  const view = {
    name: story?.author || "Traveler",
    text: story?.caption || "",
    time: story?.time || "",
    image: story?.image_url || "",
    avatarColor: "bg-amber",
  };

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
    showToast(`Reply noted for ${view.name}`);
    setReplyText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative max-w-sm w-full h-[min(640px,90dvh)] bg-gradient-to-b from-[#141C33] to-[#0C1222] border border-line rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-5"
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
              <div className={`w-10 h-10 rounded-full ${view.avatarColor} flex items-center justify-center font-bold text-white text-sm`}>
                {view.name[0]}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{view.name}</h4>
                <p className="text-[11px] text-muted flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber" /> {view.time}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted hover:text-white p-2 rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="my-auto relative rounded-2xl overflow-hidden border border-line/60 min-h-[280px] flex items-end">
          {view.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={view.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-line/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="relative z-10 p-5 w-full">
            <p className="text-sm font-medium text-white leading-relaxed">"{view.text}"</p>
            <span className="text-[11px] text-amber mt-2 inline-block font-semibold">📍 On the road</span>
          </div>
        </div>

        {/* Bottom Reply Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
            placeholder={`Reply to ${view.name}...`}
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
