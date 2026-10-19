import { NextResponse } from "next/server";

export async function GET() {
  try {
    const badges = [
      { id: "first_review", label: "First Review", description: "Left your first place review", group: "reviews", icon: "rate_review" },
      { id: "local_guide", label: "Local Guide", description: "Wrote 5 helpful reviews", group: "reviews", icon: "explore" },
      { id: "road_trip_master", label: "Road Trip Master", description: "Wrote 15 reviews on RoadTraveler", group: "reviews", icon: "map" },
      { id: "travel_chronicler", label: "Travel Chronicler", description: "Shared 30 reviews with the community", group: "reviews", icon: "library_books" },
      { id: "community_voice", label: "Community Voice", description: "Reached 50 reviews — a trusted traveler", group: "reviews", icon: "forum" },
      { id: "travel_legend", label: "Travel Legend", description: "Earned 75 reviews over your journeys", group: "reviews", icon: "stars" },
      { id: "roadtraveler_elite", label: "RoadTraveler Elite", description: "A century of reviews — top-tier contributor", group: "reviews", icon: "grade" },
      { id: "photo_explorer", label: "Photo Explorer", description: "Shared photos in a review", group: "photos", icon: "photo_camera" },
      { id: "shutterbug", label: "Shutterbug", description: "Added photos to 3 reviews", group: "photos", icon: "photo_library" },
      { id: "picture_perfect", label: "Picture Perfect", description: "Shared photos in 8 reviews", group: "photos", icon: "collections" },
      { id: "visual_storyteller", label: "Visual Storyteller", description: "Brought 20 reviews to life with photos", group: "photos", icon: "panorama" },
      { id: "gallery_guru", label: "Gallery Guru", description: "Photo-rich reviews on 35 different trips", group: "photos", icon: "photo_album" },
      { id: "first_stop", label: "First Stop", description: "Reviewed 3 different places", group: "explore", icon: "place" },
      { id: "route_finder", label: "Route Finder", description: "Reviewed 10 unique listings", group: "explore", icon: "directions" },
      { id: "wanderer", label: "Wanderer", description: "Explored and reviewed 20 different places", group: "explore", icon: "directions_walk" },
      { id: "cross_country", label: "Cross Country", description: "Reviewed 35 unique stops on the map", group: "explore", icon: "public" },
      { id: "open_road", label: "Open Road", description: "Reviewed 50 unique places — true explorer", group: "explore", icon: "flight" },
      { id: "contributor", label: "Contributor", description: "Added a listing to the directory", group: "listings", icon: "add" },
      { id: "directory_builder", label: "Directory Builder", description: "Added 3 listings to RoadTraveler", group: "listings", icon: "business" },
      { id: "place_maker", label: "Place Maker", description: "Published 7 listings for other travelers", group: "listings", icon: "location_city" },
      { id: "community_curator", label: "Community Curator", description: "Curated 12 listings on the platform", group: "listings", icon: "local_activity" },
      { id: "verified_owner", label: "Verified Owner", description: "Successfully claimed a business listing", group: "claims", icon: "verified_user" },
      { id: "multi_location_owner", label: "Multi-Location Owner", description: "Verified 2 business listings", group: "claims", icon: "store" },
      { id: "member_2_weeks", label: "Two-Week Traveler", description: "Part of RoadTraveler for 2 weeks", group: "loyalty", icon: "today" },
      { id: "member_2_months", label: "Regular Explorer", description: "A member for 2 months", group: "loyalty", icon: "event" },
      { id: "member_6_months", label: "Seasoned Traveler", description: "Six months on the road with us", group: "loyalty", icon: "event_available" },
      { id: "member_1_year", label: "Road Veteran", description: "One year as a RoadTraveler member", group: "loyalty", icon: "card_giftcard" },
      { id: "member_2_years", label: "Founding Spirit", description: "Two years of exploring with the community", group: "loyalty", icon: "beenhere" },
    ];
    return NextResponse.json({ success: true, count: badges.length, data: badges });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
