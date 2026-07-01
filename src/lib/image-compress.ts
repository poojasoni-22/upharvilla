// ── Client-Side Image Compression ─────────────────────────────────────────────
// Compresses images in the browser using Canvas API before uploading to ImageKit.
// No external dependencies — uses native browser APIs only.

interface CompressOptions {
  /** Maximum width in pixels. Height scales proportionally. Default: 1200 */
  maxWidth?: number;
  /** Output quality 0–1. Default: 0.92 */
  quality?: number;
  /** Output MIME type. Default: "image/webp" (falls back to "image/jpeg") */
  outputType?: "image/webp" | "image/jpeg";
}

/**
 * Compress an image File in the browser before upload.
 *
 * - Resizes to `maxWidth` while maintaining aspect ratio
 * - Re-encodes to WebP (with JPEG fallback) at the given quality
 * - Returns a new File object ready for upload
 *
 * @example
 * const compressed = await compressImage(file, { maxWidth: 600, quality: 0.8 });
 * await upload({ file: compressed, fileName: "thumb.webp", ... });
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<File> {
  const {
    maxWidth = 1200,
    quality = 0.92,
    outputType = "image/webp",
  } = options;

  // Skip compression for small files (< 100KB) and SVGs/GIFs
  if (
    file.size < 100 * 1024 ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    return file;
  }

  return new Promise<File>((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Calculate new dimensions maintaining aspect ratio
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      // Draw to canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas 2D context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob — try WebP first, fall back to JPEG
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // WebP might not be supported — fallback to JPEG
            canvas.toBlob(
              (jpegBlob) => {
                if (!jpegBlob) {
                  reject(new Error("Image compression failed"));
                  return;
                }
                const ext = "jpg";
                const baseName = file.name.replace(/\.[^.]+$/, "");
                resolve(
                  new File([jpegBlob], `${baseName}.${ext}`, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  }),
                );
              },
              "image/jpeg",
              quality,
            );
            return;
          }

          const ext = outputType === "image/webp" ? "webp" : "jpg";
          const baseName = file.name.replace(/\.[^.]+$/, "");
          resolve(
            new File([blob], `${baseName}.${ext}`, {
              type: outputType,
              lastModified: Date.now(),
            }),
          );
        },
        outputType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = objectUrl;
  });
}

/**
 * Compress an image with preset for product thumbnails.
 * Max 600px width, quality 0.92.
 */
export async function compressThumbnail(file: File): Promise<File> {
  return compressImage(file, { maxWidth: 600, quality: 0.92 });
}

/**
 * Compress an image with preset for product gallery.
 * Max 1200px width, quality 0.92.
 */
export async function compressGalleryImage(file: File): Promise<File> {
  return compressImage(file, { maxWidth: 1200, quality: 0.92 });
}

/**
 * Compress an image with preset for hero banners.
 * Max 1400px width, quality 0.92.
 */
export async function compressBannerImage(file: File): Promise<File> {
  return compressImage(file, { maxWidth: 1400, quality: 0.92 });
}
