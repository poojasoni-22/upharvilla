// ── ImageKit URL Transformation Helpers ───────────────────────────────────────
// Appends ImageKit URL-based transformations for optimized delivery.
// Docs: https://docs.imagekit.io/features/image-transformations

/**
 * Transform an ImageKit URL for optimized delivery.
 * Appends width, auto-format (WebP/AVIF), and quality parameters.
 *
 * Non-ImageKit URLs are returned unchanged.
 *
 * @example
 * optimizedUrl("https://ik.imagekit.io/.../photo.jpg", 600)
 * // → "https://ik.imagekit.io/.../photo.jpg?tr=w-600,f-auto,q-80"
 */
export function optimizedUrl(
  url: string | undefined | null,
  width: number,
  quality = 80,
): string {
  if (!url) return "";
  if (!url.includes("ik.imagekit.io")) return url;

  // Strip any existing transformation query
  const cleanUrl = url.split("?")[0];
  return `${cleanUrl}?tr=w-${width},f-auto,q-${quality}`;
}

/**
 * Optimized URL preset for product card thumbnails (400px).
 */
export function thumbnailUrl(url: string | undefined | null): string {
  return optimizedUrl(url, 400, 80);
}

/**
 * Optimized URL preset for product detail main image (800px).
 */
export function productDetailUrl(url: string | undefined | null): string {
  return optimizedUrl(url, 800, 82);
}

/**
 * Optimized URL preset for product gallery full image (1200px).
 */
export function galleryFullUrl(url: string | undefined | null): string {
  return optimizedUrl(url, 1200, 82);
}

/**
 * Optimized URL preset for hero banners (1400px).
 */
export function bannerUrl(url: string | undefined | null): string {
  return optimizedUrl(url, 1400, 80);
}

/**
 * Warm up the ImageKit cache for all optimized size presets in the background.
 * Triggers on-the-fly ImageKit generation immediately so subsequent client loads hit the CDN cache.
 */
export function prewarmImageKitCache(url: string | undefined | null): void {
  if (!url?.includes("ik.imagekit.io")) return;

  const presets = [
    thumbnailUrl(url),
    productDetailUrl(url),
    galleryFullUrl(url),
    bannerUrl(url),
  ];

  for (const presetUrl of presets) {
    if (typeof window !== "undefined" && window.fetch) {
      window.fetch(presetUrl, { mode: "no-cors" }).catch(() => {});
    }
  }
}
