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
// File sizes are bimodal: a few hundred real images (10 KB – 5 MB) and
// thousands of tiny generated variants that complete in under 1 ms.
// Only the top 10% by size (P90 set) are used for rate measurement — the
// rest are noise. Progress % is bytes-based for the same reason.
//
// Queue: three segments by size so the first 15 s window captures
// representative files and ETA is conservative (see buildQueue).
//
// ETA: max(P90-window estimate, cumulative-all-bytes estimate) so the
// estimate is always on the safe (overestimate) side.

// CI detection: GitHub Actions, Jenkins, etc. set CI=true. Non-TTY stdout
// (e.g. `mvn -B` piped to a log file) is also treated as CI.
const isCI = !!(process.env.CI || !process.stdout.isTTY);

const BAR_WIDTH = 30;
let completed = 0;
let lastLogTime = 0;

let etaSizeThreshold = 0;
let totalEtaBytes = 0;
let processedEtaBytes = 0;
let allProcessedBytes = 0;
let totalAllBytes = 0;
const fileSizeMap = new Map();

// 15 s warmup: enough completions in the 100 KB–1 MB warmup segment to
// give a stable rate before the first ETA is printed.
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
 * Sliding-window bytes/s rate over the last WINDOW_MS for P90 files only.
 * Falls back to cumulative average during cold start (< 5 samples in window).
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

/** Reports throttled progress to stdout. */
function reportProgress(done, total, startTime, fileSize) {
  const now = Date.now();
  recordCompletion(now, fileSize);

  const pct = totalAllBytes > 0 ? Math.floor(allProcessedBytes / totalAllBytes * 100) : 0;
  const elapsed = now - startTime;
  const displayRate = elapsed > 0 ? allProcessedBytes / (elapsed / 1000) : 0;
  const rateStr = formatRate(displayRate);
  const warmedUp = elapsed >= WINDOW_MS;

  // ETA estimate 1: P90 window rate × remaining P90 bytes.
  // Too optimistic once large files dominate the window but tiny files remain.
  const etaRate = computeEtaRate(now, startTime);
  const remainingEtaBytes = totalEtaBytes - processedEtaBytes;
  const p90EtaMs = etaRate > 0 && remainingEtaBytes > 0
    ? (remainingEtaBytes / etaRate) * 1000
    : null;

  // ETA estimate 2: cumulative all-bytes rate × remaining all bytes.
  // Includes tiny-file overhead so it stays conservative in the second half.
  const cumulativeRate = elapsed > 0 ? allProcessedBytes / (elapsed / 1000) : 0;
  const allBytesRemaining = totalAllBytes - allProcessedBytes;
  const allBytesEtaMs = cumulativeRate > 0 && allBytesRemaining > 0
    ? (allBytesRemaining / cumulativeRate) * 1000
    : null;

  // Take the larger of the two — always the conservative (overestimate) side.
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

// Size boundaries for the three-segment queue (see buildQueue).
const WARMUP_MIN_BYTES = 100_000;  // 100 KB
const WARMUP_MAX_BYTES = 1_000_000; // 1 MB

/**
 * Builds the queue in three segments for conservative ETA from the first window.
 *
 * 1. Warmup (100 KB – 1 MB) ascending — fills the measurement window with
 *    moderate-size files; rate stays flat or declines, ETA only increases.
 * 2. Giants (> 1 MB) descending — arrive after the window is established;
 *    slower per byte, so ETA rises further (conservative overestimate).
 * 3. Small P90 (< 100 KB) + rest — tiny near-instant files trail at the end.
 *
 * Size thresholds beat percentile-by-count because the distribution is
 * extremely right-skewed (median ~1 KB); percentile boundaries are too small.
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

  // Exclude generated responsive variants to avoid reprocessing them.
  files = files.filter(file => !file.match(/-\d+w\.(jpg|jpeg|png|webp)$/));

  // Gather sizes for sorting, ETA setup, and per-file progress lookup.
  const filesWithSizes = (await Promise.all(files.map(async f => ({ f, size: (await fs.stat(f)).size }))))
    .sort((a, b) => b.size - a.size);

  // Top 10% by size (P90) — all real processing cost; bottom 90% are noise.
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
