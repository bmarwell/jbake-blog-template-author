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
set -eup pipefail



SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "${SCRIPT_DIR}" || exit 1

curl --silent --fail --show-error -JL --url "http://famfamfam.com/lab/icons/flags/famfamfam_flag_icons.zip" -o "${SCRIPT_DIR}/famfamfam_flag_icons.zip"
unzip "${SCRIPT_DIR}/famfamfam_flag_icons.zip" "png/*.png"
rm "${SCRIPT_DIR}/famfamfam_flag_icons.zip"
mv "${SCRIPT_DIR}/png/"*.png "${SCRIPT_DIR}/."
rm -rf -- "${SCRIPT_DIR}/png"

find "${SCRIPT_DIR}" -name "*.png" -print0 | xargs --null -P 8 -I{} optipng -quiet -o6 '{}'
