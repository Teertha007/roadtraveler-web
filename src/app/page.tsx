"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StoryViewerModal from "@/components/StoryViewerModal";
import CommentsModal from "@/components/CommentsModal";
import ShareModal from "@/components/ShareModal";
import AddToTripModal from "@/components/AddToTripModal";
import { useToast } from "@/context/ToastContext";
import { 
  MapPin, Tent, Caravan, Trees, Map, Heart, Compass, Calendar, 
  Users, BookOpen, Route, Plus, MessageSquare, Share2, Bookmark, 
  CheckCircle2, XCircle, MoreHorizontal, Image as ImageIcon, Loader2,
  Check, Flame, Sparkles
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { showToast } = useToast();

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [postText, setPostText] = useState("");
  const [composerTag, setComposerTag] = useState("#RoadTraveler");
  const [composerAttachment, setComposerAttachment] = useState<string | null>(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Modals state
  const [activeStoryUser, setActiveStoryUser] = useState<string | null>(null);
  const [activeCommentPost, setActiveCommentPost] = useState<any | null>(null);
  const [activeSharePost, setActiveSharePost] = useState<any | null>(null);
  const [activeTripPlace, setActiveTripPlace] = useState<any | null>(null);

  // Backend connected state
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  // Fetch posts from Backend API
  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (activeFilters.length > 0) params.append("tag", activeFilters[0]);

      const res = await fetch(`/api/posts?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setFeedPosts(json.data);
      }
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Fetch Leaderboard and Events from Backend API
  useEffect(() => {
    async function loadSidebarData() {
      try {
        const [leaderboardRes, eventsRes] = await Promise.all([
          fetch("/api/leaderboard").then(r => r.json()),
          fetch("/api/events").then(r => r.json())
        ]);
        if (leaderboardRes.success) setLeaderboard(leaderboardRes.data);
        if (eventsRes.success) setEvents(eventsRes.data);
      } catch (err) {
        console.error("Error loading sidebar data:", err);
      }
    }
    loadSidebarData();
  }, []);

  // Re-fetch posts when filters or search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilters]);

  // Logic to toggle filter chips
  const toggleFilter = (label: string) => {
    if (activeFilters.includes(label)) {
      setActiveFilters(activeFilters.filter(f => f !== label));
      showToast(`Removed filter: ${label}`, "info");
    } else {
      setActiveFilters([...activeFilters, label]);
      showToast(`Filter applied: ${label}`);
    }
  };

  // Logic to post a new update via Backend API
  const handlePost = async () => {
    if (!postText.trim() || isPosting) return;
    
    setIsPosting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: "Teertha (You)",
          location: nearMeActive ? "Near Current Location" : "On the road",
          title: postText.slice(0, 45) + (postText.length > 45 ? "..." : ""),
          text: postText + (composerAttachment ? `\n[Attached: ${composerAttachment}]` : ""),
          tag: composerTag
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setFeedPosts([json.data, ...feedPosts]);
        setPostText("");
        setComposerAttachment(null);
        showToast("Road update posted to the community feed!");
      }
    } catch (err) {
      console.error("Failed to create post:", err);
      showToast("Could not publish post. Try again.", "error");
    } finally {
      setIsPosting(false);
    }
  };

  // Near Me handler
  const handleNearMeToggle = () => {
    if (!nearMeActive) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            setNearMeActive(true);
            showToast("GPS Active: Filtering within 50 miles");
            try {
              const res = await fetch(`/api/events?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=50`);
              const json = await res.json();
              if (json.success) setEvents(json.data);
            } catch (err) {
              console.error(err);
            }
          },
          () => {
            setNearMeActive(true);
            showToast("Near Me mode active (50 mi radius)");
          }
        );
      } else {
        setNearMeActive(true);
        showToast("Near Me mode active");
      }
    } else {
      setNearMeActive(false);
      showToast("Near Me mode deactivated", "info");
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-background text-foreground">
      {/* Left Sidebar */}
      <Sidebar onAddPostClick={() => document.getElementById("composer-input")?.focus()} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilters={activeFilters}
          toggleFilter={toggleFilter}
          nearMeActive={nearMeActive}
          onNearMeToggle={handleNearMeToggle}
          onNewPostClick={() => document.getElementById("composer-input")?.focus()}
        />

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-center w-full min-w-0">
            <div className="flex w-full max-w-[1280px] px-8 py-8 gap-10">
              
              {/* Feed Column (780px) */}
              <div className="flex-1 max-w-[780px] min-w-0 flex flex-col gap-6">
                
                {/* Stories Row */}
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar items-center">
                  <StoryItem 
                    add 
                    onClick={() => {
                      showToast("Click 'Photo' or 'New post' to publish a story to your profile!");
                      document.getElementById("composer-input")?.focus();
                    }} 
                  />
                  <StoryItem name="Sarah" hasRing imgColor="bg-[#10B981]" onClick={() => setActiveStoryUser("Sarah")} />
                  <StoryItem name="JohnRV" hasRing imgColor="bg-[#5271FF]" onClick={() => setActiveStoryUser("JohnRV")} />
                  <StoryItem name="OffRoad Joe" imgColor="bg-[#F43F5E]" onClick={() => setActiveStoryUser("OffRoad Joe")} />
                  <StoryItem name="Family Tra..." imgColor="bg-[#EAB308]" onClick={() => setActiveStoryUser("Sarah")} />
                  <StoryItem name="Mike" imgColor="bg-[#3B82F6]" onClick={() => setActiveStoryUser("JohnRV")} />
                  <StoryItem name="Camp Cook" imgColor="bg-[#F97316]" onClick={() => setActiveStoryUser("OffRoad Joe")} />
                  <StoryItem name="Trailer Li..." imgColor="bg-[#8B5CF6]" onClick={() => setActiveStoryUser("Sarah")} />
                </div>

                {/* Composer */}
                <div className="bg-card border border-line rounded-2xl p-4 flex flex-col gap-4 focus-within:border-amber/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#5271FF] shrink-0 flex items-center justify-center text-sm font-bold text-white">T</div>
                    <input 
                      id="composer-input"
                      type="text" 
                      value={postText}
                      onChange={(e) => setPostText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePost()}
                      placeholder="What did you find on the road, Teertha?"
                      className="bg-background border border-line rounded-full px-4 py-2.5 flex-1 text-sm focus:outline-none focus:border-amber/50 placeholder:text-muted text-white transition-colors"
                    />
                  </div>

                  {/* Attachment Pill if active */}
                  {composerAttachment && (
                    <div className="flex items-center gap-2 bg-amber/10 border border-amber/30 text-amber text-xs px-3 py-1.5 rounded-xl w-fit">
                      <span>Attached: <strong>{composerAttachment}</strong></span>
                      <button onClick={() => setComposerAttachment(null)} className="hover:text-white">✕</button>
                    </div>
                  )}

                  <div className="flex items-center justify-between ml-13">
                    <div className="flex gap-4 text-xs text-muted">
                      <button 
                        onClick={() => {
                          setComposerAttachment("photo_overlook_4k.jpg");
                          showToast("Photo attached to post!");
                        }}
                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <ImageIcon className="w-4 h-4 text-amber"/> Photo
                      </button>
                      <button 
                        onClick={() => {
                          setComposerAttachment("Horseshoe Bend Overlook, AZ");
                          showToast("Location tagged: Horseshoe Bend Overlook");
                        }}
                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-[#10B981]"/> Place
                      </button>
                      <button 
                        onClick={() => {
                          setComposerTag("#Event");
                          setComposerAttachment("Moab Overland Fest 2026");
                          showToast("Event tagged: Moab Overland Fest");
                        }}
                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-purple-400"/> Event
                      </button>
                      <button 
                        onClick={() => {
                          setComposerAttachment("Stop #3 in Southwest Itinerary");
                          showToast("Linked to Trip Planner");
                        }}
                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <Route className="w-4 h-4 text-blue-400"/> Trip stop
                      </button>
                    </div>
                    <button 
                      onClick={handlePost}
                      disabled={!postText.trim() || isPosting}
                      className={`text-background text-xs font-bold px-6 py-2 rounded-full transition-all active:scale-95 flex items-center gap-2 ${postText.trim() && !isPosting ? 'bg-amber hover:bg-amber/90 shadow-md' : 'bg-amber/50 cursor-not-allowed'}`}
                    >
                      {isPosting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Post
                    </button>
                  </div>
                </div>

                {/* Feed Posts */}
                {isLoadingPosts ? (
                  <div className="py-12 flex flex-col items-center justify-center text-muted gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-amber" />
                    <span className="text-sm">Loading feed...</span>
                  </div>
                ) : feedPosts.length === 0 ? (
                  <div className="py-12 text-center text-muted bg-card border border-line rounded-2xl">
                    No posts found matching your filter.
                  </div>
                ) : (
                  feedPosts.map((post) => (
                    <FeedPost 
                      key={post.id} 
                      {...post}
                      onHashtagClick={(tag: string) => setSearchQuery(tag)}
                      onCommentClick={() => setActiveCommentPost(post)}
                      onShareClick={() => setActiveSharePost(post)}
                      onAddToTripClick={() => setActiveTripPlace({ name: post.title || post.location, location: post.location })}
                    >
                      {post.imageText && (
                        <div className="aspect-[16/9] bg-line rounded-xl mt-4 relative overflow-hidden flex items-end p-4">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <span className="text-white text-xs z-10 font-medium">{post.imageText}</span>
                          {!post.isBad && <span className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-md z-10 backdrop-blur-sm">1 / 4</span>}
                        </div>
                      )}
                      {post.isEvent && (
                        <div className="flex gap-2 mt-4">
                          <div className="flex-1 aspect-[4/3] bg-line rounded-xl overflow-hidden"></div>
                          <div className="flex-1 aspect-[4/3] bg-line rounded-xl overflow-hidden relative flex items-center justify-center">
                             <div className="absolute inset-0 bg-background/50"></div>
                             <span className="z-10 text-white font-bold text-2xl">+6</span>
                          </div>
                        </div>
                      )}
                    </FeedPost>
                  ))
                )}
                
              </div>

              {/* Right Column (456px) */}
              <div className="w-[456px] shrink-0 flex flex-col gap-6">
                
                {/* Explore USA */}
                <RightCard 
                  title="Explore USA by travelers" 
                  link="Open map →" 
                  onLinkClick={() => router.push("/map")}
                >
                  <p className="text-xs text-muted mb-4">Most posts this week · tap a state to explore</p>
                  <StateBar state="California" count="532 posts" percent={100} onClick={() => { setSearchQuery("California"); router.push("/explore?search=California"); }} />
                  <StateBar state="Texas" count="312 posts" percent={60} onClick={() => { setSearchQuery("Texas"); router.push("/explore?search=Texas"); }} />
                  <StateBar state="Florida" count="201 posts" percent={40} onClick={() => { setSearchQuery("Florida"); router.push("/explore?search=Florida"); }} />
                  <StateBar state="New York" count="156 posts" percent={30} onClick={() => { setSearchQuery("New York"); router.push("/explore?search=New York"); }} />
                  <StateBar state="Michigan" count="125 posts" percent={24} onClick={() => { setSearchQuery("Michigan"); router.push("/explore?search=Michigan"); }} />
                  <StateBar state="Ohio" count="106 posts" percent={20} onClick={() => { setSearchQuery("Ohio"); router.push("/explore?search=Ohio"); }} />
                </RightCard>

                {/* Events */}
                <RightCard 
                  title="Events near you" 
                  link="All events →" 
                  onLinkClick={() => router.push("/events")}
                >
                  <p className="text-xs text-muted mb-4">⊙ Using your location · 50 mi radius</p>
                  <div className="flex flex-col gap-4">
                    {events.map((ev) => (
                      <EventItem 
                        key={ev.id} 
                        id={ev.id} 
                        date={ev.date} 
                        title={ev.title} 
                        loc={ev.location} 
                        tag={ev.status} 
                      />
                    ))}
                  </div>
                </RightCard>

                {/* Next Trip */}
                <div 
                  onClick={() => router.push("/trips")}
                  className="bg-amber text-background rounded-2xl p-6 flex flex-col gap-2 relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all active:scale-[0.99]"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/30 transition-colors"></div>
                  <h3 className="font-bold text-lg mb-1 relative z-10">Your next trip</h3>
                  <p className="text-sm font-medium mb-6 opacity-80 relative z-10">Zion → Moab → Denver · 3 days · 2 overnight stops</p>
                  
                  <div className="flex items-center gap-0 mb-2 px-4 relative z-10">
                    <div className="w-3.5 h-3.5 rounded-full bg-background border-2 border-amber z-10 shrink-0"></div>
                    <div className="h-0.5 bg-background flex-1"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-white z-10 shrink-0 border-2 border-amber"></div>
                    <div className="h-0.5 bg-background/30 flex-1"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-white z-10 shrink-0 border-2 border-amber"></div>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold px-1 mb-8 relative z-10">
                    <span>Zion NP</span>
                    <span>Moab</span>
                    <span>Denver</span>
                  </div>

                  <div className="flex items-center gap-4 relative z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push("/trips");
                      }}
                      className="bg-background text-white px-5 py-2.5 rounded-full text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-md"
                    >
                      Open planner
                    </button>
                    <span className="text-xs font-bold opacity-80 hover:opacity-100 transition-opacity">
                      Add 2 saved places from today's feed →
                    </span>
                  </div>
                </div>

                {/* Top Travelers */}
                <RightCard 
                  title="Top travelers" 
                  link="Leaderboard →" 
                  onLinkClick={() => router.push("/community")}
                >
                  <p className="text-xs text-muted mb-4">This month · earn points for posts, reviews & tips</p>
                  <div className="flex flex-col gap-3">
                    {leaderboard.map((u) => (
                      <TravelerRank 
                        key={u.rank} 
                        rank={u.rank} 
                        name={u.name} 
                        pts={u.points} 
                        initial={u.initial} 
                        color={u.color} 
                        onClick={() => {
                          showToast(`Viewing ${u.name}'s badges and reviews`);
                          router.push("/community");
                        }}
                      />
                    ))}
                  </div>
                </RightCard>

                {/* Your Badges */}
                <RightCard 
                  title="Your badges" 
                  link="All badges →" 
                  onLinkClick={() => router.push("/community")}
                >
                  <p className="text-xs text-muted mb-4">2 of 28 unlocked · 380 pts to Road Master</p>
                  <div className="flex justify-between mt-2">
                     <BadgeItem active icon={<Compass className="w-6 h-6"/>} name="Explorer" onClick={() => router.push("/community")} />
                     <BadgeItem active icon={<Map className="w-6 h-6"/>} name="Adventurer" onClick={() => router.push("/community")} />
                     <BadgeItem icon={<Heart className="w-6 h-6"/>} name="Road Master" onClick={() => router.push("/community")} />
                     <BadgeItem icon={<MapPin className="w-6 h-6"/>} name="Legend" onClick={() => router.push("/community")} />
                  </div>
                </RightCard>
                
              </div>
            </div>
            
            {/* Floating Action Button */}
            <button 
              onClick={() => document.getElementById("composer-input")?.focus()}
              className="fixed bottom-8 right-8 w-14 h-14 bg-amber text-background rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40"
              title="Compose post"
            >
              <Plus className="w-6 h-6" />
            </button>
            
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      {activeStoryUser && (
        <StoryViewerModal 
          isOpen={Boolean(activeStoryUser)} 
          storyUser={activeStoryUser} 
          onClose={() => setActiveStoryUser(null)} 
        />
      )}

      {activeCommentPost && (
        <CommentsModal 
          isOpen={Boolean(activeCommentPost)} 
          postId={activeCommentPost.id}
          postTitle={activeCommentPost.title}
          postAuthor={activeCommentPost.author}
          onClose={() => setActiveCommentPost(null)} 
        />
      )}

      {activeSharePost && (
        <ShareModal 
          isOpen={Boolean(activeSharePost)} 
          title={activeSharePost.title}
          url={`http://localhost:3000/post/${activeSharePost.id}`}
          onClose={() => setActiveSharePost(null)} 
        />
      )}

      {activeTripPlace && (
        <AddToTripModal 
          isOpen={Boolean(activeTripPlace)} 
          placeName={activeTripPlace.name}
          placeLocation={activeTripPlace.location}
          onClose={() => setActiveTripPlace(null)} 
        />
      )}
    </div>
  );
}

