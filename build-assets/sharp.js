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
import process from 'node:process';
import path from 'path';
import os from 'os';
import { glob } from "glob";
import fs from "fs/promises";
import pLimit from "p-limit";
import sharp from "sharp";

let [, , ...files] = process.argv

async function optimizeImageFile(file, index, total) {
  if (file.endsWith(".jpg") || file.endsWith(".jpeg")) {
    const optiJpeg = await sharp(file)
      .jpeg({ mozjpeg: true, quality: 80 })
      .toBuffer();
    await fs.writeFile(file, optiJpeg);

    const webp = await sharp(file)
      .webp({quality: 80})
      .toBuffer();

    await fs.writeFile(file.replace(".jpeg", "").replace(".jpg", "") + ".webp", webp);
  } else if (file.endsWith(".png")) {
    const optiPng = await sharp(file)
      .png({ compressionLevel: 6, palette: true, quality: 85, effort: 10 })
      .toBuffer();

    await fs.writeFile(file, optiPng);
  } else if (file.endsWith(".gif")) {
    const optiGif = await sharp(file)
      .gif({ effort: 10 })
      .toBuffer();

    await fs.writeFile(file, optiGif);
  }

  if (index % 10 === 0) {
    console.log(`Processed ${index}/${total} files`)
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
