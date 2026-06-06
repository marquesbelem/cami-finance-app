import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/**
 * Saves an uploaded File to `public/uploads/` and returns the
 * public-accessible path (e.g. "/uploads/abc123-invoice.pdf").
 *
 * @throws {Error} if file type or size is not allowed
 */
export async function saveUploadedFile(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `File type "${file.type}" is not allowed. Use PDF or an image.`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size ${(file.size / 1024 / 1024).toFixed(1)} MB exceeds the 10 MB limit.`
    );
  }

  const ext = getExtension(file.type);
  const filename = `${randomUUID()}-${slugify(file.name)}${ext}`;
  const dest = path.join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buffer);

  return `/uploads/${filename}`;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return map[mimeType] ?? "";
}

function slugify(name: string): string {
  return name
    .replace(/\.[^/.]+$/, "") // remove extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
}
