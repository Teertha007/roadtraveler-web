import { fail, ok } from "@/lib/http";
import { getUserId } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET() {
  try {
    return ok(await store.stories());
  } catch (error) {
    return fail(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return fail(new Error("Sign in required."));
    const body = await request.json();
    if (!body.caption) return fail(new Error("Add a caption for your story."));
    return ok(await store.addStory(userId, body), 201);
  } catch (error) {
    return fail(error, 500);
  }
}
