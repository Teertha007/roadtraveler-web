import { fail, ok } from "@/lib/http";
import { getUserId } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const events = await store.getEvents(await getUserId(), {
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      radius: searchParams.get("radius") ? parseFloat(searchParams.get("radius")!) : 50,
    });
    return ok(events);
  } catch (error) {
    return fail(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return fail(new Error("Sign in required."));
    const body = await request.json();
    if (!body.title || !body.location) return fail(new Error("Title and location are required."));
    return ok(await store.createEvent(userId, body), 201);
  } catch (error) {
    return fail(error, 500);
  }
}
