import sharp from "sharp";

/** Max edge length and WebP quality — keeps uploads small without looking soft. */
const MAX_EDGE = 1280;
const WEBP_QUALITY = 72;

/**
 * Compress an uploaded image to WebP.
 * The binary is written to disk / Supabase Storage — only the short URL is stored in the DB.
 */
export async function compressImage(input: Buffer) {
  const image = sharp(input, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const width = meta.width || MAX_EDGE;
  const height = meta.height || MAX_EDGE;

  const pipeline = image.resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });

  const { data, info } = await pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    contentType: "image/webp" as const,
    ext: "webp" as const,
    bytesIn: input.length,
    bytesOut: data.length,
    width: info.width || width,
    height: info.height || height,
  };
}

/** Only allow URLs that point at Storage / local uploads — never raw base64 in the DB. */
export function sanitizePhotoUrls(urls: unknown, max = 4): string[] {
  if (!Array.isArray(urls)) return [];
  return urls
    .filter((u): u is string => typeof u === "string")
    .map((u) => u.trim())
    .filter(
      (u) =>
        u.startsWith("/uploads/") ||
        u.startsWith("https://") ||
        u.startsWith("http://localhost")
    )
    .filter((u) => !u.startsWith("data:"))
    .slice(0, max);
}
