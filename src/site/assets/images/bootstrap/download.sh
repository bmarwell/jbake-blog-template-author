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

ICONS=(
  "chevron-down"
  "chevron-up"
  "discord"
  "facebook"
  "github"
  "google"
  "instagram"
  "linkedin"
  "paypal"
  "reddit"
  "rss"
  "rss-fill"
  "signal"
  "snapchat"
  "stack-overflow"
  "twitch"
  "twitter"
  "whatsapp"
  "wordpress"
  "youtube"
)

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "${SCRIPT_DIR}" || exit 1

download_and_modify() {
  local file="${1}"
  curl --silent --fail --show-error -JL "https://icons.getbootstrap.com/assets/icons/${file}.svg" -o "${SCRIPT_DIR}/${file}.svg"
  sed -i 's/svg" width="16"/svg" id="'"$file"'" width="16"/g' "${SCRIPT_DIR}/${file}.svg"

}

for file in "${ICONS[@]}"; do
  echo "Downloading [$file]"
  download_and_modify "${file}" &
done

wait