// Subcomponents

function StoryItem({ add, name, hasRing, imgColor = 'bg-line', onClick }: { add?: boolean, name?: string, hasRing?: boolean, imgColor?: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
      <div className={`w-[68px] h-[68px] rounded-full flex items-center justify-center ${hasRing ? 'bg-gradient-to-tr from-amber to-amber/50 p-[2px]' : 'p-[2px] bg-transparent'}`}>
        <div className={`w-full h-full rounded-full border-[3px] border-background ${add ? 'bg-card border-line border-dashed flex items-center justify-center' : imgColor}`}>
          {add && <Plus className="w-6 h-6 text-muted" />}
        </div>
      </div>
      <span className="text-xs font-medium text-white">{add ? 'Your story' : name}</span>
    </div>
  );
}

function FeedPost({ 
  id, author, time, location, title, text, tag, isBad, likes: initialLikes, comments, avatarColor, avatarInitial, children, actionButton,
  onHashtagClick, onCommentClick, onShareClick, onAddToTripClick
}: any) {
  const { showToast } = useToast();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes || 0);

  const handleLikeToggle = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev: number) => prev + (nextLiked ? 1 : -1));
    showToast(nextLiked ? "Post liked!" : "Like removed", "info");

    try {
      await fetch(`/api/posts/${id}/like`, { method: "POST" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveToggle = () => {
    const nextSaved = !saved;
    setSaved(nextSaved);
    showToast(nextSaved ? "Post saved to your bookmarks!" : "Bookmark removed");
  };

  const handleAction = () => {
    if (actionButton === "I'm going →") {
      setAdded(!added);
      showToast(added ? "RSVP cancelled" : "RSVP Confirmed: You're going to this event!");
    } else {
      if (onAddToTripClick) onAddToTripClick();
    }
  };

  return (
    <div className="bg-card border border-line rounded-2xl p-6 transition-all hover:border-line/80">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${avatarColor || 'bg-amber-600'} flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-90 transition-opacity`}>
            {avatarInitial || author?.[0] || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm cursor-pointer hover:underline">{author}</span>
              <span className="text-muted text-xs">· {time}</span>
            </div>
            <div className="text-muted text-xs flex items-center gap-1 mt-0.5 cursor-pointer hover:text-white transition-colors">
               <MapPin className="w-3 h-3" /> {location}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all hover:brightness-110 ${
            tag === 'Recommended' || tag === '#Arizona' ? 'text-[#10B981] bg-[#10B981]/10' : 
            tag === 'Not recommended' || tag === '#RestStop' ? 'text-[#F43F5E] bg-[#F43F5E]/10 border border-[#F43F5E]/20' : 
            'text-[#3B82F6] bg-[#3B82F6]/10'
          }`}>
            {(tag === 'Recommended' || tag === '#Arizona') && <CheckCircle2 className="w-3.5 h-3.5" />}
            {(tag === 'Not recommended' || tag === '#RestStop') && <XCircle className="w-3.5 h-3.5" />}
            {tag === 'Event' && <Calendar className="w-3.5 h-3.5" />}
            {tag}
          </button>
          <button 
            onClick={() => showToast("Options menu: Post reported/hidden", "info")}
            className="text-muted hover:text-white transition-colors p-1 rounded-full hover:bg-line/50"
            title="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-[#D1D5DB] leading-relaxed mb-4">{text}</p>
      
      <div className="flex gap-2 mb-4">
        <button onClick={() => onHashtagClick && onHashtagClick(tag === 'Event' ? '#Event' : tag === 'Recommended' ? '#Arizona' : '#RestStop')} className="text-xs text-[#3B82F6] hover:underline">
          #{tag === 'Event' ? 'Event' : tag === 'Recommended' ? 'Arizona' : 'RestStop'}
        </button>
        <button onClick={() => onHashtagClick && onHashtagClick(tag === 'Recommended' ? '#Vanlife' : tag === 'Event' ? '#Moab' : '#Utah')} className="text-xs text-[#3B82F6] hover:underline">
          #{tag === 'Recommended' ? 'Vanlife' : tag === 'Event' ? 'Moab' : 'Utah'}
        </button>
        {(tag === 'Recommended' || tag === '#Arizona') && (
          <button onClick={() => onHashtagClick && onHashtagClick('#Sunrise')} className="text-xs text-[#3B82F6] hover:underline">#Sunrise</button>
        )}
      </div>

      {children}
      
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLikeToggle} 
            className={`flex items-center gap-2 text-sm transition-colors active:scale-95 ${liked ? 'text-red-500' : 'text-muted hover:text-red-400'}`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} /> {likesCount}
          </button>
          <button 
            onClick={onCommentClick}
            className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors active:scale-95"
          >
            <MessageSquare className="w-5 h-5" /> {comments || 3}
          </button>
          <button 
            onClick={onShareClick}
            className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors active:scale-95"
          >
            <Share2 className="w-5 h-5" /> Share
          </button>
          <button 
            onClick={handleSaveToggle}
            className={`flex items-center gap-2 text-sm transition-colors active:scale-95 ${saved ? 'text-amber font-bold' : 'text-muted hover:text-white'}`}
          >
            <Bookmark className={`w-5 h-5 ${saved ? 'fill-amber text-amber' : ''}`} /> Save
          </button>
        </div>
        <button 
          onClick={handleAction}
          className={`px-5 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 ${
            added ? 'border-[#10B981] text-[#10B981] bg-[#10B981]/10' : 'border-amber text-amber hover:bg-amber/10'
          }`}
        >
          {added ? 'Added ✓' : (actionButton || "Add to trip +")}
        </button>
      </div>
    </div>
  );
}

