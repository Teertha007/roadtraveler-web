import { fail, ok } from "@/lib/http";
import { store } from "@/lib/store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const places = await store.getPlaces({
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      radius: searchParams.get("radius") ? parseFloat(searchParams.get("radius")!) : 50,
    });
    return ok(places);
  } catch (error) {
    return fail(error, 500);
  }
}
