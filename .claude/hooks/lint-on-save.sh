#!/bin/bash

echo "Quick lint check..."

if [ -f package.json ]; then
  npm run lint >/dev/null 2>&1
  if [ $? -ne 0 ]; then
    echo "Lint issues found."
    exit 1
  fi
fi

echo "Lint looks good."
exit 0
