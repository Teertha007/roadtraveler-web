import { fail, ok } from "@/lib/http";
import { getUserId } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = await getUserId();
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const posts = await store.getPosts(userId, {
      tag: searchParams.get("tag") || undefined,
      search: searchParams.get("search") || undefined,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      radius: searchParams.get("radius") ? parseFloat(searchParams.get("radius")!) : 50,
    });
    return ok(posts);
  } catch (error) {
    return fail(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return fail(new Error("Sign in required."));
    const body = await request.json();
    if (!body.text || !String(body.text).trim()) return fail(new Error("Post content cannot be empty."));
    const post = await store.createPost(userId, {
      title: body.title,
      text: body.text,
      tag: body.tag,
      place_id: body.place_id,
      is_recommended: body.is_recommended,
      photos: Array.isArray(body.photos) ? body.photos : [],
    });
    return ok(post, 201);
  } catch (error) {
    return fail(error, 500);
  }
}
