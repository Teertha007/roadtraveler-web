import { createClient } from "@supabase/supabase-js";

// Check if valid Supabase credentials are provided
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes("mock"));

export const supabaseServer = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

// ==============================================================================
// In-Memory Fallback Store (Ensures 100% functionality out-of-the-box in dev)
// ==============================================================================

export interface Post {
  id: string | number;
  author: string;
  time: string;
  location: string;
  title: string;
  text: string;
  tag: string;
  isBad?: boolean;
  isEvent?: boolean;
  likes: number;
  comments: number;
  avatarColor: string;
  avatarInitial: string;
  imageText?: string;
  actionButton: string;
  created_at: string;
}

export interface Place {
  id: string;
  name: string;
  category: "campground" | "rv_park" | "beach" | "trail" | "rest_stop" | "attraction";
  location_name: string;
  state: string;
  lat: number;
  lng: number;
  rating: number;
  reviews_count: number;
  travelers_count: number;
  amenities: string[];
}

export interface EventItem {
  id: string;
  title: string;
  location: string;
  date: string;
  status: string;
  going_count: number;
  interested_count: number;
  lat: number;
  lng: number;
}

export interface LeaderboardUser {
  rank: number;
  initial: string;
  name: string;
  points: string;
  color: string;
  badgeCount: number;
}

let postsStore: Post[] = [
  {
    id: 1,
    author: "Sarah Adventures",
    time: "2h",
    location: "Horseshoe Bend, Page, AZ",
    title: "Sunrise at Horseshoe Bend was worth the 4am alarm",
    text: "Parked the van at the overlook lot ($10, opens at 5). Walk is 15 min on a paved path — easy with kids. Bring a wide lens, the bend barely fits.",
    tag: "#Arizona",
    likes: 248,
    comments: 31,
    avatarColor: "bg-emerald-600",
    avatarInitial: "S",
    imageText: "📍 Horseshoe Bend Overlook · 1,204 travelers were here",
    actionButton: "Add to trip +",
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 2,
    author: "Moab Overland Fest",
    time: "5h",
    location: "Sand Flats Rec Area, Moab, UT",
    title: "Moab Overland Fest · Sat Oct 18 — rigs, trail runs, campfire talks",
    text: "Two-day gathering for off-roaders and RVers. Free camping on site, vendor row, guided Hell's Revenge run at 9am. 212 travelers are going.",
    tag: "#Event",
    isEvent: true,
    likes: 96,
    comments: 12,
    avatarColor: "bg-amber-600",
    avatarInitial: "M",
    actionButton: "I'm going →",
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 3,
    author: "OffRoad Joe",
    time: "9h",
    location: "Red Mesa Rest Area, I-70, UT",
    title: "Skip this rest stop overnight — no shade, generators all night",
    text: "Lot was packed with semis by 8pm. No potable water, restrooms locked after 10. Drive 20 more minutes to the BLM pullout near Green River instead.",
    tag: "#RestStop",
    isBad: true,
    likes: 54,
    comments: 27,
    avatarColor: "bg-blue-600",
    avatarInitial: "O",
    imageText: "📍 Red Mesa Rest Area · 38 reviews · 2.1 ★",
    actionButton: "Add to trip +",
    created_at: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
  },
];

let placesStore: Place[] = [
  {
    id: "p1",
    name: "Horseshoe Bend Overlook",
    category: "attraction",
    location_name: "Page, AZ",
    state: "Arizona",
    lat: 36.8791,
    lng: -111.5105,
    rating: 4.8,
    reviews_count: 1204,
    travelers_count: 4890,
    amenities: ["parking", "restrooms", "wheelchair_accessible"],
  },
  {
    id: "p2",
    name: "Sand Flats Recreation Area",
    category: "campground",
    location_name: "Moab, UT",
    state: "Utah",
    lat: 38.5806,
    lng: -109.4975,
    rating: 4.7,
    reviews_count: 342,
    travelers_count: 1850,
    amenities: ["pet_friendly", "free_entry", "restrooms", "trails"],
  },
  {
    id: "p3",
    name: "Red Mesa Rest Area",
    category: "rest_stop",
    location_name: "I-70, UT",
    state: "Utah",
    lat: 38.9328,
    lng: -110.1654,
    rating: 2.1,
    reviews_count: 38,
    travelers_count: 512,
    amenities: ["parking"],
  },
  {
    id: "p4",
    name: "Zion River Resort RV Park",
    category: "rv_park",
    location_name: "Virgin, UT",
    state: "Utah",
    lat: 37.2081,
    lng: -113.1899,
    rating: 4.9,
    reviews_count: 856,
    travelers_count: 3200,
    amenities: ["rv_hookups", "showers", "potable_water", "pet_friendly", "restrooms"],
  },
  {
    id: "p5",
    name: "Pfeiffer Beach",
    category: "beach",
    location_name: "Big Sur, CA",
    state: "California",
    lat: 36.2381,
    lng: -121.8153,
    rating: 4.6,
    reviews_count: 620,
    travelers_count: 2400,
    amenities: ["parking", "restrooms", "trails"],
  },
];

