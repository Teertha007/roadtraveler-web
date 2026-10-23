import { fail, ok } from "@/lib/http";
import { getUserId } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET(request: Request) {
  try {
    const placeId = new URL(request.url).searchParams.get("place_id") || "";
    return ok(await store.reviewsFor(placeId));
  } catch (error) {
    return fail(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return fail(new Error("Sign in required."));
    const body = await request.json();
    if (!body.place_id || !body.content) return fail(new Error("A place and a review are required."));
    return ok(await store.createReview(userId, body), 201);
  } catch (error) {
    return fail(error, 500);
  }
}
