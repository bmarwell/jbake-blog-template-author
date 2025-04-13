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
import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminOptipng from "imagemin-optipng";
import imageminSvgo from "imagemin-svgo";

import { glob } from "glob";
import fs from "fs/promises";
import pLimit from "p-limit";

let [, , ...files] = process.argv

async function optimizeImageFile( file ) {
  const [ result ] = await imagemin( [ file ], {
    glob: false,
    plugins: [
      imageminMozjpeg( {
        quality: 80
      } ),
      imageminOptipng( {
        optimizationLevel: 6
      } ),
      //require('imagemin-webp')(),
      imageminSvgo( {
        multipass: true,
        js2svg: {
          indent: 2
        }
      } ),
      //require('imagemin-gifsicle')(),
    ],
  } )
  await fs.writeFile( result.sourcePath, result.data )

  return file;
}

(async () => {
  // assemble files to compress
  if (!files.length) {
    let ignore = ['node_modules', 'dist', 'build']
    const globPattern = path.join(
      process.cwd(),
      'target/website/**/*.+(png|jpg|jpeg|gif|svg|webp)',
    )
    files = await glob(globPattern, {ignore: ignore});
    console.log(`found ${files.length} files.`)
  }

  // limit is cpus-1, but min 1.
  const cpus = os.cpus().length;
  const maxConcurrency = Math.max(1, cpus - 1)

  const limit = pLimit(maxConcurrency);

  // concurrently process files (using limit)
  const promises = files.map(async (file) => {
    return limit(() => optimizeImageFile( file ));
  });

  await (async () => {
    // Only three promises are run at once (as defined above)
    const result = await Promise.all(promises);
    console.log(result);
  })();

  console.log(`Finished processing ${files.length} files`)
})()
