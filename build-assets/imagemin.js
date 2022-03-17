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

import path from 'path';
import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminOptipng from "imagemin-optipng";
import imageminSvgo from "imagemin-svgo";

import glob from "glob";
import util from "util";
import fs from "fs/promises";

let [, , ...files] = process.argv

;(async () => {
  if (!files.length) {
    let ignore = ['node_modules', 'dist', 'build']
    const globPattern = path.join(
      process.cwd(),
      'target/website/**/*.+(png|jpg|jpeg|gif|svg|webp)',
    )
    files = await util.promisify(glob)(globPattern, {ignore})
    console.log(`found ${files.length} files.`)
  }

  await Promise.all(
    files.map(async (file) => {
      const [result] = await imagemin([file], {
        glob: false,
        plugins: [
          imageminMozjpeg({
            quality: 80
          }),
          imageminOptipng({
            optimizationLevel: 5
          }),
          //require('imagemin-webp')(),
          imageminSvgo({
            multipass: true,
            js2svg: {
              indent: 2
            }
          }),
          //require('imagemin-gifsicle')(),
        ],
      })
      await fs.writeFile(result.sourcePath, result.data)
    }),
  )
  console.log(`Finished processing ${files.length} files`)
})()
