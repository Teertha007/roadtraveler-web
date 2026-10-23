import fs from "fs";
import path from "path";
import { fail, ok } from "@/lib/http";
import { getUserId } from "@/lib/session";
import { isVercel, supabaseConfigured, useLocalDb } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { compressImage } from "@/lib/image";

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return fail(new Error("Sign in required."));
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail(new Error("Choose a photo first."));
    if (file.size > 8_000_000) return fail(new Error("Photos must be under 8 MB before compression."));

    const raw = Buffer.from(await file.arrayBuffer());
    const compressed = await compressImage(raw);
    const name = `${Date.now()}-${userId.slice(0, 8)}.${compressed.ext}`;

    // Binary goes to Storage / disk. The database only stores the short URL string.
    if (supabaseConfigured()) {
      const sb = getSupabaseAdmin()!;
      const { error } = await sb.storage.from("uploads").upload(name, compressed.buffer, {
        contentType: compressed.contentType,
        upsert: false,
      });
      if (error) {
        return fail(
          new Error(
            `Upload failed: ${error.message}. Create a public Storage bucket named "uploads" (see DEPLOY.md).`
          ),
          500
        );
      }
      const { data } = sb.storage.from("uploads").getPublicUrl(name);
      return ok({
        url: data.publicUrl,
        bytesIn: compressed.bytesIn,
        bytesOut: compressed.bytesOut,
      });
    }

    if (useLocalDb() && !isVercel()) {
      const dir = path.join(process.cwd(), "public", "uploads");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, name), compressed.buffer);
      return ok({
        url: `/uploads/${name}`,
        bytesIn: compressed.bytesIn,
        bytesOut: compressed.bytesOut,
      });
    }

    return fail(new Error("Uploads require Supabase Storage in production. See DEPLOY.md."), 503);
  } catch (error) {
    return fail(error, 500);
  }
}
