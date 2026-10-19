-- ==============================================================================
-- RoadTraveler Database Seed Data
-- ==============================================================================

-- 1. Badges Catalog (All 28 badges from WordPress spec)
INSERT INTO badges (id, label, description, icon, metric, threshold, group_name) VALUES
('first_review', 'First Review', 'Left your first place review', 'rate_review', 'reviews', 1, 'reviews'),
('local_guide', 'Local Guide', 'Wrote 5 helpful reviews', 'explore', 'reviews', 5, 'reviews'),
('road_trip_master', 'Road Trip Master', 'Wrote 15 reviews on RoadTraveler', 'map', 'reviews', 15, 'reviews'),
('travel_chronicler', 'Travel Chronicler', 'Shared 30 reviews with the community', 'library_books', 'reviews', 30, 'reviews'),
('community_voice', 'Community Voice', 'Reached 50 reviews — a trusted traveler', 'forum', 'reviews', 50, 'reviews'),
('travel_legend', 'Travel Legend', 'Earned 75 reviews over your journeys', 'stars', 'reviews', 75, 'reviews'),
('roadtraveler_elite', 'RoadTraveler Elite', 'A century of reviews — top-tier contributor', 'grade', 'reviews', 100, 'reviews'),

('photo_explorer', 'Photo Explorer', 'Shared photos in a review', 'photo_camera', 'reviews_with_photos', 1, 'photos'),
('shutterbug', 'Shutterbug', 'Added photos to 3 reviews', 'photo_library', 'reviews_with_photos', 3, 'photos'),
('picture_perfect', 'Picture Perfect', 'Shared photos in 8 reviews', 'collections', 'reviews_with_photos', 8, 'photos'),
('visual_storyteller', 'Visual Storyteller', 'Brought 20 reviews to life with photos', 'panorama', 'reviews_with_photos', 20, 'photos'),
('gallery_guru', 'Gallery Guru', 'Photo-rich reviews on 35 different trips', 'photo_album', 'reviews_with_photos', 35, 'photos'),

('first_stop', 'First Stop', 'Reviewed 3 different places', 'place', 'unique_listings_reviewed', 3, 'explore'),
('route_finder', 'Route Finder', 'Reviewed 10 unique listings', 'directions', 'unique_listings_reviewed', 10, 'explore'),
('wanderer', 'Wanderer', 'Explored and reviewed 20 different places', 'directions_walk', 'unique_listings_reviewed', 20, 'explore'),
('cross_country', 'Cross Country', 'Reviewed 35 unique stops on the map', 'public', 'unique_listings_reviewed', 35, 'explore'),
('open_road', 'Open Road', 'Reviewed 50 unique places — true explorer', 'flight', 'unique_listings_reviewed', 50, 'explore'),

('contributor', 'Contributor', 'Added a listing to the directory', 'add', 'listings', 1, 'listings'),
('directory_builder', 'Directory Builder', 'Added 3 listings to RoadTraveler', 'business', 'listings', 3, 'listings'),
('place_maker', 'Place Maker', 'Published 7 listings for other travelers', 'location_city', 'listings', 7, 'listings'),
('community_curator', 'Community Curator', 'Curated 12 listings on the platform', 'local_activity', 'listings', 12, 'listings'),

('verified_owner', 'Verified Owner', 'Successfully claimed a business listing', 'verified_user', 'approved_claims', 1, 'claims'),
('multi_location_owner', 'Multi-Location Owner', 'Verified 2 business listings', 'store', 'approved_claims', 2, 'claims'),

('member_2_weeks', 'Two-Week Traveler', 'Part of RoadTraveler for 2 weeks', 'today', 'account_days', 14, 'loyalty'),
('member_2_months', 'Regular Explorer', 'A member for 2 months', 'event', 'account_days', 60, 'loyalty'),
('member_6_months', 'Seasoned Traveler', 'Six months on the road with us', 'event_available', 'account_days', 180, 'loyalty'),
('member_1_year', 'Road Veteran', 'One year as a RoadTraveler member', 'card_giftcard', 'account_days', 365, 'loyalty'),
('member_2_years', 'Founding Spirit', 'Two years of exploring with the community', 'beenhere', 'account_days', 730, 'loyalty')
ON CONFLICT (id) DO NOTHING;
