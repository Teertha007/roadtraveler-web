import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { assertDbReady, supabaseConfigured, useLocalDb } from "@/lib/env";
import { sanitizePhotoUrls } from "@/lib/image";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** CDN demo photos — short URL strings only (never image bytes in the DB). */
const DEMO_IMG = {
  horseshoe: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=960&q=70&auto=format&fit=crop",
  moab: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=960&q=70&auto=format&fit=crop",
  desert: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=960&q=70&auto=format&fit=crop",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=960&q=70&auto=format&fit=crop",
  zion: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=960&q=70&auto=format&fit=crop",
  camp: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=960&q=70&auto=format&fit=crop",
  rv: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=960&q=70&auto=format&fit=crop",
} as const;

// Keep the local DB outside the Next project so Turbopack never watches it.
const FILE = path.join(process.env.LOCALAPPDATA || os.tmpdir(), "roadtraveler-web", "db.json");

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  points: number;
  created_at: string;
};

export type Place = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  location_name: string;
  state: string;
  lat: number;
  lng: number;
  amenities: string[];
  rating: number;
  reviews_count: number;
  travelers_count: number;
  photo_url?: string | null;
};

export type PostRow = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  tag: string;
  is_recommended: boolean | null;
  place_id: string | null;
  likes_count: number;
  comments_count: number;
  photos: string[];
  created_at: string;
};

export type CommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export type EventRow = {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  location_name: string;
  lat: number;
  lng: number;
  event_date: string;
  going_count: number;
  interested_count: number;
  created_at: string;
};

export type TripRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  is_public: boolean;
  created_at: string;
};

export type StopRow = {
  id: string;
  trip_id: string;
  place_id: string | null;
  custom_title: string;
  stop_type: "place" | "break" | "checkpoint";
  days_duration: number;
  order_index: number;
  note: string;
  location: string;
};

export type ClaimRow = {
  id: string;
  place_id: string;
  user_id: string;
  status: "pending" | "approved" | "declined";
  business_email: string;
  phone: string;
  role: string;
  decline_note: string | null;
  resubmit_count: number;
  created_at: string;
};

export type ReviewRow = {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  content: string;
  created_at: string;
};

export type Badge = {
  id: string;
  label: string;
  description: string;
  icon: string;
  metric: string;
  threshold: number;
  group: string;
};

type Password = { user_id: string; salt: string; hash: string };

export type StoryRow = { id: string; user_id: string; caption: string; image_url: string | null; created_at: string };
export type Notice = { id: string; user_id: string; text: string; read: boolean; created_at: string };

type DB = {
  profiles: Profile[];
  passwords: Password[];
  places: Place[];
  posts: PostRow[];
  likes: { post_id: string; user_id: string }[];
  comments: CommentRow[];
  events: EventRow[];
  rsvps: { event_id: string; user_id: string; status: "going" | "interested" }[];
  trips: TripRow[];
  stops: StopRow[];
  claims: ClaimRow[];
  reviews: ReviewRow[];
  badges: Badge[];
  user_badges: { user_id: string; badge_id: string; is_showcased: boolean }[];
  stories: StoryRow[];
  notifications: Notice[];
  bookmarks: { user_id: string; post_id: string }[];
  guide_saves: { user_id: string; guide_id: string }[];
};

const COLORS = ["bg-amber-600", "bg-emerald-600", "bg-blue-600", "bg-purple-600", "bg-rose-600"];

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 32).toString("hex");
  return { salt, hash };
}

function id() {
  return crypto.randomUUID();
}

function miles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.round(hrs / 24);
  return `${days}d`;
}

function dateLabel(iso: string) {
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  if (Number.isNaN(d.getTime())) return iso;
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  return `${month} ${d.getDate()}`;
}

