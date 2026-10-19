import { fail, ok } from "@/lib/http";
import { getUserId } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET() {
  try {
    return ok(await store.badges(await getUserId()));
  } catch (error) {
    return fail(error, 500);
  }
}
