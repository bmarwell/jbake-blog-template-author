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
        .jpeg({ mozjpeg: true, quality: 80 })
        .toBuffer();
      await fs.writeFile(resizedPath, resizedJpeg);
    } else {
      const resizedPng = await sharp(file)
        .resize(actualWidth, actualHeight, { fit: 'cover' })
        .png({ compressionLevel: 6, palette: true, quality: 85, effort: 10 })
        .toBuffer();
      await fs.writeFile(resizedPath, resizedPng);
    }

    // Generate WebP variant
    const webpVariant = await sharp(file)
      .resize(actualWidth, actualHeight, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();
    await fs.writeFile(webpPath, webpVariant);
  }
}

async function optimizeImageFile(file, index, total) {
  try {
    let imageInfo;

    if (file.endsWith(".jpg") || file.endsWith(".jpeg")) {
      const image = sharp(file);
      imageInfo = await image.metadata();

      const optiJpeg = await image
        .jpeg({ mozjpeg: true, quality: 80 })
        .toBuffer();
      await fs.writeFile(file, optiJpeg);

      const webp = await sharp(file)
        .webp({quality: 80})
        .toBuffer();

      await fs.writeFile(file.replace(".jpeg", "").replace(".jpg", "") + ".webp", webp);

      // Generate responsive variants for large images
      await generateResponsiveVariants(file, imageInfo);

    } else if (file.endsWith(".png")) {
      const image = sharp(file);
      imageInfo = await image.metadata();

      const optiPng = await image
        .png({ compressionLevel: 6, palette: true, quality: 85, effort: 10 })
        .toBuffer();

      await fs.writeFile(file, optiPng);

      // Generate WebP version of the PNG
      const webp = await sharp(file)
        .webp({ quality: 80 })
        .toBuffer();

      await fs.writeFile(file.replace(".png", "") + ".webp", webp);

      // Generate responsive variants for large images
      await generateResponsiveVariants(file, imageInfo);

    } else if (file.endsWith(".gif")) {
      const optiGif = await sharp(file)
        .gif({ effort: 10 })
        .toBuffer();

      await fs.writeFile(file, optiGif);
    }

    if (index % 10 === 0) {
      console.log(`Processed ${index}/${total} files`)
    }
  } catch (error) {
    console.warn(`Warning: Could not process ${file}: ${error.message}`);
  }

  return file;
}

async function compress() {
  let ignore = ['node_modules', 'dist', 'build']
  const globPattern = path.join(
    process.cwd(),
    'target/website/**/*.+(png|jpg|jpeg|gif|svg|webp)',
  )
  files = await glob(globPattern, {ignore: ignore});
  
  // IMPORTANT: Filter out generated responsive variants to avoid reprocessing them.
  // This prevents "unsupported image format" errors when trying to process
  // files that were just created by this script (e.g., *-400w.jpg, *-800w.webp).
  files = files.filter(file => {
    // Exclude files that match the responsive variant pattern: *-NNNw.ext
    return !file.match(/-\d+w\.(jpg|jpeg|png|webp)$/);
  });

  console.log(`found ${files.length} files.`)

  // limit is cpus-1, but min 1.
  const cpus = os.cpus().length;
  const maxConcurrency = Math.max(1, cpus - 1)

  const limit = pLimit(maxConcurrency);

  const promises = files.map(async (file, index) => {
    return limit(() => optimizeImageFile( file, index, files.length ));
  });

  await (async () => {
    // Only three promises are run at once (as defined above)
    await Promise.all(promises);
  })();

  console.log(`Finished processing ${files.length} files`)
}

await compress();