const BADGES: Badge[] = [
  { id: "first_review", label: "First Review", description: "Left your first place review", icon: "rate_review", metric: "reviews", threshold: 1, group: "reviews" },
  { id: "local_guide", label: "Local Guide", description: "Wrote 5 helpful reviews", icon: "explore", metric: "reviews", threshold: 5, group: "reviews" },
  { id: "road_trip_master", label: "Road Trip Master", description: "Wrote 15 reviews", icon: "map", metric: "reviews", threshold: 15, group: "reviews" },
  { id: "travel_chronicler", label: "Travel Chronicler", description: "Shared 30 reviews", icon: "library_books", metric: "reviews", threshold: 30, group: "reviews" },
  { id: "community_voice", label: "Community Voice", description: "Reached 50 reviews", icon: "forum", metric: "reviews", threshold: 50, group: "reviews" },
  { id: "travel_legend", label: "Travel Legend", description: "Earned 75 reviews", icon: "stars", metric: "reviews", threshold: 75, group: "reviews" },
  { id: "roadtraveler_elite", label: "RoadTraveler Elite", description: "100 reviews", icon: "grade", metric: "reviews", threshold: 100, group: "reviews" },
  { id: "photo_explorer", label: "Photo Explorer", description: "Shared photos in a review", icon: "photo_camera", metric: "photo_reviews", threshold: 1, group: "photos" },
  { id: "shutterbug", label: "Shutterbug", description: "Photos on 3 reviews", icon: "photo_library", metric: "photo_reviews", threshold: 3, group: "photos" },
  { id: "picture_perfect", label: "Picture Perfect", description: "Photos on 8 reviews", icon: "collections", metric: "photo_reviews", threshold: 8, group: "photos" },
  { id: "visual_storyteller", label: "Visual Storyteller", description: "Photos on 20 reviews", icon: "panorama", metric: "photo_reviews", threshold: 20, group: "photos" },
  { id: "gallery_guru", label: "Gallery Guru", description: "Photos on 35 reviews", icon: "photo_album", metric: "photo_reviews", threshold: 35, group: "photos" },
  { id: "first_stop", label: "First Stop", description: "Reviewed 3 different places", icon: "place", metric: "places", threshold: 3, group: "explore" },
  { id: "route_finder", label: "Route Finder", description: "Reviewed 10 unique listings", icon: "directions", metric: "places", threshold: 10, group: "explore" },
  { id: "wanderer", label: "Wanderer", description: "Reviewed 20 places", icon: "directions_walk", metric: "places", threshold: 20, group: "explore" },
  { id: "cross_country", label: "Cross Country", description: "Reviewed 35 stops", icon: "public", metric: "places", threshold: 35, group: "explore" },
  { id: "open_road", label: "Open Road", description: "Reviewed 50 places", icon: "flight", metric: "places", threshold: 50, group: "explore" },
  { id: "contributor", label: "Contributor", description: "Added a listing", icon: "add", metric: "listings", threshold: 1, group: "listings" },
  { id: "directory_builder", label: "Directory Builder", description: "Added 3 listings", icon: "business", metric: "listings", threshold: 3, group: "listings" },
  { id: "place_maker", label: "Place Maker", description: "Published 7 listings", icon: "location_city", metric: "listings", threshold: 7, group: "listings" },
  { id: "community_curator", label: "Community Curator", description: "Curated 12 listings", icon: "local_activity", metric: "listings", threshold: 12, group: "listings" },
  { id: "verified_owner", label: "Verified Owner", description: "Claimed a business listing", icon: "verified_user", metric: "claims", threshold: 1, group: "claims" },
  { id: "multi_location_owner", label: "Multi-Location Owner", description: "Verified 2 listings", icon: "store", metric: "claims", threshold: 2, group: "claims" },
  { id: "member_2_weeks", label: "Two-Week Traveler", description: "Member for 2 weeks", icon: "today", metric: "days", threshold: 14, group: "loyalty" },
  { id: "member_2_months", label: "Regular Explorer", description: "Member for 2 months", icon: "event", metric: "days", threshold: 60, group: "loyalty" },
  { id: "member_6_months", label: "Seasoned Traveler", description: "Member for 6 months", icon: "event_available", metric: "days", threshold: 180, group: "loyalty" },
  { id: "member_1_year", label: "Road Veteran", description: "Member for one year", icon: "card_giftcard", metric: "days", threshold: 365, group: "loyalty" },
  { id: "member_2_years", label: "Founding Spirit", description: "Member for two years", icon: "beenhere", metric: "days", threshold: 730, group: "loyalty" },
];

