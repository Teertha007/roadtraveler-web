-- ==============================================================================
-- RoadTraveler Database Schema (Supabase / PostgreSQL)
-- Specification based on road-traveler-features and v4 UI requirements
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ------------------------------------------------------------------------------
-- 1. Profiles (Extends Supabase Auth users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. Places / Listings
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('campground', 'rv_park', 'beach', 'trail', 'rest_stop', 'attraction', 'restaurant')),
    description TEXT,
    location_name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT NOT NULL,
    zip_code TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    amenities JSONB DEFAULT '[]'::jsonb, -- e.g. ["pet_friendly", "wheelchair_accessible", "free_entry", "restrooms", "parking", "rv_hookups", "potable_water", "showers"]
    rating NUMERIC(2, 1) DEFAULT 0.0,
    reviews_count INTEGER DEFAULT 0,
    travelers_count INTEGER DEFAULT 0,
    photos TEXT[] DEFAULT '{}',
    claimed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for lat/lng queries
CREATE INDEX IF NOT EXISTS idx_places_lat_lng ON places (lat, lng);
CREATE INDEX IF NOT EXISTS idx_places_category ON places (category);
CREATE INDEX IF NOT EXISTS idx_places_state ON places (state);

-- ------------------------------------------------------------------------------
-- 3. Social Posts (Feed)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    tag TEXT, -- e.g. "#Arizona", "#Vanlife"
    is_recommended BOOLEAN, -- TRUE = Recommended, FALSE = Not Recommended, NULL = Neutral
    place_id UUID REFERENCES places(id) ON DELETE SET NULL,
    photos TEXT[] DEFAULT '{}',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. Post Likes & Comments
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. Events
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_name TEXT NOT NULL,
    place_id UUID REFERENCES places(id) ON DELETE SET NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    event_date DATE NOT NULL,
    start_time TIME,
    tags TEXT[] DEFAULT '{}',
    photos TEXT[] DEFAULT '{}',
    going_count INTEGER DEFAULT 0,
    interested_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('going', 'interested')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 6. Trip Planner & Itineraries
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places(id) ON DELETE SET NULL,
    custom_title TEXT,
    stop_type TEXT NOT NULL CHECK (stop_type IN ('place', 'break', 'checkpoint')),
    days_duration INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_stops_trip ON trip_stops (trip_id, order_index);

-- ------------------------------------------------------------------------------
-- 7. Reviews & Ratings
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(place_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 8. Business Claims (Ownership Verification)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    proof_photos TEXT[] DEFAULT '{}',
    decline_note TEXT,
    resubmit_count INTEGER DEFAULT 0 CHECK (resubmit_count <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. Badges & Gamification (28 Badges Spec)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY, -- slug e.g. 'first_review', 'local_guide'
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    metric TEXT NOT NULL,
    threshold INTEGER NOT NULL,
    group_name TEXT NOT NULL -- 'reviews', 'photos', 'explore', 'listings', 'claims', 'loyalty'
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    is_showcased BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- ------------------------------------------------------------------------------
-- 10. Spatial "Near Me" Function (Haversine Proximity Search)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_places_near_me(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_miles DOUBLE PRECISION DEFAULT 50.0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    category TEXT,
    location_name TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    rating NUMERIC,
    reviews_count INTEGER,
    distance_miles DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.slug,
        p.category,
        p.location_name,
        p.lat,
        p.lng,
        p.rating,
        p.reviews_count,
        (
            3959 * acos(
                cos(radians(user_lat)) * cos(radians(p.lat)) *
                cos(radians(p.lng) - radians(user_lng)) +
                sin(radians(user_lat)) * sin(radians(p.lat))
            )
        ) AS distance_miles
    FROM places p
    WHERE (
        3959 * acos(
            cos(radians(user_lat)) * cos(radians(p.lat)) *
            cos(radians(p.lng) - radians(user_lng)) +
            sin(radians(user_lat)) * sin(radians(p.lat))
        )
    ) <= radius_miles
    ORDER BY distance_miles ASC;
END;
$$ LANGUAGE plpgsql;

-- Row level security. Run after the tables exist.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "public read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "public read places" ON places FOR SELECT USING (true);
CREATE POLICY "public read events" ON events FOR SELECT USING (true);
CREATE POLICY "auth create events" ON events FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "own trips" ON trips FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own stops" ON trip_stops FOR ALL USING (
  EXISTS (SELECT 1 FROM trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
);
CREATE POLICY "public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own claims" ON claims FOR ALL USING (auth.uid() = user_id);
