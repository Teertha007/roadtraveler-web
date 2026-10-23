"use client";

import React, { useEffect, useState } from "react";
import { Bell, Heart, Calendar, Award, Check, MessageSquare, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPopover({ isOpen, onClose }: NotificationsPopoverProps) {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<{ id: string; text: string; time: string; read: boolean }[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/notifications").then((r) => r.json()).then((json) => {
      if (json.success) setNotifications(json.data);
    }).catch(() => setNotifications([]));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-16 right-16 w-84 bg-card border border-line rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber" />
          <h4 className="font-bold text-sm text-white">Notifications</h4>
        </div>
        <button 
          onClick={async () => {
            await fetch("/api/notifications", { method: "POST" });
            setNotifications(notifications.map((n) => ({ ...n, read: true })));
            showToast("Marked as read");
          }}
          className="text-[11px] text-amber hover:underline font-medium"
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-line/40">
        {notifications.map((n) => (
          <div 
            key={n.id}
            className={`p-3.5 flex items-start gap-3 hover:bg-line/40 transition-colors cursor-pointer ${
              !n.read ? "bg-amber/5" : ""
            }`}
          >
            <div className="p-2 rounded-xl bg-background border border-line shrink-0 mt-0.5">
              <Bell className="w-4 h-4 text-amber" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white leading-relaxed">{n.text}</p>
              <span className="text-[10px] text-muted mt-1 block">{n.time}</span>
            </div>
            {!n.read && <span className="w-2 h-2 rounded-full bg-amber shrink-0 mt-2"></span>}
          </div>
        ))}
      </div>

      <div className="p-3 bg-background/50 border-t border-line text-center">
        <span className="text-[11px] text-muted">Stay connected with your fellow road travelers</span>
      </div>
    </div>
  );
}