/** Local seed includes a known demo login; cloud seed uses an unguessable password. */
function seed(opts?: { demoLogin?: boolean }): DB {
  const now = Date.now();
  const ago = (h: number) => new Date(now - h * 3600_000).toISOString();
  const demoLogin = opts?.demoLogin !== false;
  const pw = hashPassword(demoLogin ? "roadtraveler" : crypto.randomBytes(32).toString("hex"));
  const profiles: Profile[] = [
    { id: "u-teertha", username: "teertha", display_name: "Teertha", avatar_url: null, bio: "Building RoadTraveler.", location: "USA", points: 420, created_at: ago(24 * 40) },
    { id: "u-sarah", username: "sarah", display_name: "Sarah Adventures", avatar_url: null, bio: null, location: "Arizona", points: 1980, created_at: ago(24 * 200) },
    { id: "u-john", username: "johnrv", display_name: "JohnRV", avatar_url: null, bio: null, location: "Utah", points: 2450, created_at: ago(24 * 300) },
    { id: "u-joe", username: "offroadjoe", display_name: "OffRoad Joe", avatar_url: null, bio: null, location: "Utah", points: 1620, created_at: ago(24 * 120) },
    { id: "u-mike", username: "mike", display_name: "Mike on the Road", avatar_url: null, bio: null, location: "Colorado", points: 1250, created_at: ago(24 * 90) },
    { id: "u-family", username: "family", display_name: "Family Travel", avatar_url: null, bio: null, location: "Florida", points: 1120, created_at: ago(24 * 80) },
  ];
  const places: Place[] = [
    { id: "p1", name: "Horseshoe Bend Overlook", slug: "horseshoe-bend", category: "attraction", description: "Sunrise overlook above the Colorado River.", location_name: "Page, AZ", state: "Arizona", lat: 36.8791, lng: -111.5105, amenities: ["parking", "restrooms", "wheelchair_accessible"], rating: 4.8, reviews_count: 1204, travelers_count: 4890, photo_url: DEMO_IMG.horseshoe },
    { id: "p2", name: "Sand Flats Recreation Area", slug: "sand-flats", category: "campground", description: "Slickrock camping outside Moab.", location_name: "Moab, UT", state: "Utah", lat: 38.5806, lng: -109.4975, amenities: ["pet_friendly", "free_entry", "restrooms", "trails"], rating: 4.7, reviews_count: 342, travelers_count: 1850, photo_url: DEMO_IMG.moab },
    { id: "p3", name: "Red Mesa Rest Area", slug: "red-mesa", category: "rest_stop", description: "Highway rest stop with limited overnight space.", location_name: "I-70, UT", state: "Utah", lat: 38.9328, lng: -110.1654, amenities: ["parking"], rating: 2.1, reviews_count: 38, travelers_count: 512, photo_url: DEMO_IMG.desert },
    { id: "p4", name: "Zion River Resort RV Park", slug: "zion-river-resort", category: "rv_park", description: "Full-hookup park near Zion.", location_name: "Virgin, UT", state: "Utah", lat: 37.2081, lng: -113.1899, amenities: ["rv_hookups", "showers", "potable_water", "pet_friendly", "restrooms"], rating: 4.9, reviews_count: 856, travelers_count: 3200, photo_url: DEMO_IMG.rv },
    { id: "p5", name: "Pfeiffer Beach", slug: "pfeiffer-beach", category: "beach", description: "Big Sur beach with purple sand.", location_name: "Big Sur, CA", state: "California", lat: 36.2381, lng: -121.8153, amenities: ["parking", "restrooms", "trails"], rating: 4.6, reviews_count: 620, travelers_count: 2400, photo_url: DEMO_IMG.beach },
  ];
  return {
    profiles,
    passwords: [{ user_id: "u-teertha", ...pw }],
    places,
    posts: [
      { id: "post-1", author_id: "u-sarah", title: "Sunrise at Horseshoe Bend was worth the 4am alarm", content: "Parked the van at the overlook lot ($10, opens at 5). Walk is 15 min on a paved path — easy with kids. Bring a wide lens, the bend barely fits.", tag: "#Arizona", is_recommended: true, place_id: "p1", likes_count: 248, comments_count: 2, photos: [DEMO_IMG.horseshoe], created_at: ago(2) },
      { id: "post-2", author_id: "u-john", title: "Moab Overland Fest · Sat Oct 18 — rigs, trail runs, campfire talks", content: "Two-day gathering for off-roaders and RVers. Free camping on site, vendor row, guided Hell's Revenge run at 9am. 212 travelers are going.", tag: "#Event", is_recommended: null, place_id: "p2", likes_count: 96, comments_count: 0, photos: [DEMO_IMG.moab], created_at: ago(5) },
      { id: "post-3", author_id: "u-joe", title: "Skip this rest stop overnight — no shade, generators all night", content: "Lot was packed with semis by 8pm. No potable water, restrooms locked after 10. Drive 20 more minutes to the BLM pullout near Green River instead.", tag: "#RestStop", is_recommended: false, place_id: "p3", likes_count: 54, comments_count: 0, photos: [DEMO_IMG.desert], created_at: ago(9) },
      { id: "post-4", author_id: "u-family", title: "7 Florida beach campgrounds 10 feet from the water", content: "We spent the winter hopping between them. Here's which ones have hookups, which ones book out 11 months ahead, and the one nobody talks about.", tag: "#Guide", is_recommended: true, place_id: "p5", likes_count: 412, comments_count: 0, photos: [DEMO_IMG.beach], created_at: ago(26) },
    ],
    likes: [],
    comments: [
      { id: "c1", post_id: "post-1", user_id: "u-john", content: "The lot fills up fast on weekends. Getting there before 5am is the move.", created_at: ago(1) },
      { id: "c2", post_id: "post-1", user_id: "u-joe", content: "Dogs on leash are fine on the paved path.", created_at: ago(0.5) },
    ],
    events: [
      { id: "e1", creator_id: "u-john", title: "Moab Overland Fest", description: "Rigs, trail runs, campfire talks.", location_name: "Sand Flats · Moab, UT", lat: 38.5806, lng: -109.4975, event_date: "2026-10-18", going_count: 212, interested_count: 450, created_at: ago(48) },
      { id: "e2", creator_id: "u-sarah", title: "Full-moon night hike", description: "Guided walk in Arches.", location_name: "Arches NP · 8:30pm", lat: 38.7331, lng: -109.5925, event_date: "2026-10-24", going_count: 48, interested_count: 130, created_at: ago(40) },
      { id: "e3", creator_id: "u-mike", title: "Van & RV swap meet", description: "Gear swap in Grand Junction.", location_name: "Grand Junction, CO", lat: 39.0639, lng: -108.5506, event_date: "2026-11-02", going_count: 89, interested_count: 190, created_at: ago(30) },
    ],
    rsvps: [],
    trips: [
      { id: "t1", user_id: "u-teertha", title: "Southwest Red Rock Discovery", description: "Las Vegas → Zion → Moab → Denver", is_public: true, created_at: ago(72) },
    ],
    stops: [
      { id: "s1", trip_id: "t1", place_id: null, custom_title: "Depart from Las Vegas, NV", stop_type: "checkpoint", days_duration: 0, order_index: 0, note: "Full fuel tank, groceries at Trader Joe's.", location: "Las Vegas, NV" },
      { id: "s2", trip_id: "t1", place_id: "p4", custom_title: "Zion River Resort RV Park", stop_type: "place", days_duration: 2, order_index: 1, note: "Reserved site with 30A hookups.", location: "Virgin, UT" },
      { id: "s3", trip_id: "t1", place_id: null, custom_title: "Rest & laundry day in Moab", stop_type: "break", days_duration: 1, order_index: 2, note: "Van maintenance and gear cleanup.", location: "Moab, UT" },
      { id: "s4", trip_id: "t1", place_id: "p2", custom_title: "Sand Flats Recreation Area", stop_type: "place", days_duration: 2, order_index: 3, note: "Dispersed site overlooking Slickrock. $15 fee.", location: "Moab, UT" },
      { id: "s5", trip_id: "t1", place_id: null, custom_title: "Arrive in Denver, CO", stop_type: "checkpoint", days_duration: 1, order_index: 4, note: "I-70 through Glenwood Canyon.", location: "Denver, CO" },
    ],
    claims: [],
    reviews: [],
    badges: BADGES,
    user_badges: [
      { user_id: "u-teertha", badge_id: "first_review", is_showcased: true },
      { user_id: "u-teertha", badge_id: "first_stop", is_showcased: true },
    ],
    stories: [
      { id: "st1", user_id: "u-sarah", caption: "First light on the Colorado River.", image_url: DEMO_IMG.horseshoe, created_at: ago(2) },
      { id: "st2", user_id: "u-john", caption: "Hell's Revenge, then campfire.", image_url: DEMO_IMG.camp, created_at: ago(4) },
      { id: "st3", user_id: "u-joe", caption: "Dispersed camp at 9,500 ft.", image_url: DEMO_IMG.zion, created_at: ago(6) },
    ],
    notifications: [
      { id: "n1", user_id: "u-teertha", text: "Sarah Adventures liked a post you follow", read: false, created_at: ago(1) },
      { id: "n2", user_id: "u-teertha", text: "Moab Overland Fest is coming up on Oct 18", read: false, created_at: ago(20) },
    ],
    bookmarks: [],
    guide_saves: [],
  };
}

