-- RoadTraveler production schema (Supabase / Postgres)
-- Safe to run in the Supabase SQL editor on a new project.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Single-row app document used by the production data layer.
CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data JSONB NOT NULL,
    version INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;
-- No policies: anon/authenticated cannot read/write; service_role bypasses RLS.

-- Public media bucket (create via Dashboard if this block fails).
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('uploads', 'uploads', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Create Storage bucket "uploads" (Public) in the Dashboard if needed.';
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public read uploads" ON storage.objects;
  CREATE POLICY "Public read uploads"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'uploads');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Add Storage policies for bucket uploads in the Dashboard if needed.';
END $$;

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_passwords (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    salt TEXT NOT NULL,
    hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    location_name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT NOT NULL,
    zip_code TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    amenities JSONB DEFAULT '[]'::jsonb,
    rating NUMERIC(2, 1) DEFAULT 0.0,
    reviews_count INTEGER DEFAULT 0,
    travelers_count INTEGER DEFAULT 0,
    photos TEXT[] DEFAULT '{}',
    claimed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_places_lat_lng ON places (lat, lng);
CREATE INDEX IF NOT EXISTS idx_places_category ON places (category);
CREATE INDEX IF NOT EXISTS idx_places_state ON places (state);

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    tag TEXT,
    is_recommended BOOLEAN,
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

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
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
    location TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_stops_trip ON trip_stops (trip_id, order_index);

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

CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    business_email TEXT,
    phone TEXT,
    role TEXT,
    proof_photos TEXT[] DEFAULT '{}',
    decline_note TEXT,
    resubmit_count INTEGER DEFAULT 0 CHECK (resubmit_count <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    metric TEXT NOT NULL,
    threshold INTEGER NOT NULL,
    group_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    is_showcased BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    caption TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookmarks (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS guide_saves (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    guide_id TEXT NOT NULL,
    PRIMARY KEY (user_id, guide_id)
);

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
        p.id, p.name, p.slug, p.category, p.location_name, p.lat, p.lng, p.rating, p.reviews_count,
        (3959 * acos(
            cos(radians(user_lat)) * cos(radians(p.lat)) *
            cos(radians(p.lng) - radians(user_lng)) +
            sin(radians(user_lat)) * sin(radians(p.lat))
        )) AS distance_miles
    FROM places p
    WHERE (3959 * acos(
            cos(radians(user_lat)) * cos(radians(p.lat)) *
            cos(radians(p.lng) - radians(user_lng)) +
            sin(radians(user_lat)) * sin(radians(p.lat))
        )) <= radius_miles
    ORDER BY distance_miles ASC;
END;
$$ LANGUAGE plpgsql;
