/**
 * Base URL of the API. Empty means same-origin Next.js routes (local dev).
 * On Vercel set NEXT_PUBLIC_API_URL to the Render service URL, with no trailing slash.
 */
export function apiUrl(path) {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  return `${base}${path}`;
}