let queue: Promise<unknown> = Promise.resolve();

function migrate(db: DB) {
  let changed = false;
  if (!db.stories) { db.stories = []; changed = true; }
  if (!db.notifications) { db.notifications = []; changed = true; }
  if (!db.bookmarks) { db.bookmarks = []; changed = true; }
  if (!db.guide_saves) { db.guide_saves = []; changed = true; }
  const seedPhotos: Record<string, string> = {
    "post-1": DEMO_IMG.horseshoe,
    "post-2": DEMO_IMG.moab,
    "post-3": DEMO_IMG.desert,
    "post-4": DEMO_IMG.beach,
  };
  const placePhotos: Record<string, string> = {
    p1: DEMO_IMG.horseshoe,
    p2: DEMO_IMG.moab,
    p3: DEMO_IMG.desert,
    p4: DEMO_IMG.rv,
    p5: DEMO_IMG.beach,
  };
  for (const post of db.posts) {
    if (!post.photos) { post.photos = []; changed = true; }
    if (post.photos.length === 0 && seedPhotos[post.id]) {
      post.photos = [seedPhotos[post.id]];
      changed = true;
    }
    // Strip accidental base64 blobs from older builds — keep DB small.
    const cleaned = sanitizePhotoUrls(post.photos);
    if (cleaned.length !== post.photos.length || cleaned.some((u, i) => u !== post.photos[i])) {
      post.photos = cleaned.length ? cleaned : seedPhotos[post.id] ? [seedPhotos[post.id]] : [];
      changed = true;
    }
  }
  for (const place of db.places) {
    if (!place.photo_url && placePhotos[place.id]) {
      place.photo_url = placePhotos[place.id];
      changed = true;
    }
  }
  for (const story of db.stories || []) {
    if (!story.image_url) {
      if (story.id === "st1") { story.image_url = DEMO_IMG.horseshoe; changed = true; }
      else if (story.id === "st2") { story.image_url = DEMO_IMG.camp; changed = true; }
      else if (story.id === "st3") { story.image_url = DEMO_IMG.zion; changed = true; }
    }
  }
  if (db.notifications.length === 0) {
    const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
    db.notifications.push(
      { id: "n1", user_id: "u-teertha", text: "Sarah Adventures posted from Horseshoe Bend", read: false, created_at: ago(1) },
      { id: "n2", user_id: "u-teertha", text: "Moab Overland Fest is coming up on Oct 18", read: false, created_at: ago(20) }
    );
    changed = true;
  }
  if (db.stories.length === 0) {
    const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
    db.stories.push(
      { id: "st1", user_id: "u-sarah", caption: "First light on the Colorado River.", image_url: null, created_at: ago(2) },
      { id: "st2", user_id: "u-john", caption: "Hell's Revenge, then campfire.", image_url: null, created_at: ago(4) },
      { id: "st3", user_id: "u-joe", caption: "Dispersed camp at 9,500 ft.", image_url: null, created_at: ago(6) }
    );
    changed = true;
  }
  return changed;
}

