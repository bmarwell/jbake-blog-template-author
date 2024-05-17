#!/usr/bin/env bash
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
# file except in compliance with the License. You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software distributed under
# the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied. See the License for the specific language governing
# permissions and limitations under the License.
#

set -euo pipefail

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "${SCRIPT_DIR}" || exit 1

curl \
  --silent \
  --fail \
  --show-error \
  --location \
  --url "https://gwfh.mranftl.com/api/fonts/lato?download=zip&subsets=latin,latin-ext&variants=700,900,regular,italic,700italic&formats=woff2" \
  -o "lato.zip"

unzip -o lato.zip
rm lato.zip

curl \
  --silent \
  --fail \
  --show-error \
  --location \
  --url "https://gwfh.mranftl.com/api/fonts/rokkitt?download=zip&subsets=latin,latin-ext&variants=500,700,800,regular&formats=woff2" \
  -o "rokkitt.zip"

unzip -o rokkitt.zip
rm rokkitt.zip
