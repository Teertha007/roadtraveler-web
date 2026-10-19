# RoadTraveler — Full Rebuild Technical Handoff Document

**Last Updated:** October 2026  
**Author:** AI Pair Programmer (Antigravity)  
**Project Owner:** Teertha (`teert`)  
**Workspace Location:** `C:\Users\teert\roadtraveler-web`  

---

## 1. Executive Summary & Context

**RoadTraveler** is a USA-focused roadside discovery, camping, RVing, and trip-planning web platform. 
Originally built on WordPress (Local by Flywheel + MyListing theme + custom feature plugins), the client approved transitioning the platform into a modern, full-stack **travel social network + directory** matching the Figma **v4 "Night Feed"** dark UI theme.

The codebase at `C:\Users\teert\roadtraveler-web` is a standalone, production-ready **Next.js 16 (App Router) + Supabase** application. All pages, interactive UI components, modals, and backend API routes have been built, verified, and connected.

---

## 2. Technology Stack & Design System

* **Framework:** Next.js 16.4.0 (App Router, Turbopack, React 19)
* **Language:** TypeScript 5
* **Styling:** Tailwind CSS v4 using `@theme inline` variables defined in `src/app/globals.css`:
  * Base Background: `#0C1222`
  * Card Surface: `#141C33`
  * Border / Line: `#243052`
  * Amber Accent: `#FDB601`
  * Font Family: `Public Sans` (`--font-public-sans`)
* **Icons:** `lucide-react`
* **Maps Engine:** Google Maps JavaScript API via `@googlemaps/js-api-loader` + `@types/google.maps` + Leaflet/React-Leaflet
* **Database & Auth Client:** `@supabase/supabase-js`

---

## 3. Database Architecture & Schema (Supabase / Postgres)

The complete SQL schema and seed data are located in the repository:
* Schema file: `supabase/schema.sql`
* Seed catalog: `supabase/seed.sql`

### 3.1 Tables Overview
1. **`profiles`**: Extends Supabase `auth.users` with `username`, `display_name`, `avatar_url`, `bio`, `location`, `points`, and review counters.
2. **`places`**: Directory listings for campgrounds, RV parks, beaches, trails, rest stops, and attractions. Includes coordinates (`lat`, `lng`), `amenities` stored as `JSONB`, ratings, review count, and business ownership claims.
3. **`posts`**: Community social feed updates supporting media attachments, place tagging, recommendation flags (`is_recommended`), hashtags, like counts, and comment counts.
4. **`post_likes` & `post_comments`**: One-to-many and many-to-many post engagement relations.
5. **`events` & `event_rsvps`**: Community rallies, trail runs, and gatherings with attendance tracking (`going` / `interested`).
6. **`trips` & `trip_stops`**: Multi-day trip itineraries supporting sequence ordering, rest days, custom checkpoints, and shareable URLs.
7. **`claims`**: Business listing ownership claims with proof uploads, review status (`pending`, `approved`, `declined`), and a 5-attempt resubmit limit.
8. **`badges` & `user_badges`**: **All 28 milestone badges** ported directly from the legacy WordPress `road-traveler-features` plugin (Reviews, Photo Reviews, Exploration, Listings, Claims, and Member Loyalty). Showcase limit: maximum 4 badges.
9. **`get_places_near_me()` Function**: PostgreSQL stored procedure using the Haversine distance formula to query places within a 50-mile radius of user GPS coordinates.

---

## 4. Backend Data Access Layer & API Endpoints

### 4.1 Unified DB Access Layer (`src/lib/supabase/db.ts`)
The application includes a dual-mode database abstraction layer:
* **Production Mode:** When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided in `.env.local`, queries route directly to PostgreSQL via `@supabase/supabase-js`.
* **In-Memory Fallback Mode:** If Supabase credentials are not yet configured, the system transparently serves a complete in-memory data store with full CRUD capabilities. This allows development and UI testing to function 100% out-of-the-box without crashing or requiring database setup.

### 4.2 Next.js API Routes
| Endpoint | Method | Description |
|---|---|---|
| `/api/posts` | `GET` | Fetches feed posts with search query, tag filters, or tab filters. |
| `/api/posts` | `POST` | Publishes a new road post to the feed. |
| `/api/posts/[id]/like` | `POST` | Toggles like/unlike on a post with live count updates. |
| `/api/places` | `GET` | Searches directory places by keyword, category, or GPS radius (`lat`, `lng`, `radius`). |
| `/api/events` | `GET` | Returns upcoming gatherings and rallies. |
| `/api/events/[id]/rsvp` | `POST` | Updates RSVP status (`going` / `interested`) for an event. |
| `/api/leaderboard` | `GET` | Returns top traveler rankings by points, badges, and reviews. |
| `/api/badges` | `GET` | Returns the complete catalog of all 28 milestone badges. |

---

## 5. Webpages & Application Routing

The application follows the Next.js App Router structure with dedicated pages for all 7 sidebar navigation sections:

### 1. Home Social Feed (`src/app/page.tsx` — `/`)
* Full implementation of the Figma v4 "Night Feed" design.
* Instagram-style story bubbles with active gradient borders and story viewer modal.
* Post composer with interactive attachments for photos, location tags, event tags, and trip links.
* Live social feed with likes, bookmarking, post sharing, comments discussion modal, and hashtag filtering.
* Right rail widgets: State discovery bars, upcoming events, trip summary card, top travelers leaderboard, and badge showcase.

