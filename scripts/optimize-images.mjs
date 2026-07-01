// ── Static Image Optimization + Trim Script ──────────────────────────────────
// Converts SVGs/PNGs to WebP with trim (removes white/transparent padding).
// Originals kept. Locked WebPs are deleted and regenerated.
//
// Run: node scripts/optimize-images.mjs

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, rename, stat, unlink } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const sharp = (await import("sharp")).default;

const PUBLIC_DIR = join(process.cwd(), "public");

const SKIP_FILES = new Set([
  "facebook.svg",
  "favicon.ico",
  "icon.png",
  "apple-icon.png",
]);

const MIN_SIZE_BYTES = 3 * 1024; // 3KB

async function forceDeleteWebp(filePath) {
  // On Windows, files locked by dev server need forced deletion
  try {
    await unlink(filePath);
  } catch {
    // If unlink fails due to lock, try via OS command
    try {
      execSync(`del /f /q "${filePath}"`, { stdio: "ignore" });
    } catch {
      return false;
    }
  }
  return true;
}

async function optimizeImages() {
  console.log("🔍 Scanning public/ for images to optimize + trim...\n");

  const files = await readdir(PUBLIC_DIR);
  let totalOriginal = 0;
  let totalOptimized = 0;
  let processedCount = 0;

  for (const file of files) {
    if (SKIP_FILES.has(file)) continue;

    const filePath = join(PUBLIC_DIR, file);
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) continue;
    if (fileStat.size < MIN_SIZE_BYTES) continue;

    const ext = extname(file).toLowerCase();
    const name = basename(file, ext);

    if (![".svg", ".png"].includes(ext)) continue;

    console.log(
      `📦 Processing: ${file} (${(fileStat.size / 1024).toFixed(0)} KB)`,
    );
    totalOriginal += fileStat.size;

    try {
      const webpPath = join(PUBLIC_DIR, `${name}.webp`);

      // Delete existing WebP (even if locked)
      if (existsSync(webpPath)) {
        const deleted = await forceDeleteWebp(webpPath);
        if (!deleted) {
          console.log(`   ⚠️  Could not delete locked ${name}.webp, skipping`);
          totalOptimized += fileStat.size;
          processedCount++;
          continue;
        }
      }

      // Convert with TRIM to remove white/transparent padding
      await sharp(filePath)
        .trim({ threshold: 15 })
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(webpPath);

      const newStat = await stat(webpPath);
      totalOptimized += newStat.size;

      const savings = ((1 - newStat.size / fileStat.size) * 100).toFixed(1);
      console.log(
        `   ✅ → ${name}.webp (${(newStat.size / 1024).toFixed(0)} KB, -${savings}%) [trimmed]`,
      );
      processedCount++;
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
      totalOptimized += fileStat.size;
    }
  }

  // Also handle JPGs (compress in-place, no WebP conversion)
  for (const file of files) {
    if (SKIP_FILES.has(file)) continue;
    const filePath = join(PUBLIC_DIR, file);
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) continue;
    if (fileStat.size < MIN_SIZE_BYTES) continue;

    const ext = extname(file).toLowerCase();
    if (![".jpg", ".jpeg"].includes(ext)) continue;

    console.log(
      `📦 Processing: ${file} (${(fileStat.size / 1024).toFixed(0)} KB)`,
    );
    totalOriginal += fileStat.size;

    try {
      const tempPath = join(PUBLIC_DIR, `_temp_${file}`);
      await sharp(filePath)
        .trim({ threshold: 15 })
        .resize({ width: 1400, withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(tempPath);

      const newStat = await stat(tempPath);
      if (newStat.size < fileStat.size) {
        await unlink(filePath);
        await rename(tempPath, filePath);
        totalOptimized += newStat.size;
        const savings = ((1 - newStat.size / fileStat.size) * 100).toFixed(1);
        console.log(
          `   ✅ Compressed + trimmed (${(newStat.size / 1024).toFixed(0)} KB, -${savings}%)`,
        );
      } else {
        await unlink(tempPath);
        totalOptimized += fileStat.size;
        console.log(`   ⏭️  Already optimal`);
      }
      processedCount++;
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
      totalOptimized += fileStat.size;
    }
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log("📊 Results:");
  console.log(`   Files processed: ${processedCount}`);
  if (totalOriginal > 0) {
    console.log(
      `   Original total:  ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`,
    );
    console.log(
      `   Optimized total: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`,
    );
    console.log(
      `   Saved:           ${((totalOriginal - totalOptimized) / 1024 / 1024).toFixed(2)} MB (${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%)`,
    );
  }
  console.log("═".repeat(60));
}

optimizeImages().catch(console.error);
