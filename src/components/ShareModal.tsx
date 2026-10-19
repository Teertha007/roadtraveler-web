"use client";

import React, { useState } from "react";
import { X, Copy, Check, Share2, Globe, MessageCircle, Send } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  url?: string;
}

export default function ShareModal({ isOpen, onClose, title = "RoadTraveler Post", url = "https://roadtraveler.com/post/1" }: ShareModalProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-card border border-line rounded-3xl max-w-md w-full shadow-2xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber" />
            <h3 className="font-bold text-base text-white">Share with Travelers</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <span className="text-xs text-muted block mb-2 font-medium">Direct Link</span>
          <div className="flex items-center gap-2 bg-background border border-line rounded-xl p-2">
            <input 
              type="text" 
              readOnly 
              value={url}
              className="bg-transparent text-xs text-white flex-1 focus:outline-none px-2 font-mono"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-amber text-background rounded-lg text-xs font-bold hover:bg-amber/90 transition-all flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <button 
            onClick={() => { showToast("Opening Twitter / X share..."); onClose(); }}
            className="p-3 bg-background border border-line rounded-xl flex flex-col items-center gap-2 hover:border-amber transition-colors"
          >
            <Globe className="w-5 h-5 text-blue-400" />
            <span>Twitter / X</span>
          </button>
          <button 
            onClick={() => { showToast("Opening WhatsApp share..."); onClose(); }}
            className="p-3 bg-background border border-line rounded-xl flex flex-col items-center gap-2 hover:border-amber transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-[#10B981]" />
            <span>WhatsApp</span>
          </button>
          <button 
            onClick={() => { showToast("Opening Telegram share..."); onClose(); }}
            className="p-3 bg-background border border-line rounded-xl flex flex-col items-center gap-2 hover:border-amber transition-colors"
          >
            <Send className="w-5 h-5 text-sky-400" />
            <span>Telegram</span>
          </button>
        </div>
      </div>
    </div>
  );
}
