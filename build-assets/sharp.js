#!/usr/bin/env node
/*
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

/**
 * Image optimization and responsive variant generation script.
 *
 * Processes all images in target/website to:
 * 1. Optimize JPEGs with mozjpeg
 * 2. Optimize PNGs with optipng
 * 3. Generate WebP versions
 * 4. Create responsive variants (400w, 800w, 1200w) for large images (≥800px)
 *
 * Important: Generated responsive variants (files ending in -NNNw.ext) are excluded
 * from processing to avoid recursive generation and errors.
 */
import process from 'node:process';
import path from 'path';
import os from 'os';
import { glob } from "glob";
import fs from "fs/promises";
import pLimit from "p-limit";
import sharp from "sharp";

let [, , ...files] = process.argv

// Compression level: 'low' for fast CI builds, 'high' for production (default)
const IMAGE_COMPRESSION_LEVEL = process.env.IMAGE_COMPRESSION_LEVEL || 'high';

/**
 * Returns compression settings based on the configured IMAGE_COMPRESSION_LEVEL.
 *
 * High quality (production default):
 * - PNG: compressionLevel 6, effort 10
 * - JPEG/WebP: quality 80
 *
 * Low quality (CI builds - much faster):
 * - PNG: compressionLevel 1, effort 1
 * - JPEG/WebP: quality 60
 */
function getCompressionSettings() {
  if (IMAGE_COMPRESSION_LEVEL === 'low') {
    return { pngCompressionLevel: 1, pngEffort: 1, jpegQuality: 60, webpQuality: 60 };
  }
  if (IMAGE_COMPRESSION_LEVEL !== 'high') {
    console.warn(`Warning: Unknown IMAGE_COMPRESSION_LEVEL '${IMAGE_COMPRESSION_LEVEL}', defaulting to 'high'.`);
  }
  return { pngCompressionLevel: 6, pngEffort: 10, jpegQuality: 80, webpQuality: 80 };
}

const COMPRESSION = getCompressionSettings();

console.log(`Image compression level: ${IMAGE_COMPRESSION_LEVEL}`);

// ── Progress & ETA ───────────────────────────────────────────────────────────
//
// DESIGN OVERVIEW
// ───────────────
// File sizes are bimodal: a few hundred real images (10 KB – 5 MB) surrounded
// by thousands of tiny WebP/SVG variants that sharp returns in under 1 ms.
// Mixing both groups poisons any throughput estimate, so we split them:
//
//   P90 set  — top 10% of files by size; accounts for almost all real work.
//   Rest     — bottom 90%; dominated by files at or below the 0.8 KB median;
//              complete near-instantly; excluded from rate tracking.
//
// Queue ordering (buildQueue)
//   Three-segment ordering based on explicit file size thresholds:
//
//   1. Warmup (100 KB – 1 MB), ascending
//      Files in this range complete in 0.3–3 s at typical concurrency and
//      produce a representative bytes/s rate within the first 10–15 s.
//      Ascending order means the first slots process smaller end of this
//      range first; as files grow, bytes/s stays flat or declines → ETA
//      will only increase (conservative) as the run advances.
//
//   2. Giants (> 1 MB), descending
//      These land after the warmup, so the rate the window measured on
//      100–500 KB files will appear optimistic compared to multi-MB files.
//      ETA rises → conservative overestimate. ✓
//
//   3. Small P90 (< 100 KB) + tiny rest
//      Smallest of the meaningful files, then the near-instant bottom 90%.
//      Rate ticks down further here; ETA stays ≥ actual.
//
// Why size thresholds beat percentile-by-count:
//   With a median of 0.8 KB the distribution is extremely right-skewed.
//   p75-by-count has a boundary of ~3–5 KB — still tiny. Size thresholds
//   work regardless of the file count distribution shape.
//
// ETA window (computeEtaRate)
//   Sliding 15-second window over P90 completions only. WINDOW_MS doubles as
//   the warmup period before ETA is printed. 15 s gives the first estimate
//   after the warmup segment is well-populated and the rate has stabilised.
//
// Progress percentage
//   Shown as bytes-processed / total-bytes, not file count. With 8 000+ files
//   where 90% complete instantly, file-count % shows 9% when 90% of the actual
//   work is done; bytes % reflects the true picture.

// CI detection: GitHub Actions, Jenkins, etc. set CI=true. Non-TTY stdout
// (e.g. `mvn -B` piped to a log file) is also treated as CI.
const isCI = !!(process.env.CI || !process.stdout.isTTY);

const BAR_WIDTH = 30;
let completed = 0;
let lastLogTime = 0;

