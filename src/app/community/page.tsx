"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { 
  Users, MessageSquare, ThumbsUp, Award, Star, Compass, 
  HelpCircle, ShieldCheck, Flame, Plus, Sparkles, MapPin
} from "lucide-react";

export default function CommunityPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("discussions");
  const [searchQuery, setSearchQuery] = useState("");

  const discussions = [
    {
      id: 1,
      author: "JohnRV",
      avatarColor: "bg-[#5271FF]",
      title: "Best BLM boondocking spots near Moab with reliable Starlink/Cell signal?",
      snippet: "Heading out for 2 weeks of remote work in our Class C rig. Need open sky for dish and good gravel road access...",
      category: "Boondocking",
      replies: 42,
      upvotes: 184,
      time: "3h ago",
    },
    {
      id: 2,
      author: "Sarah Adventures",
      avatarColor: "bg-[#10B981]",
      title: "Winterizing your camper van: 5 mistakes to avoid before freezing temps hit",
      snippet: "Last year we cracked our water pump filter because we forgot to blow out the outdoor shower line. Here is our full checklist...",
      category: "Gear & Maintenance",
      replies: 29,
      upvotes: 215,
      time: "6h ago",
    },
    {
      id: 3,
      author: "OffRoad Joe",
      avatarColor: "bg-[#F43F5E]",
      title: "I-70 Colorado Pass snow chains requirement update (Fall 2026)",
      snippet: "CDOT just issued new commercial and passenger tire traction laws for the Eisenhower Tunnel corridor. Make sure your tires have the 3PMSF symbol...",
      category: "Road Conditions",
      replies: 18,
      upvotes: 98,
      time: "12h ago",
    },
  ];

  useEffect(() => {
    async function loadCommunityData() {
      try {
        const [leaderboardRes, badgesRes] = await Promise.all([
          fetch("/api/leaderboard").then(r => r.json()),
          fetch("/api/badges").then(r => r.json()),
        ]);
        if (leaderboardRes.success) setLeaderboard(leaderboardRes.data);
        if (badgesRes.success) setBadges(badgesRes.data);
      } catch (err) {
        console.error("Failed to load community data:", err);
      }
    }
    loadCommunityData();
  }, []);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
            
            {/* Community Hero Header */}
            <div className="bg-gradient-to-r from-card via-[#1A233F] to-card border border-line rounded-3xl p-8 flex items-center justify-between">
              <div>
                <span className="text-amber text-xs font-bold uppercase tracking-widest">Traveler Network</span>
                <h1 className="text-3xl font-bold text-white mt-1">RoadTraveler Community & Forum</h1>
                <p className="text-muted text-sm mt-1">
                  Ask questions, share advice, review roadside gems, and earn badges as you explore the country.
                </p>
              </div>
              <button className="bg-amber text-background px-6 py-3 rounded-full text-xs font-bold hover:bg-amber/90 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 shadow-md">
                <Plus className="w-4 h-4" /> Start discussion
              </button>
            </div>

            {/* Layout: Main Forum Left (800px) + Right Gamification / Badges (440px) */}
            <div className="flex gap-8">
              
              {/* Left Forum Feed */}
              <div className="flex-1 flex flex-col gap-6">
                
                {/* Forum Tabs */}
                <div className="flex items-center gap-3 border-b border-line pb-3">
                  <button 
                    onClick={() => setActiveTab("discussions")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "discussions" ? "bg-amber text-background" : "text-muted hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2"><Flame className="w-4 h-4 text-amber" /> Trending Topics</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab("questions")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "questions" ? "bg-amber text-background" : "text-muted hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Q&A Help</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab("all_badges")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "all_badges" ? "bg-amber text-background" : "text-muted hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2"><Award className="w-4 h-4" /> All 28 Badges</span>
                  </button>
                </div>

                {activeTab !== "all_badges" ? (
                  discussions.map((item) => (
                    <div key={item.id} className="bg-card border border-line rounded-2xl p-6 hover:border-amber/40 transition-all hover:shadow-lg cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${item.avatarColor} flex items-center justify-center text-xs font-bold text-white`}>
                            {item.author[0]}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-white">{item.author}</span>
                            <span className="text-xs text-muted ml-2">· {item.time}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-background border border-line text-amber px-2.5 py-1 rounded-full">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 hover:text-amber transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#D1D5DB] leading-relaxed mb-4">
                        {item.snippet}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-line text-xs text-muted">
                        <div className="flex items-center gap-6">
                          <span className="flex items-center gap-1.5 hover:text-amber transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5" /> {item.upvotes} upvotes
                          </span>
                          <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <MessageSquare className="w-3.5 h-3.5" /> {item.replies} responses
                          </span>
                        </div>
                        <span className="text-amber hover:underline font-bold text-xs">Join discussion →</span>
                      </div>
                    </div>
                  ))
                ) : (
                  /* 28 Badges Showcase Grid */
                  <div className="grid grid-cols-2 gap-4">
                    {badges.map((badge) => (
                      <div key={badge.id} className="bg-card border border-line rounded-2xl p-4 flex items-start gap-4 hover:border-amber/50 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-amber/15 text-amber border border-amber/30 flex items-center justify-center shrink-0">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{badge.label}</h4>
                          <p className="text-xs text-muted mt-1 leading-tight">{badge.description}</p>
                          <span className="text-[10px] font-bold text-amber uppercase tracking-wider mt-2 inline-block">
                            Group: {badge.group}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Right Leaderboard & Badges Column */}
              <div className="w-[420px] shrink-0 flex flex-col gap-6">
                
                {/* Leaderboard Card */}
                <div className="bg-card border border-line rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-white">Top Community Travelers</h3>
                      <p className="text-xs text-muted">Earn points for reviews, listings & helpful posts</p>
                    </div>
                    <Award className="w-5 h-5 text-amber" />
                  </div>

                  <div className="flex flex-col gap-3">
                    {leaderboard.map((user) => (
                      <div key={user.rank} className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-line/30 transition-colors">
                        <span className={`text-sm font-bold w-4 ${user.rank === 1 ? 'text-amber' : 'text-muted'}`}>
                          {user.rank}
                        </span>
                        <div className={`w-9 h-9 rounded-full ${user.color || 'bg-amber-600'} flex items-center justify-center text-white text-xs font-bold`}>
                          {user.initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm text-white truncate">{user.name}</h5>
                          <span className="text-[11px] text-muted">{user.badgeCount || 8} badges unlocked</span>
                        </div>
                        <span className="text-xs font-bold text-amber shrink-0">{user.points}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Badges Showcase Info Card */}
                <div className="bg-gradient-to-b from-card to-background border border-line rounded-2xl p-6">
                  <div className="flex items-center gap-3 text-amber mb-2">
                    <Sparkles className="w-5 h-5" />
                    <h4 className="font-bold text-white text-sm">Badge Progression</h4>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    RoadTraveler features 28 milestone badges across reviews, photography, place exploration, and member loyalty. Showcase up to 4 badges next to your name!
                  </p>
                  <button 
                    onClick={() => setActiveTab("all_badges")}
                    className="w-full mt-4 py-2.5 bg-line text-white rounded-xl text-xs font-bold hover:bg-line/80 transition-colors"
                  >
                    View All 28 Badges
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