function readLocal(): { db: DB; changed: boolean } {
  if (!fs.existsSync(FILE)) {
    const legacy = path.join(process.cwd(), ".data", "db.json");
    if (fs.existsSync(legacy)) {
      fs.mkdirSync(path.dirname(FILE), { recursive: true });
      fs.copyFileSync(legacy, FILE);
    } else {
      fs.mkdirSync(path.dirname(FILE), { recursive: true });
      const db = seed();
      fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
      return { db, changed: false };
    }
  }
  const db = JSON.parse(fs.readFileSync(FILE, "utf8")) as DB;
  const changed = migrate(db);
  return { db, changed };
}

function writeLocal(db: DB) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

async function readCloud(): Promise<{ db: DB; changed: boolean; version: number }> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase is not configured.");
  const { data, error } = await sb.from("app_state").select("data, version").eq("id", 1).maybeSingle();
  if (error) throw new Error(`Database read failed: ${error.message}`);
  if (!data?.data) {
    // Never plant a public demo password into production cloud data.
    const db = seed({ demoLogin: false });
    const { error: insertError } = await sb.from("app_state").upsert({ id: 1, data: db, version: 1 });
    if (insertError) throw new Error(`Database seed failed: ${insertError.message}`);
    return { db, changed: false, version: 1 };
  }
  const db = data.data as DB;
  const changed = migrate(db);
  return { db, changed, version: data.version || 1 };
}

async function writeCloud(db: DB, version: number) {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase is not configured.");
  const nextVersion = version + 1;
  const { data, error } = await sb
    .from("app_state")
    .update({ data: db, version: nextVersion })
    .eq("id", 1)
    .eq("version", version)
    .select("version")
    .maybeSingle();
  if (error) throw new Error(`Database write failed: ${error.message}`);
  if (!data) {
    // Lost the race — retry once with latest
    const latest = await readCloud();
    const { error: retryError } = await sb
      .from("app_state")
      .update({ data: db, version: latest.version + 1 })
      .eq("id", 1)
      .eq("version", latest.version);
    if (retryError) throw new Error(`Database write retry failed: ${retryError.message}`);
  }
}

function withDb<T>(fn: (db: DB) => T): Promise<T> {
  const run = queue.then(async () => {
    assertDbReady();
    if (useLocalDb()) {
      const { db, changed } = readLocal();
      const before = JSON.stringify(db);
      const result = fn(db);
      const after = JSON.stringify(db);
      if (changed || before !== after) writeLocal(db);
      return result;
    }
    if (!supabaseConfigured()) {
      throw new Error("Supabase is required for production. See DEPLOY.md.");
    }
    const { db, changed, version } = await readCloud();
    const before = JSON.stringify(db);
    const result = fn(db);
    const after = JSON.stringify(db);
    if (changed || before !== after) await writeCloud(db, version);
    return result;
  });
  queue = run.then(() => undefined, () => undefined);
  return run;
}

function profile(db: DB, id: string) {
  return db.profiles.find((p) => p.id === id) || null;
}

function colorFor(userId: string) {
  let n = 0;
  for (const ch of userId) n += ch.charCodeAt(0);
  return COLORS[n % COLORS.length];
}

function toFeed(db: DB, post: PostRow, viewerId: string | null) {
  const author = profile(db, post.author_id);
  const place = post.place_id ? db.places.find((p) => p.id === post.place_id) : null;
  const name = author?.display_name || "Traveler";
  const isEvent = (post.tag || "").toLowerCase().includes("event");
  return {
    id: post.id,
    author_id: post.author_id,
    author: name,
    time: relativeTime(post.created_at),
    location: place ? `${place.name}, ${place.location_name}` : "On the road",
    title: post.title,
    text: post.content,
    tag: post.tag,
    isBad: post.is_recommended === false,
    isRecommended: post.is_recommended === true,
    isEvent,
    likes: post.likes_count,
    comments: post.comments_count,
    liked_by_me: viewerId ? db.likes.some((l) => l.post_id === post.id && l.user_id === viewerId) : false,
    avatarInitial: name[0] || "T",
    avatarColor: colorFor(post.author_id),
    imageText: place ? `${place.name} · ${place.location_name}` : undefined,
    actionButton: isEvent ? "I'm going →" : "Add to trip +",
    place_id: post.place_id,
    photos: post.photos || [],
    saved_by_me: viewerId ? db.bookmarks.some((b) => b.post_id === post.id && b.user_id === viewerId) : false,
    created_at: post.created_at,
  };
}

function notify(db: DB, userId: string, text: string) {
  db.notifications.unshift({ id: id(), user_id: userId, text, read: false, created_at: new Date().toISOString() });
}

function toEvent(db: DB, event: EventRow, viewerId: string | null) {
  const mine = viewerId ? db.rsvps.find((r) => r.event_id === event.id && r.user_id === viewerId) : undefined;
  return {
    ...event,
    location: event.location_name,
    date: dateLabel(event.event_date),
    status: mine ? (mine.status === "going" ? "Going" : "Interested") : "",
    my_status: mine?.status || null,
  };
}