let eventsStore: EventItem[] = [
  {
    id: "e1",
    title: "Moab Overland Fest",
    location: "Sand Flats · Moab, UT",
    date: "OCT 18",
    status: "Going",
    going_count: 212,
    interested_count: 450,
    lat: 38.5806,
    lng: -109.4975,
  },
  {
    id: "e2",
    title: "Full-moon night hike",
    location: "Arches NP · 8:30pm",
    date: "OCT 24",
    status: "Interested",
    going_count: 48,
    interested_count: 130,
    lat: 38.7331,
    lng: -109.5925,
  },
  {
    id: "e3",
    title: "Van & RV swap meet",
    location: "Grand Junction, CO",
    date: "NOV 02",
    status: "Going",
    going_count: 89,
    interested_count: 190,
    lat: 39.0639,
    lng: -108.5506,
  },
];

const leaderboardStore: LeaderboardUser[] = [
  { rank: 1, initial: "J", name: "JohnRV", points: "2,450 pts", color: "bg-amber-600", badgeCount: 14 },
  { rank: 2, initial: "S", name: "Sarah Adventures", points: "1,980 pts", color: "bg-emerald-600", badgeCount: 11 },
  { rank: 3, initial: "O", name: "OffRoad Joe", points: "1,620 pts", color: "bg-blue-600", badgeCount: 9 },
  { rank: 4, initial: "M", name: "Mike on the Road", points: "1,250 pts", color: "bg-purple-600", badgeCount: 6 },
  { rank: 5, initial: "F", name: "Family Travel", points: "1,120 pts", color: "bg-rose-600", badgeCount: 4 },
];

// Helper: Haversine distance in miles
function calculateDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3959; // Radius of the Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ==============================================================================
// Unified DB Access Methods
// ==============================================================================

export const db = {
  // Posts
  async getPosts(filter?: { tag?: string; search?: string; tab?: string }) {
    if (supabaseServer) {
      let query = supabaseServer.from("posts").select("*, profiles(*)");
      if (filter?.tag) query = query.ilike("tag", `%${filter.tag}%`);
      if (filter?.search) query = query.or(`title.ilike.%${filter.search}%,content.ilike.%${filter.search}%`);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data) return data;
    }

    let results = [...postsStore];
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.text.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q)
      );
    }
    if (filter?.tag) {
      const t = filter.tag.toLowerCase();
      results = results.filter((p) => p.tag.toLowerCase().includes(t));
    }
    return results;
  },

  async createPost(postData: Partial<Post>) {
    if (supabaseServer) {
      const { data, error } = await supabaseServer.from("posts").insert(postData).select().single();
      if (!error && data) return data;
    }

    const newPost: Post = {
      id: Date.now(),
      author: postData.author || "Teertha",
      time: "Just now",
      location: postData.location || "USA Roadway",
      title: postData.title || (postData.text ? postData.text.slice(0, 45) + "..." : "New Road Post"),
      text: postData.text || "",
      tag: postData.tag || "#RoadTraveler",
      likes: 0,
      comments: 0,
      avatarColor: "bg-amber-600",
      avatarInitial: "T",
      actionButton: "Add to trip +",
      created_at: new Date().toISOString(),
      ...postData,
    };

    postsStore = [newPost, ...postsStore];
    return newPost;
  },

  async toggleLikePost(postId: number | string) {
    const post = postsStore.find((p) => String(p.id) === String(postId));
    if (post) {
      post.likes += 1;
      return { success: true, likes: post.likes };
    }
    return { success: false, likes: 0 };
  },

  // Places
  async getPlaces(query?: { search?: string; category?: string; lat?: number; lng?: number; radius?: number }) {
    let results = [...placesStore];

    if (query?.category) {
      results = results.filter((p) => p.category.toLowerCase() === query.category?.toLowerCase());
    }

    if (query?.search) {
      const s = query.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.location_name.toLowerCase().includes(s) ||
          p.state.toLowerCase().includes(s)
      );
    }

    if (query?.lat !== undefined && query?.lng !== undefined) {
      const radius = query.radius || 50; // default 50 miles per RT spec
      results = results
        .map((p) => ({
          ...p,
          distance_miles: calculateDistanceMiles(query.lat!, query.lng!, p.lat, p.lng),
        }))
        .filter((p) => p.distance_miles <= radius)
        .sort((a, b) => a.distance_miles - b.distance_miles);
    }

    return results;
  },

  // Events
  async getEvents(query?: { lat?: number; lng?: number; radius?: number }) {
    let results = [...eventsStore];
    if (query?.lat !== undefined && query?.lng !== undefined) {
      const radius = query.radius || 50;
      results = results
        .map((e) => ({
          ...e,
          distance_miles: calculateDistanceMiles(query.lat!, query.lng!, e.lat, e.lng),
        }))
        .filter((e) => e.distance_miles <= radius)
        .sort((a, b) => a.distance_miles - b.distance_miles);
    }
    return results;
  },

  async rsvpEvent(eventId: string, status: "going" | "interested") {
    const event = eventsStore.find((e) => e.id === eventId);
    if (event) {
      if (status === "going") event.going_count += 1;
      else event.interested_count += 1;
      return { success: true, event };
    }
    return { success: false };
  },

  // Leaderboard & Badges
  async getLeaderboard() {
    return leaderboardStore;
  },
};
