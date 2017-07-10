#!/usr/bin/env bash
set -e

# Colors
ESC_SEQ="\x1b["
COL_RESET=$ESC_SEQ"39;49;00m"
COL_RED=$ESC_SEQ"31;01m"
COL_GREEN=$ESC_SEQ"32;01m"
COL_YELLOW=$ESC_SEQ"33;01m"
COL_BLUE=$ESC_SEQ"34;01m"
COL_MAGENTA=$ESC_SEQ"35;01m"
COL_CYAN=$ESC_SEQ"36;01m"

echo -e "$COL_CYAN| ------------------------------------------- $COL_RESET"
echo -e "$COL_CYAN| Running tests...$COL_RESET"
echo -e "$COL_CYAN| ------------------------------------------- $COL_RESET"
yarn test

# Configure production environment

export NODE_ENV=production

if [ -z "$API" ]; then
  export API=production
fi

echo -e "$COL_CYAN| ------------------------------------------- $COL_RESET"
echo -e "$COL_CYAN| initai-js build initiated$COL_RESET"
echo -e "$COL_CYAN| API: $API $COL_RESET"
echo -e "$COL_CYAN| NODE_ENV: $NODE_ENV $COL_RESET"
echo -e "$COL_CYAN| ------------------------------------------- $COL_RESET"
yarn build

./node_modules/.bin/babili dist/initai.js -o dist/initai.min.js --no-comments --debug

echo -e "$COL_CYAN| ------------------------------------------- $COL_RESET"
echo -e "$COL_CYAN| initai-js build complete!$COL_RESET"
echo -e "$COL_CYAN| ------------------------------------------- $COL_RESET"
