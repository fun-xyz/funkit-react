#!/bin/bash

#!/bin/bash
if [ -d "./node_modules/@magic-ext/oauth/dist/cjs" ]; then
  cd "./node_modules/@magic-ext/oauth/dist/cjs" || exit
  touch core.js
elif [ -d "../../@magic-ext/oauth/dist/cjs" ]; then
  cd "../../@magic-ext/oauth/dist/cjs" || exit
  touch core.js
else
  echo "Folder not found: @magic-ext/oauth/dist/cjs"
fi