// Mutable ETA state — initialised in compress() from actual file sizes.
let etaSizeThreshold = 0;   // min size for a file to contribute to ETA
let totalEtaBytes = 0;       // total bytes in the P90 set
let processedEtaBytes = 0;   // P90 bytes completed so far
let allProcessedBytes = 0;   // all bytes completed (for display rate + %)
let totalAllBytes = 0;       // all bytes total (for %)
const fileSizeMap = new Map();

// WINDOW_MS: sliding-window width AND warmup period before ETA is shown.
// 15 s: warmup segment has produced 50–100 completions in the 100 KB–1 MB
// range, giving a stable and representative rate before the first ETA prints.
const WINDOW_MS = 15_000;
const etaWindowTimes = [];
const etaWindowBytesList = [];
let etaWindowPtr = 0;
let etaWindowBytesSum = 0;

function recordCompletion(now, fileSize) {
  allProcessedBytes += fileSize;
  if (fileSize < etaSizeThreshold) return;
  etaWindowTimes.push(now);
  etaWindowBytesList.push(fileSize);
  processedEtaBytes += fileSize;
  etaWindowBytesSum += fileSize;
}

/**
 * Computes bytes/s over the last WINDOW_MS for heavy (P90) files only.
 *
 * Falls back to the global average while fewer than 5 P90 files are in the
 * window (cold start) to avoid divide-by-near-zero noise.
 *
 * @param {number} now - current timestamp in ms
 * @param {number} startTime - process start timestamp in ms
 * @returns {number} bytes per second
 */
function computeEtaRate(now, startTime) {
  const cutoff = now - WINDOW_MS;
  while (etaWindowPtr < etaWindowTimes.length && etaWindowTimes[etaWindowPtr] < cutoff) {
    etaWindowBytesSum -= etaWindowBytesList[etaWindowPtr++];
  }
  const windowCount = etaWindowTimes.length - etaWindowPtr;
  if (windowCount < 5) {
    const elapsed = (now - startTime) / 1000;
    return elapsed > 0 ? processedEtaBytes / elapsed : 0;
  }
  const oldest = etaWindowTimes[etaWindowPtr];
  const span = (now - oldest) / 1000;
  return span > 0 ? etaWindowBytesSum / span : 0;
}

function formatRate(bytesPerSec) {
  if (bytesPerSec >= 1_048_576) return `${(bytesPerSec / 1_048_576).toFixed(1)} MB/s`;
  if (bytesPerSec >= 1_024) return `${(bytesPerSec / 1_024).toFixed(0)} KB/s`;
  return `${bytesPerSec.toFixed(0)} B/s`;
}

