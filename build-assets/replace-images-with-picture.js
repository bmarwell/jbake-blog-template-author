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
 * Post-processes HTML files to replace body images with responsive picture elements.
 *
 * This script scans all HTML files in target/website and replaces <img> tags
 * that have responsive variants (≥800px width) with <picture> elements containing
 * WebP sources and fallback images.
 *
 * Only processes images that are wrapped in <a> tags (for SimpleLightbox support).
 * Featured images in <picture> tags are skipped (already handled by templates).
 *
 * The lightbox link is updated to point to the largest WebP variant (1200w)
 * instead of the original multi-megabyte image, improving performance.
 */

import process from 'node:process';
import path from 'path';
import { glob } from "glob";
import fs from "fs/promises";

/**
 * Checks if responsive image variants exist for the given image path.
 * Returns true if all expected variants (400w, 800w, 1200w) exist in WebP format.
 */
async function hasResponsiveVariants(imagePath) {
  const basePath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '');
  const widths = [400, 800, 1200];

  try {
    for (const width of widths) {
      const webpPath = `${basePath}-${width}w.webp`;
      await fs.access(webpPath);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts image dimensions from the img tag attributes.
 * Returns {width, height} or null if not found.
 */
function extractDimensions(imgTag) {
  const widthMatch = imgTag.match(/width=["']?(\d+)["']?/);
  const heightMatch = imgTag.match(/height=["']?(\d+)["']?/);

  if (widthMatch && heightMatch) {
    return {
      width: parseInt(widthMatch[1], 10),
      height: parseInt(heightMatch[1], 10)
    };
  }
  return null;
}

/**
 * Generates a responsive picture element with WebP sources and fallback.
 *
 * Structure:
 * <picture>
 *   <source type="image/webp" srcset="...400w.webp 400w, ...800w.webp 800w, ...1200w.webp 1200w" sizes="...">
 *   <source type="image/jpeg|png" srcset="...400w.jpg 400w, ...800w.jpg 800w, ...1200w.jpg 1200w" sizes="...">
 *   <img src="...800w.jpg" width="..." height="..." alt="..." loading="lazy" decoding="async">
 * </picture>
 */
function generatePictureElement(imgTag, basePath, ext, dimensions, alt, loading = 'lazy') {
  const isJpeg = ext === '.jpg' || ext === '.jpeg';
  const fallbackType = isJpeg ? 'jpg' : 'png';

  const webpSrcset = `${basePath}-400w.webp 400w, ${basePath}-800w.webp 800w, ${basePath}-1200w.webp 1200w`;
  const fallbackSrcset = `${basePath}-400w.${fallbackType} 400w, ${basePath}-800w.${fallbackType} 800w, ${basePath}-1200w.${fallbackType} 1200w`;

  const sizes = "(max-width: 549px) 100vw, (max-width: 949px) 50vw, 412px";

  const dimensionAttrs = dimensions
    ? ` width="${dimensions.width}" height="${dimensions.height}"`
    : '';

  const loadingAttr = loading === 'eager' ? '' : ' loading="lazy"';

  return `<picture>
  <source type="image/webp" srcset="${webpSrcset}" sizes="${sizes}">
  <source type="image/${isJpeg ? 'jpeg' : 'png'}" srcset="${fallbackSrcset}" sizes="${sizes}">
  <img src="${basePath}-800w.${fallbackType}"${dimensionAttrs} alt="${alt}"${loadingAttr} decoding="async">
</picture>`;
}

/**
 * Processes a single HTML file, replacing eligible images with picture elements.
 *
 * This function:
 * 1. Finds all <a><img></a> patterns (lightbox-enabled images)
 * 2. Checks if responsive variants exist for each image
 * 3. Replaces the <img> tag with a <picture> element
 * 4. Updates the <a href="..."> to point to the 1200w WebP variant for better performance
 */
async function processHtmlFile(htmlPath) {
  let content = await fs.readFile(htmlPath, 'utf-8');
  let modified = false;

  const htmlDir = path.dirname(htmlPath);

  const linkImgPattern = /<a[^>]*href=["']([^"']+)["'][^>]*>\s*<img\s+([^>]+)>\s*<\/a>/g;

  const matches = [...content.matchAll(linkImgPattern)];

  for (const match of matches) {
    const fullMatch = match[0];
    const href = match[1];
    const imgAttrs = match[2];

    if (fullMatch.includes('<picture>')) {
      continue;
    }

    const srcMatch = imgAttrs.match(/src=["']([^"']+)["']/);
    if (!srcMatch) {
      continue;
    }

    const imgSrc = srcMatch[1];

    const extMatch = imgSrc.match(/\.(jpg|jpeg|png)$/i);
    if (!extMatch) {
      continue;
    }

    const ext = extMatch[0].toLowerCase();

    const imgFullPath = path.join(htmlDir, imgSrc);
    const hasVariants = await hasResponsiveVariants(imgFullPath);

    if (!hasVariants) {
      continue;
    }

    const basePath = imgSrc.replace(/\.(jpg|jpeg|png)$/i, '');

    const dimensions = extractDimensions(imgAttrs);

    const altMatch = imgAttrs.match(/alt=["']([^"']*)["']/);
    const alt = altMatch ? altMatch[1] : '';

    const loading = imgAttrs.includes('loading="eager"') ? 'eager' : 'lazy';

    const pictureElement = generatePictureElement(imgSrc, basePath, ext, dimensions, alt, loading);

    const largestWebP = `${basePath}-1200w.webp`;
    const newLink = fullMatch.replace(
      /(<a[^>]*href=["'])([^"']+)(["'][^>]*>)/,
      `$1${largestWebP}$3`
    ).replace(/<img\s+[^>]+>/, pictureElement);

    content = content.replace(fullMatch, newLink);
    modified = true;
  }

  if (modified) {
    await fs.writeFile(htmlPath, content, 'utf-8');
    return true;
  }

  return false;
}

/**
 * Main processing function that finds and processes all HTML files.
 */
async function processAllHtmlFiles() {
  const globPattern = path.join(
    process.cwd(),
    'target/website/**/*.html'
  );

  const files = await glob(globPattern, {
    ignore: ['node_modules', 'dist', 'build']
  });

  console.log(`Found ${files.length} HTML files to process.`);

  let processedCount = 0;

  for (const file of files) {
    const wasModified = await processHtmlFile(file);
    if (wasModified) {
      processedCount++;
    }
  }

  console.log(`Processed ${processedCount} HTML files with body image replacements.`);
}

await processAllHtmlFiles();
