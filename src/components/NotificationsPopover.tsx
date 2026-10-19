"use client";

import React from "react";
import { Bell, Heart, Calendar, Award, Check, MessageSquare, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPopover({ isOpen, onClose }: NotificationsPopoverProps) {
  const { showToast } = useToast();

  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      icon: <Heart className="w-4 h-4 text-red-400" />,
      text: "Sarah Adventures liked your post about Horseshoe Bend",
      time: "15m ago",
      unread: true,
    },
    {
      id: 2,
      icon: <Award className="w-4 h-4 text-amber" />,
      text: "You unlocked the 'Explorer' badge! (Reviewed 3 places)",
      time: "2h ago",
      unread: true,
    },
    {
      id: 3,
      icon: <Calendar className="w-4 h-4 text-[#10B981]" />,
      text: "Reminder: Moab Overland Fest starts this Saturday",
      time: "1d ago",
      unread: false,
    },
    {
      id: 4,
      icon: <MessageSquare className="w-4 h-4 text-blue-400" />,
      text: "JohnRV replied to your question in the Community Forum",
      time: "2d ago",
      unread: false,
    },
  ];

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
          onClick={() => {
            showToast("All notifications marked as read!");
            onClose();
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
              n.unread ? "bg-amber/5" : ""
            }`}
          >
            <div className="p-2 rounded-xl bg-background border border-line shrink-0 mt-0.5">
              {n.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white leading-relaxed">{n.text}</p>
              <span className="text-[10px] text-muted mt-1 block">{n.time}</span>
            </div>
            {n.unread && <span className="w-2 h-2 rounded-full bg-amber shrink-0 mt-2"></span>}
          </div>
        ))}
      </div>

      <div className="p-3 bg-background/50 border-t border-line text-center">
        <span className="text-[11px] text-muted">Stay connected with your fellow road travelers</span>
      </div>
    </div>
  );
}