function RightCard({ title, link, onLinkClick, children }: { title: string, link: string, onLinkClick?: () => void, children: React.ReactNode }) {
  return (
    <div className="bg-card border border-line rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white text-sm">{title}</h3>
        <button onClick={onLinkClick} className="text-xs font-bold text-amber hover:underline">{link}</button>
      </div>
      {children}
    </div>
  );
}

function StateBar({ state, count, percent, onClick }: { state: string, count: string, percent: number, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="mb-3 last:mb-0 group cursor-pointer">
      <div className="flex justify-between text-xs font-medium text-white mb-1.5 group-hover:text-amber transition-colors">
        <span>{state}</span>
        <span className="text-muted group-hover:text-amber/80 transition-colors">{count}</span>
      </div>
      <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
        <div className="h-full bg-amber rounded-full" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function EventItem({ id, date, title, loc, tag }: { id?: string, date: string, title: string, loc: string, tag?: string }) {
  const { showToast } = useToast();
  const [currentTag, setCurrentTag] = useState(tag);
  const parts = (date || "OCT 18").split(' ');
  const month = parts[0];
  const day = parts[1] || "";

  const handleRsvp = async () => {
    const nextStatus = currentTag === "Going" ? "Interested" : "Going";
    setCurrentTag(nextStatus);
    showToast(`RSVP status changed to: ${nextStatus}!`);
    if (id) {
      try {
        await fetch(`/api/events/${id}/rsvp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus.toLowerCase() })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div onClick={handleRsvp} className="flex items-start gap-4 p-2 -mx-2 rounded-xl hover:bg-line/30 transition-colors cursor-pointer group">
      <div className="flex flex-col items-center justify-center w-12 shrink-0">
        <span className="text-[10px] font-bold text-amber">{month}</span>
        <span className="text-xl font-bold text-white leading-tight group-hover:scale-110 transition-transform">{day}</span>
      </div>
      <div className="flex-1 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-white group-hover:text-amber transition-colors">{title}</h4>
          <p className="text-xs text-muted mt-0.5">{loc}</p>
        </div>
        {currentTag && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${currentTag === 'Going' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-line text-muted'}`}>
            {currentTag}
          </span>
        )}
      </div>
    </div>
  );
}

function TravelerRank({ rank, name, pts, initial, color, onClick }: { rank: number, name: string, pts: string, initial: string, color: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center gap-4 p-2 -mx-2 rounded-xl hover:bg-line/30 transition-colors cursor-pointer group">
      <span className="text-sm font-bold text-muted w-2 group-hover:text-white transition-colors">{rank}</span>
      <div className={`w-8 h-8 rounded-full ${color || 'bg-amber-600'} flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform`}>{initial}</div>
      <span className="text-sm font-medium text-white flex-1 group-hover:text-amber transition-colors">{name}</span>
      <span className="text-xs font-bold text-amber">{pts}</span>
    </div>
  );
}

function BadgeItem({ active, icon, name, onClick }: { active?: boolean, icon: React.ReactNode, name: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${active ? 'bg-amber text-background' : 'bg-line text-muted border border-[#3b4b72] group-hover:text-white group-hover:border-amber/50'}`}>
        {icon}
      </div>
      <span className={`text-[10px] transition-colors ${active ? 'text-amber font-bold' : 'text-muted group-hover:text-white'}`}>{name}</span>
    </div>
  );
}
