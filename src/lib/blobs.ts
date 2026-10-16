/**
 * Session-only previews for files the user attaches. Object URLs can't
 * survive a reload, so they live outside the persisted store.
 */
const blobs = new Map<string, string>();
const live = new Set<string>();

export function registerBlob(id: string, file: File): string {
  const url = URL.createObjectURL(file);
  blobs.set(id, url);
  live.add(url);
  return url;
}

/** Object URLs persisted from an earlier session are dead; drop them. */
export function isLive(url: string): boolean {
  return live.has(url);
}

export function getBlob(id: string): string | undefined {
  return blobs.get(id);
}

export function kindFromFile(file: { name: string; type: string }) {
  const n = file.name.toLowerCase();
  if (file.type.startsWith("image/")) return "image" as const;
  if (file.type.startsWith("video/")) return "video" as const;
  if (file.type.startsWith("audio/")) return "audio" as const;
  if (n.endsWith(".pdf")) return "pdf" as const;
  if (/\.(zip|rar|7z|tar|gz)$/.test(n)) return "archive" as const;
  if (/\.(doc|docx|txt|md|fig|key|pptx|xlsx|csv)$/.test(n)) return "doc" as const;
  return "other" as const;
}
