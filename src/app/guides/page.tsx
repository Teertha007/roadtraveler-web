"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import GuideReaderModal from "@/components/GuideReaderModal";
import { useToast } from "@/context/ToastContext";
import { 
  BookOpen, Clock, Bookmark, Share2, Compass, 
  MapPin, Flame, ArrowRight, Tag, Search
} from "lucide-react";

export default function GuidesPage() {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedGuides, setSavedGuides] = useState<number[]>([]);
  const [readingGuide, setReadingGuide] = useState<any | null>(null);

  const guides = [
    {
      id: 1,
      title: "The Ultimate Guide to BLM Dispersed Camping in Utah & Arizona",
      excerpt: "Everything you need to know about the 14-day limit, finding water fill-ups, handling gray water responsibly, and using offline maps in remote red rock territory.",
      category: "Boondocking",
      readTime: "8 min read",
      author: "Sarah Adventures",
      authorColor: "bg-[#10B981]",
      date: "Oct 2026",
      featured: true,
      imageText: "BLM Land · Free Dispersed Camping",
    },
    {
      id: 2,
      title: "Winter Vanlife Survival: Heating, Insulation & Battery Care",
      excerpt: "How to safely run diesel heaters, protect your lithium iron phosphate (LiFePO4) battery bank from freezing charge cycles, and insulate windows against drafts.",
      category: "Vanlife 101",
      readTime: "6 min read",
      author: "JohnRV",
      authorColor: "bg-[#5271FF]",
      date: "Sep 2026",
      imageText: "Winter RVing & Sub-Zero Tips",
    },
    {
      id: 3,
      title: "Pacific Coast Highway (Highway 1) Route Itinerary: San Francisco to Big Sur",
      excerpt: "Turn-by-turn breakdown of the most scenic coastal pullouts, campground reservations at Pfeiffer Big Sur, and where to grab fresh seafood along the route.",
      category: "Route Guides",
      readTime: "12 min read",
      author: "Mike on the Road",
      authorColor: "bg-[#3B82F6]",
      date: "Aug 2026",
      imageText: "California Coastline Itinerary",
    },
    {
      id: 4,
      title: "How to Legally and Safely Camp Overnight at Rest Stops and Truck Stops",
      excerpt: "State-by-state laws on 8-hour sleep rules at highway rest areas, Pilot/Flying J truck stop etiquette, and staying safe overnight.",
      category: "Overnight Tips",
      readTime: "5 min read",
      author: "OffRoad Joe",
      authorColor: "bg-[#F43F5E]",
      date: "Aug 2026",
      imageText: "Rest Stop Rules & Etiquette",
    },
  ];

  const toggleSave = (id: number) => {
    if (savedGuides.includes(id)) {
      setSavedGuides(savedGuides.filter(g => g !== id));
      showToast("Removed from bookmarks", "info");
    } else {
      setSavedGuides([...savedGuides, id]);
      showToast("Guide bookmarked to your reading list!");
    }
  };

  const filteredGuides = guides.filter(g => {
    const matchesCat = activeCategory === "all" || g.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = !searchQuery || g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
            
            {/* Hero Header */}
            <div className="bg-card border border-line rounded-3xl p-8 flex items-center justify-between">
              <div className="max-w-[700px]">
                <span className="text-amber text-xs font-bold uppercase tracking-widest">Field Journal & Advice</span>
                <h1 className="text-3xl font-bold text-white mt-1">Practical Outdoor Road Guides</h1>
                <p className="text-muted text-sm mt-1">
                  In-depth tutorials, route itineraries, boondocking locations, and gear essentials written by experienced overlanders.
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-amber/15 text-amber flex items-center justify-center shrink-0 border border-amber/30">
                <BookOpen className="w-8 h-8" />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 border-b border-line pb-4 overflow-x-auto no-scrollbar">
              {["all", "Boondocking", "Vanlife 101", "Route Guides", "Overnight Tips"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); showToast(`Category: ${cat}`); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeCategory === cat 
                      ? "bg-amber text-background shadow-md" 
                      : "bg-card border border-line text-muted hover:text-white"
                  }`}
                >
                  {cat === "all" ? "All Field Guides" : cat}
                </button>
              ))}
            </div>

            {/* Featured Guide */}
            {filteredGuides.length > 0 && (
              <div className="bg-card border border-line rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 hover:border-amber/50 transition-all group">
                <div 
                  onClick={() => setReadingGuide(filteredGuides[0])}
                  className="aspect-[16/10] bg-line relative flex items-end p-6 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  <span className="absolute top-4 left-4 bg-amber text-background px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                    Featured Guide
                  </span>
                  <div className="z-10 text-white font-medium text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber" /> {filteredGuides[0].imageText}
                  </div>
                </div>

                <div className="p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-muted mb-3">
                      <span className="text-amber font-bold">{filteredGuides[0].category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {filteredGuides[0].readTime}</span>
                      <span>·</span>
                      <span>{filteredGuides[0].date}</span>
                    </div>

                    <h2 
                      onClick={() => setReadingGuide(filteredGuides[0])}
                      className="text-2xl font-bold text-white group-hover:text-amber transition-colors mb-3 cursor-pointer"
                    >
                      {filteredGuides[0].title}
                    </h2>
                    <p className="text-sm text-[#D1D5DB] leading-relaxed mb-6">
                      {filteredGuides[0].excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-line">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${filteredGuides[0].authorColor} flex items-center justify-center text-xs font-bold text-white`}>
                        {filteredGuides[0].author[0]}
                      </div>
                      <span className="text-xs font-bold text-white">{filteredGuides[0].author}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleSave(filteredGuides[0].id)}
                        className={`p-2 rounded-full border transition-all ${
                          savedGuides.includes(filteredGuides[0].id) 
                            ? "bg-amber text-background border-amber" 
                            : "bg-background border-line text-muted hover:text-white"
                        }`}
                        title="Bookmark guide"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setReadingGuide(filteredGuides[0])}
                        className="bg-amber text-background px-5 py-2 rounded-full text-xs font-bold hover:bg-amber/90 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 shadow-sm"
                      >
                        Read full guide <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Guides Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.slice(1).map((guide) => {
                const isSaved = savedGuides.includes(guide.id);
                return (
                  <div key={guide.id} className="bg-card border border-line rounded-2xl p-6 flex flex-col justify-between hover:border-amber/40 transition-all hover:shadow-xl group">
                    <div>
                      <div 
                        onClick={() => setReadingGuide(guide)}
                        className="aspect-[16/9] bg-line rounded-xl mb-4 relative overflow-hidden flex items-end p-4 cursor-pointer"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <span className="absolute top-3 left-3 bg-amber/90 text-background px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {guide.category}
                        </span>
                        <span className="z-10 text-white text-xs font-medium">{guide.imageText}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted mb-2">
                        <Clock className="w-3.5 h-3.5 text-amber" />
                        <span>{guide.readTime}</span>
                        <span>·</span>
                        <span>{guide.date}</span>
                      </div>

                      <h3 
                        onClick={() => setReadingGuide(guide)}
                        className="text-base font-bold text-white group-hover:text-amber transition-colors mb-2 cursor-pointer"
                      >
                        {guide.title}
                      </h3>
                      <p className="text-xs text-muted line-clamp-3 leading-relaxed mb-6">
                        {guide.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-line flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{guide.author}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleSave(guide.id)}
                          className={`p-2 rounded-full border transition-all ${
                            isSaved 
                              ? "bg-amber text-background border-amber" 
                              : "bg-background border-line text-muted hover:text-white"
                          }`}
                          title="Bookmark guide"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setReadingGuide(guide)}
                          className="px-3 py-1.5 bg-background border border-line text-white hover:border-amber rounded-lg text-xs font-semibold"
                        >
                          Read
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Guide Reading Modal */}
      {readingGuide && (
        <GuideReaderModal 
          isOpen={Boolean(readingGuide)} 
          guide={readingGuide} 
          onClose={() => setReadingGuide(null)} 
        />
      )}
    </div>
  );
}
