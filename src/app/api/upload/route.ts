import fs from "fs";
import path from "path";
import { fail, ok } from "@/lib/http";
import { getUserId } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return fail(new Error("Sign in required."));
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail(new Error("Choose a photo first."));
    if (file.size > 5_000_000) return fail(new Error("Photos must be under 5 MB."));
    const safe = file.name.replace(/[^a-zA-Z0-9.]+/g, "-").slice(-40);
    const name = `${Date.now()}-${safe || "photo.jpg"}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    return ok({ url: `/uploads/${name}` });
  } catch (error) {
    return fail(error, 500);
  }
}
