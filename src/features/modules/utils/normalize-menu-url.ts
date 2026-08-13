export function normalizeMenuUrl(url: string | null): string {
  if (!url) return "#";
  let cleanUrl = url;
  if (cleanUrl.startsWith("/dashboard/")) {
    cleanUrl = cleanUrl.substring(10);
  } else if (cleanUrl.startsWith("dashboard/")) {
    cleanUrl = cleanUrl.substring(9);
  } else if (cleanUrl.startsWith("/dashboard")) {
    cleanUrl = cleanUrl.substring(10);
  } else if (cleanUrl.startsWith("dashboard")) {
    cleanUrl = cleanUrl.substring(9);
  }
  if (!cleanUrl.startsWith("/")) {
    cleanUrl = "/" + cleanUrl;
  }
  return `/dashboard${cleanUrl}`;
}