function formatDuration(ms) {
  if (ms < 0 || !isFinite(ms) || isNaN(ms)) return '?';
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

/**
 * Reports progress to stdout, throttled to avoid log spam.
 *
 * Display rate is computed from all processed bytes (global average) so it
 * reflects actual total throughput. ETA uses the maximum of two estimates
 * to stay conservative throughout the run (see comment in reportProgress).
 *
 * @param {number} done - files completed so far
 * @param {number} total - total file count
 * @param {number} startTime - process start timestamp in ms
 * @param {number} fileSize - byte size of the just-completed file
 */
function reportProgress(done, total, startTime, fileSize) {
  const now = Date.now();
  recordCompletion(now, fileSize);

  const pct = totalAllBytes > 0 ? Math.floor(allProcessedBytes / totalAllBytes * 100) : 0;
  const elapsed = now - startTime;
  const displayRate = elapsed > 0 ? allProcessedBytes / (elapsed / 1000) : 0;
  const rateStr = formatRate(displayRate);
  const warmedUp = elapsed >= WINDOW_MS;

  // ETA estimate 1: P90 window rate × remaining P90 bytes.
  //   Accurate during the warmup/giants phases; too optimistic once the
  //   window captures large files but remaining work is small/tiny files.
  const etaRate = computeEtaRate(now, startTime);
  const remainingEtaBytes = totalEtaBytes - processedEtaBytes;
  const p90EtaMs = etaRate > 0 && remainingEtaBytes > 0
    ? (remainingEtaBytes / etaRate) * 1000
    : null;

  // ETA estimate 2: cumulative all-bytes rate × remaining all bytes.
  //   Naturally includes tiny-file overhead in both numerator and denominator,
  //   so it stays conservative once the fast-file phase is over.
  const cumulativeRate = elapsed > 0 ? allProcessedBytes / (elapsed / 1000) : 0;
  const allBytesRemaining = totalAllBytes - allProcessedBytes;
  const allBytesEtaMs = cumulativeRate > 0 && allBytesRemaining > 0
    ? (allBytesRemaining / cumulativeRate) * 1000
    : null;

  // Take the larger of the two: whichever predicts more time remaining wins.
  // This guarantees ETA is always the conservative (overestimate) side.
  const etaMs = p90EtaMs !== null || allBytesEtaMs !== null
    ? Math.max(p90EtaMs ?? 0, allBytesEtaMs ?? 0)
    : null;
  const eta = warmedUp ? etaMs : null;
  const etaStr = eta !== null ? `ETA: ~${formatDuration(eta)}` : '';

  if (isCI) {
    const timeout = elapsed - lastLogTime > 15_000;
    const isFirst = done === 1;
    const isDone = done === total;

    if (isFirst || timeout || isDone) {
      const parts = [`[sharp] ${done}/${total} (${pct}%)`, rateStr, `elapsed: ${formatDuration(elapsed)}`];
      if (etaStr) parts.push(etaStr);
      console.log(parts.join(' – '));
      lastLogTime = elapsed;
    }
  } else {
    const filled = Math.round((done / total) * BAR_WIDTH);
    const bar = '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
    const suffix = etaStr ? `  ${etaStr}` : '  done!';
    const line = `[${bar}] ${done}/${total} (${pct}%)  ${rateStr}${suffix}`;
    process.stdout.write(`\r${line.padEnd(80)}`);
    if (done === total) process.stdout.write('\n');
  }
}

// Responsive image sizes for featured images
const RESPONSIVE_WIDTHS = [400, 800, 1200];

/**
 * Generates responsive variants for featured images (large images).
 * Creates multiple width variants and WebP versions for each.
 *
 * Always generates all configured sizes (400w, 800w, 1200w) for consistency,
 * even if the target size equals the original width. This keeps the logic simple
 * and ensures srcset references are never broken.
 */
async function generateResponsiveVariants(file, imageInfo) {
  const { width, height } = imageInfo;

  // Only generate responsive variants for images that benefit from it (>= 800px)
  if (width < 800) {
    return;
  }

  const basePath = file.replace(/\.(jpg|jpeg|png)$/i, '');
  const ext = file.match(/\.(jpg|jpeg|png)$/i)[0].toLowerCase();
  const isJpeg = ext === '.jpg' || ext === '.jpeg';

  for (const targetWidth of RESPONSIVE_WIDTHS) {
    // Always generate the variant, even if it matches the original size
    // This keeps things simple and consistent
    const targetHeight = Math.round((height / width) * targetWidth);
    const resizedPath = `${basePath}-${targetWidth}w${ext}`;
    const webpPath = `${basePath}-${targetWidth}w.webp`;

    // If target size is larger than original, use original dimensions
    const actualWidth = Math.min(targetWidth, width);
    const actualHeight = Math.round((height / width) * actualWidth);

    // Generate resized original format
    if (isJpeg) {
      const resizedJpeg = await sharp(file)
        .resize(actualWidth, actualHeight, { fit: 'cover' })
        .jpeg({ mozjpeg: true, quality: COMPRESSION.jpegQuality })
        .toBuffer();
      await fs.writeFile(resizedPath, resizedJpeg);
    } else {
      const resizedPng = await sharp(file)
        .resize(actualWidth, actualHeight, { fit: 'cover' })
        .png({ compressionLevel: COMPRESSION.pngCompressionLevel, palette: true, quality: 85, effort: COMPRESSION.pngEffort })
        .toBuffer();
      await fs.writeFile(resizedPath, resizedPng);
    }

    // Generate WebP variant
    const webpVariant = await sharp(file)
      .resize(actualWidth, actualHeight, { fit: 'cover' })
      .webp({ quality: COMPRESSION.webpQuality })
      .toBuffer();
    await fs.writeFile(webpPath, webpVariant);
  }
}

async function optimizeImageFile(file) {
  try {
    let imageInfo;

    if (file.endsWith(".jpg") || file.endsWith(".jpeg")) {
      const image = sharp(file);
      imageInfo = await image.metadata();

      const optiJpeg = await image
        .jpeg({ mozjpeg: true, quality: COMPRESSION.jpegQuality })
        .toBuffer();
      await fs.writeFile(file, optiJpeg);

      const webp = await sharp(file)
        .webp({ quality: COMPRESSION.webpQuality })
        .toBuffer();

      await fs.writeFile(file.replace(".jpeg", "").replace(".jpg", "") + ".webp", webp);

      // Generate responsive variants for large images
      await generateResponsiveVariants(file, imageInfo);

    } else if (file.endsWith(".png")) {
      const image = sharp(file);
      imageInfo = await image.metadata();

      const optiPng = await image
        .png({ compressionLevel: COMPRESSION.pngCompressionLevel, palette: true, quality: 85, effort: COMPRESSION.pngEffort })
        .toBuffer();

      await fs.writeFile(file, optiPng);

      // Generate WebP version of the PNG
      const webp = await sharp(file)
        .webp({ quality: COMPRESSION.webpQuality })
        .toBuffer();

      await fs.writeFile(file.replace(".png", "") + ".webp", webp);

      // Generate responsive variants for large images
      await generateResponsiveVariants(file, imageInfo);

    } else if (file.endsWith(".gif")) {
      const optiGif = await sharp(file)
        .gif({ effort: COMPRESSION.pngEffort })
        .toBuffer();

      await fs.writeFile(file, optiGif);
    }

  } catch (error) {
    console.warn(`Warning: Could not process ${file}: ${error.message}`);
  }

  return file;
}

// Size boundaries for the three-segment queue order (see DESIGN OVERVIEW).
const WARMUP_MIN_BYTES = 100_000;  // 100 KB — bottom of the warmup segment
const WARMUP_MAX_BYTES = 1_000_000; // 1 MB  — top of the warmup segment

/**
 * Builds the processing queue for conservative, stable ETA accuracy.
 *
 * Applies three-segment ordering based on explicit file size thresholds so
 * the rate measured in the first 15 s window is representative — and any
 * deviation from the measured rate causes ETA to overestimate, not
 * underestimate.
 *
 * Segment order:
 *   1. Warmup  (100 KB – 1 MB), ascending  → fills the first measurement
 *      window with files whose per-file time is moderate and consistent.
 *   2. Giants  (> 1 MB),        descending → arrive after the window is
 *      established; their slower bytes/s only increases the ETA from here.
 *   3. Small   (< 100 KB P90) + tiny rest  → rate declines further; ETA
 *      remains conservative.
 *
 * Files below etaSizeThreshold (bottom 90% by size) are placed at the end;
 * they are excluded from rate tracking and complete near-instantly.
 *
 * @param {Array<{f: string, size: number}>} filesWithSizes - sorted descending
 * @returns {string[]} ordered file paths
 */
function buildQueue(filesWithSizes) {
  const p90Idx = Math.floor(filesWithSizes.length * 0.10);
  const p90 = filesWithSizes.slice(0, p90Idx);
  const rest = filesWithSizes.slice(p90Idx);

  const warmup = p90.filter(f => f.size >= WARMUP_MIN_BYTES && f.size <= WARMUP_MAX_BYTES)
    .sort((a, b) => a.size - b.size);                 // ascending: ~100 KB → ~1 MB
  const giants = p90.filter(f => f.size > WARMUP_MAX_BYTES)
    .sort((a, b) => b.size - a.size);                 // descending: largest first
  const small  = p90.filter(f => f.size < WARMUP_MIN_BYTES); // natural descending

  return [...warmup, ...giants, ...small, ...rest].map(({ f }) => f);
}

async function compress() {
  let ignore = ['node_modules', 'dist', 'build']
  const globPattern = path.join(
    process.cwd(),
    'target/website/**/*.+(png|jpg|jpeg|gif|svg|webp)',
  )
  files = await glob(globPattern, {ignore: ignore});

  // Exclude generated responsive variants to avoid reprocessing them (*-NNNw.ext).
  files = files.filter(file => !file.match(/-\d+w\.(jpg|jpeg|png|webp)$/));

  // Gather file sizes once for sorting, ETA setup, and per-file progress lookup.
  const filesWithSizes = (await Promise.all(files.map(async f => ({ f, size: (await fs.stat(f)).size }))))
    .sort((a, b) => b.size - a.size);

  // P90 threshold: track only the top 10% of files for rate measurement.
  // These are the meaningful images (avg ~71 KB) that represent actual
  // processing cost. The bottom 90% are near-instant no-ops at the 0.8 KB
  // median and would poison the bytes/s estimate if included.
  const etaThresholdIdx = Math.max(1, Math.floor(filesWithSizes.length * 0.10));
  etaSizeThreshold = filesWithSizes[etaThresholdIdx].size;
  totalEtaBytes = filesWithSizes
    .slice(0, etaThresholdIdx)
    .reduce((sum, { size }) => sum + size, 0);

  for (const { f, size } of filesWithSizes) {
    fileSizeMap.set(f, size);
  }
  files = buildQueue(filesWithSizes);

  totalAllBytes = filesWithSizes.reduce((s, { size }) => s + size, 0);
  const medianBytes = filesWithSizes[Math.floor(filesWithSizes.length / 2)].size;
  const totalMB = (totalAllBytes / 1_048_576).toFixed(1);
  const medianKB = (medianBytes / 1_024).toFixed(1);

  console.log(`found ${files.length} files (total: ${totalMB} MB, median: ${medianKB} KB).`);

  const maxConcurrency = Math.max(1, os.cpus().length - 1);
  const limit = pLimit(maxConcurrency);

  const startTime = Date.now();
  const promises = files.map(async (file) => {
    return limit(async () => {
      await optimizeImageFile(file);
      completed++;
      reportProgress(completed, files.length, startTime, fileSizeMap.get(file) ?? 0);
    });
  });

  await Promise.all(promises);

  console.log(`Finished processing ${files.length} files`);
}

await compress();
