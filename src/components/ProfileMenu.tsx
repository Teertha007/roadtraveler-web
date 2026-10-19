"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Route, ShieldCheck, LogOut } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const { showToast } = useToast();
  const [user, setUser] = useState<{ display_name: string; username: string; points: number; badge_count: number } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((json) => setUser(json.success ? json.data : null))
      .catch(() => setUser(null));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-16 right-6 w-64 bg-card border border-line rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b border-line flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#5271FF] flex items-center justify-center font-bold text-white text-sm">
          {(user?.display_name || "?").slice(0, 1)}
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-sm text-white truncate">{user?.display_name || "Guest"}</h4>
          <span className="text-[11px] text-amber font-semibold">
            {user ? `${user.badge_count} badges · ${user.points} pts` : "Not signed in"}
          </span>
        </div>
      </div>

      <div className="p-2 flex flex-col gap-1 text-xs">
        <Link 
          href="/community"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-white hover:bg-line/50 hover:text-amber transition-colors"
        >
          <Award className="w-4 h-4 text-amber" />
          <span>My Badges & Points</span>
        </Link>
        <Link 
          href="/trips"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-white hover:bg-line/50 hover:text-amber transition-colors"
        >
          <Route className="w-4 h-4 text-[#10B981]" />
          <span>My Planned Trips</span>
        </Link>
        <Link 
          href="/explore"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-white hover:bg-line/50 hover:text-amber transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Claimed Listings</span>
        </Link>
        {!user && (
          <Link href="/login" onClick={onClose} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber hover:bg-line/50 transition-colors">
            Sign in
          </Link>
        )}
      </div>

      <div className="p-2 border-t border-line bg-background/40">
        <button 
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
            showToast("Signed out");
            onClose();
            window.location.href = "/";
          }}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-xs font-semibold"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