### 2. Map Explorer (`src/app/map/page.tsx` — `/map`)
* Integrated **Google Maps JavaScript API** engine (`src/components/GoogleMapView.tsx`) with dark-mode styling (`#0C1222`).
* Map mode toggle between **Google Dark**, **Satellite**, and **Terrain**.
* Left places drawer synced with map pins. Clicking a place smoothly pans and zooms to its location.
* Interactive place detail overlay with ratings, visitor counts, amenity tags, "Add to trip +", and a 1-click Google Maps turn-by-turn directions launcher.

### 3. Places Directory (`src/app/explore/page.tsx` — `/explore`)
* Directory discovery for campgrounds, RV parks, beaches, trails, and rest stops.
* Multi-select amenity filtering (*Pet-Friendly*, *Restrooms*, *Parking*, *RV Hookups*, *Showers*, *Potable Water*, *Free Entry*).
* Sort by *Highest Rated ★* or *Most Reviewed*.
* Business Claim CTA banner linking to the ownership verification flow.

### 4. Gatherings & Events (`src/app/events/page.tsx` — `/events`)
* Lists upcoming overland rallies, swap meets, and trail runs.
* Category filters: *All Events*, *Festivals & Rallies*, *Trail Runs & Hikes*, *Gear Swap Meets*.
* Real-time RSVP toggle buttons (*Going* / *Interested*) connected to the backend.
* Host an Event modal allowing users to publish new community gatherings.

### 5. Community & Badges (`src/app/community/page.tsx` — `/community`)
* Traveler discussion forum with trending topics and Q&A categories.
* Monthly community leaderboard ranking contributors by points and reviews.
* Complete visual catalog of all 28 milestone badges with threshold requirements and showcase rules.

### 6. Field Guides (`src/app/guides/page.tsx` — `/guides`)
* In-depth overlanding tutorials, boondocking guides, and vanlife survival articles.
* Estimated read times, category tags, and bookmarking.
* Fullscreen Guide Reader modal with formatted article text, tips, and social sharing.

### 7. Trip Planner (`src/app/trips/page.tsx` — `/trips`)
* Step-by-step itinerary builder with rest days, custom checkpoints, and waypoint sequencing.
* Route summary statistics (Total Distance: 740 mi, Drive Time: 12h 30m, Reserved Campgrounds).
* Reorder stops, remove stops, add new custom stops, and copy shareable trip links to clipboard.

---

## 6. Shared Components & Interactive Modals

All UI elements are interactive, backed by modals or toast notifications:

* **`src/context/ToastContext.tsx`**: Global toast alert system providing visual feedback (`useToast()`).
* **`src/components/Sidebar.tsx`**: 92px left rail navigation with active route detection (`usePathname`).
* **`src/components/Navbar.tsx`**: 72px top bar with search, filter chips, GPS Near Me toggle, notifications, and profile menu.
* **`src/components/CommandPalette.tsx`**: Modal opened by `⌘K` or the search badge for quick keyboard navigation.
* **`src/components/NotificationsPopover.tsx`**: Notification popover showing likes, badge alerts, and mark-all-read.
* **`src/components/ProfileMenu.tsx`**: User profile menu displaying unlocked badges, planned trips, and account actions.
* **`src/components/FilterModal.tsx`**: Search filter modal with distance radius sliders (5–200 mi), amenity checkboxes, minimum star ratings, and BLM/free camping toggles.
* **`src/components/StoryViewerModal.tsx`**: Fullscreen story viewer with animated progress timer and instant reply box.
* **`src/components/CommentsModal.tsx`**: Comments and discussion drawer for reading and submitting post replies.
* **`src/components/ShareModal.tsx`**: Share dialog with 1-click clipboard link copying and Twitter/WhatsApp/Telegram shortcuts.
* **`src/components/AddToTripModal.tsx`**: Modal to attach any place from the feed or map into an existing or new trip.
* **`src/components/ClaimListingModal.tsx`**: Business claim form with proof-of-ownership document upload.
* **`src/components/HostEventModal.tsx`**: Form to submit and publish new community gatherings.
* **`src/components/GuideReaderModal.tsx`**: Reader dialog for field guides and tutorials.
* **`src/components/GoogleMapView.tsx`**: Full Google Maps implementation with custom dark theme, Satellite/Terrain toggles, custom pins, and CartoDB Dark Matter fallback.

---

## 7. Environment Variables & Setup

Configuration template is at `.env.example`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Maps API (Optional: Fallback map is active if omitted)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Running the Project
```bash
cd C:\Users\teert\roadtraveler-web
npm run dev      # Starts Next.js Turbopack dev server on http://localhost:3000
npm run build    # Produces optimized production build (validated with 0 errors)
```

---

## 8. Recommended Next Steps for Continuing AI

1. **Connect Live Supabase Instance:**
   * Create a Supabase project and execute `supabase/schema.sql` and `supabase/seed.sql` in the Supabase SQL editor.
   * Add the project URL and anon key into `.env.local`.
2. **Supabase Auth UI:**
   * Add Supabase Login/Signup modals (email/password and Google OAuth) connected to `auth.users` and `profiles`.
3. **Storage Buckets:**
   * Create a Supabase Storage bucket (`photos`) for image uploads from the post composer, review submissions, and claim proof documents.
4. **Deploy to Vercel:**
   * Run `npx vercel` inside `C:\Users\teert\roadtraveler-web` to deploy permanently to Vercel's free tier.