export const store = {
  async signup(input: { username: string; display_name: string; password: string }) {
    return withDb((db) => {
      const username = input.username.trim().toLowerCase();
      if (username.length < 3) throw new Error("Username must be at least 3 characters.");
      if (input.password.length < 6) throw new Error("Password must be at least 6 characters.");
      if (db.profiles.some((p) => p.username === username)) throw new Error("That username is taken.");
      const user: Profile = {
        id: id(),
        username,
        display_name: input.display_name.trim() || username,
        avatar_url: null,
        bio: null,
        location: null,
        points: 0,
        created_at: new Date().toISOString(),
      };
      db.profiles.push(user);
      db.passwords.push({ user_id: user.id, ...hashPassword(input.password) });
      return publicUser(db, user);
    });
  },

  async login(username: string, password: string) {
    return withDb((db) => {
      const user = db.profiles.find((p) => p.username === username.trim().toLowerCase());
      const pw = user && db.passwords.find((p) => p.user_id === user.id);
      if (!user || !pw) throw new Error("Wrong username or password.");
      const hash = crypto.scryptSync(password, pw.salt, 32).toString("hex");
      if (hash !== pw.hash) throw new Error("Wrong username or password.");
      return publicUser(db, user);
    });
  },

  async me(userId: string | null) {
    if (!userId) return null;
    return withDb((db) => {
      const user = profile(db, userId);
      return user ? publicUser(db, user) : null;
    });
  },

  async getPosts(viewerId: string | null, filter?: { tag?: string; search?: string; lat?: number; lng?: number; radius?: number }) {
    return withDb((db) => {
      let rows = [...db.posts].sort((a, b) => b.created_at.localeCompare(a.created_at));
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        rows = rows.filter((p) => {
          const author = profile(db, p.author_id)?.display_name || "";
          const place = p.place_id ? db.places.find((x) => x.id === p.place_id) : null;
          return [p.title, p.content, p.tag, author, place?.name, place?.state, place?.location_name]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q));
        });
      }
      if (filter?.tag) {
        const t = filter.tag.toLowerCase().replace(/\s+/g, "");
        const category = t.includes("camp") ? "campground" : t.includes("rv") ? "rv_park" : t.includes("beach") ? "beach" : t.includes("trail") ? "trail" : "";
        rows = rows.filter((p) => p.tag.toLowerCase().includes(t) || (category && p.place_id && db.places.find((x) => x.id === p.place_id)?.category === category));
      }
      if (filter?.lat !== undefined && filter?.lng !== undefined) {
        const radius = filter.radius || 50;
        rows = rows.filter((p) => {
          const place = p.place_id ? db.places.find((x) => x.id === p.place_id) : null;
          return place ? miles(filter.lat!, filter.lng!, place.lat, place.lng) <= radius : false;
        });
      }
      return rows.map((p) => toFeed(db, p, viewerId));
    });
  },

  async createPost(userId: string, input: { title?: string; text: string; tag?: string; place_id?: string | null; is_recommended?: boolean | null; photos?: string[] }) {
    const photos = sanitizePhotoUrls(input.photos);
    return withDb((db) => {
      const user = profile(db, userId);
      if (!user) throw new Error("Sign in required.");
      const post: PostRow = {
        id: id(),
        author_id: userId,
        title: (input.title || input.text.slice(0, 80)).trim(),
        content: input.text.trim(),
        tag: input.tag || "#RoadTraveler",
        is_recommended: input.is_recommended ?? null,
        place_id: input.place_id || null,
        likes_count: 0,
        comments_count: 0,
        photos,
        created_at: new Date().toISOString(),
      };
      db.posts.unshift(post);
      user.points += 10;
      return toFeed(db, post, userId);
    });
  },

  async toggleLike(userId: string, postId: string) {
    return withDb((db) => {
      const post = db.posts.find((p) => p.id === postId);
      if (!post) throw new Error("Post not found.");
      const existing = db.likes.findIndex((l) => l.post_id === postId && l.user_id === userId);
      if (existing >= 0) {
        db.likes.splice(existing, 1);
        post.likes_count = Math.max(0, post.likes_count - 1);
        return { liked: false, likes: post.likes_count };
      }
      db.likes.push({ post_id: postId, user_id: userId });
      post.likes_count += 1;
      if (post.author_id !== userId) {
        const who = profile(db, userId)?.display_name || "Someone";
        notify(db, post.author_id, `${who} liked your post “${post.title.slice(0, 48)}”`);
      }
      return { liked: true, likes: post.likes_count };
    });
  },

  async getComments(postId: string) {
    return withDb((db) =>
      db.comments
        .filter((c) => c.post_id === postId)
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((c) => {
          const author = profile(db, c.user_id);
          const name = author?.display_name || "Traveler";
          return { id: c.id, author: name, initial: name[0], color: colorFor(c.user_id), text: c.content, time: relativeTime(c.created_at) };
        })
    );
  },

  async addComment(userId: string, postId: string, content: string) {
    return withDb((db) => {
      const post = db.posts.find((p) => p.id === postId);
      const user = profile(db, userId);
      if (!post || !user) throw new Error("Sign in required.");
      const row: CommentRow = { id: id(), post_id: postId, user_id: userId, content: content.trim(), created_at: new Date().toISOString() };
      db.comments.push(row);
      post.comments_count += 1;
      user.points += 2;
      if (post.author_id !== userId) notify(db, post.author_id, `${user.display_name} commented on “${post.title.slice(0, 48)}”`);
      return { id: row.id, author: user.display_name, initial: user.display_name[0], color: colorFor(userId), text: row.content, time: "Just now", comments_count: post.comments_count };
    });
  },

  async getPlaces(query?: { search?: string; category?: string; lat?: number; lng?: number; radius?: number }) {
    return withDb((db) => {
      let results = db.places.map((p) => ({ ...p }));
      if (query?.category && query.category !== "all") {
        results = results.filter((p) => p.category === query.category);
      }
      if (query?.search) {
        const s = query.search.toLowerCase();
        results = results.filter((p) => [p.name, p.location_name, p.state, p.category].some((v) => v.toLowerCase().includes(s)));
      }
      if (query?.lat !== undefined && query?.lng !== undefined) {
        const radius = query.radius || 50;
        results = results
          .map((p) => ({ ...p, distance_miles: Math.round(miles(query.lat!, query.lng!, p.lat, p.lng) * 10) / 10 }))
          .filter((p) => p.distance_miles <= radius)
          .sort((a, b) => a.distance_miles - b.distance_miles);
      }
      return results;
    });
  },

  async getEvents(viewerId: string | null, query?: { lat?: number; lng?: number; radius?: number }) {
    return withDb((db) => {
      let rows = [...db.events];
      if (query?.lat !== undefined && query?.lng !== undefined) {
        const radius = query.radius || 50;
        rows = rows.filter((e) => miles(query.lat!, query.lng!, e.lat, e.lng) <= radius);
      }
      rows.sort((a, b) => a.event_date.localeCompare(b.event_date));
      return rows.map((e) => toEvent(db, e, viewerId));
    });
  },

  async createEvent(userId: string, input: { title: string; location: string; date?: string; description?: string }) {
    return withDb((db) => {
      if (!profile(db, userId)) throw new Error("Sign in required.");
      const event: EventRow = {
        id: id(),
        creator_id: userId,
        title: input.title.trim(),
        description: input.description || "",
        location_name: input.location.trim(),
        lat: 39.5,
        lng: -98.35,
        event_date: input.date || new Date().toISOString().slice(0, 10),
        going_count: 1,
        interested_count: 0,
        created_at: new Date().toISOString(),
      };
      db.events.unshift(event);
      db.rsvps.push({ event_id: event.id, user_id: userId, status: "going" });
      return toEvent(db, event, userId);
    });
  },

  async rsvp(userId: string, eventId: string, status: "going" | "interested") {
    return withDb((db) => {
      const event = db.events.find((e) => e.id === eventId);
      if (!event || !profile(db, userId)) throw new Error("Sign in required.");
      const prev = db.rsvps.find((r) => r.event_id === eventId && r.user_id === userId);
      if (prev?.status === "going") event.going_count = Math.max(0, event.going_count - 1);
      if (prev?.status === "interested") event.interested_count = Math.max(0, event.interested_count - 1);
      if (prev) prev.status = status;
      else db.rsvps.push({ event_id: eventId, user_id: userId, status });
      if (status === "going") event.going_count += 1;
      else event.interested_count += 1;
      return toEvent(db, event, userId);
    });
  },

  async leaderboard() {
    return withDb((db) =>
      [...db.profiles]
        .sort((a, b) => b.points - a.points)
        .map((p, i) => ({
          rank: i + 1,
          initial: p.display_name[0],
          name: p.display_name,
          points: `${p.points.toLocaleString()} pts`,
          color: colorFor(p.id),
          badgeCount: db.user_badges.filter((b) => b.user_id === p.id).length,
        }))
    );
  },

  async badges(userId: string | null) {
    return withDb((db) => {
      const mine = new Set(db.user_badges.filter((b) => b.user_id === userId).map((b) => b.badge_id));
      return db.badges.map((b) => ({ ...b, unlocked: mine.has(b.id) }));
    });
  },

  async tripsFor(userId: string) {
    return withDb((db) =>
      db.trips
        .filter((t) => t.user_id === userId)
        .map((t) => ({ ...t, stops: db.stops.filter((s) => s.trip_id === t.id).sort((a, b) => a.order_index - b.order_index) }))
    );
  },

  async createTrip(userId: string, title: string) {
    return withDb((db) => {
      if (!profile(db, userId)) throw new Error("Sign in required.");
      const trip: TripRow = { id: id(), user_id: userId, title: title.trim() || "New trip", description: "", is_public: true, created_at: new Date().toISOString() };
      db.trips.unshift(trip);
      return { ...trip, stops: [] as StopRow[] };
    });
  },

  async addStop(userId: string, tripId: string, input: { title: string; location?: string; note?: string; stop_type?: StopRow["stop_type"]; place_id?: string | null; days?: number }) {
    return withDb((db) => {
      const trip = db.trips.find((t) => t.id === tripId && t.user_id === userId);
      if (!trip) throw new Error("Trip not found.");
      const existing = db.stops.filter((s) => s.trip_id === tripId);
      const stop: StopRow = {
        id: id(),
        trip_id: tripId,
        place_id: input.place_id || null,
        custom_title: input.title,
        stop_type: input.stop_type || "place",
        days_duration: input.days ?? 1,
        order_index: existing.length,
        note: input.note || "",
        location: input.location || "",
      };
      db.stops.push(stop);
      return stop;
    });
  },

  async removeStop(userId: string, stopId: string) {
    return withDb((db) => {
      const stop = db.stops.find((s) => s.id === stopId);
      const trip = stop && db.trips.find((t) => t.id === stop.trip_id && t.user_id === userId);
      if (!stop || !trip) throw new Error("Stop not found.");
      db.stops = db.stops.filter((s) => s.id !== stopId);
      return { ok: true };
    });
  },

  async createClaim(userId: string, input: { place_id?: string; listing_name?: string; business_email: string; phone?: string; role?: string }) {
    return withDb((db) => {
      if (!profile(db, userId)) throw new Error("Sign in required.");
      const place = input.place_id
        ? db.places.find((p) => p.id === input.place_id)
        : db.places.find((p) => p.name === input.listing_name) || db.places[0];
      if (!place) throw new Error("Listing not found.");
      const prior = db.claims.filter((c) => c.place_id === place.id && c.user_id === userId);
      const last = prior[prior.length - 1];
      if (last?.status === "pending") throw new Error("You already have a claim waiting for review.");
      if (last && last.resubmit_count >= 5) throw new Error("This listing can only be resubmitted 5 times.");
      const claim: ClaimRow = {
        id: id(),
        place_id: place.id,
        user_id: userId,
        status: "pending",
        business_email: input.business_email,
        phone: input.phone || "",
        role: input.role || "Owner",
        decline_note: null,
        resubmit_count: last ? last.resubmit_count + 1 : 0,
        created_at: new Date().toISOString(),
      };
      db.claims.push(claim);
      return claim;
    });
  },

  async createReview(userId: string, input: { place_id: string; rating: number; content: string }) {
    return withDb((db) => {
      const user = profile(db, userId);
      const place = db.places.find((p) => p.id === input.place_id);
      if (!user || !place) throw new Error("Sign in required.");
      const rating = Math.min(5, Math.max(1, Math.round(input.rating)));
      let review = db.reviews.find((r) => r.place_id === place.id && r.user_id === userId);
      if (review) {
        review.rating = rating;
        review.content = input.content.trim();
      } else {
        review = { id: id(), place_id: place.id, user_id: userId, rating, content: input.content.trim(), created_at: new Date().toISOString() };
        db.reviews.push(review);
        user.points += 15;
        if (!db.user_badges.some((b) => b.user_id === userId && b.badge_id === "first_review")) {
          db.user_badges.push({ user_id: userId, badge_id: "first_review", is_showcased: true });
        }
      }
      const mine = db.reviews.filter((r) => r.place_id === place.id);
      place.reviews_count = mine.length;
      place.rating = Math.round((mine.reduce((s, r) => s + r.rating, 0) / mine.length) * 10) / 10;
      return review;
    });
  },

  async reviewsFor(placeId: string) {
    return withDb((db) =>
      db.reviews
        .filter((r) => r.place_id === placeId)
        .map((r) => ({ ...r, author: profile(db, r.user_id)?.display_name || "Traveler", time: relativeTime(r.created_at) }))
    );
  },

  async stories() {
    return withDb((db) =>
      [...db.stories]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((s) => {
          const author = profile(db, s.user_id);
          return { ...s, author: author?.display_name || "Traveler", time: relativeTime(s.created_at) };
        })
    );
  },

  async addStory(userId: string, input: { caption: string; image_url?: string | null }) {
    return withDb((db) => {
      const user = profile(db, userId);
      if (!user) throw new Error("Sign in required.");
      const imageUrl = sanitizePhotoUrls(input.image_url ? [input.image_url] : [])[0] || null;
      const story: StoryRow = { id: id(), user_id: userId, caption: input.caption.trim(), image_url: imageUrl, created_at: new Date().toISOString() };
      db.stories.unshift(story);
      return { ...story, author: user.display_name, time: "Just now" };
    });
  },

  async notifications(userId: string) {
    return withDb((db) => db.notifications.filter((n) => n.user_id === userId).map((n) => ({ ...n, time: relativeTime(n.created_at) })));
  },

  async markNotificationsRead(userId: string) {
    return withDb((db) => {
      for (const n of db.notifications) if (n.user_id === userId) n.read = true;
      return { ok: true };
    });
  },

  async toggleBookmark(userId: string, postId: string) {
    return withDb((db) => {
      const i = db.bookmarks.findIndex((b) => b.user_id === userId && b.post_id === postId);
      if (i >= 0) {
        db.bookmarks.splice(i, 1);
        return { saved: false };
      }
      db.bookmarks.push({ user_id: userId, post_id: postId });
      return { saved: true };
    });
  },

  async guideSaves(userId: string | null) {
    return withDb((db) => (userId ? db.guide_saves.filter((g) => g.user_id === userId).map((g) => g.guide_id) : []));
  },

  async toggleGuide(userId: string, guideId: string) {
    return withDb((db) => {
      const i = db.guide_saves.findIndex((g) => g.user_id === userId && g.guide_id === guideId);
      if (i >= 0) {
        db.guide_saves.splice(i, 1);
        return { saved: false };
      }
      db.guide_saves.push({ user_id: userId, guide_id: guideId });
      return { saved: true };
    });
  },
};

function publicUser(db: DB, user: Profile) {
  const badges = db.user_badges.filter((b) => b.user_id === user.id);
  return {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    points: user.points,
    badge_count: badges.length,
    showcased: badges.filter((b) => b.is_showcased).length,
  };
}
